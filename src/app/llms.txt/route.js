/**
 * /llms.txt — bản tóm tắt dạng Markdown cho trợ lý AI (https://llmstxt.org).
 */

import { CIPHERS } from '@/core/registry';
import { NHOM } from '@/lib/huongDan';
import { SITE, duongDanLoai } from '@/lib/site';

export const dynamic = 'force-static';

export function GET() {
  const dong = [
    `# ${SITE.ten}`,
    '',
    `> ${SITE.moTa}`,
    '',
    'Công cụ miễn phí tham khảo cách giải các loại mật thư cơ bản trong kỹ năng Đoàn – Đội (sinh hoạt Đoàn TNCS, Đội TNTP). Người dùng dán OTT (câu gợi ý) và bản mã; ',
    `bộ giải thử ${CIPHERS.length} quy luật ngay trên trình duyệt, chấm điểm bằng mô hình n-gram tiếng Việt và xếp hạng lời giải. `,
    'Một mô hình nhúng câu nhỏ (multilingual-e5-small) chạy trên máy chủ có thể đoán loại mật thư từ nghĩa của OTT khi người dùng yêu cầu.',
    '',
    '## Trang chính',
    '',
    `- [Bộ giải mật thư](${SITE.url}/): dán OTT và bản mã để giải`,
    `- [Các loại mật thư](${SITE.url}/mat-thu): nguyên lý, dấu hiệu và ví dụ của từng loại`,
    '',
    ...NHOM.flatMap((n) => [
      `## ${n.ten}`,
      '',
      ...n.loai.map((c) => `- [${c.name}](${SITE.url}${duongDanLoai(c.id)}): ${c.moTa}`),
      '',
    ]),
    '## Mã nguồn',
    '',
    `- [GitHub](${SITE.github})`,
    `- Tác giả: [${SITE.tacGia.ten}](${SITE.tacGia.url})`,
  ];
  return new Response(dong.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
