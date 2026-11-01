/**
 * Làm gọn gợi ý AI bằng chính bản mã — chạy trên trình duyệt.
 *
 * Mô hình chỉ đọc OTT, nên nó có thể đoán "Morse" cho một bản mã toàn chữ
 * số. Mỗi loại mật thư đã có `khaThi(bản mã)` để sàng khuôn dạng; loại nào
 * không khả thi thì bỏ khỏi danh sách rồi chia lại xác suất cho các loại
 * còn lại. Bản mã không bao giờ rời khỏi trình duyệt.
 *
 * Khi loại đứng đầu vẫn dưới ngưỡng, gợi ý được hiện ra nhưng KHÔNG đưa vào
 * chấm điểm: một phỏng đoán mơ hồ cộng vào điểm còn tệ hơn không có gì.
 */

import { CIPHERS } from '@/core/registry';
import { chuanHoa } from '@/core/types';

/** Xác suất tối thiểu của loại đứng đầu để coi gợi ý là đáng tin. */
export const NGUONG_CHAC = 0.4;

const SO_HIEN = 5;

/**
 * @param {{id: string, ten: string, xacSuat: number}[]} goiY  toàn bộ loại, xếp giảm dần
 * @param {string} banMa
 * @returns {{goiY: Array, chacChan: boolean, soBiLoai: number}}
 */
export function locGoiYAi(goiY, banMa, ciphers = CIPHERS) {
  if (!goiY?.length) return { goiY: [], chacChan: false, soBiLoai: 0 };

  let con = goiY;
  const ct = chuanHoa(banMa ?? '');
  if (ct) {
    const theoId = new Map(ciphers.map((c) => [c.id, c]));
    const khaThi = goiY.filter((g) => {
      try {
        return theoId.get(g.id)?.khaThi(ct) ?? true;
      } catch {
        return false;
      }
    });
    // Không loại nào khớp khuôn dạng thì giữ nguyên — đừng để danh sách trống.
    if (khaThi.length) con = khaThi;
  }

  const tong = con.reduce((s, g) => s + g.xacSuat, 0) || 1;
  const chuan = con.map((g) => ({ ...g, xacSuat: g.xacSuat / tong }));
  const dau = chuan[0].xacSuat || 1;

  return {
    goiY: chuan.slice(0, SO_HIEN).map((g) => ({ ...g, doTin: g.xacSuat / dau })),
    chacChan: chuan[0].xacSuat >= NGUONG_CHAC,
    soBiLoai: goiY.length - con.length,
  };
}
