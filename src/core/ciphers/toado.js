/**
 * Nhóm mật thư TOẠ ĐỘ — mỗi chữ cái được chỉ bằng vị trí hàng–cột trên lưới.
 *
 * Bảng tra cứu đặt ở core/data/constants.js.
 */

import { POLYBIUS_5, ALPHABET_EN, COMPASS, MAGIC_SQUARES } from '../data/constants.js';

/** Dựng lưới 5×5 từ một bảng chữ cái đã cho trước (bỏ J, gộp vào I). */
function dungLuoi(chuoi) {
  const ky = chuoi.replace(/J/g, '').slice(0, 25).split('');
  return Array.from({ length: 5 }, (_, h) => ky.slice(h * 5, h * 5 + 5));
}

/** Tách bản mã thành các cặp số hàng–cột, chấp nhận nhiều cách viết. */
function tachCap(ct) {
  const so = ct.match(/\d/g);
  if (!so || so.length < 2 || so.length % 2) return null;
  const cap = [];
  for (let i = 0; i < so.length; i += 2) cap.push([+so[i], +so[i + 1]]);
  return cap.every(([h, c]) => h >= 1 && h <= 5 && c >= 1 && c <= 5) ? cap : null;
}

/* ── Polybius: hàng trước, cột sau ── */

const polybius = {
  id: 'polybius',
  name: 'Bảng hàng - cột',
  family: 'toado',
  moTa: 'Lưới 5×5 chứa bảng chữ cái; mỗi chữ được chỉ bằng số hàng và số cột.',
  tuKhoaOTT: ['hang cot', 'bang hang', 'toa do', 'o vuong', 'ban co'],

  /** Chỉ chữ số 1–5, số lượng chẵn (mỗi chữ là một cặp hàng–cột). */
  dauHieu: (ct) => {
    const so = ct.match(/\d/g);
    if (!so || /[A-Z]/.test(ct)) return 0;
    if (so.length % 2) return 0.2;
    return so.every((n) => +n >= 1 && +n <= 5) ? 1 : 0.1;
  },

  khaThi: (ct) => tachCap(ct) !== null,

  *bienThe(ct) {
    const cap = tachCap(ct);
    if (!cap) return;

    const tra = (luoi, doiChieu) =>
      cap.map(([a, b]) => (doiChieu ? luoi[b - 1]?.[a - 1] : luoi[a - 1]?.[b - 1]) ?? '?').join('');

    // Lưới chuẩn A–Z.
    yield {
      nhan: 'hàng → cột',
      bv: tra(POLYBIUS_5, false),
      cach: 'Số thứ nhất là hàng, số thứ hai là cột trên lưới 5×5 A–Z.',
    };
    yield {
      nhan: 'cột → hàng',
      bv: tra(POLYBIUS_5, true),
      cach: 'Số thứ nhất là cột, số thứ hai là hàng trên lưới 5×5 A–Z.',
    };

    // Lưới điền ngược — biến thể hay gặp khi người ra đề muốn làm khó.
    const nguoc = dungLuoi([...ALPHABET_EN].reverse().join(''));
    yield {
      nhan: 'lưới ngược, hàng → cột',
      bv: tra(nguoc, false),
      cach: 'Lưới 5×5 điền từ Z về A, số thứ nhất là hàng.',
    };
  },
};

/* ── Ma phương bậc 5 ── */

/** Chữ A–Y điền theo hàng vào lưới 5×5, khớp với ô chứa số. */
const CHU_MA_PHUONG = 'ABCDEFGHIJKLMNOPQRSTUVWXY';

const maPhuong = {
  id: 'maphuong',
  name: 'Ma phương',
  family: 'toado',
  moTa: 'Bản mã là dãy số 1–25; tra vị trí số trên ma phương rồi lấy chữ ở cùng ô.',
  tuKhoaOTT: ['ma phuong', 'o so', 'vuong so', 'tong 65'],

  /** Toàn số trong 1–25 — đúng số ô của ma phương bậc 5. */
  dauHieu: (ct) => {
    const so = ct.match(/\d+/g);
    if (!so || /[A-Z]/.test(ct)) return 0;
    return so.every((n) => +n >= 1 && +n <= 25) ? 1 : 0;
  },

  khaThi: (ct) => {
    const so = ct.match(/\d+/g);
    return !!so && so.every((n) => +n >= 1 && +n <= 25);
  },

  *bienThe(ct) {
    const so = (ct.match(/\d+/g) || []).map(Number);
    if (!so.length) return;

    for (const [ten, luoi] of Object.entries(MAGIC_SQUARES)) {
      // Lập bảng tra: số → chữ ở cùng vị trí.
      const tra = {};
      for (let h = 0; h < 5; h++) {
        for (let c = 0; c < 5; c++) tra[luoi[h][c]] = CHU_MA_PHUONG[h * 5 + c];
      }
      const nhan = ten === 'bienThien' ? 'Biến Thiên' : 'Khoá 65';
      yield {
        nhan,
        bv: so.map((n) => tra[n] ?? '?').join(''),
        cach: `Tra từng số trên ma phương "${nhan}" rồi lấy chữ nằm cùng ô.`,
      };
    }
  },
};

