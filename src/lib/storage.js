/**
 * Lưu phiên làm việc vào localStorage.
 *
 * Người chơi thường mở nhiều tab mật thư rồi đóng trình duyệt giữa chừng, nên
 * toàn bộ đầu vào và tuỳ chọn được ghi lại để mở lại là có ngay.
 *
 * Chỉ lưu ĐẦU VÀO, không lưu kết quả: kết quả tính lại chỉ mất vài mili giây,
 * mà lưu thì tốn chỗ và dễ lệch khi thuật toán thay đổi.
 *
 * ── Ranh giới tin cậy ──────────────────────────────────────────────────────
 * localStorage KHÔNG đáng tin. Nội dung của nó sửa được bằng DevTools, bằng
 * tiện ích mở rộng, hoặc bằng bất kỳ đoạn mã nào từng chạy trên cùng gốc.
 * Vì vậy dữ liệu đọc ra được kiểm tra và cắt gọt như mọi đầu vào từ ngoài:
 * đúng kiểu, đúng giới hạn, bỏ mọi trường lạ.
 *
 * Giới hạn độ dài không phải để làm khó người dùng mà để chặn hai thứ:
 *   - mục bị nhồi hàng megabyte khiến trang treo khi giải (từ chối dịch vụ),
 *   - mảng tab dài vô hạn làm React dựng hàng nghìn thành phần.
 */

const KEY = 'giaimatthu:v1';

/** Trần an toàn — rộng rãi với dùng thật, nhưng chặn dữ liệu bị nhồi. */
const GIOI_HAN = {
  soTab: 50,
  ott: 2000,
  banMa: 20000,
  soLoai: 100,
  idLoai: 40,
};

/** Cắt một chuỗi về đúng kiểu và độ dài; thứ gì không phải chuỗi thành ''. */
const chuoi = (x, max) => (typeof x === 'string' ? x.slice(0, max) : '');

/** Chỉ nhận giá trị nằm trong danh sách cho phép, ngoài ra lấy mặc định. */
const motTrong = (x, cho, macDinh) => (cho.includes(x) ? x : macDinh);

/**
 * Đọc phiên đã lưu.
 * @returns {{tabs: Array, selected: string[], bangChu: string, view: string}|null}
 *   null nếu chưa có, dữ liệu hỏng, hoặc không đúng hình dạng.
 */
export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (!Array.isArray(data?.tabs) || !data.tabs.length) return null;

    return {
      tabs: data.tabs.slice(0, GIOI_HAN.soTab).map((t) => ({
        ott: chuoi(t?.ott, GIOI_HAN.ott),
        banMa: chuoi(t?.banMa, GIOI_HAN.banMa),
      })),
      // Id loại mật thư chỉ gồm chữ thường và số — khớp đúng dạng đặt trong
      // registry. Lọc theo khuôn dạng thay vì tin vào chuỗi đọc được.
      selected: Array.isArray(data.selected)
        ? data.selected
            .filter((s) => typeof s === 'string' && /^[a-z0-9]{1,40}$/.test(s))
            .slice(0, GIOI_HAN.soLoai)
        : [],
      bangChu: motTrong(data.bangChu, ['auto', 'en', 'vn'], 'auto'),
      view: motTrong(data.view, ['grid', 'table'], 'grid'),
    };
  } catch {
    return null; // localStorage bị chặn, hoặc JSON hỏng
  }
}

/** Ghi phiên hiện tại. Bỏ qua lỗi vì đây là tiện ích, không phải chức năng lõi. */
export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* hết dung lượng hoặc chế độ riêng tư — không cản trở việc giải mã */
  }
}

export function clear() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* không sao */
  }
}
