/**
 * Cách người ra đề hay "nói bóng gió" về từng loại mật thư trong OTT.
 *
 * Từ khoá trong registry (`tuKhoaOTT`) chỉ bắt được OTT nhắc thẳng tên loại.
 * Thực tế OTT thường là một câu thơ, câu đố: "Tít tè tít tè" thay vì "Morse",
 * "Gọi cho mình bằng chiếc di động cũ" thay vì "Nokia". Các câu ở đây là
 * nguyên mẫu ngữ nghĩa cho mô hình AI (xem server/ottModel.js): mô hình so
 * NGHĨA của OTT với từng câu, nên không cần trùng chữ.
 *
 * Thêm câu nào cũng phải là cách ra đề có thật — đây là kiến thức, không
 * phải dữ liệu để ép mô hình thuộc lòng bộ kiểm thử.
 */

import { CIPHERS } from '../registry.js';
import { VI_DU, LOAI_GIAI } from './vidu.js';

export const GOI_Y_OTT = {
  morse: ['tích te tích te', 'dài ngắn ngắn dài', 'chấm và gạch', 'tiếng điện tín', 'tít tè tít tè', 'chim bay tiếng kêu'],
  caesar: ['dời chữ đi vài bước', 'chữ này thay chữ kia cách đều', 'A thành D', 'dịch bảng chữ cái', 'Anh cả đi chăn dê', 'Bò con bằng tuổi dê', 'Leo thang cũng như đang ca', 'Trẻ em như búp trên cành', 'chữ này như chữ kia'],
  atbash: ['soi gương', 'đầu thành cuối, cuối thành đầu bảng chữ', 'A đổi Z', 'lật ngược bảng chữ cái'],
  sothaychu: ['số thứ tự của chữ cái', 'A là một B là hai', 'đếm chữ theo số', 'con số thay lời', 'Bê con bốn cẳng một què', 'Em lên năm', 'Dê mà đi hai chân', 'một phần ít ỏi'],
  sothaychuvn: ['bảng chữ cái tiếng Việt', '29 chữ cái', 'có cả Ă Â Đ Ê Ô Ơ Ư', 'chữ Việt đánh số'],
  phimnokia: ['điện thoại di động', 'nhắn tin', 'bàn phím số', 'bấm phím', 'alô', 'gọi điện'],
  semaphore: ['hai lá cờ', 'phất cờ', 'cờ tay', 'đánh tín hiệu bằng tay', 'góc của cánh tay'],
  tienchu: ['tiến lên vài bước', 'lùi lại', 'bước tới', 'đếm bước mà đi', 'dãy số bước'],
  sohoc: ['cộng thêm', 'trừ bớt', 'phép tính', 'làm toán', 'thêm vào bớt ra'],
  andau: ['chữ đầu mỗi từ', 'người đứng đầu', 'đầu dòng', 'mở đầu', 'chữ cái đầu tiên', 'đứng đầu hàng'],
  khanhhoa: ['Khánh Hoà', 'Nha Trang', 'biển Nha Trang', 'hai dòng chữ đối nhau'],
  polybius: ['hàng trước cột sau', 'toạ độ ô vuông', 'bàn cờ', 'ô số hàng và cột', 'lưới năm nhân năm'],
  maphuong: ['ma phương', 'ô số tổng 65', 'vuông số', 'tổng các hàng bằng nhau'],
  phuonghuong: ['la bàn', 'đông tây nam bắc', 'phương hướng', 'kim chỉ nam', 'theo hướng mà đi'],
  kimtuthap: ['kim tự tháp', 'leo tháp', 'bậc thang', 'lên núi', 'tầng tầng lớp lớp'],
  docnguoc: ['đọc ngược', 'nước chảy về nguồn', 'quay đầu', 'lộn ngược', 'từ cuối lên đầu'],
  theocot: ['viết hàng ngang đọc hàng dọc', 'đọc theo cột', 'xếp thành bảng', 'cây thẳng'],
  duongrao: ['hàng rào', 'răng cưa', 'lên xuống', 'zigzag', 'sóng nhấp nhô', 'lên voi xuống chó', 'chặt đôi thanh sắt', 'đặt đường ray', 'hai đường ray song song'],
  camranh: ['Cam Ranh', 'khoá chia cột', 'chữ khoá xếp cột', 'tuyên ngôn'],
  taynam: ['tây nam', 'gió tây nam', 'đọc chéo', 'mũi tên chéo', 'hướng gió'],
  chuyenvitudo: ['xáo trộn cột', 'đổi chỗ cột', 'mất khoá', 'không có khoá'],
  tienchudokhoa: ['tiến chữ không rõ bước', 'dò bước', 'đoán số bước'],
  khanhhoadobang: ['Khánh Hoà thiếu bảng', 'Nha Trang không đủ chữ'],
  battavet: ['bắt tà vẹt', 'dựng đứng từng nhóm chữ', 'xuống thang máy', 'các tầng lầu', 'tà vẹt đường ray'],
  thutudayso: ['dãy số thứ tự', 'lẻ trước chẵn sau', 'theo thứ tự con số'],
  morseso: ['số lẻ là tè số chẵn là tích', 'N bằng mười hai', 'chẵn lẻ'],
  morseghep: ['ghép hai chữ Morse thành một', 'X bằng NA bằng TU', 'mã dài tách thành mã ngắn'],
  pheptinhchu: ['chữ trừ chữ', 'D trừ A bằng C', 'A cộng một', 'cộng trừ bảng chữ cái'],
  chudunggiua: ['người đứng chính giữa', 'chữ ở giữa hai chữ', 'kẹp ở giữa', 'đứng giữa hai người'],
};

/**
 * Mọi câu nguyên mẫu, mỗi câu gắn với một loại: tên, mô tả, từ khoá, câu
 * gợi ý ở trên và OTT của ví dụ mẫu cùng loại.
 * @returns {{id: string, text: string}[]}
 */
export function nguyenMau() {
  const ra = [];
  for (const c of CIPHERS) {
    const cau = [c.name, c.moTa, ...(c.tuKhoaOTT ?? []), ...(GOI_Y_OTT[c.id] ?? [])];
    for (const v of VI_DU) {
      if (v.ott && (v.id === c.id || LOAI_GIAI[v.id]?.includes(c.id))) cau.push(v.ott);
    }
    for (const text of new Set(cau)) if (text) ra.push({ id: c.id, text });
  }
  return ra;
}
