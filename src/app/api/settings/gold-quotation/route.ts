import { NextResponse } from 'next/server';
import { getPricingParameters } from '@/lib/supabase/pricing';

export async function GET() {
  try {
    const parameters = await getPricingParameters();
    
    if (!parameters) {
      return NextResponse.json(
        { gold_quotation: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      gold_quotation: parameters.goldQuotation || null,
    });
  } catch (error) {
    console.error('Error fetching gold quotation:', error);
    return NextResponse.json(
      { gold_quotation: null },
      { status: 200 }
    );
  }
}

