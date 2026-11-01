# Giải Mật Thư

**Công cụ giải mật thư hướng đạo tiếng Việt** — dán OTT và bản mã, bộ giải thử hơn 20 quy luật
(Morse, Semaphore, Cam Ranh, Khánh Hoà, toạ độ, đọc ngược…), chấm điểm bằng mô hình tiếng Việt và
xếp hạng lời giải. Có thêm một mô hình AI nhỏ chạy ngay trong hàm Vercel để đọc hiểu câu OTT.

**[matthu.nguyenxuancam.com](https://matthu.nguyenxuancam.com)**

## Điểm chính

- **Giải trên trình duyệt.** Toàn bộ thuật toán nằm ở `src/core/` và chạy trong Web Worker; kết quả
  hiện dần theo từng loại, loại dò khoá chậm không chặn loại nhanh.
- **Chấm điểm có đơn vị.** Mỗi lời giải có "bằng chứng" tính bằng bit từ mô hình n-gram tiếng Việt,
  cộng từ điển, âm tiết, dấu hiệu khuôn dạng và gợi ý OTT.
- **AI đọc OTT (tuỳ chọn).** Nút "Hỏi AI về OTT" gửi riêng câu OTT tới `/api/goi-y-ott`. Ở đó
  [`multilingual-e5-small`](https://huggingface.co/Xenova/multilingual-e5-small) (ONNX, lượng tử hoá q8,
  chạy bằng transformers.js) so nghĩa OTT với cách ra đề của từng loại và trả về xác suất. Không gọi
  dịch vụ AI bên ngoài, OTT không được lưu.
  - Trên 20 câu đố OTT chưa từng thấy: đúng loại ở hạng nhất **17/20**, trong top 3 **19/20**
    (so từ khoá cũ: 10/20).
  - Mô hình được tải lúc build (`scripts/fetch-model.mjs`), vector nguyên mẫu tính sẵn; lúc chạy chỉ
    nhúng một câu (~20 ms sau khi hàm đã ấm).
- **SEO.** Mỗi loại mật thư có trang hướng dẫn riêng (`/mat-thu/[id]`) với lời giải mẫu do chính bộ
  giải tính ra, JSON-LD (WebApplication, FAQPage, TechArticle, BreadcrumbList), sitemap, robots
  mời trợ lý AI, `/llms.txt` và ảnh OG.
- **Bảo mật.** CSP với nonce mới cho mỗi yêu cầu (`src/proxy.js`), không tải tài nguyên bên ngoài —
  phông chữ được next/font phục vụ từ chính trang.

## Cấu trúc

```
src/
  app/            trang (App Router), API AI, sitemap, robots, llms.txt, ảnh OG
  core/           thuật toán giải mã + chấm điểm (thuần JS, có test)
    data/goiYOtt  cách ra đề của từng loại — nguyên mẫu cho mô hình AI
  server/         nạp mô hình và đoán loại từ OTT
  ui/             giao diện "sổ tay dã ngoại": bộ giải, kết quả, bộ lọc
  lib/            dữ liệu trang, JSON-LD, lưu phiên
scripts/          tải mô hình, báo cáo đánh giá
```

## Chạy

```bash
npm install
npm run model    # tải mô hình AI (~130 MB) vào ./models, chỉ cần một lần
npm run dev      # http://localhost:3000
npm test         # 75+ test cho thuật toán
npm run eval     # báo cáo độ chính xác trên thư viện ví dụ
npm run build    # tự tải mô hình trước khi build
```

> Trên ổ exFAT, Turbopack không tạo được liên kết thư mục cho gói máy chủ — hãy build trên NTFS
> hoặc để Vercel build.

Tác giả: [Nguyễn Xuân Cảm](https://nguyenxuancam.com)
