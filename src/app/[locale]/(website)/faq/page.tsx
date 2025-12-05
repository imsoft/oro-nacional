"use client";

import { HelpCircle, Search } from "lucide-react";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

const FAQPage = () => {
  const t = useTranslations('faq');
  
  const faqCategories = [
    {
      titleKey: "categories.products",
      questions: [
        { key: "products.karat" },
        { key: "products.solid" },
        { key: "products.customize" },
        { key: "products.stones" },
        { key: "products.resize" },
      ],
    },
    {
      titleKey: "categories.purchase",
      questions: [
        { key: "purchase.payment" },
        { key: "purchase.installments" },
        { key: "purchase.secure" },
        { key: "purchase.layaway" },
        { key: "purchase.invoice" },
      ],
    },
    {
      titleKey: "categories.shipping",
      questions: [
        { key: "shipping.cost" },
        { key: "shipping.time" },
        { key: "shipping.tracking" },
        { key: "shipping.insured" },
        { key: "shipping.pickup" },
      ],
    },
    {
      titleKey: "categories.returns",
      questions: [
        { key: "returns.return" },
        { key: "returns.exchange" },
        { key: "returns.size" },
        { key: "returns.engraved" },
      ],
    },
    {
      titleKey: "categories.warranty",
      questions: [
        { key: "warranty.duration" },
        { key: "warranty.maintenance" },
        { key: "warranty.claim" },
        { key: "warranty.cleaning" },
      ],
    },
    {
      titleKey: "categories.about",
      questions: [
        { key: "about.location" },
        { key: "about.experience" },
        { key: "about.manufacturer" },
        { key: "about.buyGold" },
        { key: "about.contact" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-muted/50 to-background py-16 lg:py-20 pt-32 lg:pt-40">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AF37]/10 mb-6">
            <HelpCircle className="h-8 w-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>

          {/* Buscador (decorativo por ahora) */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal - FAQ por categorías */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                  <span className="w-1 h-8 bg-[#D4AF37] rounded-full"></span>
                  {t(category.titleKey)}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="rounded-lg bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-foreground mb-2 flex items-start gap-2">
                        <HelpCircle className="h-5 w-5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                        <span>{t(`questions.${item.key}.q`)}</span>
                      </h3>
                      <p className="text-sm text-muted-foreground ml-7">
                        {t(`questions.${item.key}.a`)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* No encontraste tu respuesta */}
          <div className="mt-16 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 p-8 lg:p-12 border border-[#D4AF37]/20 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t('notFoundTitle')}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {t('notFoundDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#D4AF37] hover:bg-[#B8941E] text-white font-medium transition-colors"
              >
                {t('contactForm')}
              </Link>
              <a
                href="tel:+523312345678"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white font-medium transition-colors"
              >
                <span className="mr-2">📞</span>
                {t('callUs')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQPage;
