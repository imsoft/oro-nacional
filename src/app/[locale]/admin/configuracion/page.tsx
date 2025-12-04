"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Save, Store, Mail, MapPin, Phone, Globe, RefreshCw, Loader2, Languages } from "lucide-react";
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
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { getStoreSettings, updateStoreSettings } from "@/lib/supabase/settings";

export default function AdminSettings() {
  const t = useTranslations('admin.settings');
  const locale = useLocale() as 'es' | 'en';
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [detectedCountry, setDetectedCountry] = useState<string>('MX');
  const [countryName, setCountryName] = useState<string>('México');
  const [isDetectingCountry, setIsDetectingCountry] = useState(false);

  // Store settings state
  const [storeName, setStoreName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [freeShippingFrom, setFreeShippingFrom] = useState('');
  const [standardShippingCost, setStandardShippingCost] = useState('');
  const [expressShippingCost, setExpressShippingCost] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');

  // Moneda basada en el idioma: Español -> USD, Inglés -> MXN
  const currency = locale === 'es' ? 'USD' : 'MXN';

  // Zona horaria siempre Ciudad de México
  const timezone = 'America/Mexico_City';

  // Idioma basado en el locale actual
  const language = locale;

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await getStoreSettings();
        if (settings) {
          setStoreName(settings.store_name);
          setContactEmail(settings.contact_email);
          setPhone(settings.phone);
          setWebsite(settings.website);
          setAddress(settings.address);
          setDescription(settings.description);
          setFreeShippingFrom(settings.free_shipping_from.toString());
          setStandardShippingCost(settings.standard_shipping_cost.toString());
          setExpressShippingCost(settings.express_shipping_cost.toString());
          setDeliveryTime(settings.delivery_time);
          setExchangeRate(settings.exchange_rate?.toString() || '0.0588');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        alert(locale === 'es'
          ? 'Error al cargar las configuraciones'
          : 'Error loading settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [locale]);

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
    try {
      const result = await updateStoreSettings({
        store_name: storeName,
        contact_email: contactEmail,
        phone: phone,
        website: website,
        address: address,
        description: description,
        free_shipping_from: parseFloat(freeShippingFrom) || 0,
        standard_shipping_cost: parseFloat(standardShippingCost) || 0,
        express_shipping_cost: parseFloat(expressShippingCost) || 0,
        delivery_time: deliveryTime,
        exchange_rate: parseFloat(exchangeRate) || 0.0588,
      });

      if (result.success) {
        alert(locale === 'es'
          ? 'Configuración guardada exitosamente'
          : 'Settings saved successfully');
      } else {
        alert(result.error || (locale === 'es'
          ? 'Error al guardar la configuración'
          : 'Error saving settings'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(locale === 'es'
        ? 'Error al guardar la configuración'
        : 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

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
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
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
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
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
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-10"
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="storeDescription">{t('storeInfo.description')}</Label>
              <Textarea
                id="storeDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                value={freeShippingFrom}
                onChange={(e) => setFreeShippingFrom(e.target.value)}
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
                value={standardShippingCost}
                onChange={(e) => setStandardShippingCost(e.target.value)}
                placeholder={t('shipping.shippingCostPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expressShipping">{t('shipping.expressShipping')}</Label>
              <Input
                id="expressShipping"
                type="number"
                value={expressShippingCost}
                onChange={(e) => setExpressShippingCost(e.target.value)}
                placeholder={t('shipping.expressCostPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryTime">{t('shipping.deliveryTime')}</Label>
              <Input
                id="deliveryTime"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                placeholder={t('shipping.deliveryTimePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exchangeRate">Tasa de Cambio USD/MXN</Label>
              <Input
                id="exchangeRate"
                type="number"
                step="0.0001"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                placeholder="0.0588"
              />
              <p className="text-xs text-muted-foreground">
                Tasa de cambio para convertir precios de MXN a USD (ej: 0.0588 significa 1 USD = 17 MXN)
              </p>
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

        {/* Configuración de Idioma */}
        <div className="rounded-lg bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-[#D4AF37]/10 p-2">
              <Languages className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {locale === 'es' ? 'Idioma del Panel' : 'Panel Language'}
            </h2>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {locale === 'es'
                ? 'Cambia el idioma del panel de administración. Esta configuración solo afecta la interfaz de administración.'
                : 'Change the language of the admin panel. This setting only affects the administration interface.'}
            </p>

            <div className="flex items-center gap-4">
              <Label htmlFor="languageSwitcher" className="text-sm font-medium">
                {locale === 'es' ? 'Seleccionar idioma:' : 'Select language:'}
              </Label>
              <LanguageSwitcher />
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
