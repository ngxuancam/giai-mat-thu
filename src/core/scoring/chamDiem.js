/**
 * Chấm điểm bạch văn: "đáp án nào giống tiếng Việt nhất?"
 *
 * Năm tín hiệu, cộng lại thành thang 0..100:
 *   1. N-gram    (0..40) — mô hình xác suất chữ cái. Tín hiệu chính, có đơn vị.
 *   2. Từ điển   (0..25) — tỉ lệ từ có nghĩa.
 *   3. Âm tiết   (0..10) — cấu trúc phụ âm đầu + vần hợp lệ.
 *   4. Gợi ý OTT (0..10) — OTT có nhắc tới loại mật thư này không.
 *   5. Dấu hiệu  (0..15) — bản mã có đúng khuôn dạng của loại này không.
 *
 * Thiết kế tách rời: mỗi tín hiệu là một hàm thuần, trả 0..1, rồi nhân trọng
 * số. Muốn chỉnh độ nhạy chỉ cần sửa TRONG_SO.
 *
 * Điểm 0..100 chỉ để XẾP HẠNG và hiển thị. Đại lượng dùng để ĐO và ĐÁNH GIÁ là
 * `chungCu` — bằng chứng tính bằng bit, xem nguGram.js và `doTinCay` bên dưới.
 */

import { TU_DIEN, PHU_AM_DAU, VAN } from '../data/tiengviet.js';
import { boDau } from '../types.js';
import { chiSoNguGram, chungCu } from './nguGram.js';
import { goTelex } from './telex.js';

export const TRONG_SO = { nguGram: 40, tuDien: 25, amTiet: 10, ott: 10, dauHieu: 15 };

/**
 * Tách bạch văn thành các "từ" chữ cái thuần, viết thường, bỏ dấu.
 *
 * Gỡ telex trước khi tách: bạch văn mật thư Việt Nam hay viết "HUOWNGS" cho
 * "hướng", mà từ điển chỉ có "huong". Không gỡ thì từ đúng cũng không tra
 * được — xem telex.js.
 */
function tachTu(bv) {
  return boDau(bv.toLowerCase())
    .split(/[^a-z]+/)
    .filter(Boolean)
    // Gỡ telex TỪNG TỪ, không gỡ cả chuỗi: goTelex() bỏ mọi ký tự ngoài A–Z
    // nên nếu gỡ trước khi tách thì các từ dính liền nhau hết.
    .map((t) => goTelex(t).toLowerCase())
    .filter(Boolean);
}

/**
 * Cắt một chuỗi liền không dấu cách thành các từ có nghĩa.
 *
 * Bạch văn mật thư thường viết dính liền (VIDGTHQUANANHX), nên không thể chỉ
 * tách theo khoảng trắng. Dùng quy hoạch động tối đa hoá số ký tự nằm trong
 * từ điển, ưu tiên từ dài.
 *
 * @returns {number} tỉ lệ ký tự thuộc về một từ có nghĩa, 0..1
 */
function phuTuDien(chuoi) {
  const n = chuoi.length;
  if (!n) return 0;

  // Cho điểm theo bình phương độ dài từ: ghép được một từ 5 chữ đáng tin hơn
  // nhiều so với ghép hai từ 2 chữ, vốn dễ xảy ra ngẫu nhiên.
  const loi = (d) => d * d;

  // diem[i] = điểm tốt nhất phủ được chuoi[0..i)
  const diem = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    diem[i] = diem[i - 1]; // bỏ qua ký tự này, không được điểm
    for (let d = 2; d <= Math.min(7, i); d++) {
      if (TU_DIEN.has(chuoi.slice(i - d, i))) {
        diem[i] = Math.max(diem[i], diem[i - d] + loi(d));
      }
    }
  }

  // Chuẩn hoá theo điểm tối đa lý thuyết (toàn chuỗi là một từ dài).
  return Math.min(1, diem[n] / loi(Math.min(n, 7)) / Math.ceil(n / 7));
}

/**
 * 1. Tỉ lệ ký tự thuộc về từ có nghĩa.
 * Xử lý được cả bạch văn có dấu cách lẫn bạch văn viết liền.
 */
