import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

export const metadata = {
  title: "Aviso Legal y Términos de Uso - Oro Nacional",
  description: "Aviso legal y términos de uso del sitio web de Oro Nacional S.A. de C.V.",
};

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-4xl px-6 lg:px-8 py-24 lg:py-32">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Oro Nacional S.A. de C.V.
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">
            AVISO LEGAL Y TÉRMINOS DE USO
          </h2>
        </div>

        <div className="prose prose-neutral max-w-none space-y-8">
          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              1. Propiedad Intelectual
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Todo el contenido del sitio web www.oronacional.mx, incluyendo logotipos, imágenes,
              textos, fotografías, diseños, descripciones y código fuente, es propiedad exclusiva
              de Oro Nacional S.A. de C.V.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Queda estrictamente prohibida su reproducción, distribución o uso sin autorización
              expresa por escrito.
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              2. Uso del Sitio Web
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              El usuario se compromete a:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Usar el sitio únicamente para fines lícitos.</li>
              <li>No realizar actividades que afecten la seguridad o funcionalidad del sitio.</li>
              <li>No copiar ni distribuir contenidos sin autorización.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Oro Nacional se reserva el derecho de restringir el acceso o cancelar cuentas que
              incumplan estos términos.
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              3. Enlaces a Sitios de Terceros
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              El sitio puede contener enlaces a páginas externas. Oro Nacional no se responsabiliza
              por el contenido, políticas o prácticas de dichos sitios.
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              4. Exención de Responsabilidad
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Oro Nacional no garantiza que el sitio web esté libre de errores o interrupciones.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              No será responsable por pérdidas derivadas del uso del sitio, fallas tecnológicas,
              errores tipográficos o información desactualizada.
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              5. Modificaciones de los Términos
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Oro Nacional podrá actualizar los presentes Términos de Uso en cualquier momento,
              notificando los cambios en el sitio web. El uso continuo del sitio implica la
              aceptación de las modificaciones.
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              6. Legislación Aplicable
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Este Aviso Legal se rige por las leyes mexicanas. Cualquier disputa relacionada
              con el uso del sitio será competencia de los tribunales de Guadalajara, Jalisco, México.
            </p>
          </section>

          <section className="mt-12 pt-8 border-t-2 border-border">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Representante Legal
              </p>
              <p className="text-foreground font-semibold mb-4">
                Oro Nacional S.A. de C.V.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Firma y sello oficial
              </p>
            </div>
          </section>

          <footer className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © Oro Nacional S.A. de C.V. – Todos los derechos reservados 2025 | www.oronacional.mx
            </p>
          </footer>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;
