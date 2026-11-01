/**
 * Nhóm mật thư ĐỔI CHỖ — giữ nguyên chữ cái, chỉ xáo trộn thứ tự.
 *
 * Đây là nhóm brute-force sinh nhiều biến thể nhất, nên mỗi hàm đều giới hạn
 * không gian tìm kiếm để giao diện không bị treo.
 */

import { bitTrenChu } from '../scoring/nguGram.js';
import { boDau } from '../types.js';

/** Giới hạn số cột thử khi đọc theo bảng, tránh bùng nổ tổ hợp. */
const MAX_COT = 8;

/* ── Đọc ngược ── */

const docNguoc = {
  id: 'docnguoc',
  name: 'Đọc ngược',
  family: 'doicho',
  moTa: 'Bạch văn bị viết ngược, đọc từ phải sang trái.',
  tuKhoaOTT: ['doc nguoc', 'nguoc', 'nuoc chay', 've nguon', 'quay dau', 'lon nguoc'],

  khaThi: (ct) => /[A-Z]/.test(ct),

  *bienThe(ct) {
    yield {
      nhan: 'toàn bộ',
      bv: [...ct].reverse().join(''),
      cach: 'Đọc toàn bộ bản mã từ ký tự cuối về ký tự đầu.',
    };

    yield {
      nhan: 'từng từ',
      bv: ct.split(/\s+/).map((t) => [...t].reverse().join('')).join(' '),
      cach: 'Giữ nguyên thứ tự các từ, đảo ngược chữ cái trong từng từ.',
    };

    yield {
      nhan: 'thứ tự từ',
      bv: ct.split(/\s+/).reverse().join(' '),
      cach: 'Giữ nguyên từng từ, đảo ngược thứ tự các từ.',
    };
  },
};

/* ── Đọc theo cột (chuyển vị bảng) ── */

const theoCot = {
  id: 'theocot',
  name: 'Viết hàng đọc cột',
  family: 'doicho',
  moTa: 'Bạch văn viết vào bảng theo hàng, bản mã đọc ra theo cột (hoặc ngược lại).',
  tuKhoaOTT: ['hang doc cot', 'viet hang', 'doc cot', 'bang', 'cay thang', 'leo cot'],

  khaThi: (ct) => ct.replace(/[^A-Z0-9]/g, '').length >= 4,

  *bienThe(ct) {
    const ky = ct.replace(/[^A-Z0-9]/g, '');
    const n = ky.length;

    for (let cot = 2; cot <= Math.min(MAX_COT, n - 1); cot++) {
      if (n % cot !== 0) continue; // chỉ xét bảng chữ nhật đầy đủ
      const hang = n / cot;

      // Bản mã đọc theo cột → khôi phục bằng cách đọc lại theo hàng.
      let bv = '';
      for (let h = 0; h < hang; h++) {
        for (let c = 0; c < cot; c++) bv += ky[c * hang + h];
      }
      yield {
        nhan: `${cot} cột`,
        bv,
        cach: `Xếp bản mã thành bảng ${hang}×${cot} theo cột rồi đọc ngang theo hàng.`,
      };
    }
  },
};

/* ── Đường rào (zigzag) ── */

const duongRao = {
  id: 'duongrao',
  name: 'Đường rào',
  family: 'doicho',
  moTa: 'Chữ cái viết theo hình răng cưa lên xuống trên nhiều dòng, đọc ra theo từng dòng.',
  tuKhoaOTT: ['duong rao', 'rang cua', 'zigzag', 'len xuong', 'song nui', 'nhap nho'],

  khaThi: (ct) => ct.replace(/[^A-Z0-9]/g, '').length >= 4,

  *bienThe(ct) {
    const ky = ct.replace(/[^A-Z0-9]/g, '');
    const n = ky.length;

    for (let rao = 2; rao <= Math.min(6, n - 1); rao++) {
      // Xác định mỗi vị trí bạch văn thuộc dòng rào nào.
      const dong = [];
      let d = 0;
      let buoc = 1;
      for (let i = 0; i < n; i++) {
        dong.push(d);
        if (d === 0) buoc = 1;
        else if (d === rao - 1) buoc = -1;
        d += buoc;
      }

      // Bản mã là các dòng nối tiếp nhau; rải ngược lại về đúng vị trí.
      const kq = new Array(n);
      let k = 0;
      for (let r = 0; r < rao; r++) {
        for (let i = 0; i < n; i++) if (dong[i] === r) kq[i] = ky[k++];
      }

      yield {
        nhan: `${rao} dòng`,
        bv: kq.join(''),
        cach: `Rải bản mã lên ${rao} dòng theo hình răng cưa rồi đọc theo đường đi.`,
      };
    }
  },
};

/* ── Cam Ranh: chuyển vị cột theo khoá ── */

/**
 * Thứ tự đọc cột suy ra từ khoá: xếp các chữ của khoá theo bảng chữ cái,
 * chữ đứng trước thì cột đó được đọc trước. Chữ trùng lấy theo thứ tự xuất hiện.
 * Thuật toán lấy từ generateKeyOrder() của site cũ (doicho/camranh.html).
 */
