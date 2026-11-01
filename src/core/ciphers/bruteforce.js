/**
 * DÒ KHOÁ — giải những mật thư Việt Nam khi OTT không cho ra khoá dùng được.
 *
 * Phạm vi file này chỉ gồm các loại CÓ THẬT trong mật thư hướng đạo / GĐPT
 * Việt Nam. Không đưa vào đây những hệ mã phương Tây (Vigenère, thay thế đơn
 * bảng dò bảng, Playfair…): chúng không nằm trong truyền thống mật thư Việt
 * Nam, có thêm cũng chỉ sinh lời giải rác làm nhiễu bảng xếp hạng.
 *
 * Tình huống thật mà file này xử lý: OTT bị mờ, bị chép thiếu, hoặc người ra
 * đề cố tình cho OTT đánh lạc hướng. Khi đó khoá phải DÒ chứ không đọc được.
 * Hai kỹ thuật giữ cho việc dò khả thi:
 *
 *   1. Cắt tỉa theo nhánh — thứ tự cột/cụm dựng dần, mỗi bước chỉ giữ lại
 *      những nhánh cho n-gram tốt nhất. Giảm 9! = 362 880 xuống vài trăm.
 *   2. Vét cạn có chặn — khoá số của Tiến chữ ngắn (1–4 chữ số), vét cạn
 *      được trọn vẹn nên chắc chắn không bỏ sót.
 *
 * Mọi hàm sinh đều là generator: Worker nhả kết quả ra dần, giao diện không
 * phải chờ duyệt xong.
 */

import { bitTrenChu } from '../scoring/nguGram.js';
import { ALPHABET_EN as AZ } from '../data/constants.js';

/** Số nhánh tốt nhất giữ lại ở mỗi bước dựng hoán vị. */
const TOP_CHUM = 24;

/** Số cột tối đa thử khi dò chuyển vị không khoá. */
const MAX_COT = 9;

/** Số lời giải tối đa mỗi loại nhả ra, tránh ngập giao diện. */
const MAX_MOI_LOAI = 12;

/* ────────────────────────────────────────────────────────────────────────
 * Viết hàng đọc cột / Cam Ranh — dò thứ tự cột khi không có khoá
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Điểm "khớp" khi đặt cột b ngay sau cột a: bit/chữ của các cặp chữ nằm cạnh
 * nhau trên từng hàng.
 *
 * Đây là mấu chốt của cắt tỉa: thứ tự cột đúng tạo ra cặp chữ hợp lệ tiếng
 * Việt ở MỌI hàng cùng lúc, nên chỉ cần nhìn hai cột đã loại được phần lớn
 * thứ tự sai, chưa cần dựng xong cả hoán vị.
 */
export function khopCot(a, b) {
  const n = Math.min(a.length, b.length);
  if (!n) return -10;
  let s = '';
  for (let i = 0; i < n; i++) s += a[i] + b[i];
  return bitTrenChu(s);
}

/**
 * Dò thứ tự cột bằng tìm kiếm chùm tia có cắt tỉa.
 *
 * @param {string[]} cot Các cột đã tách sẵn từ bản mã.
 * @param {number} [giu] Số nhánh giữ lại mỗi bước.
 * @returns {number[][]} Danh sách hoán vị ứng viên, tốt nhất đứng đầu.
 */
export function doThuTuCot(cot, giu = TOP_CHUM) {
  const k = cot.length;
  if (k < 2 || k > MAX_COT) return [];

  // Bảng khớp mọi cặp, tính một lần: k² lần gọi thay vì k! lần.
  const khop = Array.from({ length: k }, (_, i) =>
    Array.from({ length: k }, (_, j) => (i === j ? -Infinity : khopCot(cot[i], cot[j])))
  );

  // Mỗi cột đều có thể là cột mở đầu.
  let chum = Array.from({ length: k }, (_, i) => ({ thuTu: [i], diem: 0 }));

  for (let buoc = 1; buoc < k; buoc++) {
    const moi = [];
    for (const { thuTu, diem } of chum) {
      const cuoi = thuTu[thuTu.length - 1];
      for (let j = 0; j < k; j++) {
        if (thuTu.includes(j)) continue;
        moi.push({ thuTu: [...thuTu, j], diem: diem + khop[cuoi][j] });
      }
    }
    // Cắt tỉa: chỉ giữ những nhánh hứa hẹn nhất.
    moi.sort((a, b) => b.diem - a.diem);
    chum = moi.slice(0, giu);
  }

  return chum.map((c) => c.thuTu);
}

