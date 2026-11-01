/**
 * Nhóm mật thư THAY THẾ — mỗi ký tự bản mã đổi thành một ký tự bạch văn.
 *
 * Bảng tra cứu đặt ở core/data/constants.js.
 */

import {
  ALPHABET_EN as AZ,
  ALPHABET_VN,
  MORSE,
  PHONE_KEYPAD,
  SEMAPHORE,
} from '../data/constants.js';
import { boDau } from '../types.js';

/**
 * Chọn bảng chữ cái theo tuỳ chọn người dùng.
 * 'auto' trả cả hai để brute-force, 'en'/'vn' chỉ trả bảng được chọn.
 */
export function chonBang(bangChu = 'auto') {
  const en = { ten: 'EN 26', chu: AZ };
  const vn = { ten: 'VN 29', chu: ALPHABET_VN.join('') };
  if (bangChu === 'en') return [en];
  if (bangChu === 'vn') return [vn];
  return [en, vn];
}

/** Dịch vòng bảng chữ cái đi `n` bước (Caesar). */
function dich(text, n) {
  return text.replace(/[A-Z]/g, (c) => AZ[(AZ.indexOf(c) + n + 26) % 26]);
}

/* ── Morse ── */

const morse = {
  id: 'morse',
  name: 'Morse',
  family: 'thaythe',
  moTa: 'Mỗi cụm chấm/gạch là một chữ cái. Dấu cách ngăn chữ, "/" ngăn từ.',
  tuKhoaOTT: ['morse', 'tich te', 'chim bay', 'dai ngan'],

  /** Chỉ gồm chấm và gạch, có khoảng trắng ngăn cụm — dấu hiệu Morse rất đặc trưng. */
  dauHieu: (ct) => (/^[.\-/\s|]+$/.test(ct) ? (/\s/.test(ct) ? 1 : 0.7) : 0),

  khaThi: (ct) => /^[.\-/\s|]+$/.test(ct) && /[.\-]/.test(ct),

  *bienThe(ct) {
    // Người chơi dùng nhiều ký hiệu khác nhau cho dấu phân cách từ.
    const chuan = ct.replace(/[|]/g, '/');
    const giai = (s) =>
      s
        .split(/\s*\/\s*/)
        .map((tu) =>
          tu.trim().split(/\s+/).filter(Boolean).map((m) => MORSE[m] ?? '?').join('')
        )
        .join(' ')
        .trim();

    const bv = giai(chuan);
    if (bv) yield { nhan: 'chuẩn', bv, cach: 'Tra bảng Morse cho từng cụm chấm/gạch.' };

    // Biến thể đảo: một số bản mã viết ngược chấm và gạch.
    const daoDau = chuan.replace(/[.\-]/g, (c) => (c === '.' ? '-' : '.'));
    const bv2 = giai(daoDau);
    if (bv2 && bv2 !== bv) {
      yield { nhan: 'đảo chấm ↔ gạch', bv: bv2, cach: 'Đổi chấm thành gạch rồi tra bảng Morse.' };
    }
  },
};

/* ── Caesar / thay thế dịch chuyển ── */

const caesar = {
  id: 'caesar',
  name: 'Thay thế dịch chuyển',
  family: 'thaythe',
  moTa: 'Mỗi chữ cái lùi hoặc tiến một số bước cố định trên bảng chữ cái.',
  tuKhoaOTT: ['tien chu', 'lui chu', 'dich chu', 'a thanh', 'chu bang chu'],

  khaThi: (ct) => /[A-Z]/.test(ct),

  *bienThe(ct, { bangChu } = {}) {
    for (const { ten, chu } of chonBang(bangChu)) {
      const L = chu.length;
      for (let n = 1; n < L; n++) {
        yield {
          nhan: `dịch ${n}, bảng ${ten}`,
          bv: [...ct].map((c) => {
            const i = chu.indexOf(c);
            return i < 0 ? c : chu[(i + n) % L];
          }).join(''),
          cach: `Mỗi chữ tiến ${n} bước trên bảng chữ cái ${ten}.`,
        };
      }
    }
  },
};

/* ── Atbash (thay thế gương) ── */

