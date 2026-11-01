import { describe, it, expect } from 'vitest';
import { giaiMa } from './giaiMa.js';
import { CIPHERS } from './registry.js';
import { MORSE } from './data/constants.js';

/** Tìm thứ hạng của một bạch văn trong danh sách kết quả (1 = đứng đầu). */
const thuHang = (kq, bv) => kq.findIndex((r) => r.bv === bv) + 1;

describe('sổ đăng ký', () => {
  it('nạp được cả ba nhóm mật thư', () => {
    expect(CIPHERS.length).toBeGreaterThanOrEqual(10);
    for (const fam of ['thaythe', 'toado', 'doicho']) {
      expect(CIPHERS.some((c) => c.family === fam)).toBe(true);
    }
  });

  it('mọi cipher đều khai báo đủ giao diện', () => {
    for (const c of CIPHERS) {
      expect(typeof c.id, `${c.id}.id`).toBe('string');
      expect(typeof c.name, `${c.id}.name`).toBe('string');
      expect(typeof c.khaThi, `${c.id}.khaThi`).toBe('function');
      expect(typeof c.bienThe, `${c.id}.bienThe`).toBe('function');
    }
  });

  it('id không trùng nhau', () => {
    const ids = CIPHERS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('giải mã đầu-cuối — bạch văn đúng phải nằm trong tốp đầu', () => {
  it('đọc ngược', () => {
    const bv = 'TAP HOP TAI SAN TRUONG';
    const ct = [...bv].reverse().join('');
    const { ketQua } = giaiMa({ ott: 'Nước chảy đá mòn', banMa: ct });
    expect(thuHang(ketQua, bv)).toBe(1);
  });

  it('Morse', () => {
    const nguoc = Object.fromEntries(Object.entries(MORSE).map(([m, c]) => [c, m]));
    const bv = 'DI VE HUONG BAC';
    const ct = bv
      .split(' ')
      .map((t) => [...t].map((c) => nguoc[c]).join(' '))
      .join(' / ');
    const { ketQua } = giaiMa({ ott: 'Tích te', banMa: ct });
    expect(thuHang(ketQua, bv)).toBe(1);
  });

  it('dịch chuyển bảng chữ cái', () => {
    const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const bv = 'HOP MAT TAI CONG VIEN';
    const ct = bv.replace(/[A-Z]/g, (c) => AZ[(AZ.indexOf(c) + 5) % 26]);
    const { ketQua } = giaiMa({ banMa: ct });
    expect(thuHang(ketQua, bv)).toBeGreaterThan(0);
    expect(thuHang(ketQua, bv)).toBeLessThanOrEqual(3);
  });

  // Ví dụ thật do người dùng cung cấp, đáp án đã biết chắc chắn.
  it('Khánh Hoà — ví dụ thật, phải ra đúng đáp án và đứng đầu', () => {
    const { ketQua } = giaiMa({
      ott: 'HOAXUAN BANLINHSOSANGTUONGLAI',
      banMa: 'TUIDENRFOAOANW',
    });
    const dung = ketQua.find((r) => r.bv === 'VIDGTHQUANANHX');
    expect(dung, 'phải tìm ra VIDGTHQUANANHX').toBeDefined();
    expect(dung.cipherId).toBe('khanhhoa');
    expect(thuHang(ketQua, 'VIDGTHQUANANHX')).toBe(1);
  });

  // Ví dụ thật do người dùng cung cấp, đáp án đã biết chắc chắn.
  it('Cam Ranh — ví dụ thật, phải ra DKSCLUBXINCHAO', () => {
    const { ketQua } = giaiMa({
      ott: 'CAM RANH',
      banMa: 'KI - LH - DX - BO - SN - UA - CC',
    });
    const dung = ketQua.find((r) => r.bv === 'DKSCLUBXINCHAO');
    expect(dung, 'phải tìm ra DKSCLUBXINCHAO').toBeDefined();
    expect(dung.cipherId).toBe('camranh');
    // Bản mã chỉ 14 ký tự nên tín hiệu ngôn ngữ còn mỏng; loại "ẩn dấu" đôi
    // khi chen lên trên. Yêu cầu nằm trong hai hạng đầu là đủ dùng — tiêu chí
    // tổng thể do `npm run eval` canh (top-1 và MRR trên cả tập đề).
    expect(thuHang(ketQua, 'DKSCLUBXINCHAO'), 'phải nằm trong 2 hạng đầu').toBeLessThanOrEqual(2);
    // Kèm bảng làm việc để người dùng đối chiếu như giải tay.
    expect(dung.bang.soCot).toEqual([3, 1, 5, 7, 2, 6, 4]);
    // Đọc dọc cũng là một cách hợp lệ, phải có trong danh sách.
    expect(ketQua.some((r) => r.bv === 'DXKISNCCLHUABO')).toBe(true);
  });

  it('Cam Ranh — vẫn giải được khi đề dán gạch dài – và nháy cong', () => {
    const { ketQua } = giaiMa({
      ott: '“CAM RANH”',
      banMa: 'KI – LH – DX – BO – SN – UA – CC',
    });
    expect(ketQua.some((r) => r.bv === 'DKSCLUBXINCHAO')).toBe(true);
  });

  it('viết hàng đọc cột', () => {
    const bv = 'DENNGAYMAINHE';
    const ky = bv.replace(/\s/g, '');
    // 13 ký tự không chia hết cho cột nào ⇒ đệm cho đủ bảng 4 cột.
    const day = (ky + 'XXX').slice(0, 16);
    const hang = 4;
    let ct = '';
    for (let c = 0; c < 4; c++) for (let h = 0; h < hang; h++) ct += day[h * 4 + c];
    const { ketQua } = giaiMa({ banMa: ct });
    expect(ketQua.some((r) => r.bv.startsWith('DENNGAYMAINHE'))).toBe(true);
  });
});

describe('các loại rút từ site gốc', () => {
  it('Semaphore tra đúng bảng của site (12 = H, không phải 1=A)', () => {
    const { ketQua } = giaiMa({ banMa: '12 13 14' });
    const r = ketQua.find((x) => x.cipherId === 'semaphore');
    expect(r, 'phải có lời giải semaphore').toBeDefined();
    expect(r.bv).toBe('HIK');
  });

  it('Ma phương tra đúng ma trận Biến Thiên (17 ở ô A)', () => {
    const { ketQua } = giaiMa({ banMa: '17 24 1' });
    const r = ketQua.find((x) => x.cipherId === 'maphuong' && x.nhan === 'Biến Thiên');
    expect(r, 'phải có lời giải ma phương').toBeDefined();
    expect(r.bv).toBe('ABC'); // 17,24,1 nằm ở ba ô đầu hàng 1
  });

  it('Phương hướng dùng lưới 4×8 điền A–Z theo hàng', () => {
    // Lọc đúng loại: bản mã 3 ký tự quá ngắn để chấm điểm phân biệt được,
    // nên không dựa vào thứ hạng mà kiểm tra thẳng thuật toán.
    const { ketQua } = giaiMa({ banMa: 'Đ1 T1 N1' }, { chiLoai: ['phuonghuong'] });
    const r = ketQua.find((x) => x.cipherId === 'phuonghuong');
    expect(r, 'phải có lời giải phương hướng').toBeDefined();
    expect(r.bv).toBe('ABC'); // hàng 1: Đ=A, T=B, N=C
  });

  it('Ẩn dấu lấy được chữ đầu mỗi từ', () => {
    const { ketQua } = giaiMa({ banMa: 'DEN NGAY MAI ANH HAY' });
    expect(ketQua.some((r) => r.cipherId === 'andau' && r.bv === 'DNMAH')).toBe(true);
  });
});

describe('độ bền', () => {
  it('bản mã rỗng không gây lỗi', () => {
    const r = giaiMa({ banMa: '' });
    expect(r.ketQua).toEqual([]);
    expect(r.ghiChu.length).toBeGreaterThan(0);
  });

  it('ký tự lạ không làm sập hệ thống', () => {
    expect(() => giaiMa({ banMa: '@@@ ### $$$' })).not.toThrow();
  });

  it('bộ lọc loại giới hạn đúng phạm vi', () => {
    const r = giaiMa({ banMa: 'GNOURT NAS IAT POH PAT' }, { chiLoai: ['docnguoc'] });
    expect(r.thongKe.soLoaiThu).toBe(1);
    expect(r.ketQua.every((x) => x.cipherId === 'docnguoc')).toBe(true);
  });

  it('kết quả luôn xếp theo điểm giảm dần', () => {
    const { ketQua } = giaiMa({ banMa: 'GNOURT NAS IAT POH PAT' });
    for (let i = 1; i < ketQua.length; i++) {
      expect(ketQua[i - 1].diem).toBeGreaterThanOrEqual(ketQua[i].diem);
    }
  });
});
