import { NextResponse } from 'next/server';
import { getPricingParameters } from '@/lib/supabase/pricing';

export async function GET() {
  try {
    const parameters = await getPricingParameters();

    console.log('[Gold Quotation API] Parameters fetched:', JSON.stringify(parameters, null, 2));

    if (!parameters) {
      // Valor por defecto si no hay parámetros
      console.warn('[Gold Quotation API] No parameters found, using default');
      return NextResponse.json({
        gold_quotation: 2550.00, // Valor por defecto actualizado
      });
    }

    // Usar el valor directamente sin fallback, ya que si parameters existe, goldQuotation debería existir
    const goldQuotation = parameters.goldQuotation;
    console.log('[Gold Quotation API] Raw goldQuotation value:', goldQuotation);
    console.log('[Gold Quotation API] Type of goldQuotation:', typeof goldQuotation);
    console.log('[Gold Quotation API] Returning gold_quotation:', goldQuotation);
    
    // No cachear la respuesta para que siempre obtenga el valor más reciente
    return NextResponse.json(
      {
        gold_quotation: goldQuotation,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('[Gold Quotation API] Error fetching gold quotation:', error);
    // En caso de error, devolver valor por defecto
    return NextResponse.json({
      gold_quotation: 2550.00, // Valor por defecto actualizado
    });
  }
}

