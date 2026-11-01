/**
 * Các dạng mật thư hay gặp trong sinh hoạt Đoàn – Đội mà bộ giải chưa có.
 *
 * Mỗi loại đều được kiểm bằng ví dụ thật trong vidu.js (có đáp án), nên nếu
 * sửa thuật toán làm lệch kết quả thì test sẽ báo ngay.
 */

import { ALPHABET_EN as AZ, MORSE } from '../data/constants.js';

/** Tách bản mã thành các cụm chữ/số theo mọi dấu ngăn thường gặp. */
const tachCum = (ct) => ct.split(/[\s\-_,.;:/|]+/).filter(Boolean);

/* ── Bắt tà vẹt / xuống thang máy: dựng đứng từng cụm ── */

/**
 * Bản mã gồm nhiều cụm cùng độ dài viết nối nhau. Dựng mỗi cụm thành một cột
 * ("bắt tà vẹt" — như thanh tà vẹt dưới đường ray) rồi đọc ngang từng hàng.
 * "Xuống thang máy" là cùng một phép: các cụm là các tầng, đọc dọc xuống.
 *
 *   KOW HON ONG …        K H O …
 *                   →    O O N …    → đọc hàng 1, rồi hàng 2, rồi hàng 3
 *                        W N G …
 *
 * Khác "Viết hàng đọc cột" ở chỗ cụm đã cho sẵn số hàng, và số cột có thể
 * lên tới hàng chục (bảng kia chỉ thử tới 8 cột).
 */
const batTaVet = {
  id: 'battavet',
  name: 'Bắt tà vẹt (dựng đứng cụm)',
  family: 'doicho',
  moTa:
    'Bản mã chia thành nhiều cụm bằng nhau. Dựng đứng mỗi cụm thành một cột rồi đọc ngang từng hàng — ' +
    'cũng là cách giải "xuống thang máy" (mỗi cụm là một tầng, đọc dọc xuống).',
  tuKhoaOTT: ['ta vet', 'bat ta vet', 'thang may', 'xuong thang', 'dung dung', 'be dung', 'tang lau'],

  dauHieu: (ct) => {
    const cum = tachCum(ct);
    if (cum.length < 4) return 0;
    const dai = new Set(cum.map((c) => c.length));
    return dai.size === 1 ? 1 : dai.size === 2 ? 0.5 : 0;
  },

  khaThi: (ct) => {
    const cum = tachCum(ct);
    if (cum.length < 3 || !cum.every((c) => /^[A-Z]+$/.test(c))) return false;
    // Cho phép cụm cuối ngắn hơn (người ra đề hay bỏ chữ đệm), còn lại phải đều.
    const dau = cum.slice(0, -1).map((c) => c.length);
    return dau[0] >= 2 && dau.every((d) => d === dau[0]) && cum.at(-1).length <= dau[0];
  },

  *bienThe(ct) {
    const cum = tachCum(ct);
    const cao = cum[0].length;
    const hang = Array.from({ length: cao }, (_, h) => cum.map((c) => c[h] ?? ''));
    yield {
      nhan: `${cum.length} cụm × ${cao} chữ`,
      bv: hang.map((d) => d.join('')).join(''),
      cach: `Dựng đứng ${cum.length} cụm thành ${cum.length} cột cao ${cao} chữ, rồi đọc ngang lần lượt từng hàng.`,
      bang: { nhanCot: cum.map((_, i) => `#${i + 1}`), soCot: cum.map((_, i) => i + 1), hang },
    };
  },
};

/* ── Thứ tự theo dãy số ── */

/** Chữ số trong OTT nếu chúng là hoán vị đúng của 1…n (3 ≤ n ≤ 9), ngược lại null. */
function dayHoanVi(ott) {
  const so = (String(ott).match(/\d/g) || []).map(Number);
  if (so.length < 3 || so.length > 9) return null;
  return [...so].sort().every((x, i) => x === i + 1) ? so : null;
}

/**
 * OTT là một dãy số hoán vị 1…n, ví dụ "13579 8642": chữ thứ i của mỗi khối
 * n chữ trong bản mã chính là chữ ở vị trí (số thứ i) của bạch văn.
 *
 *   khoá 1 3 5 7 9 8 6 4 2,  bản mã A H A M P A M N N  →  ANH NAM MAP
 */
