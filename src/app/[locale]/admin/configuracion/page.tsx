"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Save, Store, Mail, MapPin, Phone, Globe, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ConfiguracionAdmin() {
  const t = useTranslations('admin.settings');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
          <p className="mt-2 text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#D4AF37] hover:bg-[#B8941E] text-white"
        >
          <Save className="mr-2 h-5 w-5" />
          {isSaving ? t('saving') : t('saveChanges')}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Información de la Tienda */}
        <div className="rounded-lg bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-[#D4AF37]/10 p-2">
              <Store className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {t('storeInfo.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="storeName">{t('storeInfo.storeName')}</Label>
              <Input
                id="storeName"
                defaultValue="Oro Nacional"
                placeholder={t('storeInfo.storeNamePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeEmail">{t('storeInfo.contactEmail')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="storeEmail"
                  type="email"
                  defaultValue="contacto@oronacional.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storePhone">{t('storeInfo.phone')}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="storePhone"
                  type="tel"
                  defaultValue="+52 33 1234 5678"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeWebsite">{t('storeInfo.website')}</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="storeWebsite"
                  type="url"
                  defaultValue="https://oronacional.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="storeAddress">{t('storeInfo.address')}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="storeAddress"
                  defaultValue="Guadalajara, Jalisco, México"
                  className="pl-10"
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="storeDescription">{t('storeInfo.description')}</Label>
              <Textarea
                id="storeDescription"
                defaultValue="Elegancia y tradición jalisciense desde 1990. Especialistas en joyería fina de oro."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Configuración de Envío */}
        <div className="rounded-lg bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-[#D4AF37]/10 p-2">
              <MapPin className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {t('shipping.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="freeShipping">{t('shipping.freeShippingFrom')}</Label>
              <Input
                id="freeShipping"
                type="number"
                defaultValue="3000"
                placeholder={t('shipping.freeShippingPlaceholder')}
              />
              <p className="text-xs text-muted-foreground">
                {t('shipping.freeShippingHelp')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingCost">{t('shipping.standardShippingCost')}</Label>
              <Input
                id="shippingCost"
                type="number"
                defaultValue="0"
                placeholder={t('shipping.shippingCostPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expressShipping">{t('shipping.expressShipping')}</Label>
              <Input
                id="expressShipping"
                type="number"
                defaultValue="200"
                placeholder={t('shipping.expressCostPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryTime">{t('shipping.deliveryTime')}</Label>
              <Input
                id="deliveryTime"
                defaultValue="3-5"
                placeholder={t('shipping.deliveryTimePlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Configuración de Pagos */}
        <div className="rounded-lg bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-[#D4AF37]/10 p-2">
              <CreditCard className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {t('payments.title')}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t('payments.creditDebitCards')}</p>
                  <p className="text-sm text-muted-foreground">{t('payments.creditCardsDescription')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 font-medium">{t('payments.active')}</span>
                <div className="h-6 w-11 rounded-full bg-green-600 relative">
                  <div className="h-5 w-5 rounded-full bg-white absolute right-0.5 top-0.5"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-purple-100 flex items-center justify-center">
                  <span className="text-xl">🏦</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{t('payments.bankTransfer')}</p>
                  <p className="text-sm text-muted-foreground">{t('payments.bankTransferDescription')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 font-medium">{t('payments.active')}</span>
                <div className="h-6 w-11 rounded-full bg-green-600 relative">
                  <div className="h-5 w-5 rounded-full bg-white absolute right-0.5 top-0.5"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{t('payments.cashOnDelivery')}</p>
                  <p className="text-sm text-muted-foreground">{t('payments.cashOnDeliveryDescription')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 font-medium">{t('payments.active')}</span>
                <div className="h-6 w-11 rounded-full bg-green-600 relative">
                  <div className="h-5 w-5 rounded-full bg-white absolute right-0.5 top-0.5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuración de Moneda y Región */}
        <div className="rounded-lg bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-[#D4AF37]/10 p-2">
              <Globe className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {t('regional.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="currency">{t('regional.currency')}</Label>
              <Select defaultValue="MXN">
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MXN">{t('regional.currencyMXN')}</SelectItem>
                  <SelectItem value="USD">{t('regional.currencyUSD')}</SelectItem>
                  <SelectItem value="EUR">{t('regional.currencyEUR')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">{t('regional.timezone')}</Label>
              <Select defaultValue="America/Mexico_City">
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Mexico_City">{t('regional.timezoneMexicoCity')}</SelectItem>
                  <SelectItem value="America/Tijuana">{t('regional.timezoneTijuana')}</SelectItem>
                  <SelectItem value="America/Cancun">{t('regional.timezoneCancun')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">{t('regional.language')}</Label>
              <Select defaultValue="es">
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">{t('regional.languageEs')}</SelectItem>
                  <SelectItem value="en">{t('regional.languageEn')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">{t('regional.country')}</Label>
              <Select defaultValue="MX">
                <SelectTrigger id="country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MX">{t('regional.countryMX')}</SelectItem>
                  <SelectItem value="US">{t('regional.countryUS')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Save Button at bottom */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
            className="bg-[#D4AF37] hover:bg-[#B8941E] text-white"
          >
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? t('saving') : t('saveAllChanges')}
          </Button>
        </div>
      </div>
    </div>
  );
}
