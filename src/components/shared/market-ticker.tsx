"use client";

import { useState, useEffect } from 'react';
import { DollarSign, Gem } from 'lucide-react';

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

export function MarketTicker() {
  const [data, setData] = useState<MarketData | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener datos del mercado (oro y USD desde API externa)
      const [marketResponse, settingsResponse] = await Promise.all([
        fetch('/api/market/prices'),
        fetch('/api/settings/exchange-rate'),
      ]);

      if (!marketResponse.ok) {
        throw new Error('Failed to fetch market data');
      }

      const marketResult = await marketResponse.json();
      setData(marketResult.data);

      // Obtener tasa de cambio desde store_settings (la que el usuario configura)
      if (settingsResponse.ok) {
        const settingsResult = await settingsResponse.json();
        if (settingsResult.exchange_rate) {
          setExchangeRate(settingsResult.exchange_rate);
        }
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Error loading market data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch immediately
    fetchMarketData();

    // Fetch every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number, decimals: number = 2) => {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(price);
  };

  // Si está cargando y no hay datos, mostrar cintilla con mensaje de carga
  if (isLoading && !data) {
    return (
      <div className="relative bg-gradient-to-r from-[#D4AF37] via-[#B8941E] to-[#D4AF37] text-white py-3 overflow-hidden border-b border-[#A0821A]/50 shadow-md">
        <div className="flex items-center animate-scroll">
          <div className="flex items-center gap-4 whitespace-nowrap">
            <Gem className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium">Cargando precios del mercado...</span>
          </div>
        </div>
      </div>
    );
  }

  // Si hay error y no hay datos, no mostrar nada
  if (error && !data) {
    return null;
  }

  // Preparar contenido para la cintilla animada
  const goldPrice = data?.gold.value || 0;
  const usdRate = exchangeRate || data?.usd.value || 0;

  // Contenido de la cintilla
  const tickerContent = (
    <>
      <div className="flex items-center gap-3">
        <Gem className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-semibold">Oro:</span>
        <span className="text-sm font-bold">
          ${formatPrice(goldPrice)} MXN/oz
        </span>
      </div>

      <div className="w-px h-4 bg-white/40" />

      <div className="flex items-center gap-3">
        <DollarSign className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-semibold">Dólar:</span>
        <span className="text-sm font-bold">
          ${formatPrice(usdRate, 2)} MXN/USD
        </span>
      </div>
    </>
  );

  return (
    <div className="relative bg-gradient-to-r from-[#D4AF37] via-[#B8941E] to-[#D4AF37] text-white py-3 overflow-hidden border-b border-[#A0821A]/50 shadow-md">
      {/* Contenedor con animación continua */}
      <div className="flex items-center ticker-container">
        {/* Contenido duplicado para efecto continuo infinito */}
        <div className="flex items-center gap-8 md:gap-12 whitespace-nowrap ticker-content">
          {tickerContent}
        </div>
        <div className="flex items-center gap-8 md:gap-12 whitespace-nowrap ticker-content">
          {tickerContent}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .ticker-container {
          display: flex;
          width: fit-content;
          animation: scroll 40s linear infinite;
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