export function thuTuKhoa(khoa) {
  const ky = khoa.toUpperCase().replace(/[^A-Z]/g, '').split('');
  const order = {};
  let n = 1;
  for (const chu of [...new Set(ky)].sort()) {
    ky.forEach((c, i) => {
      if (c === chu && !order[i]) order[i] = n++;
    });
  }
  return ky.map((_, i) => order[i]);
}

const camRanh = {
  id: 'camranh',
  name: 'Cam Ranh',
  family: 'doicho',
  moTa: 'Bản mã chia thành các cụm bằng nhau; khoá cho biết cụm nào đứng ở cột nào.',
  tuKhoaOTT: ['cam ranh', 'khoa', 'chia cot', 'ho chi minh', 'hoa binh', 'tuyen ngon'],

  /**
   * Điểm nhận dạng Cam Ranh (theo tài liệu hướng đạo):
   *   - bản mã chia thành các cụm rời rạc, số ký tự mỗi cụm bằng nhau
   *   - nếu lệch thì chỉ lệch 1 ký tự
   *   - số chữ của khoá bằng số cụm
   */
  dauHieu: (ct) => {
    const cum = ct.split(/[\s\-_,.]+/).filter(Boolean);
    if (cum.length < 3) return 0.2;
    const dai = cum.map((c) => c.length);
    const lech = Math.max(...dai) - Math.min(...dai);
    if (lech === 0) return 1;      // cụm đều tăm tắp — dấu hiệu rõ nhất
    if (lech === 1) return 0.8;
    return 0.1;
  },

  // Dấu nhận dạng: nhiều cụm, độ dài các cụm bằng nhau (lệch nhiều nhất 1).
  khaThi: (ct) => {
    const cum = ct.split(/[\s\-_,.]+/).filter(Boolean);
    if (cum.length < 2) return false;
    const dai = cum.map((c) => c.length);
    return Math.max(...dai) - Math.min(...dai) <= 1;
  },

  /**
   * Khoá lấy từ OTT. Số chữ của khoá phải bằng số cụm của bản mã.
   *
   * Cách giải: đánh số các chữ khoá theo thứ tự alphabet (chữ trùng tính từ
   * trái sang phải), rồi đặt cụm thứ k vào đúng vị trí mang số k. Đọc ngang
   * bảng vừa dựng ra bạch văn.
   *
   * Ví dụ đã kiểm chứng — OTT "CAM RANH", thứ tự 3 1 5 7 2 6 4:
   *   KI LH DX BO SN UA CC  →  DKSCLUB XIN CHAO
   */
  *bienThe(ct, { ott = '' } = {}) {
    const cum = ct.split(/[\s\-_,.]+/).filter(Boolean);
    if (cum.length < 2) return;

    // Khoá phải bỏ dấu trước khi tách: "SEN VÀNG" viết nguyên dấu sẽ bị cắt
    // thành SEN / V / NG (vì "À" không thuộc A–Z), ra thứ tự cột sai hoàn toàn.
    const cumKhoa = boDau(ott.toUpperCase()).split(/[^A-Z]+/).filter(Boolean);
    // Khoá có thể viết rời ("CAM RANH") nên thử cả bản ghép liền.
    const ungVien = [...new Set([...cumKhoa, cumKhoa.join('')])];
    let coKhoa = false;

    for (const khoa of ungVien) {
      const thuTu = thuTuKhoa(khoa);
      if (thuTu.length !== cum.length) continue;

      // Cụm mang số k được đặt vào vị trí có số thứ tự k.
      const cot = [];
      thuTu.forEach((so, viTri) => {
        cot[viTri] = cum[so - 1];
      });

      // Dựng bảng: mỗi cột là một cụm, đọc ngang theo từng hàng.
      const sauHang = Math.max(...cot.map((c) => c.length));
      const hang = [];
      for (let h = 0; h < sauHang; h++) hang.push(cot.map((c) => c[h] ?? ''));

      const bang = { nhanCot: khoa.split(''), soCot: thuTu, hang };
      const giaiThich =
        `Khoá "${khoa}" đánh số theo alphabet: ${thuTu.join('-')}.
` +
        'Đặt cụm thứ k vào vị trí mang số k rồi đọc bảng.';

      // Hai cách đọc đều hợp lệ — người ra đề chọn một, nên trả cả hai.
      yield {
        nhan: `khoá ${khoa}, đọc ngang`,
        bv: hang.map((d) => d.join('')).join(''),
        cach: `${giaiThich}
Đọc lần lượt từng hàng ngang.`,
        bang,
      };

      yield {
        nhan: `khoá ${khoa}, đọc dọc`,
        bv: cot.join(''),
        cach: `${giaiThich}
Đọc lần lượt từng cột từ trên xuống.`,
        bang,
      };
      coKhoa = true;
    }

    /*
     * Không có khoá khớp trong OTT — vẫn giải được bằng cách DÒ thứ tự cụm.
     *
     * Thứ tự cụm chính là một hoán vị; thay vì vét cạn k! (7 cụm đã là 5040,
     * 9 cụm là 362 880), dùng chùm tia có cắt tỉa như chuyenvitudo: cặp cụm
     * đứng cạnh nhau đúng thứ tự sẽ cho n-gram tốt ở mọi hàng cùng lúc.
     */
    if (!coKhoa && cum.length >= 3 && cum.length <= 9) {
      yield* doThuTuCum(cum);
    }
  },
};