const thuTuDaySo = {
  id: 'thutudayso',
  name: 'Thứ tự theo dãy số',
  family: 'doicho',
  moTa: 'OTT là một dãy số; chữ thứ i của bản mã được đặt về vị trí mang số thứ i của dãy, rồi đọc liền.',
  tuKhoaOTT: ['day so', 'thu tu', 'so le', 'so chan', 'le truoc chan sau'],

  /** OTT mà các chữ số là đúng một hoán vị của 1…n thì gần như chắc là loại này. */
  khopOtt: (ott) => (dayHoanVi(ott) ? 1 : 0),

  khaThi: (ct) => /[A-Z]/.test(ct),

  *bienThe(ct, { ott = '' } = {}) {
    const chu = ct.replace(/[^A-Z]/g, '');
    const so = dayHoanVi(ott);
    if (!so || chu.length < so.length) return;
    const n = so.length;

    let bv = '';
    for (let dau = 0; dau < chu.length; dau += n) {
      const khoi = chu.slice(dau, dau + n);
      const ra = new Array(khoi.length).fill('');
      // Khối cuối có thể thiếu chữ: bỏ qua những số vượt quá độ dài khối.
      const viTri = so.filter((x) => x <= khoi.length);
      viTri.forEach((x, i) => (ra[x - 1] = khoi[i]));
      bv += ra.join('');
    }

    yield {
      nhan: `dãy ${so.join('')}`,
      bv,
      cach: `Khoá ${so.join(' ')}: chữ thứ 1 của bản mã về vị trí ${so[0]}, chữ thứ 2 về vị trí ${so[1]}… rồi đọc liền từ trái sang phải.`,
    };
  },
};

/* ── Morse số chẵn lẻ ── */

/**
 * Khoá dạng "N=12": chữ N trong Morse là "-.", nên số 1 là gạch, số 2 là
 * chấm — rộng ra: số lẻ là tè (gạch), số chẵn là tích (chấm). Số 0 ngăn hai
 * chữ, "00" ngăn hai từ.
 *
 *   1246 0 68 00 3 0 234 …  →  -... / .. // - / .-. …  →  BI TR…
 */
const morseSo = {
  id: 'morseso',
  name: 'Morse số chẵn lẻ',
  family: 'thaythe',
  moTa: 'Bản mã toàn chữ số: số lẻ là gạch, số chẵn là chấm (hoặc ngược lại); số 0 ngăn chữ, "00" ngăn từ.',
  tuKhoaOTT: ['n=12', 'chan le', 'so le', 'so chan', 'tich te'],

  dauHieu: (ct) => (/^[\d\s]+$/.test(ct) && /0/.test(ct) && /[1-9]{2}/.test(ct) ? 0.9 : 0),

  khaThi: (ct) => /^[\d\s]+$/.test(ct) && /0/.test(ct) && ct.replace(/\s/g, '').length >= 6,

  *bienThe(ct) {
    const so = ct.replace(/\s/g, '');
    for (const [nhan, le, chan] of [
      ['lẻ là gạch, chẵn là chấm', '-', '.'],
      ['lẻ là chấm, chẵn là gạch', '.', '-'],
    ]) {
      const bv = so
        .split(/00+/)
        .map((tu) =>
          tu
            .split('0')
            .filter(Boolean)
            .map((cum) => MORSE[[...cum].map((d) => (Number(d) % 2 ? le : chan)).join('')] ?? '?')
            .join('')
        )
        .join(' ')
        .trim();
      if (bv) {
        yield { nhan, bv, cach: `Đổi mỗi chữ số: ${nhan}. Số 0 ngăn hai chữ, "00" ngăn hai từ, rồi tra bảng Morse.` };
      }
    }
  },
};

/* ── Morse ghép ── */

/**
 * Khoá dạng "X = NA = TU": mã Morse của X (-..-) bằng mã của N (-.) nối với
 * A (.-). Mỗi cụm chữ trong bản mã là vài chữ Morse ngắn, nối mã của chúng
 * lại sẽ ra mã của một chữ bạch văn.
 *
 *   II → .. + .. = .... → H      TM → - + -- = --- → O
 */
