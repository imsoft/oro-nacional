import { useTranslations } from 'next-intl';
import { Clock, Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ConstructionPage = () => {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] relative overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#FFD700] rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#B8860B] rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo/Icono */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center shadow-2xl">
            <Clock className="w-12 h-12 text-black animate-spin" />
          </div>
        </div>

        {/* Título principal */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
              Oro Nacional
            </span>
          </h1>
          <h2 className="text-2xl md:text-3xl text-gray-300 mb-6">
            Sitio en Construcción
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Estamos trabajando para traerte la mejor experiencia en joyería de oro. 
            Pronto podrás explorar nuestra colección exclusiva de anillos, collares, 
            pulseras y aretes artesanales.
          </p>
        </div>

        {/* Información de contacto */}
        <Card className="w-full max-w-4xl bg-black/50 border-[#D4AF37]/30 backdrop-blur-sm">
          <div className="p-8">
            <h3 className="text-2xl font-bold text-[#D4AF37] mb-6 text-center">
              Mantente Conectado
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Información de contacto */}
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-white mb-4">Información de Contacto</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Phone className="w-5 h-5 text-[#D4AF37]" />
                    <span>+52 (55) 1234-5678</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Mail className="w-5 h-5 text-[#D4AF37]" />
                    <span>contacto@oronacional.com</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-gray-300">
                    <MapPin className="w-5 h-5 text-[#D4AF37]" />
                    <span>Ciudad de México, México</span>
                  </div>
                </div>
              </div>

              {/* Redes sociales */}
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-white mb-4">Síguenos</h4>
                
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-[#D4AF37]/30 text-gray-300 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
                  >
                    <Instagram className="w-5 h-5 mr-3" />
                    @oronacional_mx
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-[#D4AF37]/30 text-gray-300 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
                  >
                    <Facebook className="w-5 h-5 mr-3" />
                    Oro Nacional México
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Mensaje de lanzamiento */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-full">
            <Clock className="w-5 h-5 text-[#D4AF37] mr-2 animate-pulse" />
            <span className="text-[#D4AF37] font-medium">
              Lanzamiento Próximo - Enero 2025
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500">
          <p>&copy; 2025 Oro Nacional. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default ConstructionPage;
