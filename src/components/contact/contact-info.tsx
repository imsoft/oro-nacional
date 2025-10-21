import { Mail, Phone, MapPin, Clock, Facebook, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContactInfo = () => {
  return (
    <div className="space-y-8">
      {/* Información de contacto */}
      <div className="rounded-2xl bg-card p-8 shadow-lg">
        <h3 className="text-xl font-semibold text-foreground mb-6">
          Información de Contacto
        </h3>

        <div className="space-y-5">
          {/* Dirección */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10">
              <MapPin className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Dirección</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Av. Chapultepec 234, Col. Americana
                <br />
                Guadalajara, Jalisco 44160
                <br />
                México
              </p>
            </div>
          </div>

          {/* Teléfono */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10">
              <Phone className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Teléfono</p>
              <a
                href="tel:+523312345678"
                className="mt-1 text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors"
              >
                +52 33 1234 5678
              </a>
              <p className="text-xs text-muted-foreground mt-1">
                Lun - Vie: 10:00 AM - 7:00 PM
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10">
              <Mail className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Email</p>
              <a
                href="mailto:contacto@oronacional.com"
                className="mt-1 text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors"
              >
                contacto@oronacional.com
              </a>
              <p className="text-xs text-muted-foreground mt-1">
                Respondemos en 24 horas
              </p>
            </div>
          </div>

          {/* Horarios */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10">
              <Clock className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Horarios</p>
              <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                <p>Lunes a Viernes: 10:00 AM - 7:00 PM</p>
                <p>Sábado: 10:00 AM - 3:00 PM</p>
                <p>Domingo: Cerrado</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp */}
      <div className="rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 p-8 border border-green-500/20">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-foreground">
            Contacto Directo por WhatsApp
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          ¿Necesitas ayuda inmediata? Chatea con nosotros por WhatsApp y te
          atenderemos al instante.
        </p>
        <Button
          asChild
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <a
            href="https://wa.me/523312345678"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Abrir WhatsApp
          </a>
        </Button>
      </div>

      {/* Redes sociales */}
      <div className="rounded-2xl bg-card p-8 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Síguenos en Redes Sociales
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
                Facebook
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
                Instagram
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
