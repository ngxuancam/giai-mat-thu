#!/usr/bin/env node
/**
 * In báo cáo đánh giá ra terminal. Chạy: `npm run eval`
 *
 * Dùng khi đổi trọng số chấm điểm, sửa mô hình n-gram hoặc thêm thuật toán
 * dò khoá — so bảng trước/sau để biết thay đổi là tiến hay lùi.
 */

import { danhGia, docMocTiengViet } from '../src/core/danhGia.js';
import { VI_DU, LOAI_GIAI } from '../src/core/data/vidu.js';
import { BIT_TIENG_VIET, BIT_NGAU_NHIEN } from '../src/core/scoring/nguGram.js';

/** Ví dụ mang tên riêng nhưng giải bằng cipher lõi khác — xem vidu.js. */
const DOI_LOAI = LOAI_GIAI;

const pc = (x) => `${(x * 100).toFixed(1)}%`;

console.log('\n=== MỐC MÔ HÌNH N-GRAM ===');
const moc = docMocTiengViet();
console.log(`  tiếng Việt thật   ${moc.trungBi.toFixed(3)} bit/chữ  (${moc.soCau} câu giữ lại)`);
console.log(`  hằng số đang dùng ${BIT_TIENG_VIET.toFixed(3)} bit/chữ`);
console.log(`  rác ngẫu nhiên    ${BIT_NGAU_NHIEN.toFixed(3)} bit/chữ`);
if (Math.abs(moc.trungBi - BIT_TIENG_VIET) > 0.15) {
  console.log(`  ⚠ lệch > 0.15 — cập nhật BIT_TIENG_VIET = ${moc.trungBi.toFixed(2)} trong nguGram.js`);
}

for (const [nhan, chon] of [
  ['CHẠY CẢ HỆ (không giới hạn loại — sát thực tế người dùng)', () => null],
  ['GIỚI HẠN ĐÚNG LOẠI (đo riêng thuật toán từng cipher)', (d) => DOI_LOAI[d.id] ?? [d.id]],
]) {
  const { dong, tongHop: t } = danhGia(VI_DU, chon);

  console.log(`\n=== ${nhan} ===`);
  console.log(
    `  ${'đề'.padEnd(34)}${'hạng'.padStart(5)}${'biên bit'.padStart(10)}${'biến thể'.padStart(10)}${'ms'.padStart(7)}`
  );
  for (const d of dong) {
    const hang = d.hang || '—';
    const dau = d.top1 ? '✓' : d.timThay ? '·' : '✗';
    console.log(
      `  ${dau} ${d.ten.slice(0, 32).padEnd(32)}${String(hang).padStart(5)}${String(d.bien).padStart(10)}${String(d.soBienThe).padStart(10)}${String(d.ms).padStart(7)}`
    );
  }

  console.log(`  ${'─'.repeat(64)}`);
  console.log(`  top-1 (đúng ngay dòng đầu)   ${pc(t.top1)}`);
  console.log(`  tìm thấy (có trong danh sách) ${pc(t.timThay)}`);
  console.log(`  MRR (nghịch đảo thứ hạng)     ${t.mrr.toFixed(3)}`);
  console.log(`  biên bit trung bình           ${t.bienTrungBi.toFixed(1)}`);
  console.log(`  Brier (hiệu chuẩn, 0 = hoàn hảo) ${t.brier.toFixed(3)}`);
  console.log(`  thời gian trung bình          ${t.msTrungBi.toFixed(0)}ms`);
}

console.log('');
