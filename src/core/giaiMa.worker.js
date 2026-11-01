/**
 * Worker giải mã — giữ giao diện luôn mượt.
 *
 * Việc giải chạy trên luồng riêng, nên dù loại nào đó phải vét 11 110 khoá
 * hay dò hoán vị cột thì ô nhập, nút bấm và cuộn trang vẫn phản hồi bình
 * thường. Kết quả được đẩy về theo từng đợt: loại nào xong trước hiện trước.
 *
 * Giao thức:
 *   gửi vào   { id, ott, banMa, chiLoai, bangChu }
 *   gửi về    { id, loai: 'tien'|'xong'|'loi', ... }
 *
 * `id` để khớp phản hồi với yêu cầu: người dùng gõ tiếp hoặc đổi tab trong
 * lúc đang giải thì kết quả cũ phải bị bỏ qua, không được ghi đè lên màn hình.
 */

import { giaiMaDan } from './giaiMa.js';

/** Khoảng thời gian tối thiểu giữa hai lần đẩy, tính bằng mili giây. */
const NHIP_DAY = 80;

/**
 * Trần độ dài bản mã.
 *
 * Các thuật toán dò khoá có chi phí tăng nhanh theo độ dài — dò thứ tự cột
 * gọi mô hình n-gram trên mọi cặp cột, vét khoá tiến chữ chạy 11 110 khoá
 * trên toàn bộ bản mã. Dán vào một tệp vài megabyte sẽ treo luồng worker và
 * ngốn hết bộ nhớ tab.
 *
 * 20 000 ký tự là rộng gấp nhiều lần mọi mật thư thật (đề dài nhất trong thư
 * viện ví dụ chưa tới 100 ký tự), nhưng đủ để chặn trường hợp dán nhầm.
 */
const MAX_BAN_MA = 20000;
const MAX_OTT = 2000;

/**
 * Gợi ý AI đến từ mạng nên được lọc như mọi đầu vào ngoài: chỉ giữ cặp
 * id hợp lệ → số trong khoảng 0..1.
 */
const locGoiYAi = (x) => {
  if (!x || typeof x !== 'object') return null;
  const ra = {};
  for (const [k, v] of Object.entries(x).slice(0, 100)) {
    if (/^[a-z0-9]{1,40}$/.test(k) && typeof v === 'number' && v >= 0 && v <= 1) ra[k] = v;
  }
  return ra;
};

self.onmessage = (e) => {
  const { id, ott = '', banMa = '', chiLoai = null, bangChu = 'auto', goiYAi = null } = e.data ?? {};

  try {
    if (String(banMa).length > MAX_BAN_MA) {
      self.postMessage({
        id,
        loai: 'loi',
        thongBao: `Bản mã dài quá ${MAX_BAN_MA.toLocaleString('vi-VN')} ký tự — hãy cắt bớt phần không thuộc mật thư.`,
      });
      return;
    }
    let lanDay = 0;

    for (const moc of giaiMaDan(
      { ott: String(ott).slice(0, MAX_OTT), banMa: String(banMa) },
      { chiLoai, bangChu, goiYAi: locGoiYAi(goiYAi) }
    )) {
      const gio = Date.now();

      /*
       * Gộp nhịp: với đề nhẹ, mọi loại xong trong vài mili giây và việc gửi
       * 15 thông điệp liên tiếp chỉ khiến giao diện vẽ lại 15 lần vô ích.
       * Chỉ đẩy khi đã qua NHIP_DAY, hoặc khi đã giải xong hẳn.
       */
      if (!moc.xong && gio - lanDay < NHIP_DAY) continue;
      lanDay = gio;

      self.postMessage({ id, loai: moc.xong ? 'xong' : 'tien', ...moc });
    }
  } catch (err) {
    // Lỗi phải báo về, nếu không giao diện sẽ quay mãi không biết đã hỏng.
    self.postMessage({ id, loai: 'loi', thongBao: String(err?.message ?? err) });
  }
};
