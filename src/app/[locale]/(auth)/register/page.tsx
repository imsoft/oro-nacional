"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth-store";

const RegistroPage = () => {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validaciones
    if (!name || !email || !password || !confirmPassword) {
      setError("Por favor completa todos los campos");
      setIsLoading(false);
      return;
    }

    if (name.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor ingresa un correo válido");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    const result = await register(name, email, password);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Error al crear la cuenta");
    }

    setIsLoading(false);
  };

  // Validación de fortaleza de contraseña
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, text: "", color: "" };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, text: "Débil", color: "text-red-600" };
    if (strength <= 3) return { strength, text: "Media", color: "text-yellow-600" };
    return { strength, text: "Fuerte", color: "text-green-600" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-12 pt-28">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              Crear tu cuenta
            </h1>
            <p className="text-muted-foreground">
              Únete a la familia Oro Nacional y disfruta de beneficios exclusivos
            </p>
          </div>

          {/* Formulario */}
          <div className="rounded-2xl bg-card p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email */}
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
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {password && (
                  <div className="flex items-center justify-between text-xs">
                    <span className={passwordStrength.color}>
                      Contraseña: {passwordStrength.text}
                    </span>
                    <span className="text-muted-foreground">
                      {password.length}/8+ caracteres
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                  {confirmPassword && password === confirmPassword && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                  )}
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Terms */}
              <div className="text-xs text-muted-foreground">
                Al crear una cuenta, aceptas nuestros{" "}
                <Link href="/terms" className="text-[#D4AF37] hover:underline">
                  Términos y Condiciones
                </Link>{" "}
                y{" "}
                <Link href="/privacy" className="text-[#D4AF37] hover:underline">
                  Política de Privacidad
                </Link>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-[#D4AF37] hover:bg-[#B8941E] text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  ¿Ya tienes cuenta?
                </span>
              </div>
            </div>

            {/* Login link */}
            <div className="text-center">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
              >
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-8 rounded-lg bg-card/50 p-6">
            <p className="text-center text-sm font-semibold text-foreground mb-4">
              ¿Por qué crear una cuenta?
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-[#D4AF37]/10 p-1 mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Proceso de compra más rápido
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Guarda tu información para compras futuras
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-[#D4AF37]/10 p-1 mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Ofertas exclusivas
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Acceso anticipado a nuevas colecciones y descuentos
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-[#D4AF37]/10 p-1 mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Seguimiento de pedidos
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Rastrea tus compras en tiempo real
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegistroPage;