export function diemTuDien(bv) {
  const tu = tachTu(bv);
  if (!tu.length) return 0;
  let tong = 0;
  let khop = 0;
  for (const t of tu) {
    tong += t.length;
    // Từ ngắn tra thẳng; chuỗi dài thì cắt bằng quy hoạch động.
    khop += TU_DIEN.has(t) ? t.length : phuTuDien(t) * t.length;
  }
  return tong ? khop / tong : 0;
}

/** Một chuỗi có tách được thành phụ âm đầu + vần hợp lệ không? */
function amTietHopLe(t) {
  const s = t.toUpperCase();
  if (VAN.has(s)) return true; // âm tiết không có phụ âm đầu, ví dụ "AN"
  for (const pa of PHU_AM_DAU) {
    if (s.startsWith(pa) && VAN.has(s.slice(pa.length))) return true;
  }
  return false;
}

/** 2. Tỉ lệ âm tiết có cấu trúc hợp lệ. */
export function diemAmTiet(bv) {
  const tu = tachTu(bv);
  if (!tu.length) return 0;
  const ok = tu.filter(amTietHopLe).length;
  return ok / tu.length;
}

/**
 * 3. Độ giống tiếng Việt theo mô hình n-gram chữ cái.
 *
 * Thay cho phép đo tần suất đơn chữ trước đây: n-gram bao trùm tần suất đơn
 * chữ (bậc unigram là một thành phần nội suy của nó) nhưng còn nắm được trật
 * tự — "NGH", "UONG", "TH" là tiếng Việt, "XQJZ" thì không, dù tần suất đơn
 * chữ có thể trông giống nhau.
 */
export const diemNguGram = chiSoNguGram;

/** 4. OTT có chứa từ khoá gợi ý loại mật thư này không. */
export function diemOTT(ott, cipher) {
  if (!ott) return 0;
  // Loại có khoá đặc trưng (vd. dãy số hoán vị) tự nhận ra OTT của mình.
  let manh = cipher.khopOtt ? cipher.khopOtt(ott) : 0;
  if (!cipher.tuKhoaOTT?.length) return manh;
  const o = boDau(ott.toLowerCase());
  for (const kw of cipher.tuKhoaOTT) {
    if (o.includes(kw)) manh = Math.max(manh, kw.includes(' ') ? 1 : 0.7);
  }
  return manh;
}

/**
 * 5. Độ khớp ĐIỂM NHẬN DẠNG của bản mã.
 *
 * Mỗi loại mật thư có dấu hiệu hình thức riêng — Morse chỉ gồm chấm/gạch,
 * Cam Ranh chia cụm đều nhau, toạ độ chỉ có số 1–5… Loại nào có `dauHieu`
 * khớp với bản mã thì lời giải của nó đáng tin hơn hẳn.
 *
 * Trả 0.5 (trung tính) khi loại đó chưa khai báo `dauHieu`, để không phạt oan.
 */
export function diemDauHieu(banMa, cipher) {
  if (typeof cipher.dauHieu !== 'function') return 0.5;
  try {
    return Math.max(0, Math.min(1, cipher.dauHieu(banMa)));
  } catch {
    return 0.5;
  }
}

/**
 * ĐỘ TIN CẬY — xác suất hậu nghiệm "đây là bạch văn thật", từ 0 đến 1.
 *
 * Quy tắc Bayes dạng log-odds, đơn vị bit:
 *
 *     logOdds = log₂(tiênNghiệm / (1 − tiênNghiệm)) + chungCu(bv)
 *     p       = 1 / (1 + 2^(−logOdds))
 *
 * `chungCu` là log tỉ số hợp lý giữa hai giả thuyết (tiếng Việt / rác), nên
 * cộng thẳng vào log-odds là đúng công thức Bayes, không phải phép chuẩn hoá
 * tuỳ tiện. Tiên nghiệm phản ánh thực tế brute-force: trong hàng nghìn biến
 * thể sinh ra thường chỉ một là bạch văn thật, nên xác suất tiên nghiệm của
 * một ứng viên bất kỳ rất thấp.
 *
 * Giá trị này mới là thứ đáng tin để kết luận "đã giải được chưa". Điểm 0..100
 * chỉ dùng để xếp hạng trong cùng một bản mã.
 *
 * @param {string} bv
 * @param {number} soUngVien Số biến thể đã sinh ra, dùng làm mẫu số tiên nghiệm.
 */
