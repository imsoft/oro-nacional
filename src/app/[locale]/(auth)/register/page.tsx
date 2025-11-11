"use client";

import { useState } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';
import { Mail, Lock, User, AlertCircle, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth-store";

const RegisterPage = () => {
  const t = useTranslations('auth.register');
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validaciones
    if (!name || !email || !password || !confirmPassword) {
      setError(t('allFieldsRequired'));
      setIsLoading(false);
      return;
    }

    if (name.length < 3) {
      setError(t('nameMinLength'));
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('invalidEmail'));
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('passwordMinLength'));
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t('passwordsDontMatch'));
      setIsLoading(false);
      return;
    }

    const result = await register(name, email, password);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || t('registerError'));
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

    if (strength <= 2) return { strength, text: t('passwordWeak'), color: "text-red-600" };
    if (strength <= 3) return { strength, text: t('passwordMedium'), color: "text-yellow-600" };
    return { strength, text: t('passwordStrong'), color: "text-green-600" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-12 pt-32">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              {t('title')}
            </h1>
            <p className="text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          {/* Formulario */}
          <div className="rounded-2xl bg-card p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('namePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
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
                {password && (
                  <div className="flex items-center justify-between text-xs">
                    <span className={passwordStrength.color}>
                      {t('passwordLabel')}: {passwordStrength.text}
                    </span>
                    <span className="text-muted-foreground">
                      {password.length}/8+ {t('characters')}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      confirmPassword && password === confirmPassword ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )
                    )}
                  </button>
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
                {t('termsText')}{" "}
                <Link href="/terms" className="text-[#D4AF37] hover:underline">
                  {t('termsAndConditions')}
                </Link>{" "}
                {t('and')}{" "}
                <Link href="/privacy" className="text-[#D4AF37] hover:underline">
                  {t('privacyPolicy')}
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
                    {t('creatingAccount')}
                  </>
                ) : (
                  t('registerButton')
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
                  {t('alreadyHaveAccount')}
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
                <Link href="/login">{t('login')}</Link>
              </Button>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-8 rounded-lg bg-card/50 p-6">
            <p className="text-center text-sm font-semibold text-foreground mb-4">
              {t('whyCreateAccount')}
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-[#D4AF37]/10 p-1 mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t('benefit1Title')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('benefit1Desc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-[#D4AF37]/10 p-1 mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t('benefit2Title')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('benefit2Desc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-[#D4AF37]/10 p-1 mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t('benefit3Title')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('benefit3Desc')}
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

export default RegisterPage;
