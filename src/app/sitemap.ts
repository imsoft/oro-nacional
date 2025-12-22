import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oronacional.com';
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

  // Add both language versions of static pages
  ['es', 'en'].forEach(locale => {
    staticRoutes.forEach(route => {
      staticPages.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: currentDate,
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
        alternates: {
          languages: {
            es: `${baseUrl}/es${route}`,
            en: `${baseUrl}/en${route}`,
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
      productPages = products.flatMap(product => [
        {
          url: `${baseUrl}/es/product/${product.slug_es}`,
          lastModified: new Date(product.updated_at),
          changeFrequency: 'weekly' as const,
          priority: 0.9,
          alternates: {
            languages: {
              es: `${baseUrl}/es/product/${product.slug_es}`,
              en: `${baseUrl}/en/product/${product.slug_en}`,
            },
          },
        },
        {
          url: `${baseUrl}/en/product/${product.slug_en}`,
          lastModified: new Date(product.updated_at),
          changeFrequency: 'weekly' as const,
          priority: 0.9,
          alternates: {
            languages: {
              es: `${baseUrl}/es/product/${product.slug_es}`,
              en: `${baseUrl}/en/product/${product.slug_en}`,
            },
          },
        },
      ]);
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  // Dynamic blog pages
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, is_published')
      .eq('is_published', true);

    if (posts) {
      blogPages = posts.flatMap(post => [
        {
          url: `${baseUrl}/es/blog/${post.slug}`,
          lastModified: new Date(post.updated_at),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        },
        {
          url: `${baseUrl}/en/blog/${post.slug}`,
          lastModified: new Date(post.updated_at),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        },
      ]);
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  return [...staticPages, ...productPages, ...blogPages];
}
