import Image from "next/image";

const jewelers = [
  {
    name: "Maestro Roberto García",
    role: "Maestro Joyero Principal",
    experience: "35 años de experiencia",
    specialty: "Especialista en anillos de compromiso y matrimonio",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    description:
      "Con más de tres décadas perfeccionando su arte, el Maestro Roberto lidera nuestro equipo con pasión y dedicación incomparables.",
  },
  {
    name: "Maestra Elena Ramírez",
    role: "Maestra en Diseño",
    experience: "28 años de experiencia",
    specialty: "Diseños contemporáneos y personalizados",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    description:
      "Elena fusiona la tradición jalisciense con tendencias modernas, creando piezas únicas que cuentan historias.",
  },
  {
    name: "Maestro Carlos Mendoza",
    role: "Especialista en Engaste",
    experience: "30 años de experiencia",
    specialty: "Engaste de piedras preciosas y diamantes",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    description:
      "La precisión de Carlos en el engaste de piedras es legendaria, garantizando la seguridad y belleza de cada gema.",
  },
];

const MasterJewelers = () => {
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wide">
            Nuestro Equipo
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Maestros Joyeros Artesanales
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Conoce a los artesanos detrás de cada pieza única. Pasión, dedicación
            y décadas de experiencia en cada creación.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {jewelers.map((jeweler) => (
            <div
              key={jeweler.name}
              className="group relative overflow-hidden rounded-2xl bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Imagen */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                <Image
                  src={jeweler.image}
                  alt={`${jeweler.name} - ${jeweler.role} en Oro Nacional`}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Badge de experiencia */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-medium text-white">
                    {jeweler.experience}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {jeweler.name}
                  </h3>
                  <p className="text-sm font-medium text-[#D4AF37]">
                    {jeweler.role}
                  </p>
                </div>

                <p className="text-sm font-medium text-muted-foreground">
                  {jeweler.specialty}
                </p>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {jeweler.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Texto adicional */}
        <div className="mt-16 mx-auto max-w-3xl text-center">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Nuestros maestros joyeros han dedicado su vida a perfeccionar el arte
            de la joyería. Cada pieza que sale de nuestro taller lleva la firma
            invisible de años de experiencia, conocimiento transmitido de
            generación en generación, y un amor profundo por el oficio.
          </p>
        </div>
      </div>
    </section>
  );
};

export default MasterJewelers;
