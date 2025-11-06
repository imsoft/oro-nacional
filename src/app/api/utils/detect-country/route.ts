import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obtener la IP del cliente desde los headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || '';

    if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      // IP local o privada, devolver México por defecto
      return NextResponse.json({
        success: true,
        country: 'MX',
        countryName: 'México',
      });
    }

    // Usar una API gratuita para obtener el país basado en la IP
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`, {
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.country_code) {
          return NextResponse.json({
            success: true,
            country: data.country_code,
            countryName: data.country_name || data.country_code,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching country from ipapi.co:', error);
    }

    // Fallback: intentar con otra API
    try {
      const response = await fetch(`https://ip-api.com/json/${ip}?fields=countryCode,country`, {
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.countryCode) {
          return NextResponse.json({
            success: true,
            country: data.countryCode,
            countryName: data.country || data.countryCode,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching country from ip-api.com:', error);
    }

    // Si todo falla, devolver México por defecto
    return NextResponse.json({
      success: true,
      country: 'MX',
      countryName: 'México',
    });
  } catch (error) {
    console.error('Error detecting country:', error);
    return NextResponse.json({
      success: true,
      country: 'MX',
      countryName: 'México',
    });
  }
}

