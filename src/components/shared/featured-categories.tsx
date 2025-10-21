import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    name: "Anillos de Oro",
    description: "Anillos de compromiso y matrimonio en oro 14k y 18k",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    href: "/rings",
  },
  {
    name: "Collares de Oro",
    description: "Collares y cadenas en oro fino para toda ocasión",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    href: "/necklaces",
  },
  {
    name: "Aretes de Oro",
    description: "Aretes elegantes en oro con diamantes y piedras preciosas",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    href: "/earrings",
  },
  {
    name: "Pulseras de Oro",
    description: "Pulseras artesanales en oro de máxima calidad",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    href: "/bracelets",
  },
];

const FeaturedCategories = () => {
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Categorías de Joyería en Oro
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Encuentra anillos, collares, aretes y pulseras de oro para cada ocasión especial
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative overflow-hidden rounded-2xl bg-card transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  alt={`${category.name} - Joyería fina en Guadalajara`}
                  src={category.image}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="text-2xl font-semibold text-white">
                  {category.name}
                </h3>
                <p className="mt-1 text-sm text-gray-200">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
