/**
 * Gỡ telex — đặc thù không thể bỏ qua của mật thư Việt Nam.
 *
 * Bảng chữ cái mã hoá chỉ có A–Z, không có Ă Â Đ Ê Ô Ơ Ư và không có dấu
 * thanh. Nên người ra đề Việt Nam viết bạch văn theo kiểu GÕ TELEX:
 *
 *     đi theo hướng nam  →  DDI THEO HUOWNGS NAM
 *     ngoài ta không có  →  NGOAIF TA KHOONG COS
 *
 * Hệ quả với việc chấm điểm: mô hình n-gram học từ từ điển không dấu sẽ thấy
 * "DD", "OW", "EE", "WJ" là những cặp chữ rất bất thường và PHẠT OAN chính
 * đáp án đúng. Trong bộ đánh giá, các đề có bạch văn telex đều bị đẩy xuống
 * hạng 3 với biên bit âm, dù lời giải hoàn toàn chính xác.
 *
 * Cách xử lý: trước khi chấm, gỡ telex về dạng không dấu thuần — bỏ ký tự
 * đánh dấu, gộp nguyên âm lặp. Bạch văn telex sau khi gỡ trở lại đúng phân
 * bố mà mô hình đã học, nên được chấm công bằng với bạch văn viết thường.
 *
 * Gỡ telex CHỈ dùng khi chấm điểm. Bạch văn hiển thị cho người dùng vẫn giữ
 * nguyên telex — đó mới là lời giải thật của đề.
 */

/** Nguyên âm biến thể: hai chữ giống nhau là dấu mũ, kèm W là móc/trăng. */
const NGUYEN_AM_KEP = /(?:AA|EE|OO|UW|OW|AW|DD)/g;

/**
 * Ký tự đánh dấu thanh điệu, đứng cuối âm tiết telex:
 *   S = sắc, F = huyền, R = hỏi, X = ngã, J = nặng
 *
 * Chỉ J và X gần như chắc chắn là dấu thanh: tiếng Việt không dấu hầu như
 * không có từ nào chứa J, và X đứng CUỐI âm tiết cũng không (X chỉ làm phụ
 * âm đầu: "xa", "xem"). S, F, R thì nhập nhằng — "nhas" có thể là "nhá",
 * nhưng "bas" cũng có thể là phần của một từ khác. Nên xử lý hai mức.
 */
const DAU_CHAC = /[JX]/g;

/**
 * Gỡ telex về chuỗi không dấu thuần.
 *
 * @param {string} s Bạch văn, có thể đang ở dạng telex.
 * @returns {string} chuỗi chỉ còn chữ cái, đã gộp nguyên âm kép và bỏ dấu.
 */
export function goTelex(s) {
  return String(s)
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    // Nguyên âm kép / phụ âm đôi telex → một chữ: DDI → DI, HUOWNG → HUONG
    .replace(NGUYEN_AM_KEP, (m) => m[0])
    // Dấu thanh chắc chắn (J, X) → bỏ
    .replace(DAU_CHAC, '');
}

/**
 * Bạch văn này trông có phải telex không?
 *
 * Dùng để quyết định có chấm bản đã gỡ telex hay không. Đếm số dấu hiệu
 * telex trên mỗi 10 chữ: nguyên âm kép, DD, và J/X nằm cuối cụm.
 *
 * @returns {number} mật độ dấu hiệu telex, 0 = chắc chắn không phải.
 */
export function matDoTelex(s) {
  const ky = String(s).toUpperCase().replace(/[^A-Z]/g, '');
  if (ky.length < 6) return 0;
  const dau = (ky.match(NGUYEN_AM_KEP) || []).length + (ky.match(DAU_CHAC) || []).length;
  return dau / (ky.length / 10);
}
