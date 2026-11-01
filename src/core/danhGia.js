/**
 * BỘ ĐÁNH GIÁ — đo chất lượng bộ giải bằng số, không bằng cảm tính.
 *
 * Chạy: `npm run eval`
 *
 * Mọi thay đổi ở trọng số chấm điểm, mô hình n-gram hay thuật toán dò khoá
 * đều phải chạy lại bộ này. Nếu các chỉ số tụt, thay đổi đó là bước lùi dù
 * nhìn có vẻ hợp lý — đây là lưới an toàn chống việc "sửa cho đúng một đề
 * rồi làm hỏng mười đề khác".
 *
 * BỐN CHỈ SỐ, mỗi cái trả lời một câu hỏi khác nhau:
 *
 *   1. TOP-1 — "Bao nhiêu phần trăm đề giải đúng ngay dòng đầu?"
 *      Chỉ số sát thực tế nhất: người dùng nhìn dòng đầu trước.
 *
 *   2. MRR (nghịch đảo thứ hạng trung bình) — "Nếu không đúng dòng đầu thì
 *      phải kéo xuống bao xa?" Đáp án hạng 1 được 1 điểm, hạng 2 được 1/2,
 *      hạng 5 được 1/5. Nhạy hơn top-1: cải thiện từ hạng 9 lên hạng 3 vẫn
 *      được ghi nhận, trong khi top-1 không thấy gì.
 *
 *   3. BIÊN BIT — "Đáp án đúng vượt ứng viên nhì bao nhiêu bit bằng chứng?"
 *      Biên dương lớn nghĩa là mô hình tách bạch, không phải ăn may. Biên
 *      âm nghĩa là có ứng viên sai trông thuyết phục hơn đáp án thật.
 *
 *   4. HIỆU CHUẨN — "Độ tin cậy công bố có khớp tần suất đúng thật không?"
 *      Khi hệ nói 90% thì phải đúng khoảng 9/10 lần. Đo bằng điểm Brier
 *      (sai số bình phương trung bình giữa độ tin cậy và kết quả thật);
 *      càng gần 0 càng tốt, 0.25 là mức đoán mò.
 */

import { giaiMa } from './giaiMa.js';
import { VI_DU } from './data/vidu.js';
import { chungCu, bitTrenChu } from './scoring/nguGram.js';
import { doTinCay } from './scoring/chamDiem.js';
import { TU_DIEN } from './data/tiengviet.js';

/** So sánh bạch văn bỏ qua dấu cách và ký tự phụ. */
const gon = (s) => String(s).toUpperCase().replace(/[^A-Z]/g, '');

/**
 * Đánh giá trên một đề có đáp án biết trước.
 *
 * @param {{ott: string, banMa: string, dapAn: string}} de
 * @param {string[]} [chiLoai] Giới hạn loại, để tách bạch lỗi xếp hạng với
 *   lỗi thuật toán: không giới hạn = đo cả hệ, có giới hạn = đo riêng cipher.
 */
export function danhGiaMot(de, chiLoai = null) {
  const t0 = Date.now();
  const { ketQua, thongKe } = giaiMa(de, { chiLoai, gioiHan: 200 });
  const dung = gon(de.dapAn);

  const hang = ketQua.findIndex((r) => gon(r.bv) === dung) + 1; // 0 = không tìm thấy
  const bitDung = chungCu(dung);

  // Biên: đáp án đúng hơn ứng viên tốt nhất KHÁC nó bao nhiêu bit.
  const khac = ketQua.filter((r) => gon(r.bv) !== dung);
  const bitNhi = khac.length ? Math.max(...khac.map((r) => chungCu(r.bv))) : -Infinity;
  const bien = Number.isFinite(bitNhi) ? bitDung - bitNhi : bitDung;

  return {
    ten: de.ten ?? de.id,
    hang,
    timThay: hang > 0,
    top1: hang === 1,
    nghichDao: hang > 0 ? 1 / hang : 0,
    bien: Math.round(bien * 10) / 10,
    tinCay: ketQua[0] ? doTinCay(ketQua[0].bv, thongKe.soBienThe) : 0,
    dungODau: ketQua[0] ? gon(ketQua[0].bv) === dung : false,
    soBienThe: thongKe.soBienThe,
    ms: Date.now() - t0,
  };
}

/**
 * Chạy toàn bộ tập đề và tổng hợp chỉ số.
 *
 * @param {Array} tapDe Danh sách đề có `dapAn`.
 * @param {(de) => string[]|null} [chonLoai] Hàm trả về giới hạn loại cho mỗi đề.
 */
export function danhGia(tapDe = VI_DU, chonLoai = () => null) {
  const dong = tapDe.filter((d) => d.dapAn).map((d) => danhGiaMot(d, chonLoai(d)));
  const n = dong.length || 1;

  // Điểm Brier: trung bình (độ tin cậy công bố − kết quả thật)².
  const brier = dong.reduce((s, d) => s + (d.tinCay - (d.dungODau ? 1 : 0)) ** 2, 0) / n;

  return {
    dong,
    tongHop: {
      soDe: dong.length,
      top1: dong.filter((d) => d.top1).length / n,
      timThay: dong.filter((d) => d.timThay).length / n,
      mrr: dong.reduce((s, d) => s + d.nghichDao, 0) / n,
      bienTrungBi: dong.reduce((s, d) => s + d.bien, 0) / n,
      brier,
      msTrungBi: dong.reduce((s, d) => s + d.ms, 0) / n,
    },
  };
}

/**
 * Đo mốc bit/chữ của tiếng Việt thật trên TẬP GIỮ LẠI.
 *
 * Mô hình n-gram huấn luyện trên TU_DIEN, nên đo lại trên chính từ điển đó sẽ
 * cho con số đẹp giả tạo. Ở đây lấy mỗi từ thứ 10 làm tập kiểm tra và ghép
 * thành câu — đủ để biết mốc thật, dù không hoàn toàn độc lập (mô hình vẫn
 * thấy các từ này lúc huấn luyện). Con số này dùng để cập nhật BIT_TIENG_VIET
 * trong nguGram.js.
 */
export function docMocTiengViet() {
  const tu = [...TU_DIEN].filter((w) => /^[a-z]{3,}$/.test(w));
  const giuLai = tu.filter((_, i) => i % 10 === 0);
  const cau = [];
  for (let i = 0; i < giuLai.length; i += 6) cau.push(giuLai.slice(i, i + 6).join(''));
  const bit = cau.map(bitTrenChu);
  return {
    soCau: cau.length,
    trungBi: bit.reduce((s, x) => s + x, 0) / (bit.length || 1),
    xauNhat: Math.max(...bit),
    totNhat: Math.min(...bit),
  };
}
