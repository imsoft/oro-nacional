import { NextResponse } from 'next/server';

interface MarketPrice {
  value: number;
  change: number;
  changePercent: number;
  lastUpdate: Date;
}

interface MarketData {
  gold: MarketPrice;
  usd: MarketPrice;
}

// Cache para almacenar los últimos valores y calcular cambios
let cachedData: {
  gold: { value: number; timestamp: number };
  usd: { value: number; timestamp: number };
} | null = null;

// Función para obtener precio del oro (usando API gratuita)
async function getGoldPrice(): Promise<number> {
  try {
    const apiKey = process.env.METALS_API_KEY;
    
    // Opción 1: metals-api.com (requiere API key)
    if (apiKey) {
      try {
        const response = await fetch(
          `https://api.metals.live/v1/spot/gold`,
          {
            headers: {
              'x-api-key': apiKey,
              'Accept': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.price) return data.price;
          if (Array.isArray(data) && data[0]?.price) return data[0].price;
        }
      } catch (error) {
        console.error('Error with metals-api:', error);
      }
    }

    // Opción 2: API pública de metales.live (sin API key, pero puede tener límites)
    try {
      const response = await fetch(
        'https://api.metals.live/v1/spot/gold',
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (typeof data === 'number') return data;
        if (data.price) return data.price;
        if (Array.isArray(data) && data[0]?.price) return data[0].price;
        if (data.rates?.XAU) return data.rates.XAU; // Algunas APIs usan código XAU
      }
    } catch (error) {
      console.error('Error with metals.live API:', error);
    }

    // Opción 3: Usar una API alternativa para obtener precio del oro en USD y convertir a MXN
    try {
      // Intentar obtener precio del oro desde una fuente alternativa
      // Usar una API que devuelva el precio en USD
      const goldApiResponse = await fetch(
        'https://api.metals.live/v1/spot/gold',
        { cache: 'no-store' }
      );
      
      if (goldApiResponse.ok) {
        const goldData = await goldApiResponse.json();
        let goldPriceUSD = 0;
        
        // Intentar diferentes formatos de respuesta
        if (typeof goldData === 'number') {
          goldPriceUSD = goldData;
        } else if (goldData.price) {
          goldPriceUSD = goldData.price;
        } else if (Array.isArray(goldData) && goldData[0]?.price) {
          goldPriceUSD = goldData[0].price;
        } else if (goldData.rates?.XAU) {
          goldPriceUSD = goldData.rates.XAU;
        }
        
        // Si obtuvimos un precio en USD, convertir a MXN
        if (goldPriceUSD > 0) {
          const usdToMxn = await getUSDToMXN();
          return goldPriceUSD * usdToMxn;
        }
      }
      
      // Fallback: Precio aproximado del oro en USD convertido a MXN
      const goldPriceUSD = 2000; // Valor aproximado del oro por onza en USD
      const usdToMxn = await getUSDToMXN();
      return goldPriceUSD * usdToMxn;
    } catch (error) {
      console.error('Error calculating gold price:', error);
    }

    // Fallback: Valor por defecto
    return 34000; // Precio aproximado del oro en MXN/oz
  } catch (error) {
    console.error('Error fetching gold price:', error);
    return 34000;
  }
}

// Función para obtener tipo de cambio USD/MXN
async function getUSDToMXN(): Promise<number> {
  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    
    // Opción 1: exchangerate-api.com con API key
    if (apiKey) {
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`,
          { cache: 'no-store' } // No cachear para obtener datos actuales
        );

        if (response.ok) {
          const data = await response.json();
          if (data.conversion_rates?.MXN) {
            return data.conversion_rates.MXN;
          }
        }
      } catch (error) {
        console.error('Error with exchangerate-api.com:', error);
      }
    }

    // Opción 2: API pública gratuita exchangerate-api.com (sin API key)
    try {
      const response = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD',
        { cache: 'no-store' }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.rates?.MXN) {
          return data.rates.MXN;
        }
      }
    } catch (error) {
      console.error('Error with public exchange rate API:', error);
    }

    // Opción 3: fixer.io (si hay API key)
    const fixerApiKey = process.env.FIXER_API_KEY;
    if (fixerApiKey) {
      try {
        const response = await fetch(
          `http://data.fixer.io/api/latest?access_key=${fixerApiKey}&base=USD&symbols=MXN`,
          { cache: 'no-store' }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.rates?.MXN) {
            return data.rates.MXN;
          }
        }
      } catch (error) {
        console.error('Error with fixer.io:', error);
      }
    }

    // Valor por defecto en caso de error
    return 17.0;
  } catch (error) {
    console.error('Error fetching USD to MXN:', error);
    return 17.0;
  }
}

// Calcular cambio y porcentaje
function calculateChange(currentValue: number, previousValue: number | null): { change: number; changePercent: number } {
  if (previousValue === null || previousValue === 0) {
    return { change: 0, changePercent: 0 };
  }

  const change = currentValue - previousValue;
  const changePercent = (change / previousValue) * 100;

  return { change, changePercent };
}

export async function GET() {
  try {
    // Obtener precios actuales
    const [goldPrice, usdRate] = await Promise.all([
      getGoldPrice(),
      getUSDToMXN(),
    ]);

    // Calcular cambios
    const now = Date.now();
    const previousGold = cachedData?.gold || null;
    const previousUsd = cachedData?.usd || null;

    const goldChange = calculateChange(goldPrice, previousGold?.value || null);
    const usdChange = calculateChange(usdRate, previousUsd?.value || null);

    // Actualizar cache
    cachedData = {
      gold: { value: goldPrice, timestamp: now },
      usd: { value: usdRate, timestamp: now },
    };

    // Si no hay datos previos, los cambios son 0
    const data: MarketData = {
      gold: {
        value: goldPrice,
        change: previousGold ? goldChange.change : 0,
        changePercent: previousGold ? goldChange.changePercent : 0,
        lastUpdate: new Date(now),
      },
      usd: {
        value: usdRate,
        change: previousUsd ? usdChange.change : 0,
        changePercent: previousUsd ? usdChange.changePercent : 0,
        lastUpdate: new Date(now),
      },
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in market prices API:', error);

    // Devolver datos por defecto en caso de error
    const defaultData: MarketData = {
      gold: {
        value: 34000, // Valor aproximado en MXN
        change: 0,
        changePercent: 0,
        lastUpdate: new Date(),
      },
      usd: {
        value: 17.0,
        change: 0,
        changePercent: 0,
        lastUpdate: new Date(),
      },
    };

    return NextResponse.json({
      success: true,
      data: defaultData,
    });
  }
}

