import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

export const metadata = {
  title: "Términos y Condiciones - Oro Nacional",
  description: "Lee nuestros términos y condiciones de uso de la tienda Oro Nacional.",
};

const TerminosPage = () => {
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

        <h1 className="text-4xl font-bold text-foreground mb-4">
          Términos y Condiciones
        </h1>
        <p className="text-muted-foreground mb-8">
          Última actualización: {new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="prose prose-neutral max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. Aceptación de los Términos
            </h2>
            <p className="text-muted-foreground mb-4">
              Al acceder y utilizar el sitio web de Oro Nacional, usted acepta estar sujeto a estos
              términos y condiciones de uso. Si no está de acuerdo con alguno de estos términos,
              le recomendamos no utilizar nuestro sitio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. Uso del Sitio Web
            </h2>
            <p className="text-muted-foreground mb-4">
              El contenido de este sitio web es solo para su información general y uso. Está sujeto
              a cambios sin previo aviso. Usted se compromete a:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Utilizar el sitio de manera legal y apropiada</li>
              <li>No interferir con el funcionamiento del sitio</li>
              <li>No intentar acceder sin autorización a áreas restringidas</li>
              <li>Proporcionar información veraz y actualizada</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. Productos y Precios
            </h2>
            <p className="text-muted-foreground mb-4">
              Todos los productos que se muestran en nuestro sitio web están sujetos a disponibilidad.
              Nos reservamos el derecho de limitar las cantidades de cualquier producto que ofrecemos.
            </p>
            <p className="text-muted-foreground mb-4">
              Los precios están en pesos mexicanos (MXN) e incluyen IVA. Nos reservamos el derecho de
              modificar los precios en cualquier momento sin previo aviso.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. Compras y Pagos
            </h2>
            <p className="text-muted-foreground mb-4">
              Al realizar un pedido a través de nuestro sitio, usted garantiza que:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Es mayor de 18 años o tiene el consentimiento de un tutor legal</li>
              <li>La información de pago proporcionada es válida y correcta</li>
              <li>Está autorizado para usar el método de pago seleccionado</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Nos reservamos el derecho de rechazar o cancelar cualquier pedido por razones que
              incluyen, entre otras: disponibilidad de productos, errores en la descripción o
              precio del producto, o problemas identificados por nuestro departamento de fraude.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              5. Envíos y Entregas
            </h2>
            <p className="text-muted-foreground mb-4">
              Los tiempos de entrega estimados son de 3 a 5 días hábiles para envíos estándar dentro
              de la República Mexicana. Estos tiempos pueden variar según la ubicación y disponibilidad.
            </p>
            <p className="text-muted-foreground mb-4">
              No nos hacemos responsables por retrasos causados por circunstancias fuera de nuestro
              control, como condiciones climáticas, desastres naturales o problemas con servicios de
              mensajería.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              6. Devoluciones y Reembolsos
            </h2>
            <p className="text-muted-foreground mb-4">
              Aceptamos devoluciones dentro de los 30 días posteriores a la recepción del producto,
              siempre y cuando:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>El producto esté en su estado original y sin usar</li>
              <li>Incluya todos los empaques y certificados originales</li>
              <li>El cliente asuma los costos de envío de devolución</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              7. Garantía
            </h2>
            <p className="text-muted-foreground mb-4">
              Todos nuestros productos de oro tienen garantía de autenticidad. Cada pieza incluye
              su certificado correspondiente. La garantía no cubre daños causados por mal uso,
              accidentes o desgaste normal.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              8. Propiedad Intelectual
            </h2>
            <p className="text-muted-foreground mb-4">
              Todo el contenido incluido en este sitio, como textos, gráficos, logos, imágenes y
              software, es propiedad de Oro Nacional y está protegido por las leyes mexicanas e
              internacionales de derechos de autor.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              9. Limitación de Responsabilidad
            </h2>
            <p className="text-muted-foreground mb-4">
              Oro Nacional no será responsable de ningún daño directo, indirecto, incidental o
              consecuente que resulte del uso o la imposibilidad de uso de nuestros productos o
              servicios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              10. Modificaciones
            </h2>
            <p className="text-muted-foreground mb-4">
              Nos reservamos el derecho de modificar estos términos y condiciones en cualquier
              momento. Los cambios entrarán en vigor inmediatamente después de su publicación
              en el sitio web.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              11. Ley Aplicable
            </h2>
            <p className="text-muted-foreground mb-4">
              Estos términos y condiciones se rigen por las leyes de los Estados Unidos Mexicanos.
              Cualquier disputa será resuelta en los tribunales competentes de Guadalajara, Jalisco.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              12. Contacto
            </h2>
            <p className="text-muted-foreground mb-4">
              Si tiene alguna pregunta sobre estos términos y condiciones, puede contactarnos en:
            </p>
            <ul className="list-none text-muted-foreground space-y-2">
              <li>
                <strong className="text-foreground">Email:</strong>{" "}
                <a href="mailto:contacto@oronacional.com" className="text-[#D4AF37] hover:underline">
                  contacto@oronacional.com
                </a>
              </li>
              <li>
                <strong className="text-foreground">Teléfono:</strong>{" "}
                <a href="tel:+523312345678" className="text-[#D4AF37] hover:underline">
                  +52 33 1234 5678
                </a>
              </li>
              <li>
                <strong className="text-foreground">Dirección:</strong> Guadalajara, Jalisco, México
              </li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TerminosPage;
