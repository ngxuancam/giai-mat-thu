import { describe, it, expect } from 'vitest';
import { bitTrenChu, chungCu, BIT_NGAU_NHIEN, BIT_TIENG_VIET } from './nguGram.js';
import { goTelex, matDoTelex } from './telex.js';
import { doTinCay } from './chamDiem.js';

describe('mô hình n-gram — thước đo định lượng', () => {
  it('tiếng Việt thật cho bằng chứng dương, chuỗi rác cho bằng chứng âm', () => {
    const that = ['TAP HOP TAI SAN TRUONG', 'DI VE HUONG BAC NGAY MAI'];
    const rac = ['XQJZWFKBVZXQJGWPZKFX', 'ZZZZQQQQWWWWJJJJXXXX'];

    for (const s of that) expect(chungCu(s), `"${s}" phải dương`).toBeGreaterThan(0);
    for (const s of rac) expect(chungCu(s), `"${s}" phải âm`).toBeLessThan(0);
  });

  it('bit/chữ của tiếng Việt nằm giữa mốc ngẫu nhiên và mốc văn bản thật', () => {
    const b = bitTrenChu('TAP HOP TAI SAN TRUONG');
    expect(b).toBeGreaterThan(BIT_NGAU_NHIEN); // khá hơn rác
    expect(b).toBeLessThan(0); // vẫn là log xác suất nên luôn âm
  });

  it('hằng số BIT_TIENG_VIET phải nằm đúng phía so với mốc ngẫu nhiên', () => {
    expect(BIT_TIENG_VIET).toBeGreaterThan(BIT_NGAU_NHIEN);
    expect(BIT_TIENG_VIET).toBeLessThan(0);
  });

  it('bằng chứng cộng dồn theo độ dài — câu dài đáng tin hơn mẩu ngắn', () => {
    const ngan = chungCu('DI VE BAC');
    const dai = chungCu('DI VE BAC DI VE BAC DI VE BAC DI VE BAC');
    expect(dai).toBeGreaterThan(ngan);
  });

  it('chuỗi quá ngắn không cho bằng chứng giả', () => {
    for (const s of ['', 'A', 'AB', 'ABC']) {
      expect(chungCu(s), `"${s}"`).toBe(0);
    }
  });
});

describe('gỡ telex — đặc thù mật thư Việt Nam', () => {
  it('gộp nguyên âm kép và bỏ dấu thanh chắc chắn', () => {
    expect(goTelex('DDI')).toBe('DI');
    expect(goTelex('HUOWNG')).toBe('HUONG');
    expect(goTelex('KHOONG')).toBe('KHONG');
    expect(goTelex('TRAMJ')).toBe('TRAM');
  });

  it('bạch văn telex được chấm công bằng với bạch văn viết thường', () => {
    // Cùng một câu, một bản viết telex, một bản không dấu.
    const telex = chungCu('DDITHEOHUOWNGSNAM');
    const thuong = chungCu('DITHEOHUONGNAM');
    // Telex không được tệ hơn nhiều — trước khi có goTelex nó bị phạt nặng.
    expect(telex).toBeGreaterThan(thuong - 12);
  });

  it('nhận ra mật độ telex', () => {
    expect(matDoTelex('DDITHEOHUOWNGSNAMJ')).toBeGreaterThan(0);
    expect(matDoTelex('TAP HOP TAI SAN TRUONG')).toBe(0);
  });
});

describe('độ tin cậy Bayes', () => {
  it('nằm trong [0, 1]', () => {
    for (const s of ['', 'TAP HOP TAI SAN TRUONG', 'XQJZWFKB']) {
      const p = doTinCay(s, 500);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });

  it('càng nhiều ứng viên thì càng khắt khe — tiên nghiệm loãng đi', () => {
    const s = 'DI VE HUONG BAC NGAY MAI';
    expect(doTinCay(s, 10)).toBeGreaterThan(doTinCay(s, 100000));
  });

  it('chuỗi rác không bao giờ được coi là đáng tin', () => {
    expect(doTinCay('XQJZWFKBVZXQJGWPZKFX', 1000)).toBeLessThan(0.01);
  });
});
