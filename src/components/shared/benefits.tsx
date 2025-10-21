import { Shield, Truck, Award, CreditCard } from "lucide-react";

const benefits = [
  {
    name: "Oro Certificado",
    description: "Joyería de oro 14k y 18k con certificado de autenticidad garantizado",
    icon: Shield,
  },
  {
    name: "Envío Nacional Seguro",
    description: "Envío asegurado a toda la República Mexicana con rastreo en tiempo real",
    icon: Truck,
  },
  {
    name: "Tradición Jalisciense",
    description: "Más de 30 años de experiencia artesanal en joyería fina de Guadalajara",
    icon: Award,
  },
  {
    name: "Meses Sin Intereses",
    description: "Pagos flexibles, todas las tarjetas y planes a meses sin intereses",
    icon: CreditCard,
  },
];

const Benefits = () => {
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            ¿Por qué comprar joyería en Oro Nacional?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tu joyería de confianza en Guadalajara con garantía, envíos seguros y tradición artesanal
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.name}
              className="group relative overflow-hidden rounded-2xl bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#D4AF37]/10 transition-all duration-300 group-hover:scale-110">
                <benefit.icon className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">
                {benefit.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
