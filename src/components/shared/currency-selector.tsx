"use client";

import { useCurrency } from '@/contexts/currency-context';
import { Button } from '@/components/ui/button';
import { DollarSign, Coins } from 'lucide-react';

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-1">
      <Button
        variant={currency === 'MXN' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setCurrency('MXN')}
        className={`flex items-center gap-2 ${
          currency === 'MXN'
            ? 'bg-[#D4AF37] text-white hover:bg-[#B8941E]'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Coins className="h-4 w-4" />
        <span className="text-sm font-medium">MXN</span>
      </Button>
      <Button
        variant={currency === 'USD' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setCurrency('USD')}
        className={`flex items-center gap-2 ${
          currency === 'USD'
            ? 'bg-[#D4AF37] text-white hover:bg-[#B8941E]'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <DollarSign className="h-4 w-4" />
        <span className="text-sm font-medium">USD</span>
      </Button>
    </div>
  );
}

