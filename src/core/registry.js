/**
 * Sổ đăng ký mật thư.
 *
 * Mỗi module mật thư tự khai báo theo giao diện `Cipher` trong types.js rồi
 * đăng ký ở đây. Động cơ giải mã chỉ làm việc với sổ này, không biết chi tiết
 * từng loại — thêm mật thư mới chỉ cần thêm một dòng import.
 */

import * as thaythe from './ciphers/thaythe.js';
import * as khanhhoa from './ciphers/khanhhoa.js';
import * as toado from './ciphers/toado.js';
import * as doicho from './ciphers/doicho.js';
import * as doandoi from './ciphers/doandoi.js';
import * as bruteforce from './ciphers/bruteforce.js';

/** @type {import('./types.js').Cipher[]} */
export const CIPHERS = [
  ...Object.values(thaythe.ciphers ?? {}),
  ...Object.values(khanhhoa.ciphers ?? {}),
  ...Object.values(toado.ciphers ?? {}),
  ...Object.values(doicho.ciphers ?? {}),
  ...Object.values(doandoi.ciphers ?? {}),
  // Các loại phải DÒ khoá thay vì đọc khoá từ OTT — tốn thời gian nhất,
  // xếp cuối để những loại giải tức thì hiện lên trước trong chế độ chạy dần.
  ...Object.values(bruteforce.ciphers ?? {}),
];

