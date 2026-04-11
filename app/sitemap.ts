import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://sentill.africa';
  const now = new Date();
  return [
    { url: base,                                                          lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/markets`,                                             lastModified: now, changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${base}/markets/mmfs`,                                        lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/markets/bonds`,                                       lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/markets/treasuries`,                                  lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${base}/markets/saccos`,                                      lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/markets/nse`,                                         lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${base}/packages`,                                            lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/tools/tax-calculator`,                                lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/tools/compare`,                                       lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/tools/goal-planner`,                                  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/tools/matrix`,                                        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/blog`,                                                lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/blog/best-money-market-funds-kenya-2026`,             lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/blog/treasury-bills-kenya-guide`,                     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/blog/mmf-vs-bonds-kenya`,                             lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/blog/best-saccos-kenya-2026`,                         lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/blog/how-to-invest-50000-kenya`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/hubs`,                                                lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/academy`,                                             lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/about`,                                               lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`,                                             lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/dashboard`,                                           lastModified: now, changeFrequency: 'daily',   priority: 0.6 },
  ];
}
