"use client";

import { useTranslations } from "next-intl";
import { Package, Gem, Shield, Truck, Award, Clock } from "lucide-react";

// Datos de contacto reales (los mismos que se muestran en el footer)
const CONTACT_PHONE = "3326363714";
const CONTACT_PHONE_DISPLAY = "33 2636 3714";
const CONTACT_EMAIL = "hola@oronacional.com";

interface ProductDetailsProps {
  product: {
    material: string;
    hasEngraving?: boolean;
  };
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const t = useTranslations("product");
  const tContact = useTranslations("contact");

  return (
    <div className="space-y-6">
      {/* Información técnica */}
      <div className="bg-muted/30 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Package className="h-5 w-5 text-[#D4AF37]" />
          {t("detailsTitle")}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Gem className="h-5 w-5 text-[#D4AF37]" />
            <div>
              <p className="text-sm font-medium">{t("material")}</p>
              <p className="text-sm text-muted-foreground">{product.material}</p>
            </div>
          </div>

          {product.hasEngraving && (
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[#D4AF37]" />
              <div>
                <p className="text-sm font-medium">{t("engraving")}</p>
                <p className="text-sm text-muted-foreground">{t("engravingAvailable")}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Beneficios y garantías */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t("benefitsTitle")}</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <Shield className="h-8 w-8 text-[#D4AF37] mx-auto mb-2" />
            <h4 className="font-semibold text-sm mb-1">{t("benefitCertified")}</h4>
            <p className="text-xs text-muted-foreground">{t("benefitCertifiedDescription")}</p>
          </div>
          
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <Truck className="h-8 w-8 text-[#D4AF37] mx-auto mb-2" />
            <h4 className="font-semibold text-sm mb-1">{t("benefitFreeShipping")}</h4>
            <p className="text-xs text-muted-foreground">{t("benefitFreeShippingDescription")}</p>
          </div>
          
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <Award className="h-8 w-8 text-[#D4AF37] mx-auto mb-2" />
            <h4 className="font-semibold text-sm mb-1">{t("benefitWarranty")}</h4>
            <p className="text-xs text-muted-foreground">{t("benefitWarrantyDescription")}</p>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-lg p-6">
        <h4 className="font-semibold text-[#D4AF37] mb-2">{t("needHelp")}</h4>
        <p className="text-sm text-muted-foreground mb-3">
          {t("needHelpDescription")}
        </p>
        <div className="text-sm space-y-1">
          <p><strong>{t("helpLocation")}</strong> {t("helpLocationValue")}</p>
          <p><strong>{t("helpHours")}</strong> {tContact("hoursWeekdays")} · {tContact("hoursSaturday")}</p>
          <p>
            <strong>{t("helpPhone")}</strong>{" "}
            <a href={`tel:+52${CONTACT_PHONE}`} className="hover:text-[#D4AF37]">{CONTACT_PHONE_DISPLAY}</a>
          </p>
          <p>
            <strong>{t("helpEmail")}</strong>{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-[#D4AF37]">{CONTACT_EMAIL}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
