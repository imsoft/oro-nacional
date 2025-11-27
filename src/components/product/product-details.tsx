"use client";

import { Package, Gem, Shield, Truck, Award, Clock } from "lucide-react";

interface ProductDetailsProps {
  product: {
    material: string;
    hasEngraving?: boolean;
  };
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  return (
    <div className="space-y-6">
      {/* Información técnica */}
      <div className="bg-muted/30 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Package className="h-5 w-5 text-[#D4AF37]" />
          Detalles del Producto
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Gem className="h-5 w-5 text-[#D4AF37]" />
            <div>
              <p className="text-sm font-medium">Material</p>
              <p className="text-sm text-muted-foreground">{product.material}</p>
            </div>
          </div>

          {product.hasEngraving && (
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[#D4AF37]" />
              <div>
                <p className="text-sm font-medium">Grabado</p>
                <p className="text-sm text-muted-foreground">Disponible</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Beneficios y garantías */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Beneficios Oro Nacional</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <Shield className="h-8 w-8 text-[#D4AF37] mx-auto mb-2" />
            <h4 className="font-semibold text-sm mb-1">Certificado</h4>
            <p className="text-xs text-muted-foreground">Oro auténtico certificado</p>
          </div>
          
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <Truck className="h-8 w-8 text-[#D4AF37] mx-auto mb-2" />
            <h4 className="font-semibold text-sm mb-1">Envío Gratis</h4>
            <p className="text-xs text-muted-foreground">A toda la República</p>
          </div>
          
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <Award className="h-8 w-8 text-[#D4AF37] mx-auto mb-2" />
            <h4 className="font-semibold text-sm mb-1">Garantía</h4>
            <p className="text-xs text-muted-foreground">De manufactura</p>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-lg p-6">
        <h4 className="font-semibold text-[#D4AF37] mb-2">¿Necesitas ayuda?</h4>
        <p className="text-sm text-muted-foreground mb-3">
          Nuestros expertos joyeros están disponibles para asesorarte en la elección perfecta.
        </p>
        <div className="text-sm space-y-1">
          <p><strong>📍 Ubicación:</strong> Guadalajara, Jalisco</p>
          <p><strong>🕒 Horarios:</strong> Lun-Vie 9:00-18:00, Sáb 9:00-14:00</p>
          <p><strong>📞 Teléfono:</strong> (33) 1234-5678</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
