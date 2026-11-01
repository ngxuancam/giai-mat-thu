/** Thông tin trang dùng chung cho metadata, JSON-LD, sitemap và llms.txt. */

export const SITE = {
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://matthu.nguyenxuancam.com').replace(/\/$/, ''),
  ten: 'Giải Mật Thư',
  tenDayDu: 'Giải Mật Thư — công cụ giải mật thư hướng đạo tiếng Việt',
  moTa:
    'Dán OTT và bản mã, công cụ thử hơn 20 quy luật mật thư (Morse, Semaphore, Cam Ranh, Khánh Hoà, toạ độ, đọc ngược…), ' +
    'chấm điểm bằng mô hình tiếng Việt và xếp hạng lời giải. Chạy ngay trên trình duyệt, miễn phí.',
  tacGia: { ten: 'Nguyễn Xuân Cảm', url: 'https://nguyenxuancam.com' },
  github: 'https://github.com/ngxuancam/giai-mat-thu',
  locale: 'vi_VN',
};

/** Đường dẫn trang hướng dẫn của một loại mật thư. */
export const duongDanLoai = (id) => `/mat-thu/${id}`;
