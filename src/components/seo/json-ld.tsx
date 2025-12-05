interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization Schema
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Oro Nacional',
    legalName: 'Oro Nacional S.A. de C.V.',
    url: 'https://www.oronacional.com',
    logo: 'https://www.oronacional.com/logos/logo-oro-nacional.png',
    description: 'Joyería elegante desde el corazón de Jalisco. Especialistas en anillos, collares, aretes y esclavas de oro.',
    foundingDate: '1990',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Guadalajara',
      addressRegion: 'Jalisco',
      addressCountry: 'MX',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+52-33-1234-5678',
      contactType: 'customer service',
      email: 'contacto@oronacional.com',
      availableLanguage: ['Spanish', 'English'],
    },
    sameAs: [
      'https://www.facebook.com/profile.php?id=61579417826319',
      'https://www.instagram.com/nacionaloro/',
    ],
  };
}

// Website Schema
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Oro Nacional',
    url: 'https://www.oronacional.com',
    description: 'Joyería elegante desde el corazón de Jalisco',
    publisher: {
      '@type': 'Organization',
      name: 'Oro Nacional',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.oronacional.com/es/catalog?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    inLanguage: ['es-MX', 'en-US'],
  };
}

// Product Schema
export function getProductSchema(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  sku?: string;
  brand?: string;
  availability?: string;
  rating?: number;
  ratingCount?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Oro Nacional',
    },
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? window.location.href : '',
      priceCurrency: product.currency,
      price: product.price,
      availability: product.availability || 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Oro Nacional',
      },
    },
    ...(product.rating && product.ratingCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.ratingCount,
          },
        }
      : {}),
  };
}

// Breadcrumb Schema
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Local Business Schema
export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://www.oronacional.com',
    name: 'Oro Nacional',
    image: 'https://www.oronacional.com/logos/logo-oro-nacional.png',
    description: 'Joyería elegante desde el corazón de Jalisco. Especialistas en anillos, collares, aretes y esclavas de oro.',
    url: 'https://www.oronacional.com',
    telephone: '+52-33-1234-5678',
    email: 'contacto@oronacional.com',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Guadalajara',
      addressLocality: 'Guadalajara',
      addressRegion: 'Jalisco',
      postalCode: '',
      addressCountry: 'MX',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 20.6597,
      longitude: -103.3496,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '14:00',
      },
    ],
    sameAs: [
      'https://www.facebook.com/profile.php?id=61579417826319',
      'https://www.instagram.com/nacionaloro/',
    ],
  };
}
