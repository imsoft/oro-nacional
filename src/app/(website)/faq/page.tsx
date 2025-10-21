import { HelpCircle, Search } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

const PreguntasFrecuentesPage = () => {
  const faqCategories = [
    {
      title: "Sobre Nuestros Productos",
      questions: [
        {
          q: "¿Qué quilataje de oro manejan?",
          a: "Trabajamos principalmente con oro de 10k, 14k y 18k. El oro de 10k es más duradero y accesible, ideal para uso diario. El 14k ofrece un excelente equilibrio entre durabilidad y pureza. El 18k tiene mayor contenido de oro puro y un color más intenso, perfecto para piezas especiales.",
        },
        {
          q: "¿Todas sus piezas son de oro macizo?",
          a: "Sí, todas nuestras piezas son de oro macizo (sólido), nunca oro laminado, enchapado o vermeil. Cada pieza está marcada con su quilataje correspondiente y viene con certificado de autenticidad.",
        },
        {
          q: "¿Puedo personalizar una joya?",
          a: "¡Por supuesto! Ofrecemos servicio de grabado personalizado y también diseños completamente a medida. Nuestros maestros joyeros pueden crear la pieza de tus sueños. Agenda una cita para discutir tu proyecto.",
        },
        {
          q: "¿Las piedras son naturales?",
          a: "Sí, trabajamos exclusivamente con piedras naturales y diamantes auténticos. Cada pieza con diamantes mayores a 0.30ct incluye certificado gemológico de laboratorio independiente (GIA, IGI o equivalente).",
        },
        {
          q: "¿Hacen ajustes de talla?",
          a: "Sí, realizamos ajustes de talla en anillos. El primer ajuste dentro de los 30 días posteriores a la compra es gratuito. Ajustes posteriores tienen un costo desde $300 MXN dependiendo de la pieza.",
        },
      ],
    },
    {
      title: "Compra y Pago",
      questions: [
        {
          q: "¿Qué métodos de pago aceptan?",
          a: "Aceptamos todas las tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencia bancaria, depósito bancario y efectivo en tienda. También ofrecemos meses sin intereses en compras mayores a $3,000 MXN con tarjetas participantes.",
        },
        {
          q: "¿Puedo pagar a meses sin intereses?",
          a: "Sí, ofrecemos planes de 3, 6, 9 y 12 meses sin intereses en compras mayores a $3,000 MXN con tarjetas Visa, Mastercard y American Express participantes. Las opciones disponibles se muestran al momento del pago.",
        },
        {
          q: "¿Es seguro comprar en línea?",
          a: "Absolutamente. Todas las transacciones están protegidas con encriptación SSL de 256 bits. No almacenamos información de tarjetas. Procesamos pagos a través de plataformas certificadas y seguras.",
        },
        {
          q: "¿Puedo apartar una joya?",
          a: "Sí, manejamos sistema de apartado. Con un anticipo del 30% puedes apartar tu joya hasta por 60 días. El saldo restante puede liquidarse en pagos quincenales o mensuales. Contacta WhatsApp o visítanos en tienda.",
        },
        {
          q: "¿Dan factura?",
          a: "Sí, emitimos facturas electrónicas (CFDI) para todas las compras. Solo proporciona tus datos fiscales al momento de la compra o solicítala dentro de los 5 días posteriores enviando tu información por correo.",
        },
      ],
    },
    {
      title: "Envíos y Entregas",
      questions: [
        {
          q: "¿Los envíos tienen costo?",
          a: "No, todos nuestros envíos dentro de la República Mexicana son completamente GRATIS, sin mínimo de compra. También ofrecemos envío express (1-2 días) por $200 MXN adicionales para entregas urgentes.",
        },
        {
          q: "¿Cuánto tarda en llegar mi pedido?",
          a: "El envío estándar gratuito tarda de 3 a 5 días hábiles. Guadalajara y zona metropolitana: 2-3 días. Estados vecinos: 3-4 días. Resto del país: 4-5 días. El envío express llega en 1-2 días hábiles.",
        },
        {
          q: "¿Puedo rastrear mi pedido?",
          a: "Sí, una vez que tu pedido sea enviado, recibirás un correo electrónico con tu número de rastreo (guía) para que puedas seguir tu paquete en tiempo real hasta tu puerta.",
        },
        {
          q: "¿Los envíos están asegurados?",
          a: "Sí, todos nuestros envíos están completamente asegurados contra pérdida, robo o daño durante el transporte. En el remoto caso de algún incidente, reponemos tu joya sin costo adicional para ti.",
        },
        {
          q: "¿Puedo recoger en tienda?",
          a: "Sí, ofrecemos la opción de recoger en nuestra tienda en Guadalajara sin costo. Selecciona esta opción al finalizar tu compra y te notificaremos cuando tu pedido esté listo (generalmente el mismo día o al siguiente).",
        },
      ],
    },
    {
      title: "Devoluciones y Cambios",
      questions: [
        {
          q: "¿Puedo devolver una joya?",
          a: "Sí, aceptamos devoluciones dentro de los 30 días posteriores a la compra si la joya no ha sido usada, modificada o grabada. Debe estar en su empaque original con todas las etiquetas. El reembolso se procesa en 5-10 días hábiles.",
        },
        {
          q: "¿Puedo cambiar mi joya por otra?",
          a: "Sí, aceptamos cambios por otra pieza de igual o mayor valor dentro de los 30 días. Si la nueva pieza tiene menor valor, emitimos una nota de crédito válida por 6 meses. Los cambios son ilimitados durante este período.",
        },
        {
          q: "¿Qué pasa si la talla no me queda?",
          a: "El primer ajuste de talla es gratuito si lo solicitas dentro de los 30 días posteriores a la compra. Puedes traer el anillo a nuestra tienda o enviarlo de forma segura. El ajuste toma 5-7 días hábiles.",
        },
        {
          q: "¿Las piezas con grabado se pueden devolver?",
          a: "Las piezas personalizadas con grabado son consideradas pedidos especiales y NO pueden devolverse, solo pueden cambiarse por defectos de manufactura. Verifica bien la ortografía antes de confirmar el grabado.",
        },
      ],
    },
    {
      title: "Garantía y Mantenimiento",
      questions: [
        {
          q: "¿Cuánto tiempo dura la garantía?",
          a: "Ofrecemos garantía de manufactura de POR VIDA en todas nuestras piezas. Esto cubre defectos de fabricación, soldaduras, engarces y autenticidad del oro. La garantía no cubre desgaste natural, daños accidentales o modificaciones por terceros.",
        },
        {
          q: "¿Qué incluye el mantenimiento gratuito?",
          a: "Durante el primer año, incluimos limpieza profesional gratuita ilimitada. Puedes venir a la tienda cuando quieras para que limpiemos tu joya con ultrasonido. También revisamos que todas las piedras estén seguras.",
        },
        {
          q: "¿Cómo hago válida la garantía?",
          a: "Trae tu joya con el certificado de autenticidad y comprobante de compra a nuestra tienda o envíala de forma segura. Nuestros maestros la evalúan en 24-48 horas. Si aplica garantía, la reparamos sin costo en 5-10 días.",
        },
        {
          q: "¿Cada cuánto debo limpiar mi joyería?",
          a: "Recomendamos limpieza básica en casa cada 2-4 semanas con agua tibia y jabón suave. Una limpieza profesional anual con ultrasonido mantiene tus joyas radiantes. La primera limpieza profesional es GRATIS en Oro Nacional.",
        },
      ],
    },
    {
      title: "Sobre Oro Nacional",
      questions: [
        {
          q: "¿Dónde está ubicada su tienda física?",
          a: "Nuestra tienda está ubicada en Guadalajara, Jalisco. Puedes visitarnos de lunes a sábado de 10:00 AM a 7:00 PM. Encuentra nuestra dirección exacta y mapa en la sección de Contacto.",
        },
        {
          q: "¿Tienen experiencia en joyería?",
          a: "Oro Nacional es una joyería familiar con más de 25 años de experiencia. Nuestros maestros joyeros cuentan con certificaciones internacionales y dominan técnicas tradicionales y modernas de la joyería fina.",
        },
        {
          q: "¿Son fabricantes o solo venden?",
          a: "Somos fabricantes. Diseñamos y fabricamos nuestras propias piezas en nuestro taller en Guadalajara. Esto nos permite ofrecer precios competitivos, calidad excepcional y personalización completa.",
        },
        {
          q: "¿Compran oro usado?",
          a: "Sí, compramos oro de cualquier quilataje (10k, 14k, 18k, 24k) en cualquier condición. Lo tasamos en el momento según el precio internacional del oro. También aceptamos oro usado como parte de pago para una pieza nueva.",
        },
        {
          q: "¿Cómo puedo contactarlos?",
          a: "Puedes contactarnos por WhatsApp, teléfono, correo electrónico o visitarnos en tienda. Encuentra todos nuestros datos de contacto en la sección de Contacto. Respondemos mensajes de WhatsApp de lunes a sábado de 9 AM a 8 PM.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-muted/50 to-background py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AF37]/10 mb-6">
            <HelpCircle className="h-8 w-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Preguntas Frecuentes
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Encuentra respuestas rápidas a las preguntas más comunes sobre
            nuestros productos, envíos, garantías y más.
          </p>

          {/* Buscador (decorativo por ahora) */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar pregunta..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal - FAQ por categorías */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                  <span className="w-1 h-8 bg-[#D4AF37] rounded-full"></span>
                  {category.title}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="rounded-lg bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-foreground mb-2 flex items-start gap-2">
                        <HelpCircle className="h-5 w-5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                        <span>{item.q}</span>
                      </h3>
                      <p className="text-sm text-muted-foreground ml-7">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* No encontraste tu respuesta */}
          <div className="mt-16 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 p-8 lg:p-12 border border-[#D4AF37]/20 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              ¿No Encontraste tu Respuesta?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Nuestro equipo está listo para ayudarte. Contáctanos por WhatsApp,
              teléfono o correo y te responderemos a la brevedad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/523312345678"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
              >
                <span className="mr-2">💬</span>
                WhatsApp
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#D4AF37] hover:bg-[#B8941E] text-white font-medium transition-colors"
              >
                Formulario de Contacto
              </a>
              <a
                href="tel:+523312345678"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white font-medium transition-colors"
              >
                <span className="mr-2">📞</span>
                Llamar
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PreguntasFrecuentesPage;
