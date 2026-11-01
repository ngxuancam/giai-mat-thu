/**
 * Hằng số dùng chung cho toàn bộ lõi giải mật thư.
 *
 * Mọi bảng tra cứu, bảng chữ cái và ngưỡng đều khai báo ở đây; module nào cần
 * thì import. Nhờ vậy sửa một bảng là mọi nơi cùng đổi, và không có bản sao
 * lệch nhau nằm rải rác.
 */

/* ── Bảng chữ cái ── */

/** Bảng chữ cái Latin 26 chữ, dùng cho hầu hết mật thư. */
export const ALPHABET_EN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Bảng chữ cái tiếng Việt 29 chữ (có Ă Â Đ Ê Ô Ơ Ư, không có F J W Z).
 * Một số mật thư hướng đạo đánh số theo bảng này thay vì A–Z.
 */
export const ALPHABET_VN = [
  'A', 'Ă', 'Â', 'B', 'C', 'D', 'Đ', 'E', 'Ê', 'G', 'H', 'I', 'K', 'L', 'M',
  'N', 'O', 'Ô', 'Ơ', 'P', 'Q', 'R', 'S', 'T', 'U', 'Ư', 'V', 'X', 'Y',
];

/* ── Bảng tra mật thư ── */

/** Mã Morse quốc tế — lấy nguyên văn từ site cũ (thaythe/morse.html). */
export const MORSE = {
  '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
  '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
  '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
  '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
  '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
  '--..': 'Z', '.----': '1', '..---': '2', '...--': '3', '....-': '4',
  '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9',
  '-----': '0',
};

/** Bàn phím điện thoại cũ, dùng cho mật thư multi-tap. */
export const PHONE_KEYPAD = {
  2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL',
  6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ',
};

/**
 * Lưới Polybius 5×5 — I và J dùng chung một ô.
 * Nền tảng của các mật thư toạ độ hàng–cột.
 */
export const POLYBIUS_5 = [
  ['A', 'B', 'C', 'D', 'E'],
  ['F', 'G', 'H', 'I', 'K'],
  ['L', 'M', 'N', 'O', 'P'],
  ['Q', 'R', 'S', 'T', 'U'],
  ['V', 'W', 'X', 'Y', 'Z'],
];

/**
 * Tám hướng la bàn làm nhãn cột trong mật thư Phương hướng.
 * Lưới thật là 4 hàng × 8 cột, điền A–Z theo hàng (26 ô dùng được).
 * Nguyên văn từ toado/phuonghuong.html.
 */
export const COMPASS = ['Đ', 'T', 'N', 'B', 'ĐN', 'TN', 'ĐB', 'TB'];

/**
 * Bảng semaphore của site cũ (thaythe/thaythesemaphore.html).
 * Lưu ý: bảng này lệch chuẩn quốc tế và thiếu vài chữ — giữ nguyên để
 * giải đúng những đề ra theo site này.
 */
export const SEMAPHORE = {
  1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F', 7: 'G',
  12: 'H', 13: 'I', 14: 'K', 15: 'L', 16: 'M', 17: 'N',
  23: 'O', 24: 'P', 25: 'Q', 26: 'R', 27: 'S',
  34: 'T', 35: 'U', 36: 'Y', 46: 'J', 47: 'V', 56: 'W', 57: 'X', 67: 'Z',
};

/**
 * Hai ma phương bậc 5 mặc định của site cũ (toado/maphuong.html).
 * Ô chứa số 1–25, chữ A–Y điền theo hàng; giải bằng cách tra số → chữ cùng ô.
 */
export const MAGIC_SQUARES = {
  bienThien: [
    [17, 24, 1, 8, 15],
    [23, 5, 7, 14, 16],
    [4, 6, 13, 20, 22],
    [10, 12, 19, 21, 3],
    [11, 18, 25, 2, 9],
  ],
  khoa65: [
    [3, 16, 9, 22, 15],
    [20, 8, 21, 14, 2],
    [7, 25, 13, 1, 19],
    [24, 12, 5, 18, 6],
    [11, 4, 17, 10, 23],
  ],
};

/** Nhãn hàng/cột thường gặp trên lưới toạ độ. */
export const GRID_LABELS = {
  so: ['1', '2', '3', '4', '5'],
  chu: ['A', 'B', 'C', 'D', 'E'],
};

/**
 * Mật thư Chuồng bò (Pigpen) — mỗi chữ là một mảnh lưới, ghi bằng ký hiệu.
 * Khi chép ra giấy người chơi thường dùng các ký tự ASCII dưới đây.
 * Bố cục chuẩn: hai lưới 3×3 (lưới sau có dấu chấm), rồi hai chữ V chéo.
 */
export const PIGPEN = {
  // Lưới 1: A–I, ký hiệu góc vuông không chấm
  '_|': 'A', '|_|': 'B', '|_': 'C',
  '⊐': 'D', '□': 'E', '⊏': 'F',
  '‾|': 'G', '|‾|': 'H', '|‾': 'I',
  // Lưới 2: J–R, cùng hình nhưng có chấm
  '_|.': 'J', '|_|.': 'K', '|_.': 'L',
  '⊐.': 'M', '□.': 'N', '⊏.': 'O',
  '‾|.': 'P', '|‾|.': 'Q', '|‾.': 'R',
  // Chữ V chéo: S–V không chấm, W–Z có chấm
  'v': 'S', '<': 'T', '>': 'U', '^': 'V',
  'v.': 'W', '<.': 'X', '>.': 'Y', '^.': 'Z',
};

/* ── Ngưỡng và giới hạn ── */

/** Số lời giải tối đa trả về cho giao diện. */
export const MAX_RESULTS = 50;

/** Ngưỡng phân hạng điểm, dùng để tô màu trong giao diện. */
export const SCORE_TIERS = { cao: 60, trungBinh: 35 };
