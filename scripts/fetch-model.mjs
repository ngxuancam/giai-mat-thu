#!/usr/bin/env node
/**
 * Tải mô hình AI và tính sẵn vector nguyên mẫu. Chạy tự động trước `build`.
 *
 * Vì sao làm lúc build:
 *   - tệp ONNX hơn 100 MB, không đưa vào git được;
 *   - hàm API không phải gọi ra Hugging Face lúc chạy — khởi động lạnh chỉ
 *     còn việc nạp mô hình từ đĩa, và không phụ thuộc mạng ngoài;
 *   - vector của ~200 câu nguyên mẫu tính một lần ở đây, lúc chạy chỉ còn
 *     nhúng đúng một câu OTT.
 */

import fs from 'node:fs';
import { pipeline, env } from '@huggingface/transformers';
import { nguyenMau } from '../src/core/data/goiYOtt.js';
import { TEN_MO_HINH, DTYPE, TIEN_TO, THU_MUC, TEP_NGUYEN_MAU } from '../src/server/moHinh.js';

env.cacheDir = THU_MUC;
env.allowRemoteModels = true;

const t0 = Date.now();
const nhung = await pipeline('feature-extraction', TEN_MO_HINH, { dtype: DTYPE });

const mau = nguyenMau();
const ra = await nhung(
  mau.map((m) => TIEN_TO + m.text),
  { pooling: 'mean', normalize: true }
);
const vec = ra.tolist().map((v) => v.map((x) => Math.round(x * 1e5) / 1e5));

fs.writeFileSync(
  TEP_NGUYEN_MAU,
  JSON.stringify({ moHinh: TEN_MO_HINH, ids: mau.map((m) => m.id), vec })
);
console.log(`[model] ${TEN_MO_HINH}: ${mau.length} nguyên mẫu trong ${Date.now() - t0}ms → ${TEP_NGUYEN_MAU}`);
