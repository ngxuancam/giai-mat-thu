/**
 * Thông số mô hình AI dùng chung cho script build và hàm API.
 *
 * multilingual-e5-small (bản lượng tử hoá q8, ~130 MB): mô hình nhúng câu đa
 * ngữ, hiểu tiếng Việt. Đã so với paraphrase-multilingual-MiniLM-L12-v2 và
 * multilingual-e5-base trên bộ câu đố OTT chưa từng thấy — bản small đúng
 * nhiều nhất mà lại nhẹ nhất.
 */

import path from 'node:path';

export const TEN_MO_HINH = 'Xenova/multilingual-e5-small';
export const DTYPE = 'q8';

/** e5 yêu cầu tiền tố này cho cả câu hỏi lẫn nguyên mẫu khi so khớp đối xứng. */
export const TIEN_TO = 'query: ';

/** Thư mục chứa mô hình đã tải và bảng vector nguyên mẫu (không đưa vào git). */
export const THU_MUC = path.join(process.cwd(), 'models');
export const TEP_NGUYEN_MAU = path.join(THU_MUC, 'nguyen-mau.json');
