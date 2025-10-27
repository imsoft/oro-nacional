import { useTranslations } from 'next-intl';
import { Clock, Mail, Phone, MapPin, Instagram, Facebook, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

const ConstructionPage = () => {
  const t = useTranslations();

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />
      
      <div className="relative isolate overflow-hidden flex-1 flex items-center">
        {/* Fondo con imagen */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background"></div>
          {/* Efectos dorados sutiles */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl opacity-5 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#FFD700] rounded-full blur-3xl opacity-5 animate-pulse delay-1000"></div>
        </div>

        {/* Efectos de fondo como en hero-section */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#FFD700] to-[#FFA500] opacity-10 sm:left-[calc(50%-30rem)] sm:w-288.75 animate-[pulse_4s_ease-in-out_infinite]"
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full">
          <div className="mx-auto max-w-4xl py-12 sm:py-16 lg:py-20">
            {/* Badge */}
            <div className="mb-8 flex justify-center animate-[fade-in-down_1s_ease-out]">
              <div className="relative rounded-full px-3 py-1 text-sm/6 text-muted-foreground ring-1 ring-border hover:ring-border/80 transition-all duration-300 hover:scale-105">
                <Clock className="w-4 h-4 inline mr-2" />
                Sitio en Construcción
              </div>
            </div>

            {/* Contenido principal */}
            <div className="text-center">
              {/* Logo/Icono */}
              <div className="mb-8 animate-[fade-in-up_1s_ease-out_0.2s_both]">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-10 h-10 text-black" />
                </div>
              </div>

              {/* Título */}
              <h1 className="text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-7xl animate-[fade-in-up_1s_ease-out_0.4s_both] mb-6">
                <span className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
                  Oro Nacional
                </span>
              </h1>
              
              <p className="mt-8 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8 animate-[fade-in-up_1s_ease-out_0.6s_both] max-w-3xl mx-auto">
                Estamos trabajando para traerte la mejor experiencia en joyería de oro. 
                Pronto podrás explorar nuestra colección exclusiva de anillos, collares, 
                pulseras y aretes artesanales.
              </p>

              {/* Información de contacto */}
              <div className="mt-12 animate-[fade-in-up_1s_ease-out_0.8s_both]">
                <Card className="w-full max-w-4xl mx-auto bg-card/50 border-border backdrop-blur-sm">
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-[#D4AF37] mb-6 text-center">
                      Mantente Conectado
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Información de contacto */}
                      <div className="space-y-4">
                        <h4 className="text-xl font-semibold text-foreground mb-4">Información de Contacto</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 text-muted-foreground hover:text-[#D4AF37] transition-colors">
                            <Phone className="w-5 h-5 text-[#D4AF37]" />
                            <span>+52 (55) 1234-5678</span>
                          </div>
                          
                          <div className="flex items-center space-x-3 text-muted-foreground hover:text-[#D4AF37] transition-colors">
                            <Mail className="w-5 h-5 text-[#D4AF37]" />
                            <span>contacto@oronacional.com</span>
                          </div>
                          
                          <div className="flex items-center space-x-3 text-muted-foreground hover:text-[#D4AF37] transition-colors">
                            <MapPin className="w-5 h-5 text-[#D4AF37]" />
                            <span>Ciudad de México, México</span>
                          </div>
                        </div>
                      </div>

                      {/* Redes sociales */}
                      <div className="space-y-4">
                        <h4 className="text-xl font-semibold text-foreground mb-4">Síguenos</h4>
                        
                        <div className="space-y-3">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start border-border text-muted-foreground hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all"
                          >
                            <Instagram className="w-5 h-5 mr-3" />
                            @oronacional_mx
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="w-full justify-start border-border text-muted-foreground hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all"
                          >
                            <Facebook className="w-5 h-5 mr-3" />
                            Oro Nacional México
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Mensaje de lanzamiento */}
              <div className="mt-12 animate-[fade-in-up_1s_ease-out_1s_both]">
                <div className="inline-flex items-center px-6 py-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full">
                  <Clock className="w-5 h-5 text-[#D4AF37] mr-2 animate-pulse" />
                  <span className="text-[#D4AF37] font-medium">
                    Lanzamiento Próximo - Diciembre 2024
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Efecto de fondo inferior */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-[#FFA500] to-[#FFD700] opacity-10 sm:left-[calc(50%+36rem)] sm:w-288.75 animate-[pulse_4s_ease-in-out_infinite_2s]"
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ConstructionPage;
