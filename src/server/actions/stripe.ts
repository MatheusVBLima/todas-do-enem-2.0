"use server"

import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe/server'
import { getCurrentUser } from '@/lib/auth/server'
import type { ActionResponse } from '@/types'

/**
 * Create a Stripe Checkout Session for PRO plan subscription
 */
export async function createCheckoutSession(): Promise<ActionResponse<{ url: string }>> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: 'Você precisa estar logado para assinar' }
    }

    const priceId = process.env.STRIPE_PRICE_ID_PRO
    if (!priceId) {
      return { success: false, error: 'Configuração de preço não encontrada' }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/planos/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/planos?canceled=true`,
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
      },
      locale: 'pt-BR',
      billing_address_collection: 'required',
    })

    if (!session.url) {
      return { success: false, error: 'Erro ao criar sessão de checkout' }
    }

    return { success: true, data: { url: session.url } }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return { success: false, error: 'Erro ao criar sessão de pagamento' }
  }
}

/**
 * Create a Stripe Customer Portal session for managing subscription
 */
export async function createPortalSession(): Promise<ActionResponse<{ url: string }>> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: 'Você precisa estar logado' }
    }

    // Get user's Stripe customer ID from database
    const { getUserProfile } = await import('./users')
    const userResult = await getUserProfile(user.id)

    if (!userResult.success || !userResult.data?.stripeCustomerId) {
      return { success: false, error: 'Informações de assinatura não encontradas' }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.billingPortal.sessions.create({
      customer: userResult.data.stripeCustomerId,
      return_url: `${baseUrl}/conta`,
    })

    return { success: true, data: { url: session.url } }
  } catch (error) {
    console.error('Error creating portal session:', error)
    return { success: false, error: 'Erro ao acessar portal de assinatura' }
  }
}

/**
 * Cancel user's subscription
 */
export async function cancelSubscription(): Promise<ActionResponse<void>> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: 'Você precisa estar logado' }
    }

    // Get user's subscription ID from database
    const { getUserProfile } = await import('./users')
    const userResult = await getUserProfile(user.id)

    if (!userResult.success || !userResult.data?.stripeSubscriptionId) {
      return { success: false, error: 'Assinatura não encontrada' }
    }

    // Cancel the subscription at period end (user keeps access until end of billing period)
    await stripe.subscriptions.update(userResult.data.stripeSubscriptionId, {
      cancel_at_period_end: true,
    })

    return { success: true }
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return { success: false, error: 'Erro ao cancelar assinatura' }
  }
}

/**
 * Reactivate a cancelled subscription (removes cancel_at_period_end)
 */
export async function reactivateSubscription(): Promise<ActionResponse<void>> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: 'Você precisa estar logado' }
    }

    const { getUserProfile } = await import('./users')
    const userResult = await getUserProfile(user.id)

    if (!userResult.success || !userResult.data?.stripeSubscriptionId) {
      return { success: false, error: 'Assinatura não encontrada' }
    }

    // Remove the cancellation by setting cancel_at_period_end to false
    await stripe.subscriptions.update(userResult.data.stripeSubscriptionId, {
      cancel_at_period_end: false,
    })

    return { success: true }
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    return { success: false, error: 'Erro ao reativar assinatura' }
  }
}

/**
 * Get subscription details including payment method
 */
export async function getSubscriptionDetails(): Promise<ActionResponse<{
  cardBrand?: string
  cardLast4?: string
  cancelAtPeriodEnd: boolean
  cancelAt?: string | null
  createdAt?: string
}>> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: 'Você precisa estar logado' }
    }

    const { getUserProfile } = await import('./users')
    const userResult = await getUserProfile(user.id)

    if (!userResult.success || !userResult.data?.stripeSubscriptionId) {
      return { success: false, error: 'Assinatura não encontrada' }
    }

    // Get subscription with payment method details
    const subscription = await stripe.subscriptions.retrieve(
      userResult.data.stripeSubscriptionId,
      {
        expand: ['default_payment_method'],
      }
    )

    const paymentMethod = subscription.default_payment_method
    const card = typeof paymentMethod === 'object' && paymentMethod && 'card' in paymentMethod
      ? paymentMethod.card
      : undefined

    return {
      success: true,
      data: {
        cardBrand: card?.brand,
        cardLast4: card?.last4,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        createdAt: new Date(subscription.created * 1000).toISOString(),
      },
    }
  } catch (error) {
    console.error('Error fetching subscription details:', error)
    return { success: false, error: 'Erro ao buscar detalhes da assinatura' }
  }
}