const atbash = {
  id: 'atbash',
  name: 'Thay thế gương (A↔Z)',
  family: 'thaythe',
  moTa: 'Bảng chữ cái lật ngược: A↔Z, B↔Y, C↔X…',
  tuKhoaOTT: ['guong', 'soi guong', 'nguoc bang', 'a thanh z'],

  khaThi: (ct) => /[A-Z]/.test(ct),

  *bienThe(ct) {
    yield {
      nhan: 'A↔Z',
      bv: ct.replace(/[A-Z]/g, (c) => AZ[25 - AZ.indexOf(c)]),
      cach: 'Đổi mỗi chữ cái sang chữ đối xứng qua tâm bảng chữ cái.',
    };
  },
};

/* ── Số thay chữ ── */

const soThayChu = {
  id: 'sothaychu',
  name: 'Số thay chữ',
  family: 'thaythe',
  moTa: 'Mỗi số là thứ tự chữ cái: 1=A, 2=B… 26=Z.',
  tuKhoaOTT: ['so bang chu', 'so thay chu', 'dem so', 'con so'],

  /** Toàn số, mỗi số nằm trong 1–26 — đúng phạm vi bảng chữ cái. */
  dauHieu: (ct) => {
    const so = ct.match(/\d+/g);
    if (!so || /[A-Z]/.test(ct)) return 0;
    return so.every((n) => +n >= 1 && +n <= 26) ? 1 : 0.3;
  },

  khaThi: (ct) => /\d/.test(ct) && !/[A-Z]{3}/.test(ct),

  *bienThe(ct) {
    const so = ct.match(/\d+/g);
    if (!so) return;

    // Gốc 1: 1=A (phổ biến nhất trong mật thư Đoàn – Đội).
    yield {
      nhan: '1=A',
      bv: so.map((n) => AZ[(+n - 1 + 26) % 26] ?? '?').join(''),
      cach: 'Đổi mỗi số thành chữ cái theo thứ tự 1=A, 2=B…',
    };

    // Gốc 0: 0=A.
    yield {
      nhan: '0=A',
      bv: so.map((n) => AZ[(+n + 26) % 26] ?? '?').join(''),
      cach: 'Đổi mỗi số thành chữ cái theo thứ tự 0=A, 1=B…',
    };
  },
};

/* ── Phím Nokia (multi-tap) ── */

const phimNokia = {
  id: 'phimnokia',
  name: 'Phím Nokia',
  family: 'thaythe',
  moTa: 'Bấm phím điện thoại cũ: 22 = B, 444 = I…',
  tuKhoaOTT: ['nokia', 'dien thoai', 'ban phim', 'bam phim', 'tin nhan'],

  /** Chỉ chữ số 2–9 (phím có chữ), và các cụm là số lặp liên tiếp. */
  dauHieu: (ct) => {
    if (!/^[2-9\s]+$/.test(ct)) return 0;
    const cum = ct.trim().split(/\s+/).filter(Boolean);
    return cum.every((c) => /^(\d)*$/.test(c)) ? 1 : 0.4;
  },

  khaThi: (ct) => /^[2-9\s]+$/.test(ct),

  *bienThe(ct) {
    const bv = ct
      .trim()
      .split(/\s+/)
      .map((cum) => {
        const phim = cum[0];
        const bang = PHONE_KEYPAD[phim];
        if (!bang || !/^(\d)\1*$/.test(cum)) return '?';
        return bang[(cum.length - 1) % bang.length];
      })
      .join('');

    if (bv) yield { nhan: 'multi-tap', bv, cach: 'Mỗi cụm số lặp là một lần bấm phím điện thoại.' };
  },
};


/* ── Semaphore (cờ tay) ── */

/**
 * Semaphore: mỗi chữ là một hoặc hai số hướng cờ, tra bảng SEMAPHORE.
 * Bảng của site cũ lệch chuẩn quốc tế nên phải tra đúng bảng đó.
 */
const semaphore = {
  id: 'semaphore',
  name: 'Semaphore (cờ tay)',
  family: 'thaythe',
  moTa: 'Mỗi cụm 1–2 số chỉ hướng hai lá cờ, tra bảng semaphore ra chữ.',
  tuKhoaOTT: ['semaphore', 'co tay', 'phat co', 'tin hieu co'],

  /** Chỉ dùng chữ số 1–7 (tám hướng cờ), không có chữ cái. */
  dauHieu: (ct) => (/^[1-7\s,\-/]+$/.test(ct) ? 1 : 0),

  khaThi: (ct) => /^[1-7\s,\-/]+$/.test(ct) && /[1-7]/.test(ct),

  *bienThe(ct) {
    const token = ct.split(/[\s,\-]+/).filter(Boolean);
    if (!token.length) return;

    const bv = token.map((t) => (t === '/' ? ' ' : SEMAPHORE[t] ?? '?')).join('');
    if (bv.replace(/[?\s]/g, '')) {
      yield {
        nhan: 'tra bảng cờ',
        bv,
        cach: 'Mỗi cụm số là một tư thế cờ; tra bảng semaphore ra chữ tương ứng.',
      };
    }
  },
};

