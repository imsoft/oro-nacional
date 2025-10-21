import { Lightbulb, Wrench, Gem, Sparkles, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Diseño y Concepto",
    description:
      "Cada pieza comienza con un boceto detallado. Nuestros diseñadores trabajan contigo para capturar tu visión y crear un diseño único que refleje tu historia.",
    icon: Lightbulb,
  },
  {
    number: "02",
    title: "Selección de Materiales",
    description:
      "Elegimos cuidadosamente oro certificado de 14k o 18k y piedras preciosas de la más alta calidad. Solo trabajamos con proveedores confiables y éticos.",
    icon: Gem,
  },
  {
    number: "03",
    title: "Elaboración Artesanal",
    description:
      "Nuestros maestros joyeros dan vida al diseño usando técnicas tradicionales refinadas durante décadas. Cada detalle se trabaja a mano con precisión milimétrica.",
    icon: Wrench,
  },
  {
    number: "04",
    title: "Engaste y Acabado",
    description:
      "Las piedras se engastan con técnicas especializadas que garantizan seguridad y belleza. El acabado final incluye pulido de alto brillo y baños de rodio cuando es necesario.",
    icon: Sparkles,
  },
  {
    number: "05",
    title: "Control de Calidad",
    description:
      "Cada pieza pasa por rigurosas inspecciones de calidad. Verificamos peso, pureza del oro, seguridad de los engastes y perfección en el acabado antes de entregar.",
    icon: CheckCircle,
  },
];

const ArtisanProcess = () => {
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wide">
            Nuestro Proceso
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            De la Inspiración a la Obra Maestra
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Cada joya pasa por un meticuloso proceso artesanal que garantiza
            calidad excepcional y diseños únicos.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Línea conectora */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-20 h-full w-0.5 bg-gradient-to-b from-[#D4AF37] to-transparent lg:left-12" />
                )}

                <div className="flex gap-6 lg:gap-8">
                  {/* Número e Icono */}
                  <div className="relative flex-shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4AF37]/10 lg:h-20 lg:w-20">
                      <step.icon className="h-8 w-8 text-[#D4AF37] lg:h-10 lg:w-10" />
                    </div>
                    <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37] text-xs font-bold text-white">
                      {step.number}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 pb-12">
                    <h3 className="text-xl font-semibold text-foreground lg:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-base text-muted-foreground leading-relaxed lg:text-lg">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Texto de cierre */}
        <div className="mt-16 mx-auto max-w-3xl">
          <div className="rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-[#B8941E]/5 p-8 lg:p-12 text-center">
            <p className="text-lg text-foreground font-medium leading-relaxed">
              &quot;La joyería artesanal no es solo crear objetos hermosos, es preservar
              una tradición milenaria, honrar el trabajo manual y crear tesoros
              que trasciendan el tiempo.&quot;
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              — Maestro Roberto García, Oro Nacional
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtisanProcess;
