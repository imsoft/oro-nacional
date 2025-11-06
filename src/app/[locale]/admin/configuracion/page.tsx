"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Save, Store, Mail, MapPin, Phone, Globe, RefreshCw } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

export default function AdminSettings() {
  const t = useTranslations('admin.settings');
  const locale = useLocale() as 'es' | 'en';
  const [isSaving, setIsSaving] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<string>('MX');
  const [countryName, setCountryName] = useState<string>('México');
  const [isDetectingCountry, setIsDetectingCountry] = useState(false);

  // Moneda basada en el idioma: Español -> USD, Inglés -> MXN
  const currency = locale === 'es' ? 'USD' : 'MXN';
  
  // Zona horaria siempre Ciudad de México
  const timezone = 'America/Mexico_City';
  
  // Idioma basado en el locale actual
  const language = locale;

  // Detectar país automáticamente
  useEffect(() => {
    const detectCountry = async () => {
      setIsDetectingCountry(true);
      try {
        const response = await fetch('/api/utils/detect-country');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setDetectedCountry(data.country);
            setCountryName(data.countryName);
          }
        }
      } catch (error) {
        console.error('Error detecting country:', error);
      } finally {
        setIsDetectingCountry(false);
      }
    };

    detectCountry();
  }, []);

  const handleDetectCountry = async () => {
    setIsDetectingCountry(true);
    try {
      const response = await fetch('/api/utils/detect-country');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDetectedCountry(data.country);
          setCountryName(data.countryName);
        }
      }
    } catch (error) {
      console.error('Error detecting country:', error);
    } finally {
      setIsDetectingCountry(false);
    }
  };

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

          <div className="mb-4 p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground mb-2">
              {locale === 'es' 
                ? 'Estos valores se configuran automáticamente según el idioma y ubicación del usuario.'
                : 'These values are automatically configured based on user language and location.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="currency">{t('regional.currency')}</Label>
                <Badge variant="secondary" className="text-xs">
                  {locale === 'es' ? 'Auto (USD)' : 'Auto (MXN)'}
                </Badge>
              </div>
              <div className="relative">
                <Select value={currency} disabled>
                  <SelectTrigger id="currency" className="w-full bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MXN">{t('regional.currencyMXN')}</SelectItem>
                    <SelectItem value="USD">{t('regional.currencyUSD')}</SelectItem>
                    <SelectItem value="EUR">{t('regional.currencyEUR')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {locale === 'es' 
                  ? 'Español → USD | Inglés → MXN'
                  : 'Spanish → USD | English → MXN'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="timezone">{t('regional.timezone')}</Label>
                <Badge variant="secondary" className="text-xs">Fijo</Badge>
              </div>
              <div className="relative">
                <Select value={timezone} disabled>
                  <SelectTrigger id="timezone" className="w-full bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Mexico_City">{t('regional.timezoneMexicoCity')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {locale === 'es' 
                  ? 'Siempre Ciudad de México (GMT-6)'
                  : 'Always Mexico City (GMT-6)'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="language">{t('regional.language')}</Label>
                <Badge variant="secondary" className="text-xs">Actual</Badge>
              </div>
              <div className="relative">
                <Select value={language} disabled>
                  <SelectTrigger id="language" className="w-full bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">{t('regional.languageEs')}</SelectItem>
                    <SelectItem value="en">{t('regional.languageEn')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {locale === 'es' 
                  ? 'Basado en el idioma actual de la página'
                  : 'Based on current page language'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="country">{t('regional.country')}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDetectCountry}
                  disabled={isDetectingCountry}
                  className="h-6 px-2 text-xs"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isDetectingCountry ? 'animate-spin' : ''}`} />
                  {isDetectingCountry 
                    ? (locale === 'es' ? 'Detectando...' : 'Detecting...')
                    : (locale === 'es' ? 'Detectar' : 'Detect')}
                </Button>
              </div>
              <div className="relative">
                <Select value={detectedCountry} disabled>
                  <SelectTrigger id="country" className="w-full bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MX">{t('regional.countryMX')}</SelectItem>
                    <SelectItem value="US">{t('regional.countryUS')}</SelectItem>
                    <SelectItem value="CA">Canadá</SelectItem>
                    <SelectItem value="CO">Colombia</SelectItem>
                    <SelectItem value="AR">Argentina</SelectItem>
                    <SelectItem value="CL">Chile</SelectItem>
                    <SelectItem value="PE">Perú</SelectItem>
                    <SelectItem value="ES">España</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {isDetectingCountry 
                  ? (locale === 'es' ? 'Detectando país...' : 'Detecting country...')
                  : `${locale === 'es' ? 'País detectado' : 'Detected country'}: ${countryName}`}
              </p>
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
