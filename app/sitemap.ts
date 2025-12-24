import { MetadataRoute } from 'next';

/**
 * Sitemap Generator
 * Automatically generates sitemap.xml for better SEO
 * Includes all main sections and dynamic content
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://moftahak.com';
  const currentDate = new Date();
  const lastModified = currentDate.toISOString();

  return [
    {
      url: baseUrl,
      lastModified: lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/#home`,
      lastModified: lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/#properties`,
      lastModified: lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#courses`,
      lastModified: lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#gallery`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];
}
