"use client";

import Link from "next/link";
import { useTranslations } from 'next-intl';
import { ShoppingBag, ArrowLeft } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import CartItem from "@/components/cart/cart-item";
import OrderSummary from "@/components/cart/order-summary";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

const CartPage = () => {
  const t = useTranslations('cart');
  const { items, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-1 flex items-center justify-center px-6 pt-32">
          <div className="text-center max-w-md">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-semibold text-foreground mb-4">
              {t('emptyTitle')}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t('emptyDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-[#D4AF37] hover:bg-[#B8941E] text-white"
              >
                <Link href="/catalog">{t('viewCatalog')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/">{t('goHome')}</Link>
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16 pt-32 lg:pt-40">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/catalog"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('continueShopping')}
          </Link>
          <h1 className="text-3xl font-semibold text-foreground">
            {t('title')}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t('itemCountText', { count: items.length })}
          </p>
        </div>

        {/* Grid de 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Lista de productos - 2 columnas */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-card p-6 lg:p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {t('products')}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {t('clearCart')}
                </Button>
              </div>

              <div className="divide-y divide-border">
                {items.map((item) => (
                  <CartItem key={`${item.id}-${item.size}`} item={item} />
                ))}
              </div>
            </div>

            {/* Métodos de pago aceptados */}
            <div className="mt-6 rounded-lg bg-muted/50 p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {t('acceptedPaymentMethods')}
              </h3>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="px-4 py-2 bg-white rounded border border-border">
                  <span className="text-xs font-medium">💳 Visa</span>
                </div>
                <div className="px-4 py-2 bg-white rounded border border-border">
                  <span className="text-xs font-medium">💳 Mastercard</span>
                </div>
                <div className="px-4 py-2 bg-white rounded border border-border">
                  <span className="text-xs font-medium">💳 American Express</span>
                </div>
                <div className="px-4 py-2 bg-white rounded border border-border">
                  <span className="text-xs font-medium">🏦 {t('transfer')}</span>
                </div>
                <div className="px-4 py-2 bg-white rounded border border-border">
                  <span className="text-xs font-medium">💰 {t('cash')}</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                {t('installmentsAvailable')}
              </p>
            </div>
          </div>

          {/* Resumen de orden - 1 columna */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg bg-card p-6 text-center shadow-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {t('securePurchase')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('securePurchaseDesc')}
            </p>
          </div>

          <div className="rounded-lg bg-card p-6 text-center shadow-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {t('premiumPackaging')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('premiumPackagingDesc')}
            </p>
          </div>

          <div className="rounded-lg bg-card p-6 text-center shadow-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {t('certificateIncluded')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('certificateIncludedDesc')}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
