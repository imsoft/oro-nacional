import Image from "next/image";
import { Shield, Award, CheckCircle2, FileCheck, Infinity, Star } from "lucide-react";

const certifications = [
  {
    icon: Shield,
    title: "Certificado de Autenticidad",
    description:
      "Cada pieza incluye un certificado que garantiza la pureza del oro (14k o 18k) y la autenticidad de las piedras preciosas.",
  },
  {
    icon: Award,
    title: "Garantía de Por Vida",
    description:
      "Ofrecemos garantía de por vida en manufactura y acabados. Reparaciones sin costo por defectos de fabricación.",
  },
  {
    icon: FileCheck,
    title: "Certificación de Diamantes",
    description:
      "Todos nuestros diamantes cuentan con certificación internacional que valida su calidad, corte y características.",
  },
  {
    icon: Infinity,
    title: "Mantenimiento Gratuito",
    description:
      "Limpieza, pulido y revisión profesional sin costo durante toda la vida útil de tu joya.",
  },
  {
    icon: Star,
    title: "Oro Ético y Responsable",
    description:
      "Trabajamos únicamente con proveedores certificados que garantizan prácticas éticas y sostenibles en la minería.",
  },
  {
    icon: CheckCircle2,
    title: "Política de Satisfacción",
    description:
      "30 días para cambios o devoluciones. Tu satisfacción es nuestra prioridad número uno.",
  },
];

const Certifications = () => {
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wide">
            Calidad Garantizada
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Certificaciones y Garantías
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tu confianza es nuestro mayor tesoro. Respaldamos cada pieza con
            certificaciones y garantías que aseguran tu inversión.
          </p>
        </div>

        {/* Grid de certificaciones */}
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {certifications.map((cert) => (
            <div
              key={cert.title}
              className="group relative overflow-hidden rounded-2xl bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#D4AF37]/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#D4AF37]/20">
                <cert.icon className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">
                {cert.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {cert.description}
              </p>
            </div>
          ))}
        </div>

        {/* Sección de imagen con garantías adicionales */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Certificados de autenticidad Oro Nacional"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground">
              Compromiso con la Excelencia
            </h3>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10">
                    <CheckCircle2 className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Verificación de Pureza
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Análisis de espectrometría para verificar la pureza exacta del
                    oro en cada pieza que fabricamos.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10">
                    <CheckCircle2 className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Trazabilidad Completa
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Registramos el origen de todos nuestros materiales y el proceso
                    de elaboración de cada joya.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10">
                    <CheckCircle2 className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Seguro de Envío Incluido
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Todos nuestros envíos están completamente asegurados contra
                    pérdida, robo o daño durante el transporte.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10">
                    <CheckCircle2 className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Valuación Profesional
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ofrecemos servicio de valuación profesional para efectos de
                    seguro sin costo adicional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            ¿Tienes preguntas sobre nuestras garantías o certificaciones?{" "}
            <a
              href="#"
              className="font-semibold text-[#D4AF37] hover:text-[#B8941E] transition-colors"
            >
              Contáctanos
            </a>{" "}
            y con gusto te atenderemos.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Certifications;
