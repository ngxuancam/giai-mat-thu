/**
 * Ảnh chia sẻ 1200×630, dựng lúc build.
 *
 * Satori (bộ vẽ của next/og) cần tệp phông có đủ dấu tiếng Việt, nên tải
 * đúng những ký tự cần dùng từ Google Fonts — chỉ chạy một lần khi build,
 * trình duyệt người xem không bao giờ gọi tới Google.
 */

import { ImageResponse } from 'next/og';
import { CIPHERS } from '@/core/registry';

export const alt = 'Giải Mật Thư — tham khảo cách giải mật thư cơ bản trong kỹ năng Đoàn – Đội';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const TIEU_DE = 'Giải mật thư Đoàn – Đội trong một lần dán.';
const PHU = `${CIPHERS.length} quy luật · chạy trên trình duyệt · AI đọc OTT`;
const MORSE = '−−· ·· ·− ·· / −− ·− − / − ···· ··−';

async function taiPhong(ho, trongLuong, chu) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${ho}:wght@${trongLuong}&text=${encodeURIComponent(chu)}`
  ).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`Không tải được phông ${ho}`);
  return fetch(url).then((r) => r.arrayBuffer());
}

export default async function Image() {
  const chu = `Giải Mật Thư${TIEU_DE}${PHU}Sổ tay trại`;
  const [bitter, beVietnam] = await Promise.all([
    taiPhong('Bitter', 700, chu),
    taiPhong('Be+Vietnam+Pro', 500, chu + MORSE),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#f3ecdb',
          backgroundImage:
            'linear-gradient(rgba(31,42,40,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(31,42,40,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          color: '#1f2a28',
          fontFamily: 'Be Vietnam Pro',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14.5" fill="none" stroke="#1f2a28" strokeWidth="1.5" />
            <path d="M16 3.5 19 16 16 28.5 13 16Z" fill="#1f2a28" opacity="0.25" />
            <path d="M16 3.5 19 16h-6Z" fill="#b03a2b" />
            <path d="M3.5 16 16 13v6Z M28.5 16 16 19v-6Z" fill="#1f2a28" opacity="0.55" />
          </svg>
          <span style={{ fontFamily: 'Bitter', fontSize: 40 }}>Giải Mật Thư</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <span style={{ fontFamily: 'Bitter', fontSize: 76, lineHeight: 1.08, maxWidth: 980 }}>{TIEU_DE}</span>
          <span style={{ fontSize: 30, color: '#59625d' }}>{PHU}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 26, letterSpacing: 8, color: '#8a7647' }}>{MORSE}</span>
          <span
            style={{
              fontFamily: 'Bitter',
              fontSize: 22,
              letterSpacing: 4,
              color: '#b03a2b',
              border: '3px solid #b03a2b',
              borderRadius: 8,
              padding: '6px 16px',
              transform: 'rotate(-4deg)',
            }}
          >
            SỔ TAY TRẠI
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Bitter', data: bitter, weight: 700, style: 'normal' },
        { name: 'Be Vietnam Pro', data: beVietnam, weight: 500, style: 'normal' },
      ],
    }
  );
}