const morseGhep = {
  id: 'morseghep',
  name: 'Morse ghép',
  family: 'thaythe',
  moTa: 'Mỗi cụm chữ trong bản mã là mấy chữ Morse ngắn; nối mã Morse của chúng lại ra một chữ bạch văn.',
  tuKhoaOTT: ['morse ghep', 'ghep morse', 'x = na', 'x=na', 'na = tu', 'phan tich'],

  khaThi: (ct) => {
    const cum = ct.split(/[\s.,\-/|]+/).filter(Boolean);
    return cum.length >= 3 && cum.every((c) => /^[ETIAMNSUROWDKG]{1,4}$/.test(c));
  },

  *bienThe(ct) {
    const maCua = Object.fromEntries(Object.entries(MORSE).map(([ma, c]) => [c, ma]));
    // "-" (có khoảng trắng hai bên hoặc không) ngăn từ; ".", ",", khoảng trắng ngăn chữ.
    const bv = ct
      .split(/\s*[-/|]\s*/)
      .map((tu) =>
        tu
          .split(/[\s.,]+/)
          .filter(Boolean)
          .map((cum) => MORSE[[...cum].map((c) => maCua[c] ?? '').join('')] ?? '?')
          .join('')
      )
      .join(' ')
      .trim();
    if (bv) yield { nhan: 'nối mã', bv, cach: 'Nối mã Morse của các chữ trong mỗi cụm thành một mã dài rồi tra bảng Morse.' };
  },
};

/* ── Phép tính chữ cái ── */

/**
 * Bản mã có đúng là chuỗi phép tính không: phải có ít nhất 3 phép, và các
 * phép phải phủ gần hết chữ cái. Thiếu điều kiện sau thì một bản mã thay thế
 * thường như "T . V. N - Q. Q…" cũng bị hiểu nhầm là "N trừ Q".
 */
function phuPhepTinh(ct) {
  const soPhep = (ct.match(/[A-Z]\s*[+\-]\s*(?:[A-Z]\b|\d+)/g) || []).length;
  const soChu = (ct.match(/[A-Z]/g) || []).length;
  return soPhep >= 3 && soPhep * 2 >= soChu * 0.8;
}

/**
 * Bản mã là các phép tính trên số thứ tự chữ cái (A=1): "Z - M" = 26 − 13
 * = 13 = M, hoặc "(A+8)" = 9 = I. Khoá thường là một phép mẫu như
 * "D − A = C" hay chỉ một chữ "A" làm gốc.
 */
const phepTinhChu = {
  id: 'pheptinhchu',
  name: 'Phép tính chữ cái',
  family: 'thaythe',
  moTa: 'Mỗi phép tính trên số thứ tự chữ cái (A=1) như "Z − M" hay "(A+8)" cho ra một chữ của bạch văn.',
  tuKhoaOTT: ['d - a = c', 'a + 1', 'phep tinh', 'cong tru chu', 'chu tru chu'],

  dauHieu: (ct) => (phuPhepTinh(ct) ? 1 : 0),

  khaThi: (ct) => phuPhepTinh(ct),

  *bienThe(ct) {
    const giaTri = (x) => (/^\d+$/.test(x) ? Number(x) : x.charCodeAt(0) - 64);
    // Phép tính có ngoặc trước, rồi phép tính trần, rồi dấu ngăn từ.
    const re = /\(\s*([A-Z])\s*([+\-])\s*(\d+|[A-Z])\s*\)|\b([A-Z])\s*([+\-])\s*(\d+|[A-Z])\b|(;|\/|\s-\s)/g;
    let bv = '';
    let soPhep = 0;
    for (const m of ct.matchAll(re)) {
      if (m[7]) {
        bv += ' ';
        continue;
      }
      const [a, dau, b] = m[1] ? [m[1], m[2], m[3]] : [m[4], m[5], m[6]];
      const kq = dau === '+' ? giaTri(a) + giaTri(b) : giaTri(a) - giaTri(b);
      bv += AZ[((kq - 1) % 26 + 26) % 26];
      soPhep++;
    }
    if (soPhep >= 3) {
      yield {
        nhan: 'A=1',
        bv: bv.replace(/\s+/g, ' ').trim(),
        cach: 'Đổi mỗi chữ thành số thứ tự (A=1 … Z=26), làm phép cộng/trừ, rồi đổi kết quả về chữ.',
      };
    }
  },
};

export const ciphers = { batTaVet, thuTuDaySo, morseSo, morseGhep, phepTinhChu };
