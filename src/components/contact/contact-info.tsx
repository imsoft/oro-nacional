"use client";

import { useTranslations } from "next-intl";
import { Mail, Phone, MapPin, Clock, Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getStoreSettings, type StoreSettings } from "@/lib/supabase/settings";

const ContactInfo = () => {
  const t = useTranslations('contact');
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Load store settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const data = await getStoreSettings();
      setSettings(data);
    };
    loadSettings();
  }, []);
  
  return (
    <div className="space-y-8">
      {/* Información de contacto */}
      <div className="rounded-2xl bg-card p-8 shadow-lg">
        <h3 className="text-xl font-semibold text-foreground mb-6">
          {t('contactInfo')}
        </h3>

        <div className="space-y-5">
          {/* Dirección */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10">
              <MapPin className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t('address')}</p>
              <a
                href="https://maps.app.goo.gl/GBnsUNi5fe9QNEDj8"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors whitespace-pre-line block"
              >
                {settings?.address || t('addressFull')}
              </a>
            </div>
          </div>

          {/* Teléfono */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10">
              <Phone className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t('phoneNumber')}</p>
              <a
                href={`tel:${settings?.phone?.replace(/\s/g, '') || '+523312345678'}`}
                className="mt-1 text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors"
              >
                {settings?.phone || '+52 33 1234 5678'}
              </a>
              <p className="text-xs text-muted-foreground mt-1">
                {t('phoneHours')}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10">
              <Mail className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t('emailAddress')}</p>
              <a
                href={`mailto:${settings?.contact_email || 'contacto@oronacional.com'}`}
                className="mt-1 text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors"
              >
                {settings?.contact_email || 'contacto@oronacional.com'}
              </a>
              <p className="text-xs text-muted-foreground mt-1">
                {t('emailResponse')}
              </p>
            </div>
          </div>

          {/* Horarios */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10">
              <Clock className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t('hours')}</p>
              <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                <p>{t('hoursWeekdays')}</p>
                <p>{t('hoursSaturday')}</p>
                <p>{t('hoursSunday')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Redes sociales */}
      <div className="rounded-2xl bg-card p-8 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t('followUs')}
        </h3>
        <div className="space-y-3">
          <a
            href="https://facebook.com/oronacional"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
          >
            <Facebook className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground group-hover:text-[#D4AF37] transition-colors">
                {t('facebook')}
              </p>
              <p className="text-xs text-muted-foreground">@OroNacional</p>
            </div>
          </a>

          <a
            href="https://instagram.com/oronacional"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
          >
            <Instagram className="h-5 w-5 text-pink-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground group-hover:text-[#D4AF37] transition-colors">
                {t('instagram')}
              </p>
              <p className="text-xs text-muted-foreground">@OroNacional</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
