import Stripe from 'stripe';

// Función para obtener instancia de Stripe (solo cuando se necesite)
export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-10-29.clover',
  });
}

// Función para verificar si Stripe está configurado
export function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
}

// Obtener la clave pública de Stripe
export function getStripePublishableKey(): string | null {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null;
}

