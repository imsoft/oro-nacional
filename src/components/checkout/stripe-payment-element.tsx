"use client";

import { useEffect, useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StripePaymentElementProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  isLoading: boolean;
}

export function StripePaymentElement({
  clientSecret,
  onSuccess,
  onError,
  isLoading: externalLoading,
}: StripePaymentElementProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (elements && !isReady) {
      setIsReady(true);
    }
  }, [elements, isReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe no está inicializado. Por favor recarga la página.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Confirmar el pago
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/checkout/confirmacion`,
        },
      });

      if (confirmError) {
        setError(confirmError.message || 'Error al procesar el pago');
        onError(confirmError.message || 'Error al procesar el pago');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        setError('El pago no se completó correctamente');
        onError('El pago no se completó correctamente');
        setIsProcessing(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al procesar el pago';
      setError(errorMessage);
      onError(errorMessage);
      setIsProcessing(false);
    }
  };

  if (!stripe || !elements) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isLoading = isProcessing || externalLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-lg border border-border bg-background">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isLoading || !isReady}
        className="w-full bg-[#D4AF37] hover:bg-[#B8941E] text-white"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Procesando pago...
          </>
        ) : (
          'Confirmar y Pagar'
        )}
      </Button>
    </form>
  );
}

