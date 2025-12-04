import { NextResponse } from 'next/server';
import { getStoreSettings } from '@/lib/supabase/settings';

export async function GET() {
  try {
    const settings = await getStoreSettings();
    
    if (!settings) {
      return NextResponse.json(
        { exchange_rate: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      exchange_rate: settings.exchange_rate || null,
    });
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return NextResponse.json(
      { exchange_rate: null },
      { status: 200 }
    );
  }
}

