import { NextResponse } from 'next/server';
import { getStoreSettings } from '@/lib/supabase/settings';

export async function GET() {
  try {
    const settings = await getStoreSettings();
    
    if (!settings) {
      // Valor por defecto si no hay configuración
      return NextResponse.json({
        exchange_rate: 18.00, // Valor por defecto
      });
    }

    return NextResponse.json({
      exchange_rate: settings.exchange_rate || 18.00,
    });
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    // En caso de error, devolver valor por defecto
    return NextResponse.json({
      exchange_rate: 18.00, // Valor por defecto
    });
  }
}

