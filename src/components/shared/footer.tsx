import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

const navigation = {
  tienda: [
    { name: "Anillos", href: "/rings" },
    { name: "Collares", href: "/necklaces" },
    { name: "Aretes", href: "/earrings" },
    { name: "Pulseras", href: "/bracelets" },
  ],
  empresa: [
    { name: "Nosotros", href: "/about" },
    { name: "Contacto", href: "/contact" },
    { name: "Blog", href: "/blog" },
    { name: "Catálogo", href: "/catalog" },
  ],
  servicio: [
    { name: "Envíos", href: "/shipping" },
    { name: "Garantía", href: "/warranty" },
    { name: "Cuidados", href: "/care" },
    { name: "FAQ", href: "/faq" },
  ],
  legal: [
    { name: "Política de privacidad", href: "/privacy" },
    { name: "Términos y condiciones", href: "/terms" },
    { name: "Política de cookies", href: "/privacy#cookies" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-muted" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div>
              <Image
                src="/logos/logo-oro-nacional.png"
                alt="Logo Oro Nacional - Joyería Elegante en Jalisco"
                width={180}
                height={60}
                className="h-12 w-auto"
              />
              <p className="mt-4 text-sm text-muted-foreground">
                Elegancia y tradición jalisciense desde 1990
              </p>
            </div>
            <div className="flex space-x-6">
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </Link>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Guadalajara, Jalisco, México</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <Link href="tel:+523312345678" className="hover:text-foreground">
                  +52 33 1234 5678
                </Link>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <Link
                  href="mailto:contacto@oronacional.com"
                  className="hover:text-foreground"
                >
                  contacto@oronacional.com
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Tienda
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.tienda.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground">
                  Empresa
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.empresa.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Servicio al cliente
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.servicio.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-border pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Oro Nacional. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
