"use client";

import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";

const LocationMap = () => {
  const t = useTranslations('contact');
  
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-foreground">
            {t('visitStoreTitle')}
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            {t('visitStoreDescription')}
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-xl">
          {/* Mapa de Google Maps embebido */}
          <div className="relative w-full h-[500px] bg-muted">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3732.8301932968425!2d-103.34285392351254!3d20.676486280886152!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8428b1f23ef0a8bd%3A0xf6a25c6fa5df3784!2sMagno%20Centro%20Joyero%20San%20Juan%20de%20Dios!5e0!3m2!1ses!2smx!4v1764128837846!5m2!1ses!2smx"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t('storeName')}
            />
          </div>

          {/* Información adicional sobre el mapa */}
          <div className="bg-card p-6 lg:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10">
                <MapPin className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {t('storeName')}
                </h3>
                <a
                  href="https://maps.app.goo.gl/GBnsUNi5fe9QNEDj8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors block"
                >
                  {t('storeAddress')}
                </a>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href="https://maps.app.goo.gl/GBnsUNi5fe9QNEDj8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-medium text-white hover:bg-[#B8941E] transition-colors"
                  >
                    <MapPin className="h-4 w-4" />
                    {t('getDirections')}
                  </a>
                </div>
              </div>
            </div>

            {/* Instrucciones de acceso */}
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="font-semibold text-foreground mb-3">
                {t('accessInfo')}
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-0.5">•</span>
                  <span>
                    {t('accessInfo1')}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-0.5">•</span>
                  <span>
                    {t('accessInfo2')}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-0.5">•</span>
                  <span>
                    {t('accessInfo3')}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-0.5">•</span>
                  <span>
                    {t('accessInfo4')}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationMap;
