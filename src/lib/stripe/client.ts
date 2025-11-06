import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripeClient(): Promise<Stripe | null> {
  // Si ya tenemos una promesa, la devolvemos
  if (stripePromise) {
    return stripePromise;
  }

  // Verificar si la clave pública está configurada
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    // Si no hay clave, devolvemos null
    stripePromise = Promise.resolve(null);
    return stripePromise;
  }

  // Cargar Stripe
  stripePromise = loadStripe(publishableKey);
  return stripePromise;
}

