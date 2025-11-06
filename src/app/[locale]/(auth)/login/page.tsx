"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth-store";

const LoginPage = () => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validaciones básicas
    if (!email || !password) {
      setError("Por favor completa todos los campos");
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor ingresa un correo válido");
      setIsLoading(false);
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Error al iniciar sesión");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-12 pt-32">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              Bienvenido de nuevo
            </h1>
            <p className="text-muted-foreground">
              Inicia sesión en tu cuenta de Oro Nacional
            </p>
          </div>

          {/* Formulario */}
          <div className="rounded-2xl bg-card p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
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
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Forgot password */}
              <div className="flex justify-end">
                <Link
                  href="/reset-password"
                  className="text-sm text-[#D4AF37] hover:text-[#B8941E] transition-colors"
                >
                  ¿Olvidaste tu contraseña?
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
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
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

          {/* Benefits */}
          <div className="mt-8 space-y-3">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Beneficios de tener una cuenta:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-[#D4AF37]"></div>
                <span className="text-muted-foreground">
                  Seguimiento de pedidos en tiempo real
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-[#D4AF37]"></div>
                <span className="text-muted-foreground">
                  Guardado de direcciones de envío
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-[#D4AF37]"></div>
                <span className="text-muted-foreground">
                  Acceso a ofertas exclusivas
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-[#D4AF37]"></div>
                <span className="text-muted-foreground">
                  Lista de deseos personalizada
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;
