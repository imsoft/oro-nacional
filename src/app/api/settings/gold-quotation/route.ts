import { NextResponse } from 'next/server';
import { getPricingParameters } from '@/lib/supabase/pricing';

export async function GET() {
  try {
    const parameters = await getPricingParameters();

    console.log('[Gold Quotation API] Parameters fetched:', parameters);

    if (!parameters) {
      // Valor por defecto si no hay parámetros
      console.warn('[Gold Quotation API] No parameters found, using default');
      return NextResponse.json({
        gold_quotation: 2550.00, // Valor por defecto actualizado
      });
    }

    console.log('[Gold Quotation API] Returning gold_quotation:', parameters.goldQuotation);
    return NextResponse.json({
      gold_quotation: parameters.goldQuotation || 2550.00,
    });
  } catch (error) {
    console.error('[Gold Quotation API] Error fetching gold quotation:', error);
    // En caso de error, devolver valor por defecto
    return NextResponse.json({
      gold_quotation: 2550.00, // Valor por defecto actualizado
    });
  }
}

