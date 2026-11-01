# Giải Mật Thư

**Tài liệu tham khảo cách giải các loại mật thư cơ bản trong kỹ năng Đoàn – Đội**, kèm bộ giải tự động.

Mật thư là phần quen thuộc của sinh hoạt Đoàn TNCS và Đội TNTP: trò chơi lớn, hội trại, đi đường
khám phá. Kho mã này gom các phương pháp giải phổ biến lại một chỗ — mỗi loại có nguyên lý, dấu hiệu
nhận biết qua OTT (ô tìm thấy) và ví dụ có lời giải từng bước — và biến chúng thành một công cụ:
dán OTT và bản mã, công cụ thử mọi quy luật rồi xếp hạng lời giải.

**[matthu.nguyenxuancam.com](https://matthu.nguyenxuancam.com)** · [Các loại mật thư và cách giải](https://matthu.nguyenxuancam.com/mat-thu)

## Các phương pháp giải

Mọi mật thư đều thuộc một trong ba nhóm. Nhìn khuôn dạng bản mã và đọc OTT để đoán nhóm, rồi thử từng
quy luật trong nhóm.

| Nhóm | Ý chính | Các loại có trong bộ giải |
|---|---|---|
| **Thay thế** | Mỗi chữ bạch văn được thay bằng ký hiệu khác | Morse, Morse số chẵn lẻ (N=12), Morse ghép (X = NA = TU), Semaphore, số thay chữ (A=1, bảng Việt 29 chữ), dịch chữ (A=N), gương A↔Z, phím Nokia, tiến chữ, số học cộng/trừ, phép tính chữ cái (D − A = C, (A+n)), ẩn dấu (chữ đầu), Khánh Hoà |
| **Toạ độ** | Mỗi chữ được chỉ bằng vị trí trong một bảng | Bảng hàng – cột, ma phương, phương hướng (la bàn), kim tự tháp |
| **Đổi chỗ** | Giữ nguyên chữ, chỉ xáo thứ tự | Đọc ngược, viết hàng đọc cột, đường rào / đặt đường ray, Cam Ranh (đếm cột dọc theo khoá), bắt tà vẹt / xuống thang máy, thứ tự theo dãy số, đọc chéo Tây Nam, chuyển vị cột dò khoá |

Mỗi loại có trang riêng trên web (`/mat-thu/<loại>`) giải thích nguyên lý và chạy lại ví dụ mẫu bằng
chính bộ giải, nên lời giải trên trang không thể lệch với thuật toán.

### Vài mẹo đọc OTT

- OTT hiếm khi gọi thẳng tên loại: "Tít tè tít tè" là Morse, "Nước chảy đá mòn" là đọc ngược,
  "Chặt đôi thanh sắt để đặt đường ray" là đường rào hai dòng.
- OTT hay giấu khoá trong câu đố: "Bê con bốn cẳng một què" → B = 3, "Anh cả đi chăn dê" → A = D,
  "13579 8642" → lấy chữ theo thứ tự dãy số.
- Chữ có dấu thường được viết kiểu gõ Telex: `DDUOWCJ` = ĐƯỢC, `TRUOWNGF` = TRƯỜNG.
- `AR` đánh dấu hết bản tin; chữ đệm vô nghĩa có thể được thêm vào cho đủ nhóm.

## Bộ giải hoạt động thế nào

- **Giải trên trình duyệt.** Thuật toán nằm ở `src/core/` và chạy trong Web Worker; lời giải hiện dần
  theo từng loại, loại phải dò khoá không chặn loại giải tức thì.
- **Chấm điểm có đơn vị.** Mỗi lời giải có "bằng chứng" tính bằng bit từ mô hình n-gram tiếng Việt,
  cộng từ điển, âm tiết, dấu hiệu khuôn dạng bản mã và gợi ý OTT.
- **AI đọc OTT (tuỳ chọn).** Nút "Hỏi AI về OTT" gửi riêng câu OTT tới `/api/goi-y-ott`, nơi mô hình
  nhúng câu nhỏ [`multilingual-e5-small`](https://huggingface.co/Xenova/multilingual-e5-small) (ONNX,
  lượng tử hoá q8, chạy bằng transformers.js ngay trong hàm) so nghĩa OTT với cách ra đề của từng loại.
  Không gọi dịch vụ AI bên ngoài, OTT không được lưu.
  - Trên 20 câu đố OTT chưa từng thấy: đúng loại ở hạng nhất 17/20, trong top 3 19/20
    (so từ khoá: 10/20).
- **Kiểm chứng.** Mỗi ví dụ trong `src/core/data/vidu.js` có đáp án và được test tự động; `npm run eval`
  in báo cáo xếp hạng trên toàn bộ thư viện ví dụ (hiện 22/22 đúng ở hạng nhất).

## Đóng góp một loại mật thư

1. Viết module theo giao diện `Cipher` trong `src/core/types.js` (`khaThi`, `bienThe`, tuỳ chọn
   `dauHieu`, `khopOtt`) và đăng ký trong `src/core/registry.js`.
2. Thêm cách ra đề thường gặp vào `src/core/data/goiYOtt.js` để AI nhận ra OTT của loại đó.
3. Thêm một ví dụ có đáp án vào `src/core/data/vidu.js` — test sẽ kiểm nó giải ra đúng.

## Chạy

```bash
npm install
npm run model    # tải mô hình AI (~130 MB) vào ./models, chỉ cần một lần
npm run dev      # http://localhost:3000
npm test         # test cho thuật toán và thư viện ví dụ
npm run eval     # báo cáo độ chính xác
npm run build    # tự tải mô hình trước khi build
```

> Trên ổ exFAT, Turbopack không tạo được liên kết thư mục cho gói máy chủ — hãy build trên ổ NTFS
> hoặc để Vercel build.

## Công nghệ

Next.js 16 (App Router), React 19, Tailwind CSS 4, transformers.js + ONNX Runtime, Vitest.
CSP có nonce theo từng yêu cầu, không tải tài nguyên bên ngoài; phông chữ do next/font phục vụ từ
chính trang.

Tác giả: [Nguyễn Xuân Cảm](https://nguyenxuancam.com)

## Giấy phép

[Apache License 2.0](LICENSE) © 2026 Nguyễn Xuân Cảm
