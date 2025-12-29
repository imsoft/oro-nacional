import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, isStripeConfigured } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    console.log('[Stripe API] Received request to create Payment Intent');

    // Verificar si Stripe está configurado
    if (!isStripeConfigured()) {
      console.error('[Stripe API] Stripe is not configured');
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      console.error('[Stripe API] Failed to initialize Stripe client');
      return NextResponse.json(
        { error: 'Failed to initialize Stripe' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { amount, currency = 'mxn', orderId, customerEmail, metadata: customMetadata = {} } = body;
    console.log('[Stripe API] Request data:', { amount, currency, orderId, customerEmail });

    // Validar que el monto sea válido
    if (!amount || amount < 1) {
      console.error('[Stripe API] Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Crear Payment Intent simple - Los intereses ya están incluidos en el monto
    // El cliente paga el total de una sola vez con su tarjeta
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: orderId || '',
        customerEmail: customerEmail || '',
        ...customMetadata, // Incluir locale y otros metadatos personalizados
      },
    };

    // Crear el Payment Intent
    console.log('[Stripe API] Creating Payment Intent with params:', JSON.stringify(paymentIntentParams, null, 2));
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
    console.log('[Stripe API] Payment Intent created successfully:', paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('[Stripe API] Error creating payment intent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create payment intent';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

