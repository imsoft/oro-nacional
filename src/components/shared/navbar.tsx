"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Menu, ShoppingCart, LogOut, Package, Settings, Heart, UserCircle } from "lucide-react";
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from './language-switcher';
import { CurrencySelector } from './currency-selector';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useFavoritesStore } from "@/stores/favorites-store";

const Navbar = () => {
  const t = useTranslations("nav");
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const favoriteCount = useFavoritesStore((state) => state.getFavoriteCount());

  const navigation = [
    { name: t("catalog"), href: "/catalog" },
    { name: t("about"), href: "/about" },
    { name: t("blog"), href: "/blog" },
    { name: t("contact"), href: "/contact" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 animate-[fade-in-down_0.8s_ease-out]">
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">{t("companyName")}</span>
            <Image
              alt="Logo Oro Nacional - Joyería Elegante en Jalisco"
              src="/logos/logo-oro-nacional.png"
              width={200}
              height={67}
              className="h-14 w-auto lg:h-16"
              priority
            />
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
              >
                <span className="sr-only">{t("openMenu")}</span>
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm p-6">
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center justify-end gap-2">
                  <CurrencySelector />
                  <LanguageSwitcher />
                </div>
                <Link href="/" className="flex justify-center" onClick={() => setIsOpen(false)}>
                  <span className="sr-only">{t("companyName")}</span>
                  <Image
                    alt="Logo Oro Nacional - Joyería Elegante en Jalisco"
                    src="/logos/logo-oro-nacional.png"
                    width={220}
                    height={73}
                    className="h-16 w-auto"
                  />
                </Link>
              </div>
              <div className="flow-root">
                <div className="divide-y divide-border">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-foreground hover:bg-accent"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="py-6 space-y-2">
                    <Link
                      href="/cart"
                      onClick={() => setIsOpen(false)}
                      className="-mx-3 flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-semibold text-foreground hover:bg-accent"
                    >
                      <span>{t("cart")}</span>
                      {itemCount > 0 && (
                        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-[#D4AF37] rounded-full">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                    {isAuthenticated ? (
                      <>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setIsOpen(false)}
                            className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-[#D4AF37] hover:bg-accent"
                          >
                            {t("admin")}
                          </Link>
                        )}
                        <Link
                          href="/profile"
                          onClick={() => setIsOpen(false)}
                          className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-foreground hover:bg-accent"
                        >
                          {t("profile")}
                        </Link>
                        <Link
                          href="/my-orders"
                          onClick={() => setIsOpen(false)}
                          className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-foreground hover:bg-accent"
                        >
                          {t("myOrders")}
                        </Link>
                        <Link
                          href="/favorites"
                          onClick={() => setIsOpen(false)}
                          className="-mx-3 flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-semibold text-foreground hover:bg-accent"
                        >
                          <span>{t("favorites")}</span>
                          {favoriteCount > 0 && (
                            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-[#D4AF37] rounded-full">
                              {favoriteCount}
                            </span>
                          )}
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsOpen(false);
                          }}
                          className="-mx-3 w-full text-left block rounded-lg px-3 py-2.5 text-base font-semibold text-red-600 hover:bg-accent"
                        >
                          {t("logout")}
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          onClick={() => setIsOpen(false)}
                          className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-foreground hover:bg-accent"
                        >
                          {t("login")}
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setIsOpen(false)}
                          className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-[#D4AF37] hover:bg-accent"
                        >
                          {t("createAccount")}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm/6 font-semibold text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-6 lg:items-center">
          {/* Currency Selector */}
          <CurrencySelector />
          
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Carrito */}
          <Link
            href="/cart"
            className="relative text-sm/6 font-semibold text-foreground hover:text-[#D4AF37] transition-colors flex items-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>{t("cart")}</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[#D4AF37] rounded-full">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-accent h-auto p-2 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback className="bg-[#D4AF37] text-white text-sm font-semibold">
                      {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold text-foreground max-w-[100px] truncate hidden md:block">
                    {user?.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                      <AvatarFallback className="bg-[#D4AF37] text-white font-semibold">
                        {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate max-w-[150px]">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t("admin")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>{t("profile")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-orders" className="flex items-center cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    <span>{t("myOrders")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/favorites" className="flex items-center cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    <span className="flex items-center justify-between w-full">
                      {t("favorites")}
                      {favoriteCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[#D4AF37] rounded-full">
                          {favoriteCount}
                        </span>
                      )}
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm/6 font-semibold text-foreground hover:text-[#D4AF37] transition-colors"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#B8941E] transition-colors"
              >
                {t("createAccount")}
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

