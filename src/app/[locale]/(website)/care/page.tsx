import { Sparkles, Droplet, Sun, Home, AlertTriangle, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

const CarePage = () => {
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
            Cuidado de tu Joyería de Oro
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Aprende a mantener tu joyería radiante y en perfectas condiciones
            con estos consejos profesionales de nuestros maestros joyeros.
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
                    Limpieza en Casa - Método Básico
                  </h2>
                  <p className="mt-2 text-muted-foreground mb-6">
                    Limpia tu joyería de oro cada 2-4 semanas con este método
                    simple y seguro que puedes hacer en casa.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/10 text-xs font-semibold text-blue-600">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Prepara la solución
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Mezcla agua tibia con unas gotas de jabón suave (lava
                          trastes neutro). NO uses detergentes agresivos.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/10 text-xs font-semibold text-blue-600">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Remoja</p>
                        <p className="text-sm text-muted-foreground">
                          Sumerge tu joya por 10-15 minutos. Para piezas muy
                          sucias, usa un cepillo de dientes suave en las áreas
                          difíciles.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/10 text-xs font-semibold text-blue-600">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Enjuaga bien
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Enjuaga con agua tibia. IMPORTANTE: Tapa el drenaje
                          para evitar que se caiga la joya.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/10 text-xs font-semibold text-blue-600">
                        4
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Seca completamente
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Usa un paño suave y seco (preferentemente el paño de
                          microfibra incluido con tu compra). Deja secar al aire
                          antes de guardar.
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
              ⚠️ Qué Evitar para Proteger tu Joyería
            </h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Químicos Agresivos
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Evita el contacto con estas sustancias que pueden dañar tu
                      oro:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Cloro (albercas, tinas de hidromasaje)</li>
                      <li>• Blanqueador y productos de limpieza del hogar</li>
                      <li>• Perfumes, lociones y hairspray (aplícalos ANTES de ponerte las joyas)</li>
                      <li>• Acetona (quitaesmalte)</li>
                      <li>• Productos abrasivos o ácidos</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Actividades de Riesgo
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Quítate tus joyas antes de:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Hacer ejercicio o deportes</li>
                      <li>• Trabajos de jardinería o construcción</li>
                      <li>• Nadar en alberca o playa</li>
                      <li>• Bañarte (el jabón puede acumularse)</li>
                      <li>• Dormir (puede deformarse o engancharse)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-4">
                  <Sun className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Calor y Luz Extremos
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      No expongas tu joyería a temperaturas extremas o luz solar
                      directa prolongada. Las piedras preciosas pueden
                      decolorarse y el oro puede debilitarse.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Almacenamiento */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Almacenamiento Correcto
            </h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Home className="h-6 w-6 text-[#D4AF37] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Separación de Piezas
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Guarda cada pieza por separado en bolsitas de tela suave o
                      compartimentos individuales. Esto evita rayones y
                      enredos. El oro es un metal suave que se raya fácilmente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Home className="h-6 w-6 text-[#D4AF37] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Lugar Seco y Oscuro
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Almacena en un lugar fresco, seco y alejado de la luz
                      directa. El baño NO es ideal por la humedad. Considera
                      incluir paquetes de sílica gel para absorber humedad.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Home className="h-6 w-6 text-[#D4AF37] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Cierra los Broches
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Abrocha collares y pulseras antes de guardarlos para
                      evitar nudos. Para cadenas, cuélgalas o guárdalas
                      extendidas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cuidados específicos por tipo */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Cuidados Específicos por Tipo de Joya
            </h2>

            <div className="space-y-6">
              {/* Anillos */}
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-2xl">💍</span>
                  Anillos
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Quítatelos antes de aplicar cremas o lociones (se acumulan
                      debajo)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Revisa regularmente que las piedras estén bien engarzadas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Si sientes que está apretado o flojo, visítanos para
                      ajustar la talla
                    </span>
                  </li>
                </ul>
              </div>

              {/* Collares */}
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-2xl">📿</span>
                  Collares y Cadenas
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Nunca jales de la cadena para quitártelo, usa el broche
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Si se enreda, usa un alfiler para desenredar suavemente
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Revisa el broche periódicamente; si está flojo, llévalo a
                      reparar
                    </span>
                  </li>
                </ul>
              </div>

              {/* Aretes */}
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-2xl">👂</span>
                  Aretes
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Límpialos después de cada uso para remover aceites y
                      maquillaje
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Asegúrate de que los seguros estén bien colocados
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Quítatelos antes de dormir o hacer deporte
                    </span>
                  </li>
                </ul>
              </div>

              {/* Pulseras */}
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-2xl">📿</span>
                  Pulseras y Brazaletes
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Evita golpes contra superficies duras (escritorios, mesas)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Quítatelas antes de usar computadora o escribir para
                      prevenir deformaciones
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Revisa que los eslabones no estén débiles o rotos
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mantenimiento profesional */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Mantenimiento Profesional
            </h2>
            <div className="rounded-lg bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                <Sparkles className="h-6 w-6 text-[#D4AF37] mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">
                    Servicio Anual Recomendado
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Visítanos una vez al año para una limpieza profesional y
                    revisión completa. En Oro Nacional, la primera limpieza
                    profesional es GRATIS.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium text-foreground text-sm mb-1">
                        Limpieza Ultrasónica
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Remueve suciedad profunda de áreas inaccesibles
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium text-foreground text-sm mb-1">
                        Revisión de Engastes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Aseguramos que todas las piedras estén seguras
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium text-foreground text-sm mb-1">
                        Pulido Profesional
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Restaura el brillo y elimina rayones superficiales
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="font-medium text-foreground text-sm mb-1">
                        Revisión de Cierres
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Verificamos que broches funcionen correctamente
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
              Tips Rápidos para el Día a Día
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-[#D4AF37] text-xl">✓</span>
                <p className="text-sm text-muted-foreground">
                  <strong>Regla de oro:</strong> Las joyas son lo último que te
                  pones y lo primero que te quitas
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#D4AF37] text-xl">✓</span>
                <p className="text-sm text-muted-foreground">
                  <strong>Lava tus manos:</strong> Quítate los anillos antes de
                  lavarte las manos con jabón
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#D4AF37] text-xl">✓</span>
                <p className="text-sm text-muted-foreground">
                  <strong>Viajes:</strong> Lleva tus joyas en tu equipaje de
                  mano, nunca documentado
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#D4AF37] text-xl">✓</span>
                <p className="text-sm text-muted-foreground">
                  <strong>Inspección regular:</strong> Revisa tus joyas cada mes
                  para detectar problemas temprano
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#D4AF37] text-xl">✓</span>
                <p className="text-sm text-muted-foreground">
                  <strong>Usa el paño incluido:</strong> Pasa el paño de
                  microfibra después de cada uso
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#D4AF37] text-xl">✓</span>
                <p className="text-sm text-muted-foreground">
                  <strong>Ante dudas:</strong> Consúltanos antes de intentar
                  limpiar joyas con piedras delicadas
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
