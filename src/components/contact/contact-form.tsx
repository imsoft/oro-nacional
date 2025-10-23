"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createContactMessage } from "@/lib/supabase/contact";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus({ type: null, message: "" });

    const result = await createContactMessage({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      subject: formData.subject,
      message: formData.message,
    });

    setIsLoading(false);

    if (result.success) {
      setSubmitStatus({
        type: "success",
        message:
          "¡Gracias por contactarnos! Hemos recibido tu mensaje y te responderemos en un plazo máximo de 24 horas.",
      });
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } else {
      setSubmitStatus({
        type: "error",
        message:
          result.error ||
          "Hubo un error al enviar tu mensaje. Por favor, intenta de nuevo o contáctanos por WhatsApp.",
      });
    }

    // Clear status after 10 seconds
    setTimeout(() => {
      setSubmitStatus({ type: null, message: "" });
    }, 10000);
  };

  return (
    <div className="rounded-2xl bg-card p-8 lg:p-10 shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Envíanos un Mensaje
        </h2>
        <p className="mt-2 text-muted-foreground">
          Completa el formulario y nos pondremos en contacto contigo lo antes
          posible.
        </p>
      </div>

      {submitStatus.type && (
        <Alert
          className={`mb-6 ${
            submitStatus.type === "error"
              ? "border-red-500"
              : "border-green-500"
          }`}
        >
          {submitStatus.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertDescription>{submitStatus.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Nombre completo <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Juan Pérez"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isLoading}
          />
        </div>

        {/* Email y Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="juan@ejemplo.com"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="33 1234 5678"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Asunto */}
        <div className="space-y-2">
          <Label htmlFor="subject">
            Asunto <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.subject}
            onValueChange={(value) =>
              setFormData({ ...formData, subject: value })
            }
            required
            disabled={isLoading}
          >
            <SelectTrigger id="subject">
              <SelectValue placeholder="Selecciona un asunto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anillos-compromiso">
                Anillos de Compromiso
              </SelectItem>
              <SelectItem value="diseno-personalizado">
                Diseño Personalizado
              </SelectItem>
              <SelectItem value="cotizacion">Solicitar Cotización</SelectItem>
              <SelectItem value="reparacion">Reparación/Mantenimiento</SelectItem>
              <SelectItem value="garantia">Garantía</SelectItem>
              <SelectItem value="envio">Información de Envío</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mensaje */}
        <div className="space-y-2">
          <Label htmlFor="message">
            Mensaje <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="message"
            placeholder="Cuéntanos en qué podemos ayudarte..."
            rows={6}
            required
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            disabled={isLoading}
          />
        </div>

        {/* Botón de envío */}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-[#D4AF37] hover:bg-[#B8941E] text-white transition-all duration-300 hover:scale-[1.02]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Enviar Mensaje
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Al enviar este formulario, aceptas nuestra política de privacidad.
          Responderemos en un plazo máximo de 24 horas.
        </p>
      </form>
    </div>
  );
};

export default ContactForm;
