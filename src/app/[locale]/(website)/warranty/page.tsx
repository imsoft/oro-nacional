import { Shield, Award, FileCheck, RefreshCw, CheckCircle2, Sparkles } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

const WarrantyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-muted/50 to-background py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AF37]/10 mb-6">
            <Shield className="h-8 w-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Garantía y Certificados
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Tu inversión está protegida. Cada joya incluye certificado de
            autenticidad y garantía de por vida en manufactura.
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          {/* Garantía de por vida */}
          <div className="mb-16">
            <div className="rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 p-8 lg:p-12 border border-[#D4AF37]/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/10">
                  <Award className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Garantía de Por Vida
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    En Oro Nacional respaldamos la calidad de nuestra joyería
                    con una garantía de manufactura de por vida. Si tu joya
                    presenta defectos de fabricación, la reparamos sin costo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Qué cubre la garantía */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              ¿Qué Cubre Nuestra Garantía?
            </h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Defectos de Manufactura
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Cualquier defecto relacionado con la fabricación de la
                      joya: soldaduras, engarces, cierres, y estructura general.
                      Cubre mano de obra y materiales.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Quilataje del Oro
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Garantizamos que el oro de tu joya corresponde al
                      quilataje especificado (10k, 14k, 18k). Si el quilataje es
                      menor al indicado, se reembolsa el 100% del valor.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Autenticidad de Piedras
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Las piedras preciosas y diamantes son auténticos según
                      especificación. Incluye certificado gemológico en piezas
                      con diamantes mayores a 0.30ct.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Reparaciones de Manufactura
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Reparamos sin costo piezas que se rompan por defectos de
                      fabricación. Incluye soldaduras sueltas, engarces débiles
                      y cierres defectuosos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Qué NO cubre */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              ¿Qué NO Cubre la Garantía?
            </h2>
            <div className="rounded-lg bg-card p-6 shadow-sm">
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>
                    <strong>Desgaste natural:</strong> Rayones, pérdida de
                    brillo, adelgazamiento por uso diario normal
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>
                    <strong>Daños accidentales:</strong> Golpes fuertes, caídas,
                    aplastamiento o deformación por accidente
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>
                    <strong>Daños químicos:</strong> Exposición a cloro, ácidos,
                    productos de limpieza agresivos
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>
                    <strong>Modificaciones:</strong> Reparaciones o alteraciones
                    realizadas por terceros no autorizados
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>
                    <strong>Pérdida o robo:</strong> La garantía no cubre
                    artículos perdidos, robados o extraviados
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Certificados incluidos */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Certificados Incluidos
            </h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <FileCheck className="h-6 w-6 text-[#D4AF37] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Certificado de Autenticidad
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Cada joya incluye un certificado oficial de Oro Nacional
                      que garantiza:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Quilataje del oro (10k, 14k, 18k)</li>
                      <li>• Peso en gramos</li>
                      <li>• Descripción de la pieza</li>
                      <li>• Descripción de piedras (si aplica)</li>
                      <li>• Número de serie único</li>
                      <li>• Fecha de compra</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Sparkles className="h-6 w-6 text-[#D4AF37] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Certificado Gemológico (Opcional)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Para piezas con diamantes mayores a 0.30ct, incluimos
                      certificado gemológico de laboratorio independiente (GIA,
                      IGI o similar) que especifica:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Quilates (peso)</li>
                      <li>• Color</li>
                      <li>• Claridad</li>
                      <li>• Corte</li>
                      <li>• Medidas exactas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proceso de garantía */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Cómo Hacer Válida tu Garantía
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10 text-sm font-semibold text-[#D4AF37]">
                    1
                  </div>
                  <h3 className="font-semibold text-foreground">
                    Contacta con Nosotros
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Llámanos, visita nuestra tienda en Guadalajara o envíanos un
                  mensaje por WhatsApp describiendo el problema.
                </p>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10 text-sm font-semibold text-[#D4AF37]">
                    2
                  </div>
                  <h3 className="font-semibold text-foreground">
                    Presenta tu Joya
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Trae tu joya con el certificado de autenticidad y comprobante
                  de compra a nuestra tienda o envíala de forma segura.
                </p>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10 text-sm font-semibold text-[#D4AF37]">
                    3
                  </div>
                  <h3 className="font-semibold text-foreground">Evaluación</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Nuestros maestros joyeros evaluarán la pieza en 24-48 horas
                  para determinar si aplica la garantía.
                </p>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10 text-sm font-semibold text-[#D4AF37]">
                    4
                  </div>
                  <h3 className="font-semibold text-foreground">
                    Reparación o Reemplazo
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Si aplica la garantía, reparamos o reemplazamos tu joya sin
                  costo. Tiempo estimado: 5-10 días hábiles.
                </p>
              </div>
            </div>
          </div>

          {/* Servicios adicionales */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Servicios Postventa (Con Costo)
            </h2>
            <div className="rounded-lg bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-4">
                Ofrecemos servicios de mantenimiento que NO están cubiertos por
                la garantía, pero disponibles a precios preferenciales para
                clientes:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <RefreshCw className="h-5 w-5 text-[#D4AF37] mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      Pulido y Brillo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Restaura el brillo original - desde $200 MXN
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <RefreshCw className="h-5 w-5 text-[#D4AF37] mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      Cambio de Talla
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ajuste de anillos - desde $300 MXN
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <RefreshCw className="h-5 w-5 text-[#D4AF37] mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      Limpieza Profunda
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Con ultrasonido - Gratis primer año
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <RefreshCw className="h-5 w-5 text-[#D4AF37] mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      Grabado Personalizado
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Agrega nombres o fechas - desde $250 MXN
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preguntas comunes */}
          <div className="rounded-2xl bg-muted/30 p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Preguntas Frecuentes sobre Garantía
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  ¿Necesito registrar mi joya?
                </h3>
                <p className="text-sm text-muted-foreground">
                  No es necesario. Tu garantía se activa automáticamente con tu
                  compra. Solo conserva tu certificado y ticket.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  ¿Puedo hacer válida la garantía en otra ciudad?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sí, puedes enviar tu joya de forma segura a nuestra tienda en
                  Guadalajara. Nosotros cubrimos el costo del envío de regreso.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  ¿La garantía se transfiere si regalo la joya?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sí, la garantía de manufactura es transferible. Solo necesitas
                  el certificado de autenticidad original.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  ¿Cuánto tarda una reparación de garantía?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Reparaciones simples toman 5-7 días. Reparaciones complejas o
                  que requieran piezas especiales pueden tardar hasta 15 días
                  hábiles.
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

export default WarrantyPage;
