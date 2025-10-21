"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ArrowLeft, ShoppingBag } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

const MisPedidosPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl px-6 lg:px-8 py-24 lg:py-32">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
          <h1 className="text-3xl font-semibold text-foreground">
            Mis Pedidos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Bienvenido, {user?.name}
          </p>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Aún no tienes pedidos
          </h2>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Cuando realices tu primera compra, podrás ver el estado de tus
            pedidos aquí.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              size="lg"
              className="bg-[#D4AF37] hover:bg-[#B8941E] text-white"
            >
              <Link href="/catalog">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Ver Catálogo
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/">Ir al Inicio</Link>
            </Button>
          </div>
        </div>

        {/* Info cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg bg-card p-6 text-center shadow-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Seguimiento en tiempo real
            </h3>
            <p className="text-sm text-muted-foreground">
              Rastrea tus pedidos desde el momento de la compra hasta la entrega
            </p>
          </div>

          <div className="rounded-lg bg-card p-6 text-center shadow-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Notificaciones por correo
            </h3>
            <p className="text-sm text-muted-foreground">
              Recibe actualizaciones sobre el estado de tu pedido
            </p>
          </div>

          <div className="rounded-lg bg-card p-6 text-center shadow-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-4">
              <span className="text-2xl">💎</span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Certificado incluido
            </h3>
            <p className="text-sm text-muted-foreground">
              Todas las joyas incluyen certificado de autenticidad
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MisPedidosPage;
