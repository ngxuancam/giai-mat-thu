/**
 * Cấu hình Next.js.
 *
 * CSP được đặt theo từng yêu cầu trong src/proxy.js (cần nonce mới mỗi lần);
 * ở đây chỉ giữ các tiêu đề bảo mật tĩnh và phần đóng gói mô hình AI.
 */

/** Tiêu đề bảo mật áp cho mọi đường dẫn — giữ nguyên từ bản Vite. */
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value:
      'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()',
  },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  /*
   * transformers.js chạy ONNX bằng thư viện gốc (onnxruntime-node) — không
   * gói được bằng bundler, phải để Node nạp thẳng từ node_modules.
   */
  serverExternalPackages: ['@huggingface/transformers', 'onnxruntime-node', 'sharp'],

  /*
   * Mô hình được tải về lúc build (scripts/fetch-model.mjs) chứ không nằm
   * trong git — tệp ONNX hơn 100 MB, vượt giới hạn tệp của GitHub. Ở đây dặn
   * Next mang thư mục đó theo hàm API, và bỏ bớt nhị phân của hệ điều hành
   * khác để hàm nhẹ hơn.
   */
  outputFileTracingIncludes: {
    '/api/goi-y-ott': [
      './models/**/*',
      // onnxruntime-node nạp nhị phân qua đường dẫn ghép chuỗi theo hệ điều hành,
      // bộ dò tệp không lần ra được — phải chỉ thẳng (Vercel chạy linux x64).
      './node_modules/onnxruntime-node/dist/**/*',
      './node_modules/onnxruntime-node/package.json',
      './node_modules/onnxruntime-node/bin/napi-v3/linux/x64/**/*',
    ],
  },
  outputFileTracingExcludes: {
    '/api/goi-y-ott': [
      './node_modules/onnxruntime-node/bin/napi-v3/darwin/**',
      './node_modules/onnxruntime-node/bin/napi-v3/win32/**',
      './node_modules/onnxruntime-web/**',
    ],
  },

  async headers() {
    return [{ source: '/(.*)', headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
