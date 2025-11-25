import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

export const metadata = {
  title: "Política de Privacidad - Oro Nacional",
  description: "Política de privacidad y protección de datos personales de Oro Nacional S.A. de C.V.",
};

const PrivacyPage = () => {
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
            POLÍTICA DE PRIVACIDAD
          </h2>
        </div>

        <div className="prose prose-neutral max-w-none space-y-8">
          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              1. Responsable del Tratamiento de Datos Personales
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Oro Nacional S.A. de C.V., con domicilio en [agregar dirección fiscal o principal],
              es responsable del tratamiento, uso y protección de los datos personales proporcionados
              por sus clientes, en cumplimiento con la Ley Federal de Protección de Datos Personales
              en Posesión de los Particulares (LFPDPPP).
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              2. Datos Personales que Recabamos
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Oro Nacional recaba los siguientes datos personales de manera directa o indirecta a
              través de su sitio web, redes sociales, o durante el proceso de compra:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Nombre completo</li>
              <li>Dirección de envío y facturación</li>
              <li>Teléfono de contacto</li>
              <li>Correo electrónico</li>
              <li>RFC (en caso de requerir factura)</li>
              <li>Información de pago (procesada por terceros con protocolos de seguridad)</li>
              <li>Historial de compras y preferencias</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              No se solicitan ni almacenan datos sensibles (como estado de salud, religión,
              orientación sexual, etc.).
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              3. Finalidades del Tratamiento de Datos
            </h3>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-foreground mb-3">
                Finalidades principales:
              </h4>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2 ml-4">
                <li>Procesar pedidos y realizar la entrega de productos.</li>
                <li>Emitir comprobantes fiscales.</li>
                <li>Gestionar pagos y cobros.</li>
                <li>Brindar atención al cliente y soporte postventa.</li>
              </ol>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-foreground mb-3">
                Finalidades secundarias:
              </h4>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2 ml-4">
                <li>Enviar promociones, novedades y lanzamientos de productos.</li>
                <li>Realizar encuestas de satisfacción y análisis de mercado.</li>
                <li>Mejorar la experiencia del usuario en el sitio web.</li>
              </ol>
            </div>

            <p className="text-muted-foreground leading-relaxed mt-4">
              El titular puede negar el uso de sus datos para finalidades secundarias enviando un
              correo a{" "}
              <a href="mailto:contacto@oronacional.mx" className="text-[#D4AF37] hover:underline">
                contacto@oronacional.mx
              </a>
              {" "}con el asunto &quot;Cancelación de uso secundario de datos&quot;.
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              4. Transferencia de Datos Personales
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Oro Nacional no vende, renta ni cede datos personales a terceros. Únicamente se
              comparten con:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Empresas de mensajería (para entrega de productos).</li>
              <li>Plataformas de pago (para procesar transacciones).</li>
              <li>Autoridades fiscales o judiciales, en caso de requerimiento legal.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Todos los terceros están sujetos a cláusulas de confidencialidad y protección de datos
              conforme a la ley mexicana.
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              5. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              El titular tiene derecho a:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Acceder a sus datos personales.</li>
              <li>Rectificar información incorrecta.</li>
              <li>Cancelar sus datos cuando considere que no se requieren.</li>
              <li>Oponerse al uso de sus datos para fines específicos.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Para ejercer estos derechos, el titular deberá enviar una solicitud escrita al correo{" "}
              <a href="mailto:contacto@oronacional.mx" className="text-[#D4AF37] hover:underline">
                contacto@oronacional.mx
              </a>
              , incluyendo:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
              <li>Nombre completo y medio de contacto.</li>
              <li>Descripción clara del derecho que desea ejercer.</li>
              <li>Copia de identificación oficial vigente.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              El plazo de respuesta será de máximo 15 días hábiles a partir de la recepción de la
              solicitud.
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              6. Uso de Cookies y Tecnologías Similares
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              El sitio web de Oro Nacional utiliza cookies y etiquetas web para mejorar la
              experiencia del usuario, analizar tráfico y ofrecer contenido personalizado.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              El usuario puede deshabilitar las cookies desde su navegador sin afectar la
              funcionalidad básica del sitio.
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              7. Protección de la Información
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Oro Nacional aplica medidas de seguridad administrativa, técnica y física para
              proteger los datos personales contra daño, pérdida, alteración o acceso no
              autorizado.
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              8. Cambios a la Política de Privacidad
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Oro Nacional podrá modificar esta política para cumplir con actualizaciones legales
              o mejoras internas.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Cualquier cambio será notificado a través del sitio web www.oronacional.mx, en la
              sección &quot;Política de Privacidad&quot;.
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              9. Legislación y Jurisdicción
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Esta Política de Privacidad se rige por la legislación mexicana, en particular por
              la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Cualquier controversia será resuelta ante los tribunales competentes de la Ciudad
              de Guadalajara, Jalisco, México.
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

export default PrivacyPage;
