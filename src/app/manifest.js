import { SITE } from '@/lib/site';

export default function manifest() {
  return {
    name: SITE.tenDayDu,
    short_name: SITE.ten,
    description: SITE.moTa,
    lang: 'vi',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3ecdb',
    theme_color: '#f3ecdb',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
