"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Users,
  Settings
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { isAdmin, isAuthenticated, user, logout, checkSession, isLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const t = useTranslations('admin.navigation');

  const navigation = [
    { name: t('dashboard'), href: "/admin", icon: LayoutDashboard },
    { name: t('products'), href: "/admin/productos", icon: Package },
    { name: t('blog'), href: "/admin/blog", icon: FileText },
    { name: t('blogCategories'), href: "/admin/blog/categorias", icon: FileText },
    { name: t('orders'), href: "/admin/pedidos", icon: ShoppingCart },
    { name: t('users'), href: "/admin/usuarios", icon: Users },
    { name: t('settings'), href: "/admin/configuracion", icon: Settings },
  ];

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

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar para desktop */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-border bg-card">
          {/* Logo */}
          <div className="flex h-16 flex-shrink-0 items-center justify-between px-6 border-b border-border">
            <Link href="/admin" className="flex items-center">
              <span className="text-xl font-bold text-[#D4AF37]">
                Oro Nacional
              </span>
            </Link>
            <LanguageSwitcher />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="flex flex-shrink-0 border-t border-border p-4">
            <div className="group block w-full flex-shrink-0">
              <div className="flex items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="ml-3"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 flex w-64 flex-col bg-card border-r border-border">
            {/* Logo */}
            <div className="flex h-16 flex-shrink-0 items-center justify-between px-6 border-b border-border">
              <Link href="/admin" className="flex items-center">
                <span className="text-xl font-bold text-[#D4AF37]">
                  Oro Nacional
                </span>
              </Link>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User section */}
            <div className="flex flex-shrink-0 border-t border-border p-4">
              <div className="group block w-full flex-shrink-0">
                <div className="flex items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="ml-3"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64">
        {/* Top bar mobile */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-border bg-card md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="m-4"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex flex-1 items-center justify-between px-4">
            <span className="text-xl font-bold text-[#D4AF37]">
              Oro Nacional
            </span>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
