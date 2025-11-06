import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    // Verificar si Stripe está configurado
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Failed to initialize Stripe' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { amount, currency = 'mxn', orderId, customerEmail, metadata = {} } = body;

    // Validar que el monto sea válido
    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Crear el Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: orderId || '',
        customerEmail: customerEmail || '',
        ...metadata,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create payment intent';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

