"use client";

import { useTranslations } from 'next-intl';
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import ContactForm from "@/components/contact/contact-form";
import ContactInfo from "@/components/contact/contact-info";
import LocationMap from "@/components/contact/location-map";

const ContactPage = () => {
  const t = useTranslations('contact');
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-muted/50 to-background py-16 lg:py-20 pt-32 lg:pt-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wide">
              {t('subtitle')}
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('getInTouchDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Formulario y Contacto */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Formulario - 2 columnas */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>

            {/* Información de contacto - 1 columna */}
            <div className="lg:col-span-1">
              <ContactInfo />
            </div>
          </div>
        </div>
      </section>

      {/* Mapa de ubicación */}
      <LocationMap />

      {/* FAQ rápido */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold text-foreground text-center mb-12">
              {t('faqTitle')}
            </h2>

            <div className="space-y-6">
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">
                  {t('faq1Q')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('faq1A')}
                </p>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">
                  {t('faq2Q')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('faq2A')}
                </p>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">
                  {t('faq3Q')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('faq3A')}
                </p>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">
                  {t('faq4Q')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('faq4A')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
