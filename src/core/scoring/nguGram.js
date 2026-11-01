/**
 * Mô hình n-gram chữ cái tiếng Việt — THƯỚC ĐO ĐỊNH LƯỢNG của hệ thống.
 *
 * Mọi tín hiệu khác (từ điển, âm tiết, gợi ý OTT) đều là heuristic: tiện
 * nhưng không có đơn vị, không so sánh được giữa hai bản mã khác nhau.
 * Mô-đun này cung cấp một con số CÓ ĐƠN VỊ và có nền tảng lý thuyết thông tin:
 *
 *     bitTrenChu(bv) = (1/n) · Σ log₂ P(cᵢ | cᵢ₋₂ cᵢ₋₁)
 *
 * tức số bit trung bình cần để mã hoá một chữ cái của chuỗi, dưới mô hình
 * tiếng Việt. Văn bản tiếng Việt thật nén được xuống ~BIT_TIENG_VIET bit/chữ;
 * chuỗi ngẫu nhiên đều cần đúng log₂26 = 4.70 bit/chữ. Khoảng cách giữa hai
 * mốc đó chính là BẰNG CHỨNG, đo bằng bit:
 *
 *     chungCu(bv) = n · (bitTrenChu(bv) − BIT_NGAU_NHIEN)
 *
 * Đây là tỉ số hợp lý (log-likelihood ratio) giữa giả thuyết "đây là tiếng
 * Việt" và giả thuyết "đây là rác ngẫu nhiên". Nó cộng dồn theo độ dài đúng
 * như trực giác: một bạch văn 40 chữ đọc xuôi là bằng chứng mạnh hơn hẳn một
 * bạch văn 8 chữ đọc xuôi. Nhờ có đơn vị bit, hai lời giải của hai bản mã khác
 * nhau vẫn so sánh được với nhau, và nó đổi thẳng ra xác suất hậu nghiệm
 * (xem `doTinCay` trong chamDiem.js).
 *
 * Dữ liệu huấn luyện: chính TU_DIEN. Từ điển được ghép lại thành một văn bản
 * dài theo nhiều bước nhảy khác nhau, nên mô hình học được cả n-gram TRONG từ
 * lẫn n-gram BẮC CẦU giữa hai từ liền nhau — đúng dạng bạch văn mật thư, vốn
 * hay viết dính liền không dấu cách.
 */

import { TU_DIEN } from '../data/tiengviet.js';
import { goTelex } from './telex.js';

const AZ = 'abcdefghijklmnopqrstuvwxyz';
const K = 26;

/** Tra mã ASCII → chỉ số 0..25, -1 nếu không phải chữ cái thường. */
const CHI_SO = new Int8Array(128).fill(-1);
for (let i = 0; i < K; i++) CHI_SO[AZ.charCodeAt(i)] = i;

/** Entropy của nguồn ngẫu nhiên đều trên 26 chữ cái: log₂(1/26). */
export const BIT_NGAU_NHIEN = -Math.log2(K);

/**
 * Dựng văn bản huấn luyện từ từ điển.
 *
 * Ghép toàn bộ từ điển nhiều lượt, mỗi lượt duyệt theo một bước nhảy nguyên tố
 * khác nhau. Mỗi từ vì thế đứng cạnh nhiều từ khác nhau qua các lượt, cho ra
 * phân bố n-gram bắc cầu đa dạng thay vì chỉ một trật tự cố định.
 */
function dungVanBan() {
  const tu = [...TU_DIEN].filter((w) => /^[a-z]{2,}$/.test(w));
  const n = tu.length;
  const buoc = [1, 7, 13, 23, 37, 53];
  const ra = [];
  for (const b of buoc) {
    for (let i = 0; i < n; i++) ra.push(tu[(i * b + b) % n]);
  }
  return ra.join('');
}

/** Trọng số nội suy: trigram, bigram, unigram, phân bố đều. Cộng lại bằng 1. */
const NOI_SUY = [0.62, 0.26, 0.1, 0.02];

/**
 * Bảng log₂ xác suất, đánh chỉ số bằng (a·26 + b)·26 + c.
 * Tính sẵn một lần lúc nạp module: 17 576 ô, vài mili giây.
 */