/* ── Số thay chữ theo bảng chữ cái tiếng Việt ── */

const soThayChuVN = {
  id: 'sothaychuvn',
  name: 'Số thay chữ (bảng Việt)',
  family: 'thaythe',
  moTa: 'Đánh số theo bảng chữ cái tiếng Việt 29 chữ (có Ă Â Đ Ê Ô Ơ Ư).',
  tuKhoaOTT: ['bang viet', 'chu viet', 'tieng viet', '29 chu'],

  khaThi: (ct) => /\d/.test(ct) && !/[A-Z]{3}/.test(ct),

  *bienThe(ct) {
    const so = ct.match(/\d+/g);
    if (!so) return;
    yield {
      nhan: '1=A (29 chữ)',
      bv: so.map((n) => ALPHABET_VN[(+n - 1 + 29) % 29] ?? '?').join(''),
      cach: 'Đổi mỗi số thành chữ theo bảng chữ cái tiếng Việt 29 chữ.',
    };
  },
};

/* ── Tiến chữ (Vigenère bằng dãy số) ── */

/**
 * Khoá là một dãy số lặp lại: chữ thứ i dịch đi k[i mod L] bậc.
 * Ký tự ngoài bảng chữ cái giữ nguyên và KHÔNG tiêu tốn một bước khoá.
 *
 * Ba cách tính gốc trong site cũ (tienchu.html):
 *   normal  — dịch đúng số trong khoá
 *   baseOne — dịch (số − 1), tức "gốc tại 0"
 */
const tienChu = {
  id: 'tienchu',
  name: 'Tiến chữ',
  family: 'thaythe',
  moTa: 'Khoá là dãy số lặp lại; mỗi chữ lùi đi số bậc tương ứng trên bảng chữ cái.',
  tuKhoaOTT: ['tien chu', 'lui chu', 'day so', 'dem buoc'],

  khaThi: (ct) => /[A-Z]/.test(ct),

  /** Khoá số lấy từ OTT. */
  *bienThe(ct, { ott = '', bangChu } = {}) {
    const chuoiSo = (ott.match(/\d+/g) || []).join('');
    if (!chuoiSo) return;

    // Mỗi chữ số là một bước khoá (cách dùng phổ biến nhất).
    const khoa = [...chuoiSo].map(Number);
    if (!khoa.length) return;

    for (const { ten: tenBang, chu: bang } of chonBang(bangChu)) {
      const L = bang.length;
      for (const [tenGoc, bu] of [['gốc 1', 0], ['gốc 0', -1]]) {
        for (const [tenHuong, dau] of [['lùi', -1], ['tiến', 1]]) {
          let k = 0;
          const bv = [...ct]
            .map((c) => {
              const i = bang.indexOf(c);
              if (i < 0) return c; // ký tự ngoài bảng không tốn bước khoá
              const buoc = (khoa[k++ % khoa.length] + bu) * dau;
              return bang[((i + buoc) % L + L) % L];
            })
            .join('');

          yield {
            nhan: `khoá ${chuoiSo}, ${tenHuong}, ${tenGoc}, bảng ${tenBang}`,
            bv,
            cach: `Dịch từng chữ theo dãy khoá ${chuoiSo} lặp lại, đếm ${tenHuong}, ${tenGoc}, trên bảng ${tenBang}.`,
          };
        }
      }
    }
  },
};

/* ── Số học: cộng / trừ một hằng số ── */

/**
 * OTT cho một con số ("Mỗi bước tiến ba"), bạch văn là số thứ tự chữ cái
 * đã bị cộng hoặc trừ đi hằng số đó.
 */
