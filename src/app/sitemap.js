import { CIPHERS } from '@/core/registry';
import { SITE, duongDanLoai } from '@/lib/site';

export default function sitemap() {
  const nay = new Date();
  return [
    { url: SITE.url, lastModified: nay, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.url}/mat-thu`, lastModified: nay, changeFrequency: 'monthly', priority: 0.8 },
    ...CIPHERS.map((c) => ({
      url: `${SITE.url}${duongDanLoai(c.id)}`,
      lastModified: nay,
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
  ];
}