export function doTinCay(bv, soUngVien = 1000) {
  const tienNghiem = 1 / Math.max(2, soUngVien);
  const logOdds = Math.log2(tienNghiem / (1 - tienNghiem)) + chungCu(bv);
  // Chặn biên tránh tràn số với chuỗi rác rất dài.
  if (logOdds > 60) return 1;
  if (logOdds < -60) return 0;
  return 1 / (1 + 2 ** -logOdds);
}

/**
 * Chấm tổng hợp một ứng viên.
 * @returns {{diem: number, bit: number, chiTiet: Record<string, number>}}
 */
export function chamDiem(bv, { ott = '', cipher = {}, banMa = '', goiYAi = null } = {}) {
  const p = {
    nguGram: diemNguGram(bv),
    tuDien: diemTuDien(bv),
    amTiet: diemAmTiet(bv),
    // Gợi ý từ mô hình AI (nếu người dùng bật) đứng ngang hàng với từ khoá:
    // lấy bên nào chắc hơn, không cộng dồn — cả hai cùng đo một điều.
    ott: Math.max(diemOTT(ott, cipher), goiYAi?.[cipher.id] ?? 0),
    dauHieu: diemDauHieu(banMa, cipher),
  };

  /*
   * Phạt lời giải còn nguyên dấu phân cách của bản mã.
   *
   * Bạch văn là câu tiếng Việt, không mang dấu '-' hay '/' ngăn cụm. Khi một
   * "lời giải" vẫn giữ nguyên các dấu đó, nó thường chỉ là bản mã bị xáo nhẹ
   * — và những mẩu 2–3 chữ do dấu cắt ra lại rất dễ trùng từ điển một cách
   * tình cờ. Hạ điểm hai tín hiệu dựa trên việc tách từ để tránh hiểu nhầm.
   */
  const nhieu = (bv.match(/[-/|_.]/g) || []).length;
  if (nhieu >= 2) {
    const phat = Math.max(0.25, 1 - nhieu * 0.15);
    p.tuDien *= phat;
    p.amTiet *= phat;
  }
  /*
   * Bạch văn ngắn thì tín hiệu NGÔN NGỮ ít đáng tin — nhưng phải cẩn thận.
   *
   * Với 4–5 chữ, mọi chuỗi đều có thể tình cờ trông giống tiếng Việt, thống
   * kê chưa đủ mẫu. Lúc đó bằng chứng nằm ở KHUÔN DẠNG BẢN MÃ: bản mã toàn
   * số 1–5 gần như chắc chắn là toạ độ, dù bạch văn ra "ABCDE".
   *
   * Cạm bẫy phải tránh: nếu chỉ hạ trọng số ngôn ngữ cho chuỗi ngắn rồi dồn
   * hết sang `dauHieu`, thì một mẩu 7 chữ vô nghĩa sẽ được điểm cao hơn một
   * bạch văn 35 chữ đọc trôi chảy — vô lý, vì chuỗi dài đọc được MỚI là bằng
   * chứng mạnh. Đã gặp đúng tình huống này với đề "SEN VÀNG".
   *
   * Cách làm đúng: `dauHieu` không bao giờ được vượt quá mức bằng chứng ngôn
   * ngữ cho phép. Lấy `chungCu` (bit, cộng dồn theo độ dài) làm trần — chuỗi
   * dài đọc được thì trần cao, mẩu ngắn vô nghĩa thì trần thấp, bất kể khuôn
   * dạng bản mã khớp đến đâu.
   */
  /*
   * Quyết định "tin ngôn ngữ hay tin khuôn dạng" phải nhìn ĐỘ DÀI BẢN MÃ,
   * không phải độ dài lời giải.
   *
   * Lý do: độ dài lời giải nằm trong tay thuật toán. Loại "ẩn dấu" lấy chữ
   * đầu mỗi cụm sẽ biến bản mã 35 chữ thành mẩu 7 chữ — rồi được hưởng chế
   * độ ưu đãi dành cho chuỗi ngắn, trong khi đáp án thật 35 chữ đọc trôi
   * chảy lại bị chấm theo luật khắt khe hơn. Đã gặp đúng tình huống này.
   *
   * Độ dài bản mã thì khách quan: đề ngắn (Semaphore "12 13 14 15") thì mọi
   * lời giải đều ngắn, không ai phân biệt được bằng ngôn ngữ, nên tin khuôn
   * dạng là hợp lý. Đề dài thì mọi lời giải đều có đủ chất liệu để chấm bằng
   * ngôn ngữ, kể cả lời giải cố tình cắt ngắn.
   */
  const soChu = boDau(bv.toUpperCase()).replace(/[^A-Z]/g, '').length;
  // Không truyền bản mã (chấm một bạch văn rời) thì lấy chính độ dài bạch văn:
  // khi đó không có khuôn dạng nào để tin, phải dựa hẳn vào ngôn ngữ.
  const chuBanMa = banMa
    ? boDau(String(banMa).toUpperCase()).replace(/[^A-Z0-9]/g, '').length
    : soChu;
  // Ngưỡng 12…32 ký tự bản mã, dò bằng `npm run eval` quét lưới tham số.
  const tinNgonNgu = Math.max(0, Math.min(1, (chuBanMa - 12) / 20));

  const nhomNgonNgu =
    p.nguGram * TRONG_SO.nguGram +
    p.tuDien * TRONG_SO.tuDien +
    p.amTiet * TRONG_SO.amTiet;
  const tongNgonNgu = TRONG_SO.nguGram + TRONG_SO.tuDien + TRONG_SO.amTiet;

  /*
   * Trần cho phần thưởng khuôn dạng, suy từ bằng chứng bit.
   *
   * Chỉ áp trần khi bạch văn ĐỦ DÀI để bit có ý nghĩa. Với đáp án 4–5 chữ
   * như "HIKL" (Semaphore) hay "BFST" (phím Nokia), bit luôn quanh 0 dù lời
   * giải hoàn toàn đúng — áp trần ở đó là phạt oan chính đáp án. Những đề
   * này vốn chỉ phân biệt được bằng khuôn dạng bản mã, nên để `dauHieu` tự do.
   *
   * Từ 12 ký tự trở lên thì bit đã đáng tin: 0 bit (ngang rác) → trần 0.5,
   * +18 bit trở lên → trần 1. Khuôn dạng khớp cũng không cứu nổi một lời
   * giải mà chính nội dung của nó nói rằng nó là rác.
   */
  const bit = chungCu(bv);
  const tran = chuBanMa < 12 ? 1 : Math.max(0.15, Math.min(1, 0.5 + bit / 35));

  /*
   * Phạt lời giải VỨT BỚT bản mã.
   *
   * Các tín hiệu ngôn ngữ đều là trung bình trên mỗi chữ, nên chuỗi càng ngắn
   * càng dễ trông đẹp do ăn may — "IHXONAC" (7 chữ lấy từ bản mã 14 chữ) có
   * thể ghi điểm n-gram cao hơn cả "DKSCLUBXINCHAO" là đáp án thật.
   *
   * Nhưng một lời giải đúng phải GIẢI THÍCH ĐƯỢC toàn bộ bản mã. Vứt đi một
   * nửa số ký tự rồi bảo phần còn lại đọc xuôi thì đó là trùng hợp, không
   * phải lời giải. Vì vậy nhân điểm với tỉ lệ ký tự được dùng.
   *
   * Những loại ẩn dấu (lấy chữ đầu mỗi cụm) vốn dĩ vứt bớt thật, nên phạt
   * được làm dịu bằng căn bậc hai thay vì nhân thẳng tỉ lệ: chúng vẫn thắng
   * được nếu phần giữ lại thật sự đọc xuôi, chỉ là không thắng dễ dàng nữa.
   */
  const tyLeDung = chuBanMa > 0 ? Math.min(1, soChu / chuBanMa) : 1;
  const phatNgan = Math.sqrt(tyLeDung);

  const diem =
    nhomNgonNgu * tinNgonNgu * phatNgan +
    // Phần trọng số nhường lại dồn sang dấu hiệu khuôn dạng, nhưng có trần.
    p.dauHieu * tran * (TRONG_SO.dauHieu + tongNgonNgu * (1 - tinNgonNgu)) +
    p.ott * TRONG_SO.ott;

  return {
    diem: Math.round(diem * 10) / 10,
    // Bằng chứng tính bằng bit — đại lượng dùng để đánh giá và so sánh chéo.
    bit: Math.round(bit * 10) / 10,
    chiTiet: {
      nguGram: Math.round(p.nguGram * 100),
      tuDien: Math.round(p.tuDien * 100),
      amTiet: Math.round(p.amTiet * 100),
      ott: Math.round(p.ott * 100),
      dauHieu: Math.round(p.dauHieu * 100),
    },
  };
}
