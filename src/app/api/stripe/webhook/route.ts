import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/server'
import { db } from '@/lib/db'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = (await headers()).get('stripe-signature')

    if (!signature) {
      console.error('No stripe-signature header')
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Update user plan to PRO and save Stripe info
        if (session.metadata?.userId && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          const periodEnd = 'current_period_end' in sub && typeof sub.current_period_end === 'number'
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null

          const priceId = 'items' in sub ? sub.items.data[0]?.price?.id || null : null

          await db
            .from('User')
            .update({
              plan: 'RUMO_A_APROVACAO',
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: sub.id,
              stripeSubscriptionStatus: sub.status,
              stripePriceId: priceId,
              stripeCurrentPeriodEnd: periodEnd,
            })
            .eq('id', session.metadata.userId)

          console.log(`✅ User ${session.metadata.userId} upgraded to PRO`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        // Find user by stripeSubscriptionId
        const { data: user } = await db
          .from('User')
          .select('id')
          .eq('stripeSubscriptionId', subscription.id)
          .single()

        if (user) {
          const periodEnd = 'current_period_end' in subscription && typeof subscription.current_period_end === 'number'
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null

          const priceId = 'items' in subscription ? subscription.items.data[0]?.price?.id || null : null

          if (subscription.status === 'active') {
            // Update subscription info
            await db
              .from('User')
              .update({
                stripeSubscriptionStatus: subscription.status,
                stripePriceId: priceId,
                stripeCurrentPeriodEnd: periodEnd,
              })
              .eq('id', user.id)

            console.log(`✅ Subscription ${subscription.id} updated`)
          } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            // Downgrade user to FREE plan
            await db
              .from('User')
              .update({
                plan: 'TENTANDO_A_SORTE',
                stripeSubscriptionStatus: subscription.status,
              })
              .eq('id', user.id)

            console.log(`❌ User ${user.id} downgraded to FREE`)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Find user by stripeSubscriptionId
        const { data: user } = await db
          .from('User')
          .select('id')
          .eq('stripeSubscriptionId', subscription.id)
          .single()

        if (user) {
          await db
            .from('User')
            .update({
              plan: 'TENTANDO_A_SORTE',
              stripeSubscriptionStatus: 'canceled',
              stripeSubscriptionId: null,
              stripePriceId: null,
              stripeCurrentPeriodEnd: null,
            })
            .eq('id', user.id)

          console.log(`❌ User ${user.id} subscription deleted, downgraded to FREE`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        // Handle failed payment - could send email notification
        console.log(`❌ Payment failed for invoice ${invoice.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
