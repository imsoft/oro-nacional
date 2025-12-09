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
    const { amount, currency = 'mxn', orderId, customerEmail, installments, metadata: customMetadata = {} } = body;
    console.log('[Stripe API] Request data:', { amount, currency, orderId, customerEmail, installments });

    // Validar que el monto sea válido
    if (!amount || amount < 1) {
      console.error('[Stripe API] Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Configurar opciones de pago según los meses sin intereses
    // Si se especifican meses sin intereses (mayor a 1), configurar Stripe
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: orderId || '',
        customerEmail: customerEmail || '',
        installments: installments?.toString() || '1',
        ...customMetadata, // Incluir locale y otros metadatos personalizados
      },
    };

    // Agregar configuración de MSI solo si se solicitan meses sin intereses Y la moneda es MXN
    // Nota: Los MSI en México solo están disponibles para pagos en MXN
    if (installments && installments > 1 && currency.toLowerCase() === 'mxn') {
      // Validar que installments sea un valor permitido (3, 6, 9, 12)
      const validInstallments = [3, 6, 9, 12];
      if (!validInstallments.includes(installments)) {
        console.warn('[Stripe API] Invalid installment count:', installments, 'Using 1 instead');
      } else {
        paymentIntentParams.payment_method_options = {
          card: {
            installments: {
              enabled: true,
              plan: {
                count: installments,
                interval: 'month' as const,
                type: 'fixed_count' as const,
              },
            },
          },
        };
        console.log('[Stripe API] Configured installments:', installments, 'months');
      }
    } else if (installments && installments > 1 && currency.toLowerCase() !== 'mxn') {
      console.warn('[Stripe API] Installments requested for non-MXN currency. MSI only available for MXN.');
    }

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

