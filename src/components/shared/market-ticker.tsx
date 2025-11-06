"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, Gem } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/market/prices');
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }

      const result = await response.json();
      setData(result.data);
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

  if (isLoading && !data) {
    return (
      <div className="bg-gradient-to-r from-[#D4AF37] via-[#B8941E] to-[#D4AF37] text-white py-2 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <Gem className="h-4 w-4 animate-pulse" />
            <span className="animate-pulse">Cargando precios...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return null; // Don't show error banner
  }

  const formatPrice = (price: number, decimals: number = 2) => {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(price);
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${formatPrice(change, 2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-200';
    if (change < 0) return 'text-red-200';
    return 'text-white/80';
  };

  return (
    <div className="bg-gradient-to-r from-[#D4AF37] via-[#B8941E] to-[#D4AF37] text-white py-2.5 px-4 overflow-hidden border-b border-[#A0821A] shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-8 md:gap-12 text-sm flex-wrap">
          {/* Oro */}
          <div className="flex items-center gap-3 animate-[slide-in-left_0.5s_ease-out]">
            <Gem className="h-5 w-5 text-white flex-shrink-0" />
            <div className="flex flex-col md:flex-row md:items-center md:gap-2">
              <span className="font-semibold">Oro:</span>
              {data ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base">
                    ${formatPrice(data.gold.value)} MXN/oz
                  </span>
                  <div className={`flex items-center gap-1 ${getChangeColor(data.gold.change)}`}>
                    {getTrendIcon(data.gold.change)}
                    <span className="text-xs font-medium">
                      {formatChange(data.gold.change, data.gold.changePercent)}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="animate-pulse">---</span>
              )}
            </div>
          </div>

          {/* Separador */}
          <div className="hidden md:block w-px h-6 bg-white/30" />

          {/* Dólar */}
          <div className="flex items-center gap-3 animate-[slide-in-right_0.5s_ease-out]">
            <DollarSign className="h-5 w-5 text-white flex-shrink-0" />
            <div className="flex flex-col md:flex-row md:items-center md:gap-2">
              <span className="font-semibold">USD/MXN:</span>
              {data ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base">
                    ${formatPrice(data.usd.value, 4)}
                  </span>
                  <div className={`flex items-center gap-1 ${getChangeColor(data.usd.change)}`}>
                    {getTrendIcon(data.usd.change)}
                    <span className="text-xs font-medium">
                      {formatChange(data.usd.change, data.usd.changePercent)}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="animate-pulse">---</span>
              )}
            </div>
          </div>

          {/* Indicador de actualización en vivo */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-white/80">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
            <span>Actualización en vivo</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

