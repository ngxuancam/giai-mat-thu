/**
 * Dữ liệu cho các trang hướng dẫn từng loại mật thư.
 *
 * Mọi lời giải mẫu trên trang đều do chính bộ giải tính ra lúc dựng trang,
 * không chép tay — nên trang hướng dẫn không thể nói khác thuật toán.
 */

import { cache } from 'react';
import { CIPHERS } from '@/core/registry';
import { FAMILIES } from '@/core/types';
import { VI_DU, LOAI_GIAI } from '@/core/data/vidu';
import { GOI_Y_OTT } from '@/core/data/goiYOtt';
import { giaiMa } from '@/core/giaiMa';

export const NHOM = Object.entries(FAMILIES).map(([id, ten]) => ({
  id,
  ten,
  loai: CIPHERS.filter((c) => c.family === id),
}));

/** Mô tả ngắn của từng nhóm, cho trang tổng hợp. */
export const MO_TA_NHOM = {
  thaythe: 'Mỗi chữ của bạch văn được thay bằng một ký hiệu khác: chấm gạch, con số, chữ cái dời chỗ, góc cờ…',
  toado: 'Mỗi chữ được chỉ ra bằng vị trí của nó trong một bảng: hàng và cột, hướng la bàn, ô của ma phương.',
  doicho: 'Các chữ vẫn là chữ của bạch văn, chỉ bị xáo thứ tự: viết ngược, viết theo cột, đi theo đường rào.',
};

export const timLoai = (id) => CIPHERS.find((c) => c.id === id) ?? null;

/** Ví dụ (kèm lời giải do bộ giải tính) của một loại. */
export const viDuCuaLoai = cache((id) =>
  VI_DU.filter((v) => v.id === id || LOAI_GIAI[v.id]?.includes(id)).map((v) => {
    const { ketQua } = giaiMa({ ott: v.ott, banMa: v.banMa }, { chiLoai: [id], gioiHan: 1 });
    const loiGiai = ketQua[0] ?? null;
    return { ...v, loiGiai };
  })
);

/** Dấu hiệu OTT: từ khoá gốc + cách nói bóng gió, bỏ trùng. */
export const dauHieuOtt = (c) => [...new Set([...(GOI_Y_OTT[c.id] ?? [])])];

/** Các loại cùng nhóm, để gợi ý đọc tiếp. */
export const loaiLienQuan = (c) => CIPHERS.filter((x) => x.family === c.family && x.id !== c.id);
