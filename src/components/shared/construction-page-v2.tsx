import { Clock, Mail, Phone, MapPin, Instagram, Facebook, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ConstructionPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0">
        {/* Círculos dorados animados */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-[#FFD700] to-[#D4AF37] rounded-full opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] rounded-full opacity-25 animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full opacity-20 animate-pulse delay-3000"></div>
        
        {/* Patrón de puntos */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#D4AF37] rounded-full"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-[#FFD700] rounded-full"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-[#D4AF37] rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-[#FFD700] rounded-full"></div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Icono principal */}
        <div className="mb-8 relative">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center shadow-2xl">
            <Sparkles className="w-10 h-10 text-black" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FFD700] rounded-full animate-ping"></div>
        </div>

        {/* Título */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent">
              Oro Nacional
            </span>
          </h1>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-24"></div>
            <Clock className="w-6 h-6 text-[#D4AF37] animate-spin" />
            <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-24"></div>
          </div>
          <h2 className="text-3xl md:text-4xl text-gray-300 mb-6 font-light">
            Sitio en Construcción
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Estamos creando algo extraordinario para ti. Pronto podrás descubrir 
            nuestra exclusiva colección de joyería artesanal en oro, diseñada 
            con pasión y tradición mexicana.
          </p>
        </div>

        {/* Card de información */}
        <Card className="w-full max-w-5xl bg-black/40 border-[#D4AF37]/20 backdrop-blur-md shadow-2xl">
          <div className="p-10">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contacto */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-[#D4AF37] mb-6 flex items-center">
                  <Mail className="w-6 h-6 mr-3" />
                  Contáctanos
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-gray-300 hover:text-[#D4AF37] transition-colors">
                    <Phone className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-lg">+52 (55) 1234-5678</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-gray-300 hover:text-[#D4AF37] transition-colors">
                    <Mail className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-lg">contacto@oronacional.com</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-gray-300 hover:text-[#D4AF37] transition-colors">
                    <MapPin className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-lg">Ciudad de México, México</span>
                  </div>
                </div>
              </div>

              {/* Redes sociales */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-[#D4AF37] mb-6 flex items-center">
                  <Instagram className="w-6 h-6 mr-3" />
                  Síguenos
                </h3>
                
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full justify-start border-[#D4AF37]/30 text-gray-300 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all"
                  >
                    <Instagram className="w-5 h-5 mr-4" />
                    <span className="text-lg">@oronacional_mx</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full justify-start border-[#D4AF37]/30 text-gray-300 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all"
                  >
                    <Facebook className="w-5 h-5 mr-4" />
                    <span className="text-lg">Oro Nacional México</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Badge de lanzamiento */}
        <div className="mt-12">
          <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#D4AF37]/20 to-[#FFD700]/20 border border-[#D4AF37]/40 rounded-full backdrop-blur-sm">
            <Clock className="w-6 h-6 text-[#D4AF37] mr-3 animate-pulse" />
            <span className="text-[#D4AF37] font-semibold text-lg">
              Lanzamiento Próximo - Enero 2025
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-lg">
            &copy; 2025 Oro Nacional. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConstructionPage;
