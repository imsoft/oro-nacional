"use client";

import { useEffect, useState } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Lock, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";

type RecoveryStatus = "checking" | "ready" | "invalid";

const UpdatePasswordPage = () => {
  const t = useTranslations("auth.updatePassword");
  const router = useRouter();

  const [status, setStatus] = useState<RecoveryStatus>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    // supabase-js (detectSessionInUrl) procesa automáticamente el hash / `code`
    // del enlace de recuperación y emite PASSWORD_RECOVERY al crear la sesión.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active || !session) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setStatus("ready");
      }
    });

    // El evento pudo emitirse antes de montar este componente, así que también
    // se revisa la sesión ya establecida. getSession() espera a que termine el
    // procesamiento de la URL, por lo que "sin sesión" significa enlace
    // inválido o expirado.
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!active) return;
        setStatus((current) =>
          current === "ready" ? current : session ? "ready" : "invalid"
        );
      })
      .catch(() => {
        if (active) setStatus((current) => (current === "ready" ? current : "invalid"));
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Mismas reglas que la página de registro
    if (!password || !confirmPassword) {
      setError(t("allFieldsRequired"));
      return;
    }

    if (password.length < 6) {
      setError(t("passwordMinLength"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordsDontMatch"));
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        console.error("Error updating password:", updateError);
        if (updateError.code === "same_password") {
          setError(t("samePassword"));
        } else if (updateError.code === "weak_password") {
          setError(t("weakPassword"));
        } else if (updateError.name === "AuthSessionMissingError") {
          setStatus("invalid");
        } else {
          setError(t("genericError"));
        }
        setIsLoading(false);
        return;
      }

      // Cerrar la sesión de recuperación para que el usuario inicie sesión
      // con su nueva contraseña.
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error("Error signing out after password update:", signOutError);
      }

      router.replace("/login?passwordUpdated=1");
    } catch (err) {
      console.error("Error updating password:", err);
      setError(t("genericError"));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-12 pt-32">
        <div className="w-full max-w-md">
          {status === "checking" && (
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37] mx-auto mb-4" />
              <p className="text-muted-foreground">{t("verifying")}</p>
            </div>
          )}

          {status === "invalid" && (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h1 className="text-3xl font-semibold text-foreground mb-2">
                  {t("invalidLinkTitle")}
                </h1>
                <p className="text-muted-foreground">{t("invalidLinkMessage")}</p>
              </div>

              <div className="space-y-3">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941E] text-white"
                >
                  <Link href="/reset-password">{t("requestNewLink")}</Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="w-full">
                  <Link href="/login">{t("backToLogin")}</Link>
                </Button>
              </div>
            </>
          )}

          {status === "ready" && (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("backToLogin")}
                </Link>
                <h1 className="text-3xl font-semibold text-foreground mb-2">
                  {t("title")}
                </h1>
                <p className="text-muted-foreground">{t("subtitle")}</p>
              </div>

              {/* Formulario */}
              <div className="rounded-2xl bg-card p-8 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* New password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">{t("newPassword")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">{t("minChars")}</p>
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

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
                        {t("updating")}
                      </>
                    ) : (
                      t("submit")
                    )}
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UpdatePasswordPage;
