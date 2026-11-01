import { Be_Vietnam_Pro, Bitter, JetBrains_Mono, Patrick_Hand } from 'next/font/google';
import { headers } from 'next/headers';
import { SiteHeader } from '@/ui/layout/SiteHeader';
import { SiteFooter } from '@/ui/layout/SiteFooter';
import { SITE } from '@/lib/site';
import './globals.css';

/*
 * Phông chữ được next/font tải về LÚC BUILD và phục vụ từ chính trang này —
 * trình duyệt không gọi tới Google, giữ đúng tinh thần bản cũ (không rò IP
 * người dùng ra bên thứ ba, CSP chỉ cần font-src 'self').
 */
const beVietnam = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam',
  display: 'swap',
});
const bitter = Bitter({
  subsets: ['latin', 'vietnamese'],
  weight: ['600', '700'],
  variable: '--font-bitter',
  display: 'swap',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-jetbrains',
  display: 'swap',
});
const patrick = Patrick_Hand({
  subsets: ['latin', 'vietnamese'],
  weight: '400',
  variable: '--font-patrick',
  display: 'swap',
  preload: false,
});

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.tenDayDu, template: `%s · ${SITE.ten}` },
  description: SITE.moTa,
  applicationName: SITE.ten,
  authors: [{ name: SITE.tacGia.ten, url: SITE.tacGia.url }],
  keywords: [
    'giải mật thư',
    'mật thư hướng đạo',
    'mật thư Morse',
    'mật thư Cam Ranh',
    'mật thư Khánh Hoà',
    'mật thư toạ độ',
    'Semaphore',
    'trò chơi lớn',
    'sinh hoạt thanh niên',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    url: '/',
    siteName: SITE.ten,
    title: SITE.tenDayDu,
    description: SITE.moTa,
  },
  twitter: { card: 'summary_large_image', title: SITE.tenDayDu, description: SITE.moTa },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3ecdb' },
    { media: '(prefers-color-scheme: dark)', color: '#121613' },
  ],
  colorScheme: 'light dark',
};

export default async function RootLayout({ children }) {
  // Đọc nonce để Next gắn vào các script nạp trang; đồng thời buộc dựng động.
  await headers();

  return (
    <html
      lang="vi"
      className={`${beVietnam.variable} ${bitter.variable} ${jetbrains.variable} ${patrick.variable}`}
    >
      <body className="min-h-dvh">
        <a
          href="#noi-dung"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
        >
          Bỏ qua tới nội dung
        </a>
        <SiteHeader />
        <div id="noi-dung">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
