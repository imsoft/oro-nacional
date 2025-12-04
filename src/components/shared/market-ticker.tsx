"use client";

import { useState, useEffect } from 'react';
import { DollarSign, Gem, TrendingUp, TrendingDown } from 'lucide-react';

export function MarketTicker() {
  const [goldQuotation, setGoldQuotation] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener cotización del oro y tasa de cambio desde configuración
      const [goldResponse, exchangeResponse] = await Promise.all([
        fetch('/api/settings/gold-quotation'),
        fetch('/api/settings/exchange-rate'),
      ]);

      if (goldResponse.ok) {
        const goldResult = await goldResponse.json();
        if (goldResult.gold_quotation) {
          setGoldQuotation(goldResult.gold_quotation);
        }
      }

      if (exchangeResponse.ok) {
        const exchangeResult = await exchangeResponse.json();
        if (exchangeResult.exchange_rate) {
          setExchangeRate(exchangeResult.exchange_rate);
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
  if (isLoading && (!goldQuotation || !exchangeRate)) {
    return (
      <div className="relative bg-gradient-to-r from-[#D4AF37] via-[#B8941E] to-[#D4AF37] text-white py-3 overflow-hidden border-b border-[#A0821A]/50 shadow-md">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Gem className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Cargando información del mercado...</span>
          </div>
        </div>
      </div>
    );
  }

  // Si hay error y no hay datos, no mostrar nada
  if (error && (!goldQuotation || !exchangeRate)) {
    return null;
  }

  // Si no hay datos, no mostrar nada
  if (!goldQuotation || !exchangeRate) {
    return null;
  }

  // Contenido de la cintilla con mejor separación
  const tickerContent = (
    <>
      {/* Cotización del Oro */}
      <div className="flex items-center gap-2 px-4">
        <Gem className="h-4 w-4 flex-shrink-0 text-white" />
        <span className="text-sm font-semibold text-white">Cotización del Oro:</span>
        <span className="text-sm font-bold text-white">
          ${formatPrice(goldQuotation)} MXN/gr
        </span>
      </div>

      {/* Separador */}
      <div className="w-px h-5 bg-white/50 flex-shrink-0" />

      {/* Tasa de Cambio */}
      <div className="flex items-center gap-2 px-4">
        <DollarSign className="h-4 w-4 flex-shrink-0 text-white" />
        <span className="text-sm font-semibold text-white">Tasa de Cambio:</span>
        <span className="text-sm font-bold text-white">
          ${formatPrice(exchangeRate, 2)} MXN/USD
        </span>
      </div>

      {/* Separador */}
      <div className="w-px h-5 bg-white/50 flex-shrink-0" />

      {/* Información adicional: Precio del oro por onza (calculado) */}
      <div className="flex items-center gap-2 px-4">
        <span className="text-xs text-white/90">Oro por onza:</span>
        <span className="text-sm font-bold text-white">
          ${formatPrice(goldQuotation * 31.1035)} MXN/oz
        </span>
      </div>

      {/* Separador */}
      <div className="w-px h-5 bg-white/50 flex-shrink-0" />

      {/* Información adicional: Precio del oro en USD (calculado) */}
      <div className="flex items-center gap-2 px-4">
        <span className="text-xs text-white/90">Oro en USD:</span>
        <span className="text-sm font-bold text-white">
          ${formatPrice(goldQuotation / exchangeRate, 2)} USD/gr
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

