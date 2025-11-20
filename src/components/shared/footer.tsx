"use client";

import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { getStoreSettings, type StoreSettings } from "@/lib/supabase/settings";

const Footer = () => {
  const t = useTranslations("footer");
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Load store settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const data = await getStoreSettings();
      setSettings(data);
    };
    loadSettings();
  }, []);

  const navigation = {
    tienda: [
      { name: t("shop.rings"), href: "/rings" },
      { name: t("shop.necklaces"), href: "/necklaces" },
      { name: t("shop.earrings"), href: "/earrings" },
      { name: t("shop.bracelets"), href: "/bracelets" },
    ],
    empresa: [
      { name: t("company.about"), href: "/about" },
      { name: t("company.contact"), href: "/contact" },
      { name: t("company.blog"), href: "/blog" },
      { name: t("company.catalog"), href: "/catalog" },
    ],
    servicio: [
      { name: t("service.shipping"), href: "/shipping" },
      { name: t("service.warranty"), href: "/warranty" },
      { name: t("service.care"), href: "/care" },
      { name: t("service.faq"), href: "/faq" },
    ],
    legal: [
      { name: t("legal.privacy"), href: "/privacy" },
      { name: t("legal.terms"), href: "/terms" },
      { name: t("legal.cookies"), href: "/privacy#cookies" },
    ],
  };
  return (
    <footer className="bg-muted" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div>
              <Image
                src="/logos/logo-oro-nacional.png"
                alt="Logo Oro Nacional - Joyería Elegante en Jalisco"
                width={240}
                height={80}
                className="h-16 w-auto md:h-20"
              />
              <p className="mt-4 text-sm text-muted-foreground">
                {t("tagline")}
              </p>
            </div>
            <div className="flex space-x-6">
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="sr-only">{t("social.facebook")}</span>
                <Facebook className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="sr-only">{t("social.instagram")}</span>
                <Instagram className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="sr-only">{t("social.twitter")}</span>
                <Twitter className="h-6 w-6" />
              </Link>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{settings?.address || t("location")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <Link
                  href={`tel:${settings?.phone?.replace(/\s/g, '') || '+523312345678'}`}
                  className="hover:text-foreground"
                >
                  {settings?.phone || t("phoneNumber")}
                </Link>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <Link
                  href={`mailto:${settings?.contact_email || 'contacto@oronacional.com'}`}
                  className="hover:text-foreground"
                >
                  {settings?.contact_email || t("emailAddress")}
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {t("shop.title")}
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.tienda.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground">
                  {t("company.title")}
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.empresa.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {t("service.title")}
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.servicio.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground">{t("legal.title")}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-border pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Oro Nacional. {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