const chuyenViTuDo = {
  id: 'chuyenvitudo',
  name: 'Chuyển vị cột (dò thứ tự)',
  family: 'doicho',
  moTa: 'Khi OTT không cho khoá: dò thẳng thứ tự cột bằng cắt tỉa theo nhánh dựa trên mô hình n-gram.',
  tuKhoaOTT: ['chuyen vi', 'doi cot', 'xao cot', 'mat khoa', 'khong khoa', 'doc cot'],

  /** Cần đủ ký tự để thống kê n-gram trên từng cặp cột có ý nghĩa. */
  dauHieu: (ct) => {
    const n = ct.replace(/[^A-Z]/g, '').length;
    return n >= 20 ? 0.6 : n >= 12 ? 0.3 : 0.1;
  },

  khaThi: (ct) => {
    const n = ct.replace(/[^A-Z]/g, '').length;
    return n >= 12 && n <= 400;
  },

  *bienThe(ct) {
    const ky = ct.replace(/[^A-Z]/g, '');
    const n = ky.length;

    for (let k = 2; k <= Math.min(MAX_COT, Math.floor(n / 3)); k++) {
      if (n % k !== 0) continue; // chỉ xét bảng chữ nhật đầy đủ
      const hang = n / k;

      // Bản mã viết theo cột: cắt thành k đoạn liền nhau, mỗi đoạn một cột.
      const cot = [];
      for (let i = 0; i < k; i++) cot.push(ky.slice(i * hang, (i + 1) * hang));

      for (const thuTu of doThuTuCot(cot).slice(0, MAX_MOI_LOAI)) {
        let bv = '';
        for (let h = 0; h < hang; h++) for (const c of thuTu) bv += cot[c][h];

        yield {
          nhan: `${k} cột, thứ tự ${thuTu.map((i) => i + 1).join('-')}`,
          bv,
          cach:
            `Chia bản mã thành ${k} cột, mỗi cột ${hang} ký tự.\n` +
            `Dò thứ tự cột bằng mô hình n-gram (không cần khoá), được ${thuTu
              .map((i) => i + 1)
              .join('-')}.\nĐọc ngang theo hàng.`,
          bang: {
            nhanCot: thuTu.map((i) => `#${i + 1}`),
            soCot: thuTu.map((i) => i + 1),
            hang: Array.from({ length: hang }, (_, h) => thuTu.map((c) => cot[c][h] ?? '')),
          },
        };
      }
    }
  },
};

/* ────────────────────────────────────────────────────────────────────────
 * Tiến chữ — vét cạn khoá số khi OTT không cho dãy số
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Tiến chữ / Lùi chữ là mật thư Việt Nam rất phổ biến: khoá là một dãy số
 * ngắn lặp lại, mỗi chữ dịch đi số bậc tương ứng.
 *
 * `tienChu` trong thaythe.js đọc khoá từ OTT. Khi OTT không có số (bị chép
 * thiếu, hoặc gợi ý bằng chữ như "một hai ba"), khoá phải dò. May mắn là
 * không gian rất nhỏ: khoá thực tế dài 1–4 chữ số, mỗi chữ số 0–9, nên
 * 10 + 100 + 1 000 + 10 000 = 11 110 khoá — VÉT CẠN TRỌN VẸN được, không
 * phải xấp xỉ, nên chắc chắn không bỏ sót khoá đúng.
 */
