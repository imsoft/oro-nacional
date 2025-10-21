"use client";

import { useState } from "react";
import { Save, Store, Mail, MapPin, Phone, Globe, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ConfiguracionAdmin() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
          <p className="mt-2 text-muted-foreground">
            Administra la configuración de tu tienda
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#D4AF37] hover:bg-[#B8941E] text-white"
        >
          <Save className="mr-2 h-5 w-5" />
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Información de la Tienda */}
        <div className="rounded-lg bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-[#D4AF37]/10 p-2">
              <Store className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Información de la Tienda
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="storeName">Nombre de la Tienda</Label>
              <Input
                id="storeName"
                defaultValue="Oro Nacional"
                placeholder="Nombre de tu tienda"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeEmail">Email de Contacto</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="storeEmail"
                  type="email"
                  defaultValue="contacto@oronacional.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storePhone">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="storePhone"
                  type="tel"
                  defaultValue="+52 33 1234 5678"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeWebsite">Sitio Web</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="storeWebsite"
                  type="url"
                  defaultValue="https://oronacional.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="storeAddress">Dirección</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="storeAddress"
                  defaultValue="Guadalajara, Jalisco, México"
                  className="pl-10"
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="storeDescription">Descripción</Label>
              <Textarea
                id="storeDescription"
                defaultValue="Elegancia y tradición jalisciense desde 1990. Especialistas en joyería fina de oro."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Configuración de Envío */}
        <div className="rounded-lg bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-[#D4AF37]/10 p-2">
              <MapPin className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Configuración de Envío
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="freeShipping">Envío Gratis Desde</Label>
              <Input
                id="freeShipping"
                type="number"
                defaultValue="3000"
                placeholder="Monto mínimo"
              />
              <p className="text-xs text-muted-foreground">
                Monto en MXN para envío gratis
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingCost">Costo de Envío Estándar</Label>
              <Input
                id="shippingCost"
                type="number"
                defaultValue="0"
                placeholder="Costo en MXN"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expressShipping">Envío Express</Label>
              <Input
                id="expressShipping"
                type="number"
                defaultValue="200"
                placeholder="Costo en MXN"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryTime">Tiempo de Entrega (días)</Label>
              <Input
                id="deliveryTime"
                defaultValue="3-5"
                placeholder="Ej: 3-5"
              />
            </div>
          </div>
        </div>

        {/* Configuración de Pagos */}
        <div className="rounded-lg bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-[#D4AF37]/10 p-2">
              <CreditCard className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Métodos de Pago
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Tarjetas de Crédito/Débito</p>
                  <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 font-medium">Activo</span>
                <div className="h-6 w-11 rounded-full bg-green-600 relative">
                  <div className="h-5 w-5 rounded-full bg-white absolute right-0.5 top-0.5"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-purple-100 flex items-center justify-center">
                  <span className="text-xl">🏦</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Transferencia Bancaria</p>
                  <p className="text-sm text-muted-foreground">BBVA, Santander, etc.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 font-medium">Activo</span>
                <div className="h-6 w-11 rounded-full bg-green-600 relative">
                  <div className="h-5 w-5 rounded-full bg-white absolute right-0.5 top-0.5"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Efectivo Contra Entrega</p>
                  <p className="text-sm text-muted-foreground">Pago al recibir el producto</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 font-medium">Activo</span>
                <div className="h-6 w-11 rounded-full bg-green-600 relative">
                  <div className="h-5 w-5 rounded-full bg-white absolute right-0.5 top-0.5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuración de Moneda y Región */}
        <div className="rounded-lg bg-card border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-[#D4AF37]/10 p-2">
              <Globe className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Configuración Regional
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select defaultValue="MXN">
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                  <SelectItem value="USD">USD - Dólar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Zona Horaria</Label>
              <Select defaultValue="America/Mexico_City">
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                  <SelectItem value="America/Tijuana">Tijuana (GMT-8)</SelectItem>
                  <SelectItem value="America/Cancun">Cancún (GMT-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select defaultValue="es">
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Select defaultValue="MX">
                <SelectTrigger id="country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MX">México</SelectItem>
                  <SelectItem value="US">Estados Unidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Save Button at bottom */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
            className="bg-[#D4AF37] hover:bg-[#B8941E] text-white"
          >
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? "Guardando..." : "Guardar Todos los Cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
}
