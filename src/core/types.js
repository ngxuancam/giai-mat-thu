/**
 * Kiểu dữ liệu chung cho toàn bộ hệ thống giải mật thư.
 *
 * Mọi thuật toán mật thư đều tuân theo cùng một giao diện `Cipher`, nhờ đó
 * bộ brute-force có thể duyệt tất cả loại mà không cần biết chi tiết từng loại.
 *
 * @typedef {Object} Cipher
 * @property {string}   id        Định danh duy nhất, ví dụ 'morse'.
 * @property {string}   name      Tên hiển thị tiếng Việt, ví dụ 'Morse'.
 * @property {string}   family    Nhóm: 'thaythe' | 'toado' | 'doicho'.
 * @property {string}   moTa      Mô tả ngắn nguyên lý, hiện trong phần lời giải.
 * @property {string[]} tuKhoaOTT Từ khoá OTT gợi ý loại này, đã bỏ dấu.
 * @property {(ct: string) => boolean} khaThi
 *           Sàng lọc nhanh: bản mã có đúng khuôn dạng của loại này không.
 *           Trả false để loại bỏ sớm, tiết kiệm thời gian brute-force.
 * @property {(ct: string) => Iterable<Variant>} bienThe
 *           Sinh ra mọi tổ hợp tham số cần thử cho bản mã này.
 *
 * @typedef {Object} Variant
 * @property {string} nhan    Nhãn mô tả tham số, ví dụ 'dịch 3, chiều thuận'.
 * @property {string} bv      Bạch văn thu được.
 * @property {string} [cach]  Lời giải: các bước để ra kết quả này.
 */

/**
 * Một lời giải ứng viên, đã kèm điểm.
 *
 * @typedef {Object} KetQua
 * @property {string} cipherId
 * @property {string} cipherName
 * @property {string} nhan
 * @property {string} bv       Bạch văn.
 * @property {string} cach     Lời giải từng bước.
 * @property {number} diem     Điểm tổng, 0..100. Càng cao càng đáng tin.
 * @property {Object} chiTiet  Điểm thành phần, để hiện thanh phân tích.
 */

export const FAMILIES = {
  thaythe: 'Thay thế',
  toado: 'Toạ độ',
  doicho: 'Đổi chỗ',
};

/** Bỏ dấu tiếng Việt, dùng cho so khớp từ khoá OTT và chuẩn hoá đầu vào. */
export function boDau(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Chuẩn hoá bản mã trước khi giải.
 *
 * Người chơi thường sao chép đề từ Word, Facebook hay ảnh chụp, nên bản mã
 * hay lẫn ký tự "đẹp" mà bàn phím không gõ ra: gạch dài – —, gạch ngang ‐ ‑,
 * nháy cong ' ' " ", khoảng trắng không ngắt, dấu ba chấm …
 * Tất cả được đưa về ký tự ASCII tương đương để phần giải mã chỉ phải xử lý
 * một dạng duy nhất.
 */
export function chuanHoa(s) {
  return String(s)
    .normalize('NFC')
    // mọi biến thể gạch ngang → '-'
    .replace(/[‐-―−﹘﹣－]/g, '-')
    // nháy cong → nháy thẳng
    .replace(/[‘’‛′]/g, "'")
    .replace(/[“”‟″]/g, '"')
    // dấu ba chấm → ba dấu chấm, để Morse không bị hiểu sai
    .replace(/…/g, '...')
    // dấu chấm giữa dòng hay được dùng thay dấu chấm Morse
    .replace(/[·•∙⋅]/g, '.')
    // khoảng trắng đặc biệt (NBSP, en/em space, ideographic…) → khoảng trắng thường
    .replace(/[   -   　]/g, ' ')
    // ký tự rộng-không (zero-width, BOM) → bỏ hẳn
    .replace(/[​-‍﻿]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

