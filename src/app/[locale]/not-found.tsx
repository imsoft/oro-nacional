import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Search, Home, ShoppingBag } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 pt-32 pb-24">
        <div className="text-center max-w-md">
          <div className="mx-auto w-24 h-24 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-6">
            <Search className="h-12 w-12 text-[#D4AF37]" />
          </div>
          <p className="text-sm font-semibold tracking-widest text-[#D4AF37] mb-2">404</p>
          <h1 className="text-3xl font-semibold text-foreground mb-4">{t("title")}</h1>
          <p className="text-muted-foreground mb-8">{t("description")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-[#D4AF37] hover:bg-[#B8941E] text-white">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                {t("goHome")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/catalog">
                <ShoppingBag className="mr-2 h-5 w-5" />
                {t("viewCatalog")}
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
