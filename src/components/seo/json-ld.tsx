import { SITE_CONTACT, SITE_OPENING_HOURS } from "@/lib/site-contact";

type SchemaLocale = "es" | "en";

const SCHEMA_DESCRIPTIONS: Record<SchemaLocale, { business: string; website: string }> = {
  es: {
    business: 'Joyería elegante desde el corazón de Jalisco. Especialistas en anillos, collares, aretes y esclavas de oro.',
    website: 'Joyería elegante desde el corazón de Jalisco',
  },
  en: {
    business: 'Elegant jewelry from the heart of Jalisco. Specialists in gold rings, necklaces, earrings and bracelets.',
    website: 'Elegant jewelry from the heart of Jalisco',
  },
};

// Teléfono en formato +52-33-2636-3714 a partir de la fuente única de contacto
const SCHEMA_TELEPHONE = SITE_CONTACT.phoneE164.replace(
  /^\+52(\d{2})(\d{4})(\d{4})$/,
  '+52-$1-$2-$3'
);

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
export function getOrganizationSchema(locale: SchemaLocale = 'es') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Oro Nacional',
    legalName: 'Oro Nacional S.A. de C.V.',
    url: 'https://www.oronacional.com',
    logo: 'https://www.oronacional.com/logos/logo-oro-nacional.png',
    description: SCHEMA_DESCRIPTIONS[locale].business,
    foundingDate: '1990',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONTACT.streetAddress,
      addressLocality: SITE_CONTACT.city,
      addressRegion: SITE_CONTACT.state,
      addressCountry: SITE_CONTACT.countryCode,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SCHEMA_TELEPHONE,
      contactType: 'customer service',
      email: SITE_CONTACT.email,
      availableLanguage: ['Spanish', 'English'],
    },
    sameAs: [SITE_CONTACT.facebookUrl, SITE_CONTACT.instagramUrl],
  };
}

// Website Schema
export function getWebsiteSchema(locale: SchemaLocale = 'es') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Oro Nacional',
    url: 'https://www.oronacional.com',
    description: SCHEMA_DESCRIPTIONS[locale].website,
    publisher: {
      '@type': 'Organization',
      name: 'Oro Nacional',
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
export function getLocalBusinessSchema(locale: SchemaLocale = 'es') {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://www.oronacional.com',
    name: 'Oro Nacional',
    image: 'https://www.oronacional.com/logos/logo-oro-nacional.png',
    description: SCHEMA_DESCRIPTIONS[locale].business,
    url: 'https://www.oronacional.com',
    telephone: SCHEMA_TELEPHONE,
    email: SITE_CONTACT.email,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONTACT.streetAddress,
      addressLocality: SITE_CONTACT.city,
      addressRegion: SITE_CONTACT.state,
      addressCountry: SITE_CONTACT.countryCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 20.6597,
      longitude: -103.3496,
    },
    // Mismo horario que muestra la página de contacto
    openingHoursSpecification: SITE_OPENING_HOURS.map((hours) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [...hours.days],
      opens: hours.opens,
      closes: hours.closes,
    })),
    sameAs: [SITE_CONTACT.facebookUrl, SITE_CONTACT.instagramUrl],
  };
}

// Blog Article Schema
export function getBlogArticleSchema(article: {
  title: string;
  description: string;
  image: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    image: article.image,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Oro Nacional',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.oronacional.com/logos/logo-oro-nacional.png',
      },
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
}

// FAQ Schema
export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Review Schema
export function getReviewSchema(review: {
  author: string;
  datePublished: string;
  reviewBody: string;
  reviewRating: number;
  itemReviewed: {
    name: string;
    type?: string;
  };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author,
    },
    datePublished: review.datePublished,
    reviewBody: review.reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.reviewRating,
      bestRating: 5,
      worstRating: 1,
    },
    itemReviewed: {
      '@type': review.itemReviewed.type || 'Product',
      name: review.itemReviewed.name,
    },
  };
}

// Collection/Category Schema
export function getCollectionSchema(collection: {
  name: string;
  description: string;
  url: string;
  numberOfItems?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    description: collection.description,
    url: collection.url,
    ...(collection.numberOfItems !== undefined
      ? {
          numberOfItems: collection.numberOfItems,
        }
      : {}),
  };
}
