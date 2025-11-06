"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validación básica
    if (!email) {
      setError("Por favor ingresa tu correo electrónico");
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor ingresa un correo válido");
      setIsLoading(false);
      return;
    }

    // Simular envío de correo
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitted(true);
    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Success State */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                Correo Enviado
              </h1>
              <p className="text-muted-foreground">
                Revisa tu bandeja de entrada
              </p>
            </div>

            <div className="rounded-2xl bg-card p-8 shadow-lg">
              <p className="text-muted-foreground text-center mb-6">
                Hemos enviado un enlace para restablecer tu contraseña a{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>

              <div className="p-4 rounded-lg bg-muted mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong className="text-foreground">Nota:</strong> El enlace expirará en 24 horas.
                </p>
                <p className="text-sm text-muted-foreground">
                  Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941E] text-white"
                >
                  <Link href="/login">Volver al Inicio de Sesión</Link>
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                >
                  Enviar de nuevo
                </Button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio de sesión
            </Link>
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              Recuperar Contraseña
            </h1>
            <p className="text-muted-foreground">
              Ingresa tu correo para recibir instrucciones
            </p>
          </div>

          {/* Formulario */}
          <div className="rounded-2xl bg-card p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Info */}
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">
                  Te enviaremos un correo electrónico con un enlace para restablecer
                  tu contraseña. Asegúrate de revisar tu carpeta de spam si no lo
                  encuentras en tu bandeja de entrada.
                </p>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-[#D4AF37] hover:bg-[#B8941E] text-white"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar Enlace de Recuperación"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  ¿No tienes cuenta?
                </span>
              </div>
            </div>

            {/* Register link */}
            <div className="text-center">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
              >
                <Link href="/register">Crear una cuenta</Link>
              </Button>
            </div>
          </div>

          {/* Help */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              ¿Necesitas ayuda?
            </p>
            <Link
              href="/contact"
              className="text-sm font-medium text-[#D4AF37] hover:text-[#B8941E] transition-colors"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPasswordPage;
