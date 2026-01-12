"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';

export function MarketTicker() {
  const t = useTranslations('marketTicker');
  const locale = useLocale();
  const [goldQuotation, setGoldQuotation] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[MarketTicker] Fetching market data...');

      // Obtener cotización del oro y tasa de cambio desde configuración
      // Agregar timestamp para evitar caché
      const timestamp = Date.now();
      const [goldResponse, exchangeResponse] = await Promise.all([
        fetch(`/api/settings/gold-quotation?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        }),
        fetch(`/api/settings/exchange-rate?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        }),
      ]);

      if (goldResponse.ok) {
        const goldResult = await goldResponse.json();
        console.log('[MarketTicker] Gold quotation response:', goldResult);
        setGoldQuotation(goldResult.gold_quotation);
      } else {
        console.error('[MarketTicker] Gold quotation API error:', goldResponse.status);
      }

      if (exchangeResponse.ok) {
        const exchangeResult = await exchangeResponse.json();
        console.log('[MarketTicker] Exchange rate response:', exchangeResult);
        setExchangeRate(exchangeResult.exchange_rate);
      } else {
        console.error('[MarketTicker] Exchange rate API error:', exchangeResponse.status);
      }
    } catch (err) {
      console.error('[MarketTicker] Error fetching market data:', err);
      setError('Error loading market data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch immediately
    fetchMarketData();

    // Fetch every 10 seconds for more frequent updates
    const interval = setInterval(fetchMarketData, 10000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number, decimals: number = 2) => {
    const localeCode = locale === 'es' ? 'es-MX' : 'en-US';
    return new Intl.NumberFormat(localeCode, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(price);
  };

  // Si está cargando, mostrar cintilla con mensaje de carga
  if (isLoading) {
    return (
      <div className="relative bg-gradient-to-r from-[#D4AF37] via-[#B8941E] to-[#D4AF37] text-white py-3 overflow-hidden border-b border-[#A0821A]/50 shadow-md">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm font-medium">{t('loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  // Usar valores por defecto si no hay datos (nunca debería pasar ahora, pero por seguridad)
  const displayGoldQuotation = goldQuotation ?? 2550.00;
  const displayExchangeRate = exchangeRate ?? 18.00;

  console.log('[MarketTicker] Displaying:', { goldQuotation, exchangeRate, displayGoldQuotation, displayExchangeRate });

  // Calcular valores según el idioma
  const goldPrice = locale === 'es' 
    ? displayGoldQuotation 
    : displayGoldQuotation / displayExchangeRate;
  const goldUnit = locale === 'es' ? 'MXN/gr' : 'USD/gr';
  
  const exchangeRateValue = locale === 'es'
    ? displayExchangeRate
    : 1 / displayExchangeRate;
  const exchangeRateUnit = locale === 'es' ? 'MXN/USD' : 'USD/MXN';

  // Contenido de la cintilla con mejor separación
  const tickerContent = (
    <>
      {/* Cotización del Oro */}
      <div className="flex items-center gap-2 px-4">
        <span className="text-sm text-white">{t('goldQuotation')}:</span>
        <span className="text-sm font-bold text-white">
          ${formatPrice(goldPrice)} {goldUnit}
        </span>
      </div>

      {/* Separador */}
      <span className="text-sm text-white/70 px-2">|</span>

      {/* Tasa de Cambio */}
      <div className="flex items-center gap-2 px-4">
        <span className="text-sm text-white">{t('exchangeRate')}:</span>
        <span className="text-sm font-bold text-white">
          ${formatPrice(exchangeRateValue, 2)} {exchangeRateUnit}
        </span>
      </div>
    </>
  );

  return (
    <div className="relative bg-gradient-to-r from-[#D4AF37] via-[#B8941E] to-[#D4AF37] text-white py-3 overflow-hidden border-b border-[#A0821A]/50 shadow-md">
      {/* Contenedor con animación continua - sin espacios vacíos */}
      <div className="flex items-center ticker-container">
        {/* Múltiples copias para efecto continuo infinito sin espacios */}
        <div className="flex items-center whitespace-nowrap ticker-content">
          {tickerContent}
        </div>
        <div className="flex items-center whitespace-nowrap ticker-content">
          {tickerContent}
        </div>
        <div className="flex items-center whitespace-nowrap ticker-content">
          {tickerContent}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }

        .ticker-container {
          display: flex;
          width: fit-content;
          animation: scroll 60s linear infinite;
        }

        .ticker-container:hover {
          animation-play-state: paused;
        }

        .ticker-content {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}

