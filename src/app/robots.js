import { SITE } from '@/lib/site';

/** Mời cả máy tìm kiếm lẫn trợ lý AI đọc trang; chỉ chặn API. */
const TRO_LY_AI = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'];

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/api/' },
      { userAgent: TRO_LY_AI, allow: ['/', '/llms.txt'], disallow: '/api/' },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
