import { describe, it, expect } from 'vitest';
import { locGoiYAi, NGUONG_CHAC } from './locGoiYAi.js';

const goiY = [
  { id: 'morse', ten: 'Morse', xacSuat: 0.5 },
  { id: 'sothaychu', ten: 'Số thay chữ', xacSuat: 0.3 },
  { id: 'docnguoc', ten: 'Đọc ngược', xacSuat: 0.2 },
];

describe('lọc gợi ý AI theo bản mã', () => {
  it('chưa có bản mã thì giữ nguyên thứ tự và xác suất', () => {
    const { goiY: ra, chacChan, soBiLoai } = locGoiYAi(goiY, '');
    expect(ra.map((g) => g.id)).toEqual(['morse', 'sothaychu', 'docnguoc']);
    expect(ra[0].doTin).toBe(1);
    expect(chacChan).toBe(true);
    expect(soBiLoai).toBe(0);
  });

  it('bỏ loại không hợp khuôn dạng và chia lại xác suất', () => {
    // Bản mã toàn chữ số: Morse và đọc ngược không khả thi, chỉ còn số thay chữ.
    const { goiY: ra, chacChan, soBiLoai } = locGoiYAi(goiY, '4 9 22 5');
    expect(ra.map((g) => g.id)).toEqual(['sothaychu']);
    expect(ra[0].xacSuat).toBeCloseTo(1);
    expect(chacChan).toBe(true);
    expect(soBiLoai).toBe(2);
  });

  it('không loại nào khớp thì không làm rỗng danh sách', () => {
    const { goiY: ra } = locGoiYAi([{ id: 'morse', ten: 'Morse', xacSuat: 1 }], '4 9 22 5');
    expect(ra).toHaveLength(1);
  });

  it('dưới ngưỡng thì đánh dấu chưa chắc', () => {
    const deu = [0.3, 0.3, 0.2, 0.2].map((p, i) => ({ id: `x${i}`, ten: `x${i}`, xacSuat: p }));
    expect(deu[0].xacSuat).toBeLessThan(NGUONG_CHAC);
    expect(locGoiYAi(deu, '').chacChan).toBe(false);
  });
});
