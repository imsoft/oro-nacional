"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { isAdmin, isAuthenticated, checkSession, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  // Verificar sesión al montar el componente y después de cada navegación
  useEffect(() => {
    const verifySession = async () => {
      setIsChecking(true);
      await checkSession();
      setIsChecking(false);
    };

    verifySession();
  }, [checkSession, pathname]);

  useEffect(() => {
    // Si terminó de cargar y no está autenticado o no es admin, redirigir
    if (!isLoading && !isChecking && (!isAuthenticated || !isAdmin)) {
      router.push("/login", { locale: locale as 'es' | 'en' });
    }
  }, [isLoading, isChecking, isAuthenticated, isAdmin, router, locale]);

  // Mostrar loading mientras se verifica la sesión
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando sesión...</p>
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
