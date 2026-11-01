/**
 * Mật thư KHÁNH HOÀ — thay thế bằng hai bảng chữ cái khoá.
 *
 * OTT gồm hai phần, mỗi phần dựng một bảng chữ cái:
 *   - bỏ các chữ lặp lại trong phần OTT, giữ thứ tự xuất hiện
 *   - nối tiếp những chữ A–Z chưa dùng, theo đúng thứ tự bảng chữ cái
 *
 * Giải mã: tìm vị trí chữ bản mã trong bảng NGUỒN, lấy chữ ở cùng vị trí
 * trên bảng ĐÍCH.
 *
 * Ví dụ đã kiểm chứng:
 *   OTT: HOAXUAN BANLINHSOSANGTUONGLAI
 *   nguồn HOAXUNBCDEFGIJKLMPQRSTVWYZ
 *   đích  BANLIHSOGTUCDEFJKMPQRVWXYZ
 *   NW TUIDENRFOAOANW AR  →  VIDGTHQUANANHX
 */

import { ALPHABET_EN as AZ } from '../data/constants.js';
import { boDau } from '../types.js';

/** Dựng bảng chữ cái khoá từ một cụm từ. */
export function bangKhoa(cum) {
  const sach = boDau(String(cum).toUpperCase()).replace(/[^A-Z]/g, '');
  const dau = [...new Set(sach)].join('');
  return dau + [...AZ].filter((c) => !dau.includes(c)).join('');
}

/** Tách OTT thành các cụm để ghép cặp bảng nguồn / bảng đích. */
function tachCum(ott) {
  return boDau(String(ott).toUpperCase())
    .split(/[^A-Z]+/)
    .filter((t) => t.length >= 2);
}

const khanhHoa = {
  id: 'khanhhoa',
  name: 'Khánh Hoà',
  family: 'thaythe',
  moTa: 'Hai bảng chữ cái dựng từ hai phần của OTT; tra vị trí ở bảng nguồn, lấy chữ ở bảng đích.',
  tuKhoaOTT: ['khanh hoa', 'nha trang'],

  khaThi: (ct) => /[A-Z]/.test(ct),

  /**
   * Cần OTT mới giải được, nên `bienThe` nhận thêm ngữ cảnh.
   * Không có OTT thì bỏ qua — brute-force mọi bảng chữ cái là vô nghĩa.
   */
  *bienThe(ct, { ott = '' } = {}) {
    const cum = tachCum(ott);
    if (cum.length < 2) return;

    const tra = (src, tgt) =>
      [...ct]
        .map((c) => (/[A-Z]/.test(c) ? tgt[src.indexOf(c)] ?? '?' : c))
        .join('');

    // Thử mọi cặp cụm có thứ tự, vì người ra đề có thể đảo vai trò hai bảng.
    for (let a = 0; a < cum.length; a++) {
      for (let b = 0; b < cum.length; b++) {
        if (a === b) continue;
        const src = bangKhoa(cum[a]);
        const tgt = bangKhoa(cum[b]);
        yield {
          nhan: `${cum[a]} → ${cum[b]}`,
          bv: tra(src, tgt),
          cach:
            `Bảng nguồn từ "${cum[a]}": ${src}\n` +
            `Bảng đích từ "${cum[b]}": ${tgt}\n` +
            'Tra vị trí chữ bản mã ở bảng nguồn, lấy chữ cùng vị trí ở bảng đích.',
        };
      }
    }
  },
};

export const ciphers = { khanhHoa };