const tienChuDoKhoa = {
  id: 'tienchudokhoa',
  name: 'Tiến chữ (dò khoá số)',
  family: 'thaythe',
  moTa: 'Khi OTT không cho dãy số: vét cạn mọi khoá 1–4 chữ số, chọn khoá cho bạch văn giống tiếng Việt nhất.',
  tuKhoaOTT: ['tien chu', 'lui chu', 'day so', 'dem buoc', 'dich chu'],

  dauHieu: (ct) => {
    const n = ct.replace(/[^A-Z]/g, '').length;
    return n >= 16 ? 0.5 : n >= 8 ? 0.3 : 0.1;
  },

  /** Chỉ chạy khi OTT KHÔNG có số — có số thì `tienChu` đã lo rồi. */
  khaThi: (ct) => {
    const n = ct.replace(/[^A-Z]/g, '').length;
    return n >= 8 && n <= 600;
  },

  *bienThe(ct, { ott = '' } = {}) {
    if (/\d/.test(ott)) return; // OTT đã cho khoá — nhường cho `tienchu`
    const ky = ct.replace(/[^A-Z]/g, '');
    if (!ky) return;

    const ungVien = [];
    for (let L = 1; L <= 4; L++) {
      const tongKhoa = 10 ** L;
      for (let m = 0; m < tongKhoa; m++) {
        // Rã m thành L chữ số — đây là một khoá cụ thể.
        const khoa = [];
        let t = m;
        for (let i = 0; i < L; i++) {
          khoa.unshift(t % 10);
          t = Math.floor(t / 10);
        }
        // Khoá toàn số 0 không đổi gì; khoá lặp (121212) trùng khoá ngắn hơn.
        if (khoa.every((d) => d === 0)) continue;

        for (const dau of [-1, 1]) {
          let bv = '';
          for (let i = 0; i < ky.length; i++) {
            const idx = AZ.indexOf(ky[i]);
            bv += idx < 0 ? ky[i] : AZ[((idx + khoa[i % L] * dau) % 26 + 26) % 26];
          }
          ungVien.push({ khoa: khoa.join(''), dau, bv, bit: bitTrenChu(bv) });
        }
      }
    }

    // Chỉ nhả ra những khoá tốt nhất — phần còn lại chắc chắn sai.
    ungVien.sort((a, b) => b.bit - a.bit);
    const daThay = new Set();
    let ra = 0;
    for (const u of ungVien) {
      if (ra >= 6) break;
      if (daThay.has(u.bv)) continue;
      daThay.add(u.bv);
      ra++;
      const huong = u.dau > 0 ? 'tiến' : 'lùi';
      yield {
        nhan: `khoá ${u.khoa}, ${huong} (${u.bit.toFixed(2)} bit/chữ)`,
        bv: u.bv,
        cach:
          'OTT không cho dãy số nên vét cạn mọi khoá 1–4 chữ số (11 110 khoá, cả hai chiều).\n' +
          `Khoá "${u.khoa}" đọc ${huong} cho bạch văn giống tiếng Việt nhất.\n` +
          `Chữ thứ i dịch đi ${u.khoa}[i mod ${u.khoa.length}] bậc trên bảng A–Z.`,
      };
    }
  },
};

/* ────────────────────────────────────────────────────────────────────────
 * Khánh Hoà — dò cặp bảng khi OTT chỉ có một cụm dùng được
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Khánh Hoà cần HAI cụm OTT để dựng bảng nguồn và bảng đích. Khi OTT chỉ còn
 * một cụm đọc được, cụm kia phải đoán — nhưng không đoán bừa: bảng đích của
 * Khánh Hoà dựng từ một cụm từ tiếng Việt, nên thử chính các từ trong OTT
 * tách theo âm tiết, cộng thêm bảng A–Z nguyên bản (trường hợp đề chỉ khoá
 * một bên).
 */
const khanhHoaDoBang = {
  id: 'khanhhoadobang',
  name: 'Khánh Hoà (dò bảng còn lại)',
  family: 'thaythe',
  moTa: 'Khi OTT chỉ còn một cụm: ghép cụm đó với bảng A–Z và với từng âm tiết tách ra từ OTT.',
  tuKhoaOTT: ['khanh hoa', 'nha trang'],

  dauHieu: (ct) => (/^[A-Z\s]+$/.test(ct) ? 0.4 : 0.1),

  khaThi: (ct) => /[A-Z]{4}/.test(ct),

  *bienThe(ct, { ott = '' } = {}) {
    const sach = String(ott)
      .toUpperCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/Đ/g, 'D');
    const cum = sach.split(/[^A-Z]+/).filter((t) => t.length >= 2);
    // Hai cụm trở lên thì `khanhhoa` đã xử lý đủ — ở đây chỉ lo trường hợp thiếu.
    if (cum.length !== 1) return;

    const bangKhoa = (c) => {
      const dau = [...new Set(c.replace(/[^A-Z]/g, ''))].join('');
      return dau + [...AZ].filter((x) => !dau.includes(x)).join('');
    };

    const khoa = bangKhoa(cum[0]);
    const capThu = [
      [khoa, AZ, `${cum[0]} → A–Z`],
      [AZ, khoa, `A–Z → ${cum[0]}`],
    ];

    for (const [src, tgt, nhan] of capThu) {
      const bv = [...ct].map((c) => (/[A-Z]/.test(c) ? tgt[src.indexOf(c)] ?? '?' : c)).join('');
      yield {
        nhan,
        bv,
        cach:
          `OTT chỉ còn một cụm ("${cum[0]}") nên bảng kia lấy nguyên A–Z.\n` +
          `Bảng khoá: ${khoa}\n` +
          'Tra vị trí chữ bản mã ở bảng nguồn, lấy chữ cùng vị trí ở bảng đích.',
      };
    }
  },
};

export const ciphers = { chuyenViTuDo, tienChuDoKhoa, khanhHoaDoBang };
