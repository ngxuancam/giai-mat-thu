/**
 * Động cơ giải mã: thử tất cả, chấm điểm, xếp hạng.
 *
 * Luồng xử lý:
 *   lọc loại khả thi  →  sinh mọi biến thể tham số  →  chấm điểm từng bạch văn
 *   →  gộp trùng  →  sắp xếp giảm dần
 *
 * Hai lối dùng:
 *   - `giaiMa()`     — chạy một mạch, trả kết quả đầy đủ. Dùng cho test và
 *                      cho những đề nhẹ.
 *   - `giaiMaDan()`  — generator, nhả kết quả theo từng loại. Worker dùng lối
 *                      này để đẩy lời giải lên giao diện ngay khi có, không
 *                      bắt người dùng chờ những loại dò khoá chạy xong.
 */

import { chamDiem } from './scoring/chamDiem.js';
import { CIPHERS } from './registry.js';
import { chuanHoa } from './types.js';
import { MAX_RESULTS } from './data/constants.js';

/**
 * @param {Object} input
 * @param {string} input.ott     Khoá / gợi ý. Có thể để trống.
 * @param {string} input.banMa   Bản mã nằm giữa NW và AR.
 * @param {Object} [opt]
 * @param {string[]} [opt.chiLoai] Giới hạn ở các cipher id này.
 * @param {'auto'|'en'|'vn'} [opt.bangChu] Bảng chữ cái ưu tiên. 'auto' thử cả hai.
 * @param {number}   [opt.gioiHan] Số lời giải trả về.
 * @param {Record<string, number>} [opt.goiYAi]
 *        Độ tin 0..1 theo cipher id, do mô hình AI đoán từ OTT. Tuỳ chọn.
 */
export function giaiMa(nhapVao, tuyChon = {}) {
  let cuoi = { ghiChu: ['Chưa có bản mã để giải.'], ketQua: [], thongKe: {} };
  for (const moc of giaiMaDan(nhapVao, tuyChon)) cuoi = moc;
  return cuoi;
}

/**
 * Giải dần — nhả kết quả sau MỖI loại mật thư thay vì chờ xong hết.
 *
 * Lý do cần: các loại phải DÒ khoá (chuyển vị dò thứ tự, tiến chữ vét cạn
 * 11 110 khoá) mất hàng trăm mili giây tới vài giây, trong khi Morse hay đọc
 * ngược xong trong một phần nghìn giây. Chạy một mạch thì người dùng ngồi
 * nhìn màn hình trắng chờ loại chậm nhất, dù lời giải đúng có thể đã có từ
 * loại đầu tiên.
 *
 * Mỗi lần `yield` trả về một ảnh chụp ĐẦY ĐỦ (cùng khuôn dạng với `giaiMa`),
 * đã xếp hạng lại, kèm `xong` cho biết đã duyệt hết chưa. Worker chỉ việc
 * đẩy thẳng ảnh chụp đó lên giao diện.
 *
 * @yields {{ghiChu: string[], ketQua: Array, thongKe: Object, xong: boolean}}
 */
export function* giaiMaDan(
  { ott = '', banMa = '' },
  { chiLoai = null, bangChu = 'auto', gioiHan = MAX_RESULTS, goiYAi = null } = {}
) {
  const t0 = performance.now();
  const ct = chuanHoa(banMa);
  const ghiChu = [];

  if (!ct) {
    yield { ghiChu: ['Chưa có bản mã để giải.'], ketQua: [], thongKe: {}, xong: true };
    return;
  }
  if (!ott.trim()) {
    ghiChu.push('Chưa có OTT — sẽ thử tất cả quy luật và xếp hạng theo điểm.');
  }

  const ungVien = CIPHERS.filter((c) => {
    if (chiLoai?.length && !chiLoai.includes(c.id)) return false;
    try {
      return c.khaThi(ct);
    } catch {
      return false;
    }
  });

  // Gộp các lời giải cho cùng một bạch văn, giữ bản điểm cao nhất.
  const theoBV = new Map();
  let soBienThe = 0;
  let soLoaiXong = 0;

  /** Dựng ảnh chụp kết quả tại thời điểm hiện tại. */
  const anhChup = (xong) => ({
    ghiChu,
    ketQua: [...theoBV.values()].sort((a, b) => b.diem - a.diem).slice(0, gioiHan),
    thongKe: {
      soLoaiThu: ungVien.length,
      soLoaiXong,
      soLoaiTong: CIPHERS.length,
      soBienThe,
      soLoiGiai: theoBV.size,
      thoiGian: Math.round(performance.now() - t0),
    },
    xong,
  });

  for (const c of ungVien) {
    try {
      for (const v of c.bienThe(ct, { ott, bangChu })) {
        soBienThe++;
        const bv = chuanHoa(v?.bv ?? '');
        if (!bv) continue;
        const { diem, bit, chiTiet } = chamDiem(bv, { ott, cipher: c, banMa: ct, goiYAi });
        const cu = theoBV.get(bv);
        if (!cu || diem > cu.diem) {
          theoBV.set(bv, {
            cipherId: c.id,
            cipherName: c.name,
            family: c.family,
            nhan: v.nhan,
            bv,
            cach: v.cach || c.moTa,
            bang: v.bang, // bảng làm việc, nếu loại đó có dựng
            diem,
            bit,
            chiTiet,
          });
        }
      }
    } catch {
      // Một loại lỗi không được làm hỏng cả phiên giải.
    }
    soLoaiXong++;
    yield anhChup(false);
  }

  yield anhChup(true);
}
