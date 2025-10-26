import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import ContactForm from "@/components/contact/contact-form";
import ContactInfo from "@/components/contact/contact-info";
import LocationMap from "@/components/contact/location-map";

const ContactoPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-muted/50 to-background py-16 lg:py-20 pt-28 lg:pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wide">
              Estamos Aquí Para Ti
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Contacta con Oro Nacional
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              ¿Tienes preguntas sobre nuestras joyas? ¿Necesitas un diseño
              personalizado? Estamos aquí para ayudarte a encontrar la pieza
              perfecta.
            </p>
          </div>
        </div>
      </section>

      {/* Formulario y Contacto */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Formulario - 2 columnas */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>

            {/* Información de contacto - 1 columna */}
            <div className="lg:col-span-1">
              <ContactInfo />
            </div>
          </div>
        </div>
      </section>

      {/* Mapa de ubicación */}
      <LocationMap />

      {/* FAQ rápido */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold text-foreground text-center mb-12">
              Preguntas Frecuentes
            </h2>

            <div className="space-y-6">
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">
                  ¿Puedo agendar una cita para ver las joyas en persona?
                </h3>
                <p className="text-sm text-muted-foreground">
                  ¡Por supuesto! Recomendamos agendar una cita para brindarte
                  atención personalizada. Llámanos o envíanos un mensaje por
                  WhatsApp para coordinar tu visita.
                </p>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">
                  ¿Hacen diseños personalizados?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sí, somos especialistas en diseños personalizados. Nuestros
                  maestros joyeros trabajarán contigo para crear la pieza única
                  que imaginas. El proceso toma entre 2-4 semanas dependiendo de
                  la complejidad.
                </p>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">
                  ¿Realizan envíos a toda la República Mexicana?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sí, enviamos a todo México con paquetería segura y rastreable.
                  El envío es gratuito en compras mayores a $5,000 MXN. Todos
                  nuestros envíos están asegurados.
                </p>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">
                  ¿Cuánto tiempo tardan en responder mis mensajes?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Respondemos todos los mensajes en un plazo máximo de 24 horas
                  durante días hábiles. Por WhatsApp, el tiempo de respuesta es
                  generalmente inmediato durante nuestro horario de atención.
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

export default ContactoPage;
