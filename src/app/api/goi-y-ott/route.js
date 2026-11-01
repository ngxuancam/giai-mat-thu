/**
 * POST /api/goi-y-ott  { ott }  →  { goiY: [{ id, ten, xacSuat, doTin }], moHinh }
 *
 * Trả về xác suất của MỌI loại: trình duyệt còn lọc tiếp theo khuôn dạng bản mã
 * (ui/locGoiYAi.js), nên cần cả những loại không nằm trong top đầu.
 *
 * Chỉ chạy khi người dùng bấm "Hỏi AI về OTT" — việc giải mã vẫn hoàn toàn
 * trên trình duyệt. Thứ duy nhất gửi lên là câu OTT, và nó không được lưu.
 */

import { doanLoai } from '@/server/ottModel';
import { TEN_MO_HINH } from '@/server/moHinh';

export const runtime = 'nodejs';
export const maxDuration = 30;

/** OTT thật hiếm khi quá vài câu; trần này chặn dán nhầm cả văn bản dài. */
const MAX_OTT = 300;

/**
 * Hạn mức đơn giản theo IP, trong bộ nhớ của từng phiên bản hàm: đủ chặn
 * một trình duyệt bấm liên hồi, không nhằm chống tấn công có tổ chức.
 */
const HAN_MUC = { soLan: 20, cuaSoMs: 60_000 };
const lichSu = new Map();

function vuotHanMuc(ip) {
  const gio = Date.now();
  const gan = (lichSu.get(ip) ?? []).filter((t) => gio - t < HAN_MUC.cuaSoMs);
  gan.push(gio);
  lichSu.set(ip, gan);
  if (lichSu.size > 5000) lichSu.clear();
  return gan.length > HAN_MUC.soLan;
}

const loi = (status, thongBao) => Response.json({ thongBao }, { status });

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'khong-ro';
  if (vuotHanMuc(ip)) return loi(429, 'Hỏi nhanh quá — chờ một phút rồi thử lại.');

  let body;
  try {
    body = await request.json();
  } catch {
    return loi(400, 'Yêu cầu không hợp lệ.');
  }

  const ott = typeof body?.ott === 'string' ? body.ott.normalize('NFC').trim() : '';
  if (!ott) return loi(400, 'Chưa có OTT để đoán.');
  if (ott.length > MAX_OTT) return loi(413, `OTT dài quá ${MAX_OTT} ký tự.`);

  try {
    const goiY = await doanLoai(ott, Infinity);
    return Response.json({ goiY, moHinh: TEN_MO_HINH }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[goi-y-ott]', err);
    return loi(503, 'Mô hình AI đang khởi động hoặc gặp lỗi — thử lại sau ít giây.');
  }
}