const soHoc = {
  id: 'sohoc',
  name: 'Số học (cộng / trừ)',
  family: 'thaythe',
  moTa: 'Bản mã là dãy số; cộng hoặc trừ một hằng số rồi đổi sang chữ.',
  tuKhoaOTT: ['cong', 'tru', 'them', 'bot', 'so hoc', 'phep tinh'],

  khaThi: (ct) => /\d/.test(ct) && !/[A-Z]{3}/.test(ct),

  *bienThe(ct, { ott = '' } = {}) {
    const so = (ct.match(/\d+/g) || []).map(Number);
    if (!so.length) return;

    // Hằng số ưu tiên lấy từ OTT; nếu không có thì thử 1..9.
    const tuOtt = (ott.match(/\d+/g) || []).map(Number).filter((n) => n < 26);
    const ds = tuOtt.length ? tuOtt : [1, 2, 3, 4, 5, 6, 7, 8, 9];

    for (const k of ds) {
      for (const [ten, dau] of [['trừ', -1], ['cộng', 1]]) {
        yield {
          nhan: `${ten} ${k}`,
          bv: so.map((n) => AZ[((n + dau * k - 1) % 26 + 26) % 26] ?? '?').join(''),
          cach: `${ten === 'trừ' ? 'Trừ' : 'Cộng'} ${k} vào mỗi số rồi đổi sang chữ (1=A).`,
        };
      }
    }
  },
};

/* ── Ẩn dấu: lấy chữ đầu mỗi từ ── */

const anDau = {
  id: 'andau',
  name: 'Ẩn dấu (chữ đầu)',
  family: 'thaythe',
  moTa: 'Bạch văn giấu trong chữ cái đầu (hoặc cuối) của mỗi cụm, ngăn bằng - / space.',
  tuKhoaOTT: ['an dau', 'chu dau', 'dau dong', 'dau cau', 'nguoi dung dau', 'mo dau', 'moc sau he', 'sau he', 'rau dang'],

  /*
   * Hai dạng đề đều thuộc họ này nên `khaThi` phải nhận cả hai:
   *   - NHIỀU CỤM — lấy chữ đầu / chữ cuối mỗi cụm.
   *   - MỘT KHỐI LIỀN — "một sống một chết", "bỏ chữ sân": bạch văn giấu
   *     trong chính chuỗi liền, không có dấu cách nào để đếm cụm.
   */
  khaThi: (ct) =>
    ct.trim().split(/[\s\-/,.]+/).filter(Boolean).length >= 3 ||
    ct.replace(/[^A-Z]/g, '').length >= 8,

  /**
   * Nhận dạng: bạch văn giấu trong chữ đầu/cuối mỗi CỤM (ngăn bằng - / space).
   * Ví dụ thật (đã kiểm chứng): OTT "Còn thương rau đắng mọc sau hè",
   * lấy chữ cuối mỗi cụm → "TRUYỀN THỐNG 57 NĂM HỘI LHTN".
   */
  dauHieu: (ct) => {
    const cum = ct.split(/[\s\-/,.]+/).filter(Boolean);
    if (cum.length < 5) return 0.2;
    // Cụm toàn chữ cái lẫn cụm toàn số là dấu hiệu của ẩn dấu đa lớp.
    const chu = cum.filter((c) => /^[A-ZÀ-Ỹ]+$/i.test(c)).length;
    return chu / cum.length > 0.7 ? 1 : 0.4;
  },

  *bienThe(ct, { ott = '' } = {}) {
    const tu = ct.trim().split(/[\s\-/,.]+/).filter(Boolean);
    if (tu.length < 3 && !ct.replace(/[^A-Z]/g, '').length) return;

    yield {
      nhan: 'chữ đầu mỗi cụm',
      bv: tu.map((t) => t[0]).join(''),
      cach: 'Ghép chữ cái đầu tiên của mỗi cụm trong bản mã.',
    };
    yield {
      nhan: 'chữ cuối mỗi cụm',
      bv: tu.map((t) => [...t].pop()).join(''),
      cach: 'Ghép chữ cái cuối cùng của mỗi cụm trong bản mã (vd "mọc sau hè" → lấy chữ sau).',
    };

    // "Một sống một chết": giữ ký tự ở vị trí lẻ, bỏ ký tự ở vị trí chẵn.
    const lien = ct.replace(/[^A-Z]/g, '');
    if (lien.length >= 4) {
      yield {
        nhan: 'một sống một chết',
        bv: [...lien].filter((_, i) => i % 2 === 0).join(''),
        cach: 'Giữ ký tự ở vị trí lẻ (1, 3, 5…), bỏ ký tự ở vị trí chẵn.',
      };
    }

    /*
     * "Bỏ chữ sân": OTT ra lệnh xoá một chữ nào đó khỏi bản mã.
     *
     * Hai cách chèn đều gặp trong đề thật:
     *   - LIỀN KHỐI — "…SAAN…" nằm nguyên cụm, xoá bằng split là xong.
     *   - RẢI RÁC   — các chữ của cụm nằm xen kẽ trong bạch văn, phải xoá
     *     lần lượt theo đúng thứ tự: tìm S, rồi A sau S, rồi A sau A, rồi N.
     *
     * Ví dụ đã kiểm chứng (OTT "Khởi một niệm sân đốt cả rừng công đức"):
     *   THSEOHUAOWANNGSSDDOONAGAGANWPJNGUYHIEEMR  →  bỏ SAAN rải rác hai lượt
     *   →  THEOHUOWNGSDDOONGGAWPJNGUYHIEEMR  ("Theo hướng đông gặp nguy hiểm")
     */
    const cumRac = [...new Set([...layCumRac(ott), 'SAAN'])];
    for (const cum of cumRac) {
      if (ct.includes(cum)) {
        yield {
          nhan: `bỏ cụm ${cum}`,
          bv: ct.split(cum).join(''),
          cach: `Xoá mọi cụm "${cum}" chèn liền khối trong bản mã theo gợi ý OTT.`,
        };
      }

      const raiRac = xoaRaiRac(ct, cum);
      if (raiRac && raiRac !== ct) {
        yield {
          nhan: `bỏ chữ ${cum} (rải rác)`,
          bv: raiRac,
          cach:
            `Các chữ của cụm "${cum}" nằm XEN KẼ trong bạch văn chứ không liền khối.\n` +
            `Quét từ trái sang, xoá lần lượt từng chữ của "${cum}" đúng thứ tự, lặp lại tới hết.`,
        };
      }
    }
  },
};

