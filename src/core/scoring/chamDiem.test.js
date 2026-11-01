import { describe, it, expect } from 'vitest';
import { chamDiem } from './chamDiem.js';

const diem = (s, opt) => chamDiem(s, opt).diem;

describe('chamDiem — phân biệt tiếng Việt với chuỗi rác', () => {
  it('câu tiếng Việt thật phải hơn hẳn chuỗi ngẫu nhiên', () => {
    const that = diem('HOP MAT TAI CONG VIEN LUC BAY GIO');
    const rac = diem('XQJZ WFKB VZXQ JGWP ZKFX QJWZ');
    expect(that).toBeGreaterThan(rac + 30);
  });

  it('bạch văn đúng phải hơn bản dịch lệch một bậc', () => {
    const dung = diem('DI VE HUONG BAC');
    const lech = diem('EJ WF IVPOH CBD');
    expect(dung).toBeGreaterThan(lech);
  });

  it('cho điểm cao với mệnh lệnh hướng đạo điển hình', () => {
    expect(diem('TAP HOP TAI SAN TRUONG')).toBeGreaterThan(55);
  });

  it('chuỗi rỗng hoặc quá ngắn không gây lỗi', () => {
    for (const s of ['', '  ', 'A', 'XX']) {
      expect(Number.isFinite(diem(s)), `"${s}" phải cho điểm hữu hạn`).toBe(true);
    }
    // Chuỗi rỗng không có tín hiệu ngôn ngữ nào.
    const { chiTiet } = chamDiem('');
    expect(chiTiet.tuDien).toBe(0);
    expect(chiTiet.amTiet).toBe(0);
  });

  it('một chữ cái đơn lẻ không được coi là từ có nghĩa', () => {
    // 'a', 'i', 'o'… xuất hiện trong mọi chuỗi ngẫu nhiên nên không tính điểm.
    // (Chuỗi dài hơn vẫn có thể ghi điểm nhờ từ hai chữ thật nằm bên trong.)
    expect(chamDiem('A').chiTiet.tuDien).toBe(0);
    expect(chamDiem('E').chiTiet.tuDien).toBe(0);
    expect(chamDiem('Y').chiTiet.tuDien).toBe(0);
  });

  it('OTT khớp từ khoá thì được cộng điểm', () => {
    const cipher = { tuKhoaOTT: ['nuoc chay'] };
    const co = diem('DI VE HUONG BAC', { ott: 'Nước chảy đá mòn', cipher });
    const khong = diem('DI VE HUONG BAC', { ott: 'Câu gì đó khác', cipher });
    expect(co).toBeGreaterThan(khong);
  });

  it('điểm luôn nằm trong thang 0..100', () => {
    for (const s of ['', 'A', 'TAP HOP TAI SAN TRUONG', 'XQJZWFKB', 'AAAAAAAA']) {
      const d = diem(s);
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(100);
    }
  });
});
