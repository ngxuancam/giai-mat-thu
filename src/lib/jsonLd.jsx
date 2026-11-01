/** Dữ liệu có cấu trúc schema.org cho máy tìm kiếm và trợ lý AI. */

import { SITE } from '@/lib/site';

export const tacGia = {
  '@type': 'Person',
  '@id': `${SITE.tacGia.url}/#person`,
  name: SITE.tacGia.ten,
  url: SITE.tacGia.url,
};

export const ungDung = {
  '@type': 'WebApplication',
  '@id': `${SITE.url}/#app`,
  name: SITE.ten,
  url: SITE.url,
  description: SITE.moTa,
  inLanguage: 'vi',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Mọi trình duyệt hiện đại',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'VND' },
  author: { '@id': tacGia['@id'] },
  codeRepository: SITE.github,
};

export const trangWeb = {
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  name: SITE.ten,
  url: SITE.url,
  inLanguage: 'vi',
  publisher: { '@id': tacGia['@id'] },
};

export const dongDuong = (muc) => ({
  '@type': 'BreadcrumbList',
  itemListElement: muc.map(([ten, duongDan], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: ten,
    item: `${SITE.url}${duongDan}`,
  })),
});

/** Thẻ script JSON-LD. Dữ liệu là của chính trang, không chứa đầu vào người dùng. */
export function JsonLd({ data }) {
  const graph = { '@context': 'https://schema.org', '@graph': Array.isArray(data) ? data : [data] };
  return (
    <script
      type="application/ld+json"
      // Thoát "<" để chuỗi trong dữ liệu không thể đóng thẻ script.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, '\\u003c') }}
    />
  );
}