/**
 * Suy ra cụm chữ cần xoá từ OTT.
 *
 * OTT nói "sân" thì cụm là SAAN (telex), "ghét" thì GHEETS… Bản mã viết telex
 * nên nguyên âm có dấu thành nguyên âm lặp. Trả cả dạng gốc không dấu lẫn
 * dạng telex lặp nguyên âm để phủ hai lối viết.
 */
function layCumRac(ott) {
  const sach = boDau(String(ott).toUpperCase()).replace(/[^A-Z\s]/g, ' ');
  const ra = new Set();
  for (const w of sach.split(/\s+/)) {
    if (w.length < 2 || w.length > 6) continue;
    ra.add(w);
    // Dạng telex: nguyên âm mang dấu mũ/trăng viết lặp (â → AA, ê → EE…).
    ra.add(w.replace(/[AEO]/g, (c) => c + c));
  }
  return ra;
}

/**
 * Xoá một cụm chữ nằm RẢI RÁC trong chuỗi.
 *
 * Quét một lượt từ trái sang phải, luôn bám theo MỘT chữ đang cần tìm: gặp
 * đúng chữ đó thì xoá và chuyển sang chờ chữ kế tiếp của cụm; mọi chữ khác
 * giữ nguyên. Hết cụm thì quay lại chờ chữ đầu, bắt đầu lượt mới.
 *
 * Điểm mấu chốt là KHÔNG quay lui khi gặp chữ không khớp — các chữ của cụm
 * được người ra đề rắc xen kẽ vào bạch văn, nên giữa chúng luôn có chữ thật
 * nằm chen. Nếu coi chữ chen là "khớp hỏng" rồi huỷ lượt thì không bao giờ
 * khớp được lượt nào.
 *
 * Kiểm chứng trên đề thật (OTT "…niệm sân…", cụm SAAN):
 *   THSEOHUAOWANNGSSDDOONAGAGANWPJNGUYHIEEMR
 *   →  THEOHUOWNGSDDOONGGAWPJNGUYHIEEMR
 *
 * @returns {string|null} chuỗi đã xoá, hoặc null nếu không khớp trọn lượt nào
 *   (hoặc còn dở dang giữa chừng — dấu hiệu cụm này không phải cụm bị chèn).
 */
function xoaRaiRac(ct, cum) {
  if (!cum) return null;
  let ra = '';
  let k = 0;
  let soLuot = 0;

  for (const c of ct) {
    if (c === cum[k]) {
      k++;
      if (k === cum.length) {
        k = 0;
        soLuot++;
      }
    } else {
      ra += c;
    }
  }

  // Còn dở dang (k > 0) nghĩa là đã trót xoá vài chữ mà không thành lượt —
  // kết quả không tin được, bỏ qua ứng viên này.
  return soLuot > 0 && k === 0 ? ra : null;
}

export const ciphers = {
  morse,
  caesar,
  atbash,
  soThayChu,
  soThayChuVN,
  phimNokia,
  semaphore,
  tienChu,
  soHoc,
  anDau,
};
