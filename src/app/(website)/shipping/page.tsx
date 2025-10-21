import { Truck, Package, MapPin, Clock, Shield, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

const EnviosPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-muted/50 to-background py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AF37]/10 mb-6">
            <Truck className="h-8 w-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Política de Envíos
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Envío seguro y asegurado a toda la República Mexicana. Tu joya llegará
            en perfectas condiciones directamente a tu puerta.
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          {/* Envío Gratis */}
          <div className="mb-16">
            <div className="rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 p-8 lg:p-12 border border-green-500/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Envío Gratis a Todo México
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    En todas las compras, sin mínimo. Queremos que disfrutes tu joya
                    sin preocupaciones adicionales.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tiempos de entrega */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Tiempos de Entrega
            </h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-[#D4AF37] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Envío Estándar (Gratis)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      <strong>3 a 5 días hábiles</strong> a partir de la confirmación
                      del pedido.
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Zona Metropolitana de Guadalajara: 2-3 días</li>
                      <li>• Jalisco y estados vecinos: 3-4 días</li>
                      <li>• Resto de la República: 4-5 días</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Truck className="h-6 w-6 text-[#D4AF37] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Envío Express (+$200 MXN)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      <strong>1 a 2 días hábiles</strong> para cuando necesitas tu
                      joya urgentemente.
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Guadalajara: Entrega al siguiente día hábil</li>
                      <li>• Principales ciudades: 1-2 días</li>
                      <li>• Zonas remotas: No disponible</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cobertura */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Cobertura de Envíos
            </h2>
            <div className="rounded-lg bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-[#D4AF37] mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4">
                    Realizamos envíos a los 32 estados de la República Mexicana a
                    través de paqueterías certificadas y confiables.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div>✓ Aguascalientes</div>
                    <div>✓ Baja California</div>
                    <div>✓ Baja California Sur</div>
                    <div>✓ Campeche</div>
                    <div>✓ Chiapas</div>
                    <div>✓ Chihuahua</div>
                    <div>✓ Ciudad de México</div>
                    <div>✓ Coahuila</div>
                    <div>✓ Colima</div>
                    <div>✓ Durango</div>
                    <div>✓ Estado de México</div>
                    <div>✓ Guanajuato</div>
                    <div>✓ Guerrero</div>
                    <div>✓ Hidalgo</div>
                    <div className="font-semibold text-[#D4AF37]">✓ Jalisco</div>
                    <div>✓ Y todos los demás...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seguridad del envío */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Seguridad y Rastreo
            </h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-[#D4AF37] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Envío Asegurado
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Todos nuestros envíos están completamente asegurados contra
                      pérdida, robo o daño durante el transporte. En el remoto caso de
                      algún incidente, reponemos tu joya sin costo adicional.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Package className="h-6 w-6 text-[#D4AF37] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Número de Rastreo
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Una vez que tu pedido sea enviado, recibirás un correo
                      electrónico con tu número de rastreo para que puedas seguir tu
                      paquete en tiempo real hasta tu puerta.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Empaque */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Empaque Premium
            </h2>
            <div className="rounded-lg bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-4">
                Cada joya se envía en un empaque elegante que incluye:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-1">✓</span>
                  <span>Caja de regalo premium con logo de Oro Nacional</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-1">✓</span>
                  <span>Certificado de autenticidad y garantía</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-1">✓</span>
                  <span>Guía de cuidados para tu joya</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-1">✓</span>
                  <span>Paño de limpieza de microfibra</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-1">✓</span>
                  <span>Empaque exterior discreto y seguro</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Preguntas comunes */}
          <div className="rounded-2xl bg-muted/30 p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Preguntas Frecuentes sobre Envíos
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  ¿Puedo recoger mi pedido en tienda?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sí, ofrecemos la opción de recoger en nuestra tienda en
                  Guadalajara sin costo. Selecciona esta opción al finalizar tu
                  compra.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  ¿Requiere firma la entrega?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sí, por seguridad todos los envíos requieren firma del
                  destinatario o persona autorizada.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  ¿Envían a domicilios particulares?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sí, enviamos tanto a domicilios particulares como a oficinas. Solo
                  asegúrate de proporcionar una dirección donde alguien pueda recibir
                  el paquete.
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

export default EnviosPage;
