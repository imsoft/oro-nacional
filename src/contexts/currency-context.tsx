"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoreSettings } from '@/lib/supabase/settings';

export type Currency = 'MXN' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  convertPrice: (priceMXN: number, priceUSD?: number | null) => number;
  formatPrice: (price: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = 'oro-nacional-currency';
const DEFAULT_EXCHANGE_RATE = 0.0588; // 1 USD = 17 MXN (aproximadamente)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('MXN');
  const [exchangeRate, setExchangeRateState] = useState<number>(DEFAULT_EXCHANGE_RATE);

  // Cargar tasa de cambio desde store_settings
  useEffect(() => {
    const loadExchangeRate = async () => {
      try {
        const settings = await getStoreSettings();
        if (settings?.exchange_rate) {
          setExchangeRateState(settings.exchange_rate);
        }
      } catch (error) {
        console.error('Error loading exchange rate:', error);
      }
    };
    loadExchangeRate();
  }, []);

  // Cargar moneda desde localStorage al montar
  useEffect(() => {
    const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY) as Currency | null;
    if (savedCurrency && (savedCurrency === 'MXN' || savedCurrency === 'USD')) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  // Guardar moneda en localStorage cuando cambia
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
  };

  // Convertir precio según la moneda seleccionada
  const convertPrice = (priceMXN: number, priceUSD?: number | null): number => {
    if (currency === 'USD') {
      // Si hay precio USD fijo, usarlo; si no, convertir desde MXN
      return priceUSD ?? priceMXN * exchangeRate;
    }
    // Si es MXN, devolver el precio MXN directamente
    return priceMXN;
  };

  // Formatear precio según la moneda
  const formatPrice = (price: number): string => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    }
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRate,
        setExchangeRate: setExchangeRateState,
        convertPrice,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

