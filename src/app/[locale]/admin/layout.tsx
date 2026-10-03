"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const t = useTranslations("auth.session");
  // La sesión se verifica una sola vez (al cargar el store) y después se
  // mantiene sincronizada con onAuthStateChange; no se vuelve a verificar en
  // cada navegación para no desmontar todo el panel.
  const { isAdmin, isAuthenticated, hasCheckedSession, profileLoadFailed } = useAuthStore();

  // Hay sesión pero el perfil (y por tanto el rol) aún no se pudo cargar:
  // el store reintenta en segundo plano, así que se espera en vez de redirigir.
  const isWaitingForProfile = isAuthenticated && !isAdmin && profileLoadFailed;

  useEffect(() => {
    if (!hasCheckedSession || isWaitingForProfile) return;

    // Si no está autenticado o no es admin, redirigir (conserva el idioma actual)
    if (!isAuthenticated || !isAdmin) {
      router.replace("/login");
    }
  }, [hasCheckedSession, isWaitingForProfile, isAuthenticated, isAdmin, router]);

  // Mostrar loading solo mientras se hace la primera verificación de sesión
  if (!hasCheckedSession || isWaitingForProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("verifying")}</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado o no es admin, no mostrar nada (será redirigido)
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-bold text-[#D4AF37]">
              Oro Nacional - Admin
            </h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