/* ── Phương hướng: nhãn cột là 8 hướng la bàn ── */

const phuongHuong = {
  id: 'phuonghuong',
  name: 'Phương hướng',
  family: 'toado',
  moTa: 'Lưới 4 hàng × 8 cột điền A–Z; cột gọi bằng hướng la bàn, hàng bằng số 1–4.',
  tuKhoaOTT: ['phuong huong', 'la ban', 'dong tay nam bac', 'huong'],

  /** Có tên hướng la bàn kèm số — dấu hiệu không thể nhầm với loại khác. */
  dauHieu: (ct) => {
    const cap = ct.match(/(ĐN|ĐB|TN|TB|[ĐTNB])\s*[1-4]/gi) || [];
    if (!cap.length) return 0;
    // Toàn bộ bản mã là các cặp hướng+số thì chắc chắn là loại này.
    const conLai = ct.replace(/(ĐN|ĐB|TN|TB|[ĐTNB])\s*[1-4]/gi, '').replace(/[\s,\-._]/g, '');
    return conLai.length === 0 ? 1 : 0.4;
  },

  khaThi: (ct) => /(ĐN|ĐB|TN|TB|[ĐTNB])\s*[1-4]/i.test(ct),

  *bienThe(ct) {
    // Hướng hai chữ phải khớp trước, nếu không "ĐN" bị cắt nhầm thành "Đ".
    const cap = [...ct.matchAll(/(ĐN|ĐB|TN|TB|[ĐTNB])\s*([1-4])/gi)];
    if (!cap.length) return;

    const bv = cap
      .map(([, huong, so]) => {
        const c = COMPASS.indexOf(huong.toUpperCase());
        const h = +so - 1;
        if (c < 0) return '?';
        // Lưới điền A–Z theo hàng, 8 ô mỗi hàng; hàng 4 chỉ có Y, Z.
        const i = h * 8 + c;
        return i < 26 ? ALPHABET_EN[i] : '?';
      })
      .join('');

    if (bv.replace(/\?/g, '')) {
      yield {
        nhan: 'hướng + hàng',
        bv,
        cach: 'Hướng la bàn chỉ cột, số chỉ hàng; lưới 4×8 điền A–Z theo hàng.',
      };
    }
  },
};

/* ── Kim tự tháp: lưới bậc thang 1,2,3… ── */

const kimTuThap = {
  id: 'kimtuthap',
  name: 'Kim tự tháp',
  family: 'toado',
  moTa: 'Chữ xếp thành hình tháp, dòng thứ n có n chữ; đọc theo dòng hoặc theo cột.',
  tuKhoaOTT: ['kim tu thap', 'thap', 'bac thang', 'leo nui'],

  /** Số ký tự phải là số tam giác (1, 3, 6, 10, 15…) để xếp đủ tháp. */
  dauHieu: (ct) => {
    const n = ct.replace(/[^A-Z0-9]/g, '').length;
    for (let d = 1; (d * (d + 1)) / 2 <= n; d++) if ((d * (d + 1)) / 2 === n) return 1;
    return 0;
  },

  // Chỉ những độ dài tạo được tháp đầy đủ: 1, 3, 6, 10, 15, 21…
  khaThi: (ct) => {
    const n = ct.replace(/[^A-Z0-9]/g, '').length;
    for (let d = 1; (d * (d + 1)) / 2 <= n; d++) if ((d * (d + 1)) / 2 === n) return true;
    return false;
  },

  *bienThe(ct) {
    const ky = ct.replace(/[^A-Z0-9]/g, '');
    let dong = 0;
    for (let d = 1; (d * (d + 1)) / 2 <= ky.length; d++) {
      if ((d * (d + 1)) / 2 === ky.length) dong = d;
    }
    if (!dong) return;

    // Dựng tháp theo dòng.
    const thap = [];
    let k = 0;
    for (let d = 1; d <= dong; d++) thap.push(ky.slice(k, (k += d)).split(''));

    yield {
      nhan: `${dong} tầng, đọc cột`,
      bv: Array.from({ length: dong }, (_, c) =>
        thap.map((r) => r[c] ?? '').join('')
      ).join(''),
      cach: `Xếp bản mã thành tháp ${dong} tầng rồi đọc dọc theo từng cột.`,
    };

    yield {
      nhan: `${dong} tầng, đọc ngược tầng`,
      bv: [...thap].reverse().map((r) => r.join('')).join(''),
      cach: `Xếp tháp ${dong} tầng rồi đọc từ tầng đáy lên tầng đỉnh.`,
    };
  },
};

export const ciphers = { polybius, maPhuong, phuongHuong, kimTuThap };