const LOG_P = (() => {
  const vb = dungVanBan();
  const uni = new Float64Array(K);
  const bi = new Float64Array(K * K);
  const tri = new Float64Array(K * K * K);

  let a = -1;
  let b = -1;
  for (let i = 0; i < vb.length; i++) {
    const c = CHI_SO[vb.charCodeAt(i)];
    if (c < 0) {
      a = b = -1;
      continue;
    }
    uni[c]++;
    if (b >= 0) bi[b * K + c]++;
    if (a >= 0 && b >= 0) tri[(a * K + b) * K + c]++;
    a = b;
    b = c;
  }

  // Tổng biên để chuẩn hoá thành xác suất có điều kiện.
  const tongUni = uni.reduce((s, x) => s + x, 0) || 1;
  const tongBi = new Float64Array(K);
  const tongTri = new Float64Array(K * K);
  for (let x = 0; x < K; x++) {
    for (let y = 0; y < K; y++) {
      tongBi[x] += bi[x * K + y];
      for (let z = 0; z < K; z++) tongTri[x * K + y] += tri[(x * K + y) * K + z];
    }
  }

  const bang = new Float64Array(K * K * K);
  const [l3, l2, l1, l0] = NOI_SUY;
  for (let x = 0; x < K; x++) {
    for (let y = 0; y < K; y++) {
      const dTri = tongTri[x * K + y];
      const dBi = tongBi[y];
      for (let z = 0; z < K; z++) {
        const p =
          l3 * (dTri ? tri[(x * K + y) * K + z] / dTri : 0) +
          l2 * (dBi ? bi[y * K + z] / dBi : 0) +
          l1 * (uni[z] / tongUni) +
          l0 / K;
        bang[(x * K + y) * K + z] = Math.log2(p);
      }
    }
  }
  return bang;
})();

/**
 * Bỏ dấu + lọc về chuỗi chữ cái thường liền mạch.
 * Giữ nguyên hàm cục bộ (không dùng boDau của types.js) để module này độc lập
 * và có thể chạy thẳng trong Worker không cần kéo theo phần còn lại của lõi.
 */
function locChu(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z]/g, '');
}

/** Độ dài tối thiểu để thước đo có ý nghĩa (cần ít nhất một trigram). */
export const TOI_THIEU = 4;

/**
 * Số bit trung bình trên mỗi chữ cái dưới mô hình tiếng Việt.
 * Càng gần 0 càng giống tiếng Việt; BIT_NGAU_NHIEN (−4.70) là mức rác.
 *
 * @returns {number} giá trị âm, thường trong khoảng −4.7 … −1.8
 */
export function bitTrenChu(bv) {
  const s = locChu(bv);
  if (s.length < TOI_THIEU) return BIT_NGAU_NHIEN;
  let tong = 0;
  let dem = 0;
  let a = CHI_SO[s.charCodeAt(0)];
  let b = CHI_SO[s.charCodeAt(1)];
  for (let i = 2; i < s.length; i++) {
    const c = CHI_SO[s.charCodeAt(i)];
    tong += LOG_P[(a * K + b) * K + c];
    dem++;
    a = b;
    b = c;
  }
  return dem ? tong / dem : BIT_NGAU_NHIEN;
}

/**
 * Bit/chữ tốt nhất giữa bản gốc và bản đã gỡ telex.
 *
 * Mật thư Việt Nam rất hay viết bạch văn theo kiểu gõ telex (DDI THEO
 * HUOWNGS = "đi theo hướng"). Mô hình học từ từ điển không dấu nên thấy
 * "DD", "OW", "GS" là bất thường và phạt oan đáp án đúng. Chấm cả hai dạng
 * rồi lấy dạng tốt hơn: bạch văn telex được chấm công bằng, còn chuỗi rác
 * thì gỡ telex cũng vẫn là rác nên không được lợi gì.
 *
 * Xem telex.js để biết vì sao đây là đặc thù bắt buộc phải xử lý.
 */
export function bitTotNhat(bv) {
  const goc = bitTrenChu(bv);
  const go = goTelex(bv);
  // Chỉ xét bản gỡ nếu nó thật sự khác và vẫn đủ dài để thống kê có nghĩa.
  if (go.length < TOI_THIEU || go.length === locChu(bv).length) return goc;
  return Math.max(goc, bitTrenChu(go));
}

/**
 * BẰNG CHỨNG, đo bằng bit: tổng tỉ số hợp lý so với giả thuyết ngẫu nhiên.
 *
 * Diễn giải trực tiếp: "giả thuyết đây là tiếng Việt khả dĩ hơn giả thuyết
 * đây là rác 2^chungCu lần". Dương là nghiêng về tiếng Việt, âm là nghiêng về
 * rác. Khác với điểm 0..100, đại lượng này cộng dồn theo độ dài nên so sánh
 * được giữa các bản mã khác nhau.
 */
export function chungCu(bv) {
  const n = locChu(bv).length;
  if (n < TOI_THIEU) return 0;
  return (bitTotNhat(bv) - BIT_NGAU_NHIEN) * n;
}

/**
 * Mốc bit/chữ của tiếng Việt thật.
 *
 * Đo trên tập giữ lại (10% từ điển không dùng để huấn luyện) bằng
 * `npm run eval`, rồi ghi cứng ở đây. Nếu sửa TU_DIEN, chạy lại bộ đánh giá —
 * nó in ra giá trị mới để cập nhật.
 */
export const BIT_TIENG_VIET = -3.01;

/**
 * Quy bit/chữ về thang 0..1 để trộn với các tín hiệu heuristic khác.
 * 0 = rác hoàn toàn, 1 = giống tiếng Việt như văn bản thật.
 */
export function chiSoNguGram(bv) {
  const b = bitTotNhat(bv);
  const t = (b - BIT_NGAU_NHIEN) / (BIT_TIENG_VIET - BIT_NGAU_NHIEN);
  return t < 0 ? 0 : t > 1 ? 1 : t;
}
