"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  Users,
  Settings,
  Image as ImageIcon,
  Calculator,
  ChevronDown,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

export function AppSidebar() {
  const t = useTranslations("admin.navigation");
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const navigationItems = [
    { name: t("dashboard"), href: "/admin", icon: LayoutDashboard },
    { name: t("heroImages"), href: "/admin/hero", icon: ImageIcon },
    { name: t("products"), href: "/admin/productos", icon: Package },
    {
      name: t("productCategories"),
      href: "/admin/productos/categorias",
      icon: Package,
    },
    {
      name: t("priceCalculator"),
      href: "/admin/calculadora-precios",
      icon: Calculator,
    },
    { name: t("blog"), href: "/admin/blog", icon: FileText },
    {
      name: t("blogCategories"),
      href: "/admin/blog/categorias",
      icon: FileText,
    },
    { name: t("orders"), href: "/admin/pedidos", icon: ShoppingCart },
    { name: t("users"), href: "/admin/usuarios", icon: Users },
    { name: t("settings"), href: "/admin/configuracion", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#D4AF37] text-sidebar-primary-foreground">
                  <span className="text-lg font-bold">ON</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Oro Nacional</span>
                  <span className="truncate text-xs">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Menu */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <span className="text-sm font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center justify-center py-2">
              <LanguageSwitcher />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
