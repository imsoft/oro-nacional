import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase/client';
import { localizedUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/catalog',
    '/blog',
    '/rings',
    '/necklaces',
    '/earrings',
    '/bracelets',
    '/shipping',
    '/care',
    '/faq',
    '/privacy',
    '/terms',
  ];

  const staticPages: MetadataRoute.Sitemap = [];

  // Add both language versions of static pages.
  // Spanish (default locale) URLs are unprefixed: /es/... only redirects.
  (['es', 'en'] as const).forEach(locale => {
    staticRoutes.forEach(route => {
      staticPages.push({
        url: localizedUrl(route, locale),
        lastModified: currentDate,
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
        alternates: {
          languages: {
            es: localizedUrl(route, 'es'),
            en: localizedUrl(route, 'en'),
          },
        },
      });
    });
  });

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const { data: products } = await supabase
      .from('products')
      .select('slug_es, slug_en, updated_at, is_active')
      .eq('is_active', true);

    if (products) {
      productPages = products.flatMap(product => {
        const languages = {
          es: localizedUrl(`/product/${product.slug_es}`, 'es'),
          en: localizedUrl(`/product/${product.slug_en}`, 'en'),
        };

        return [
          {
            url: languages.es,
            lastModified: new Date(product.updated_at),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
            alternates: { languages },
          },
          {
            url: languages.en,
            lastModified: new Date(product.updated_at),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
            alternates: { languages },
          },
        ];
      });
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  // Dynamic blog pages (blog_posts usa `status`, no `is_published`)
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at, created_at')
      .eq('status', 'published');

    if (error) {
      console.error('Error fetching blog posts for sitemap:', error);
    }

    if (posts) {
      blogPages = posts.flatMap(post => {
        const languages = {
          es: localizedUrl(`/blog/${post.slug}`, 'es'),
          en: localizedUrl(`/blog/${post.slug}`, 'en'),
        };
        const lastModified = new Date(
          post.updated_at || post.published_at || post.created_at || currentDate
        );

        return [
          {
            url: languages.es,
            lastModified,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
            alternates: { languages },
          },
          {
            url: languages.en,
            lastModified,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
            alternates: { languages },
          },
        ];
      });
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  return [...staticPages, ...productPages, ...blogPages];
}
