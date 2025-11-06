import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

export const metadata = {
  title: "Política de Privacidad - Oro Nacional",
  description: "Conoce cómo protegemos y manejamos tu información personal en Oro Nacional.",
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

        <h1 className="text-4xl font-bold text-foreground mb-4">
          Política de Privacidad
        </h1>
        <p className="text-muted-foreground mb-8">
          Última actualización: {new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="prose prose-neutral max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. Introducción
            </h2>
            <p className="text-muted-foreground mb-4">
              En Oro Nacional, nos comprometemos a proteger tu privacidad y manejar tus datos
              personales de manera responsable. Esta Política de Privacidad explica cómo recopilamos,
              usamos, compartimos y protegemos tu información personal cuando utilizas nuestro
              sitio web y servicios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. Información que Recopilamos
            </h2>
            <p className="text-muted-foreground mb-4">
              Recopilamos diferentes tipos de información para brindarte nuestros servicios:
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              2.1 Información que nos proporcionas
            </h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Nombre completo</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Dirección de envío y facturación</li>
              <li>Información de pago (procesada de forma segura por terceros)</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
              2.2 Información que recopilamos automáticamente
            </h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Dirección IP</li>
              <li>Tipo de navegador y dispositivo</li>
              <li>Páginas visitadas en nuestro sitio</li>
              <li>Tiempo de permanencia en el sitio</li>
              <li>Cookies y tecnologías similares</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. Cómo Usamos tu Información
            </h2>
            <p className="text-muted-foreground mb-4">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Procesar y completar tus pedidos</li>
              <li>Comunicarnos contigo sobre tu pedido y nuestros servicios</li>
              <li>Mejorar nuestro sitio web y experiencia de usuario</li>
              <li>Personalizar tu experiencia de compra</li>
              <li>Enviarte ofertas y promociones (solo si has dado tu consentimiento)</li>
              <li>Prevenir fraudes y garantizar la seguridad</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. Compartir tu Información
            </h2>
            <p className="text-muted-foreground mb-4">
              No vendemos tu información personal a terceros. Podemos compartir tu información con:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>
                <strong className="text-foreground">Proveedores de servicios:</strong> Empresas de
                envío, procesadores de pago y plataformas de hosting
              </li>
              <li>
                <strong className="text-foreground">Autoridades legales:</strong> Cuando sea requerido
                por ley o para proteger nuestros derechos
              </li>
              <li>
                <strong className="text-foreground">Transferencias comerciales:</strong> En caso de
                fusión, adquisición o venta de activos
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              5. Seguridad de los Datos
            </h2>
            <p className="text-muted-foreground mb-4">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información
              personal contra acceso no autorizado, pérdida o alteración. Esto incluye:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Encriptación SSL/TLS para transmisión de datos</li>
              <li>Acceso restringido a información personal</li>
              <li>Monitoreo regular de nuestros sistemas</li>
              <li>Capacitación de personal en protección de datos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              6. Cookies
            </h2>
            <p className="text-muted-foreground mb-4">
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio.
              Las cookies nos ayudan a:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Recordar tus preferencias</li>
              <li>Mantener tu sesión activa</li>
              <li>Analizar el tráfico del sitio</li>
              <li>Personalizar contenido y anuncios</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar
              la funcionalidad del sitio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              7. Tus Derechos
            </h2>
            <p className="text-muted-foreground mb-4">
              De acuerdo con la Ley Federal de Protección de Datos Personales en Posesión de los
              Particulares (LFPDPPP), tienes derecho a:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Acceder a tus datos personales que poseemos</li>
              <li>Rectificar datos incorrectos o incompletos</li>
              <li>Cancelar tu cuenta y eliminar tus datos</li>
              <li>Oponerte al uso de tus datos para ciertos fines</li>
              <li>Limitar el uso o divulgación de tus datos</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Para ejercer estos derechos, contáctanos en{" "}
              <a href="mailto:privacidad@oronacional.com" className="text-[#D4AF37] hover:underline">
                privacidad@oronacional.com
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              8. Retención de Datos
            </h2>
            <p className="text-muted-foreground mb-4">
              Conservamos tu información personal solo durante el tiempo necesario para cumplir
              con los fines descritos en esta política, o según lo requiera la ley. Los datos
              de pedidos se conservan durante al menos 5 años para fines fiscales y legales.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              9. Enlaces a Terceros
            </h2>
            <p className="text-muted-foreground mb-4">
              Nuestro sitio puede contener enlaces a sitios web de terceros. No somos responsables
              de las prácticas de privacidad de estos sitios. Te recomendamos leer sus políticas
              de privacidad antes de proporcionarles información.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              10. Menores de Edad
            </h2>
            <p className="text-muted-foreground mb-4">
              Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos
              intencionalmente información de menores. Si descubrimos que hemos recopilado
              información de un menor, la eliminaremos de inmediato.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              11. Cambios a esta Política
            </h2>
            <p className="text-muted-foreground mb-4">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos
              sobre cambios significativos publicando la nueva política en esta página y
              actualizando la fecha de &quot;Última actualización&quot;.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              12. Contacto
            </h2>
            <p className="text-muted-foreground mb-4">
              Si tienes preguntas sobre esta Política de Privacidad o el manejo de tus datos,
              contáctanos:
            </p>
            <ul className="list-none text-muted-foreground space-y-2">
              <li>
                <strong className="text-foreground">Email:</strong>{" "}
                <a href="mailto:privacidad@oronacional.com" className="text-[#D4AF37] hover:underline">
                  privacidad@oronacional.com
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

          <section className="mb-8 p-6 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Tu Privacidad es Importante para Nosotros
            </h2>
            <p className="text-muted-foreground mb-4">
              En Oro Nacional, estamos comprometidos con la transparencia y la protección de tu
              información. Si tienes alguna inquietud sobre cómo manejamos tus datos, no dudes
              en contactarnos.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
