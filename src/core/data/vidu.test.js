import { describe, it, expect } from 'vitest';
import { VI_DU } from './vidu.js';
import { giaiMa } from '../giaiMa.js';
import { CIPHERS } from '../registry.js';

// Ví dụ GĐPT thuộc loại mới (id trong vidu.js) nhưng giải bằng cipher lõi đã có:
// taynam/senvang dùng chuyển vị, songchet/bosan dùng họ ẩn dấu mở rộng.
const AN_DAU_MO_RONG = {
  taynam: ['taynam'],
  senvang: ['camranh'],
  songchet: ['andau'],
  bosan: ['andau'],
  docnguocgdpt: ['docnguoc'],
  andausauhe: ['andau'],
};
const chiLoaiCua = (id) => AN_DAU_MO_RONG[id] ?? [id];

describe('thư viện ví dụ', () => {
  it('mỗi ví dụ trỏ tới một loại mật thư có thật', () => {
    const ids = new Set(CIPHERS.map((c) => c.id));
    for (const v of VI_DU) {
      for (const cid of chiLoaiCua(v.id)) {
        expect(ids.has(cid), `${v.id} → ${cid} không có trong sổ đăng ký`).toBe(true);
      }
    }
  });

  it('không có ví dụ trùng loại', () => {
    const ids = VI_DU.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // Đây là kiểm tra quan trọng nhất: ví dụ mẫu phải thật sự giải ra được.
  // Bạch văn so ở dạng không dấu cách vì một số kết quả giữ nguyên cấu trúc cụm.
  it.each(VI_DU.map((v) => [v.ten, v]))('%s — giải ra đúng đáp án', (_ten, v) => {
    const { ketQua } = giaiMa({ ott: v.ott, banMa: v.banMa }, { chiLoai: chiLoaiCua(v.id) });
    const gon = (x) => x.replace(/[^A-Z]/g, '');
    const bv = ketQua.map((r) => gon(r.bv));
    expect(bv, `mong đợi có "${v.dapAn}" trong: ${bv.slice(0, 5).join(' | ')}`).toContain(gon(v.dapAn));
  });
});