/**
 * Dò thứ tự cụm Cam Ranh khi OTT không cho khoá dùng được.
 *
 * Dùng chung ý tưởng cắt tỉa với `bruteforce.js`: chấm mọi cặp (cụm a đứng
 * ngay trước cụm b) bằng mô hình n-gram, rồi dựng dần hoán vị, mỗi bước chỉ
 * giữ lại những nhánh tốt nhất.
 */
function* doThuTuCum(cum) {
  const k = cum.length;
  const cao = Math.max(...cum.map((c) => c.length));

  // Chấm cặp: nối từng hàng của hai cụm rồi đo bit/chữ.
  const khop = Array.from({ length: k }, (_, i) =>
    Array.from({ length: k }, (_, j) => {
      if (i === j) return -Infinity;
      let s = '';
      for (let h = 0; h < cao; h++) s += (cum[i][h] ?? '') + (cum[j][h] ?? '');
      return bitTrenChu(s);
    })
  );

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
    moi.sort((a, b) => b.diem - a.diem);
    chum = moi.slice(0, 20);
  }

  for (const { thuTu } of chum.slice(0, 6)) {
    const cot = thuTu.map((i) => cum[i]);
    let bv = '';
    for (let h = 0; h < cao; h++) for (const c of cot) bv += c[h] ?? '';
    yield {
      nhan: `dò thứ tự cụm ${thuTu.map((i) => i + 1).join('-')}`,
      bv,
      cach:
        'OTT không cho khoá dùng được, nên dò thẳng thứ tự cụm.\n' +
        `Chấm mọi cặp cụm đứng cạnh nhau bằng mô hình n-gram rồi dựng dần hoán vị có cắt tỉa: ${thuTu
          .map((i) => i + 1)
          .join('-')}.\nĐọc ngang theo hàng.`,
      bang: {
        nhanCot: thuTu.map((i) => `#${i + 1}`),
        soCot: thuTu.map((i) => i + 1),
        hang: Array.from({ length: cao }, (_, h) => cot.map((c) => c[h] ?? '')),
      },
    };
  }
}

/* ── Đọc chéo Tây Nam: viết cụm theo hàng, đọc chéo ↙ ── */

const tayNam = {
  id: 'taynam',
  name: 'Đọc chéo Tây Nam',
  family: 'doicho',
  moTa: 'Viết các cụm thành bảng theo hàng ngang, đọc chéo từ trên-phải xuống dưới-trái.',
  tuKhoaOTT: ['tay nam', 'gio thoi', 'huong tay', 'cheo', 'mui ten'],

  // Nhiều cụm chữ hoa dài đều nhau là dấu nhận dạng rõ nhất.
  dauHieu: (ct) => {
    const cum = ct.split(/[\s\-_,.]+/).filter(Boolean);
    if (cum.length < 3 || !cum.every((c) => /^[A-Z]+$/.test(c))) return 0.1;
    const dai = cum.map((c) => c.length);
    return Math.max(...dai) === Math.min(...dai) ? 1 : 0.3;
  },

  khaThi: (ct) => ct.split(/[\s\-_,.]+/).filter(Boolean).length >= 3,

  *bienThe(ct) {
    const cum = ct.split(/[\s\-_,.]+/).filter(Boolean);
    if (cum.length < 3) return;
    const rong = Math.max(...cum.map((c) => c.length));

    // Lưới chữ nhật: mỗi cụm là một hàng.
    const luoi = cum.map((c) => c.padEnd(rong, '').split(''));
    const cao = luoi.length;

    // Mọi đường chéo ↙ (tổng chỉ số không đổi) đọc từ trên-phải xuống.
    const docCheo = (huong) => {
      let ra = '';
      for (let tong = 0; tong < cao + rong - 1; tong++) {
        const cots = [];
        for (let h = 0; h < cao; h++) {
          const c = huong < 0 ? tong - h : rong - 1 - (tong - h);
          if (c >= 0 && c < rong) cots.push(luoi[h][c]);
        }
        ra += cots.filter(Boolean).join('');
      }
      return ra;
    };

    const huongTayNam = /tay\s*nam|gio\s*thoi|tay/i.test(ct);
    const cacHuong = huongTayNam ? [-1, 1] : [1, -1];
    for (const [i, h] of cacHuong.entries()) {
      yield {
        nhan: i === 0 ? 'chéo tây nam ↙' : 'chéo đông bắc ↗',
        bv: docCheo(h),
        cach: 'Viết các cụm thành bảng theo hàng, đọc chéo từng đường từ trên-phải xuống dưới-trái.',
      };
    }
  },
};

export const ciphers = { docNguoc, theoCot, duongRao, camRanh, tayNam };
