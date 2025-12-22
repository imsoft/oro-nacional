"use client";

import { useEffect, useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

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
      const errorMsg = 'Stripe no está inicializado. Por favor recarga la página.';
      setError(errorMsg);
      toast.error('Error de inicialización', {
        description: errorMsg
      });
      return;
    }

    setIsProcessing(true);
    setError(null);

    console.log('[Stripe Payment] Starting payment confirmation with clientSecret:', clientSecret?.substring(0, 20) + '...');

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
        console.error('[Stripe Payment] Confirmation error:', confirmError);
        const errorMsg = confirmError.message || 'Error al procesar el pago';
        setError(errorMsg);
        toast.error('Error en el pago', {
          description: errorMsg
        });
        onError(errorMsg);
        setIsProcessing(false);
        return;
      }

      // Manejar diferentes estados del Payment Intent
      if (paymentIntent) {
        console.log('[Stripe Payment] Payment Intent status:', paymentIntent.status);
        console.log('[Stripe Payment] Payment Intent ID:', paymentIntent.id);

        if (paymentIntent.status === 'succeeded') {
          // Pago completado exitosamente
          console.log('[Stripe Payment] Payment succeeded!');
          toast.success('Pago completado', {
            description: 'Tu pago se procesó exitosamente'
          });
          onSuccess(paymentIntent.id);
        } else if (paymentIntent.status === 'processing') {
          // Pago en proceso (común con algunos métodos de pago)
          console.log('[Stripe Payment] Payment is processing');
          toast.success('Pago en proceso', {
            description: 'Tu pago está siendo procesado. Recibirás una confirmación pronto.'
          });
          onSuccess(paymentIntent.id);
        } else if (paymentIntent.status === 'requires_payment_method') {
          // Método de pago rechazado
          const errorMsg = 'El método de pago fue rechazado. Por favor intenta con otra tarjeta.';
          console.warn('[Stripe Payment] Payment method rejected');
          setError(errorMsg);
          toast.error('Método de pago rechazado', {
            description: errorMsg
          });
          onError('El método de pago fue rechazado');
          setIsProcessing(false);
        } else {
          // Otros estados
          const errorMsg = `Estado del pago: ${paymentIntent.status}. Por favor contacta con soporte.`;
          console.warn('[Stripe Payment] Unexpected status:', paymentIntent.status);
          setError(errorMsg);
          toast.warning('Estado inesperado', {
            description: errorMsg
          });
          onError(`Payment status: ${paymentIntent.status}`);
          setIsProcessing(false);
        }
      } else {
        const errorMsg = 'No se recibió confirmación del pago';
        console.error('[Stripe Payment] No payment intent received');
        setError(errorMsg);
        toast.error('Error de confirmación', {
          description: errorMsg
        });
        onError(errorMsg);
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('[Stripe Payment] Exception during payment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al procesar el pago';
      setError(errorMessage);
      toast.error('Error inesperado', {
        description: errorMessage
      });
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

