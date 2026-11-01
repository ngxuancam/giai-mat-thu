/**
 * Đoán loại mật thư từ OTT bằng mô hình nhúng câu chạy ngay trong hàm.
 *
 * Cách làm: nhúng OTT thành một vector, so cosine với ~270 câu nguyên mẫu
 * đã tính sẵn lúc build (xem scripts/fetch-model.mjs), mỗi loại lấy câu
 * giống nhất. Không sinh chữ, không gọi dịch vụ ngoài — OTT không rời khỏi
 * hàm của chính trang này.
 *
 * Đo trên 20 câu đố OTT chưa từng thấy: đoán đúng loại ở hạng nhất 17/20,
 * nằm trong top 3 là 19/20; bộ so từ khoá cũ chỉ bắt được 10/20.
 */

import fs from 'node:fs';
import { pipeline, env } from '@huggingface/transformers';
import { CIPHERS } from '@/core/registry';
import { TEN_MO_HINH, DTYPE, TIEN_TO, THU_MUC, TEP_NGUYEN_MAU } from './moHinh.js';

env.localModelPath = THU_MUC;
env.allowRemoteModels = false;
env.cacheDir = THU_MUC;

/**
 * Nhiệt độ softmax. Độ tương đồng của e5 dồn trong khoảng 0,8–0,95 nên chênh
 * 0,03 đã là khác biệt rõ; chia cho 0,02 kéo giãn ra thành xác suất đọc được.
 */
const NHIET_DO = 0.02;

const TEN = Object.fromEntries(CIPHERS.map((c) => [c.id, c.name]));

/** Nạp một lần cho mỗi phiên bản hàm; các yêu cầu sau dùng lại. */
let sanSang = null;
function napMoHinh() {
  sanSang ??= (async () => {
    const { ids, vec } = JSON.parse(fs.readFileSync(TEP_NGUYEN_MAU, 'utf8'));
    const nhung = await pipeline('feature-extraction', TEN_MO_HINH, { dtype: DTYPE });
    return { nhung, ids, vec };
  })().catch((err) => {
    sanSang = null; // lần sau thử nạp lại thay vì hỏng vĩnh viễn
    throw err;
  });
  return sanSang;
}

/**
 * @param {string} ott
 * @param {number} [soLuong] số loại trả về
 * @returns {Promise<{id: string, ten: string, xacSuat: number, doTin: number}[]>}
 *   `xacSuat` cộng lại bằng 1 trên mọi loại; `doTin` = xác suất chia cho
 *   xác suất cao nhất (hạng nhất luôn là 1) — đây là số đưa vào chấm điểm.
 */
export async function doanLoai(ott, soLuong = 5) {
  const { nhung, ids, vec } = await napMoHinh();
  const [q] = (await nhung([TIEN_TO + ott], { pooling: 'mean', normalize: true })).tolist();

  const tot = new Map();
  vec.forEach((v, i) => {
    let s = 0;
    for (let k = 0; k < v.length; k++) s += v[k] * q[k];
    if (s > (tot.get(ids[i]) ?? -1)) tot.set(ids[i], s);
  });

  const cao = Math.max(...tot.values());
  const mu = [...tot].map(([id, s]) => [id, Math.exp((s - cao) / NHIET_DO)]);
  const tong = mu.reduce((a, [, m]) => a + m, 0);
  const dauBang = Math.max(...mu.map(([, m]) => m));

  return mu
    .sort((a, b) => b[1] - a[1])
    .slice(0, soLuong)
    .map(([id, m]) => ({
      id,
      ten: TEN[id] ?? id,
      xacSuat: Math.round((m / tong) * 1000) / 1000,
      doTin: Math.round((m / dauBang) * 1000) / 1000,
    }));
}
