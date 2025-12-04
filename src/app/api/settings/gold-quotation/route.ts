import { NextResponse } from 'next/server';
import { getPricingParameters } from '@/lib/supabase/pricing';

export async function GET() {
  try {
    const parameters = await getPricingParameters();
    
    if (!parameters) {
      // Valor por defecto si no hay parámetros
      return NextResponse.json({
        gold_quotation: 2450.00, // Valor por defecto
      });
    }

    return NextResponse.json({
      gold_quotation: parameters.goldQuotation || 2450.00,
    });
  } catch (error) {
    console.error('Error fetching gold quotation:', error);
    // En caso de error, devolver valor por defecto
    return NextResponse.json({
      gold_quotation: 2450.00, // Valor por defecto
    });
  }
}

