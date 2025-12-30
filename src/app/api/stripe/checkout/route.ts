import { NextResponse } from 'next/server'
import { createCheckoutSession } from '@/server/actions/stripe'

export async function POST() {
  try {
    const result = await createCheckoutSession()

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ url: result.data?.url })
  } catch (error) {
    console.error('Checkout API error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar checkout' },
      { status: 500 }
    )
  }
}
