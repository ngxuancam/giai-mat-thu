/**
 * Content-Security-Policy với nonce mới cho mỗi yêu cầu.
 *
 * Bản Vite dùng CSP tĩnh `script-src 'self'`. Next.js chèn vài thẻ script
 * nội tuyến để nạp trang, nên thay vì mở 'unsafe-inline' cho script, mỗi
 * yêu cầu được cấp một nonce ngẫu nhiên — chỉ script mang đúng nonce mới
 * chạy. Mọi nguồn bên ngoài vẫn bị chặn như trước: không phông Google, không
 * CDN, không gọi mạng ra ngoài ('self' là đủ cho cả worker lẫn API AI).
 *
 * style-src giữ 'unsafe-inline' như bản cũ: thanh tiến độ đặt độ rộng bằng
 * thuộc tính style, và nonce không áp được cho thuộc tính style.
 */

import { NextResponse } from 'next/server';

export function proxy(request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const dev = process.env.NODE_ENV === 'development';

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');

  const yeuCau = new Headers(request.headers);
  yeuCau.set('x-nonce', nonce);
  yeuCau.set('Content-Security-Policy', csp);

  const phanHoi = NextResponse.next({ request: { headers: yeuCau } });
  phanHoi.headers.set('Content-Security-Policy', csp);
  return phanHoi;
}

export const config = {
  matcher: [
    {
      // Bỏ qua API, tệp tĩnh và các tệp sinh tự động (ảnh OG, sitemap…)
      source: '/((?!api|_next/static|_next/image|favicon.ico|icon|opengraph-image|robots.txt|sitemap.xml|manifest.webmanifest|llms.txt).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
