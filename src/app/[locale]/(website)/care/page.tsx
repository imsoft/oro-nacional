import { Sparkles, Droplet, Sun, Home, AlertTriangle, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { useLocale } from "next-intl";

const CarePage = () => {
  const locale = useLocale();
  const isSpanish = locale === "es";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-muted/50 to-background py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AF37]/10 mb-6">
            <Sparkles className="h-8 w-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {isSpanish ? "Cuidado de tu Joyería de Oro" : "Gold Jewelry Care"}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {isSpanish
              ? "Aprende a mantener tu joyería radiante y en perfectas condiciones con estos consejos profesionales de nuestros maestros joyeros."
              : "Learn how to keep your jewelry radiant and in perfect condition with these professional tips from our master jewelers."}
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          {/* Limpieza básica */}
          <div className="mb-16">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-8 lg:p-12 border border-blue-500/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <Droplet className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    {isSpanish ? "Limpieza en Casa - Método Básico" : "At-Home Cleaning - Basic Method"}
                  </h2>
                  <p className="mt-2 text-muted-foreground mb-6">
                    {isSpanish
                      ? "Limpia tu joyería de oro cada 2-4 semanas con este método simple y seguro que puedes hacer en casa."
                      : "Clean your gold jewelry every 2-4 weeks with this simple and safe method you can do at home."}
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/10 text-xs font-semibold text-blue-600">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {isSpanish ? "Prepara la solución" : "Prepare the solution"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isSpanish
                            ? "Mezcla agua tibia con unas gotas de jabón suave (lava trastes neutro). NO uses detergentes agresivos."
                            : "Mix warm water with a few drops of mild soap (neutral dish soap). DO NOT use harsh detergents."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/10 text-xs font-semibold text-blue-600">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {isSpanish ? "Remoja" : "Soak"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isSpanish
                            ? "Sumerge tu joya por 10-15 minutos. Para piezas muy sucias, usa un cepillo de dientes suave en las áreas difíciles."
                            : "Submerge your jewelry for 10-15 minutes. For very dirty pieces, use a soft toothbrush on hard-to-reach areas."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/10 text-xs font-semibold text-blue-600">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {isSpanish ? "Enjuaga bien" : "Rinse thoroughly"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isSpanish
                            ? "Enjuaga con agua tibia. IMPORTANTE: Tapa el drenaje para evitar que se caiga la joya."
                            : "Rinse with warm water. IMPORTANT: Cover the drain to prevent your jewelry from falling."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/10 text-xs font-semibold text-blue-600">
                        4
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {isSpanish ? "Seca completamente" : "Dry completely"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isSpanish
                            ? "Usa un paño suave y seco (preferentemente el paño de microfibra incluido con tu compra). Deja secar al aire antes de guardar."
                            : "Use a soft, dry cloth (preferably the microfiber cloth included with your purchase). Let air dry before storing."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Qué EVITAR */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              {isSpanish ? "⚠️ Qué Evitar para Proteger tu Joyería" : "⚠️ What to Avoid to Protect Your Jewelry"}
            </h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      {isSpanish ? "Químicos Agresivos" : "Harsh Chemicals"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {isSpanish
                        ? "Evita el contacto con estas sustancias que pueden dañar tu oro:"
                        : "Avoid contact with these substances that can damage your gold:"}
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• {isSpanish ? "Cloro (albercas, tinas de hidromasaje)" : "Chlorine (pools, hot tubs)"}</li>
                      <li>• {isSpanish ? "Blanqueador y productos de limpieza del hogar" : "Bleach and household cleaning products"}</li>
                      <li>• {isSpanish ? "Perfumes, lociones y hairspray (aplícalos ANTES de ponerte las joyas)" : "Perfumes, lotions and hairspray (apply BEFORE putting on jewelry)"}</li>
                      <li>• {isSpanish ? "Acetona (quitaesmalte)" : "Acetone (nail polish remover)"}</li>
                      <li>• {isSpanish ? "Productos abrasivos o ácidos" : "Abrasive or acidic products"}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      {isSpanish ? "Actividades de Riesgo" : "Risky Activities"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {isSpanish ? "Quítate tus joyas antes de:" : "Remove your jewelry before:"}
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• {isSpanish ? "Hacer ejercicio o deportes" : "Exercising or playing sports"}</li>
                      <li>• {isSpanish ? "Trabajos de jardinería o construcción" : "Gardening or construction work"}</li>
                      <li>• {isSpanish ? "Nadar en alberca o playa" : "Swimming in pool or beach"}</li>
                      <li>• {isSpanish ? "Bañarte (el jabón puede acumularse)" : "Bathing (soap can accumulate)"}</li>
                      <li>• {isSpanish ? "Dormir (puede deformarse o engancharse)" : "Sleeping (can deform or snag)"}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-4">
                  <Sun className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      {isSpanish ? "Calor y Luz Extremos" : "Extreme Heat and Light"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isSpanish
                        ? "No expongas tu joyería a temperaturas extremas o luz solar directa prolongada. Las piedras preciosas pueden decolorarse y el oro puede debilitarse."
                        : "Do not expose your jewelry to extreme temperatures or prolonged direct sunlight. Precious stones can fade and gold can weaken."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Almacenamiento */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              {isSpanish ? "Almacenamiento Correcto" : "Proper Storage"}
            </h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Home className="h-6 w-6 text-[#D4AF37] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      {isSpanish ? "Separación de Piezas" : "Separate Pieces"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isSpanish
                        ? "Guarda cada pieza por separado en bolsitas de tela suave o compartimentos individuales. Esto evita rayones y enredos. El oro es un metal suave que se raya fácilmente."
                        : "Store each piece separately in soft cloth pouches or individual compartments. This prevents scratches and tangles. Gold is a soft metal that scratches easily."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Home className="h-6 w-6 text-[#D4AF37] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      {isSpanish ? "Lugar Seco y Oscuro" : "Dry and Dark Place"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isSpanish
                        ? "Almacena en un lugar fresco, seco y alejado de la luz directa. El baño NO es ideal por la humedad. Considera incluir paquetes de sílica gel para absorber humedad."
                        : "Store in a cool, dry place away from direct light. The bathroom is NOT ideal due to humidity. Consider including silica gel packets to absorb moisture."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Home className="h-6 w-6 text-[#D4AF37] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      {isSpanish ? "Cierra los Broches" : "Fasten Clasps"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isSpanish
                        ? "Abrocha collares y pulseras antes de guardarlos para evitar nudos. Para cadenas, cuélgalas o guárdalas extendidas."
                        : "Fasten necklaces and bracelets before storing to avoid knots. For chains, hang them or store them laid out."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cuidados específicos por tipo */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              {isSpanish ? "Cuidados Específicos por Tipo de Joya" : "Specific Care by Jewelry Type"}
            </h2>

            <div className="space-y-6">
              {/* Anillos */}
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-2xl">💍</span>
                  {isSpanish ? "Anillos" : "Rings"}
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      {isSpanish
                        ? "Quítatelos antes de aplicar cremas o lociones (se acumulan debajo)"
                        : "Remove them before applying creams or lotions (they accumulate underneath)"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      {isSpanish
                        ? "Revisa regularmente que las piedras estén bien engarzadas"
                        : "Check regularly that stones are securely set"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      {isSpanish
                        ? "Si sientes que está apretado o flojo, visítanos para ajustar la talla"
                        : "If it feels tight or loose, visit us to adjust the size"}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Collares */}
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-2xl">📿</span>
                  {isSpanish ? "Collares y Cadenas" : "Necklaces and Chains"}
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      {isSpanish
                        ? "Nunca jales de la cadena para quitártelo, usa el broche"
                        : "Never pull the chain to remove it, use the clasp"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      {isSpanish
                        ? "Si se enreda, usa un alfiler para desenredar suavemente"
                        : "If it tangles, use a pin to gently untangle"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      {isSpanish
                        ? "Revisa el broche periódicamente; si está flojo, llévalo a reparar"
                        : "Check the clasp periodically; if it's loose, have it repaired"}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Aretes */}
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-2xl">👂</span>
                  {isSpanish ? "Aretes" : "Earrings"}
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      {isSpanish
                        ? "Límpialos después de cada uso para remover aceites y maquillaje"
                        : "Clean them after each use to remove oils and makeup"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      {isSpanish
                        ? "Asegúrate de que los seguros estén bien colocados"
                        : "Make sure the backs are securely fastened"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      {isSpanish
                        ? "Quítatelos antes de dormir o hacer deporte"
                        : "Remove them before sleeping or exercising"}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Pulseras */}
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-2xl">📿</span>
                  {isSpanish ? "Pulseras y Brazaletes" : "Bracelets and Bangles"}
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      {isSpanish
                        ? "Evita golpes contra superficies duras (escritorios, mesas)"
                        : "Avoid hitting hard surfaces (desks, tables)"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      {isSpanish
                        ? "Quítatelas antes de usar computadora o escribir para prevenir deformaciones"
                        : "Remove them before using computer or writing to prevent deformations"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      {isSpanish
                        ? "Revisa que los eslabones no estén débiles o rotos"
                        : "Check that links are not weak or broken"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mantenimiento profesional */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              {isSpanish ? "Mantenimiento Profesional" : "Professional Maintenance"}
            </h2>
            <div className="rounded-lg bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                <Sparkles className="h-6 w-6 text-[#D4AF37] mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">
                    {isSpanish ? "Servicio Anual Recomendado" : "Recommended Annual Service"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isSpanish
                      ? "Visítanos una vez al año para una limpieza profesional y revisión completa. En Oro Nacional, la primera limpieza profesional es GRATIS."
                      : "Visit us once a year for professional cleaning and complete inspection. At Oro Nacional, the first professional cleaning is FREE."}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium text-foreground text-sm mb-1">
                        {isSpanish ? "Limpieza Ultrasónica" : "Ultrasonic Cleaning"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isSpanish
                          ? "Remueve suciedad profunda de áreas inaccesibles"
                          : "Removes deep dirt from inaccessible areas"}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium text-foreground text-sm mb-1">
                        {isSpanish ? "Revisión de Engastes" : "Setting Inspection"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isSpanish
                          ? "Aseguramos que todas las piedras estén seguras"
                          : "We ensure all stones are secure"}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium text-foreground text-sm mb-1">
                        {isSpanish ? "Pulido Profesional" : "Professional Polishing"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isSpanish
                          ? "Restaura el brillo y elimina rayones superficiales"
                          : "Restores shine and removes superficial scratches"}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium text-foreground text-sm mb-1">
                        {isSpanish ? "Revisión de Cierres" : "Clasp Inspection"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isSpanish
                          ? "Verificamos que broches funcionen correctamente"
                          : "We verify that clasps work properly"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tips rápidos */}
          <div className="rounded-2xl bg-muted/30 p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              {isSpanish ? "Tips Rápidos para el Día a Día" : "Quick Daily Tips"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-[#D4AF37] text-xl">✓</span>
                <p className="text-sm text-muted-foreground">
                  <strong>{isSpanish ? "Regla de oro:" : "Golden rule:"}</strong>{" "}
                  {isSpanish
                    ? "Las joyas son lo último que te pones y lo primero que te quitas"
                    : "Jewelry is the last thing you put on and the first thing you take off"}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#D4AF37] text-xl">✓</span>
                <p className="text-sm text-muted-foreground">
                  <strong>{isSpanish ? "Lava tus manos:" : "Wash your hands:"}</strong>{" "}
                  {isSpanish
                    ? "Quítate los anillos antes de lavarte las manos con jabón"
                    : "Remove rings before washing your hands with soap"}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#D4AF37] text-xl">✓</span>
                <p className="text-sm text-muted-foreground">
                  <strong>{isSpanish ? "Viajes:" : "Travel:"}</strong>{" "}
                  {isSpanish
                    ? "Lleva tus joyas en tu equipaje de mano, nunca documentado"
                    : "Carry your jewelry in your carry-on luggage, never checked"}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#D4AF37] text-xl">✓</span>
                <p className="text-sm text-muted-foreground">
                  <strong>{isSpanish ? "Inspección regular:" : "Regular inspection:"}</strong>{" "}
                  {isSpanish
                    ? "Revisa tus joyas cada mes para detectar problemas temprano"
                    : "Check your jewelry monthly to detect problems early"}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#D4AF37] text-xl">✓</span>
                <p className="text-sm text-muted-foreground">
                  <strong>{isSpanish ? "Usa el paño incluido:" : "Use the included cloth:"}</strong>{" "}
                  {isSpanish
                    ? "Pasa el paño de microfibra después de cada uso"
                    : "Use the microfiber cloth after each use"}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#D4AF37] text-xl">✓</span>
                <p className="text-sm text-muted-foreground">
                  <strong>{isSpanish ? "Ante dudas:" : "When in doubt:"}</strong>{" "}
                  {isSpanish
                    ? "Consúltanos antes de intentar limpiar joyas con piedras delicadas"
                    : "Consult us before attempting to clean jewelry with delicate stones"}
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

export default CarePage;
