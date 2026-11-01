import { describe, it, expect } from 'vitest';
import { phanTich } from './BulkImport.jsx';

describe('phanTich — bóc tách danh sách mật thư dán vào', () => {
  it('dạng dòng có dấu gạch đứng', () => {
    const r = phanTich('HOAXUAN BANLINH | TUIDENRFOAOANW\nNước chảy | GNOURT NAS');
    expect(r).toEqual([
      { ott: 'HOAXUAN BANLINH', banMa: 'TUIDENRFOAOANW' },
      { ott: 'Nước chảy', banMa: 'GNOURT NAS' },
    ]);
  });

  it('dòng không có OTT thì ott rỗng', () => {
    expect(phanTich('| 12 13 14')).toEqual([{ ott: '', banMa: '12 13 14' }]);
    expect(phanTich('ABCDEF')).toEqual([{ ott: '', banMa: 'ABCDEF' }]);
  });

  it('dạng khối OTT / NW … AR', () => {
    const r = phanTich('OTT: Nước chảy đá mòn\nNW ABC DEF AR\n\nOTT: Tích te\nNW ... --- AR');
    expect(r).toEqual([
      { ott: 'Nước chảy đá mòn', banMa: 'ABC DEF' },
      { ott: 'Tích te', banMa: '... ---' },
    ]);
  });

  it('bỏ qua dòng trống và mục không có bản mã', () => {
    expect(phanTich('\n\nABC\n\n  \n')).toEqual([{ ott: '', banMa: 'ABC' }]);
    expect(phanTich('')).toEqual([]);
    expect(phanTich('   ')).toEqual([]);
  });
});
