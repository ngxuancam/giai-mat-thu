/**
 * Thư viện ví dụ mẫu — mỗi loại mật thư một ví dụ.
 *
 * Dùng để học cách dùng công cụ và để thử nhanh. Mọi ví dụ đều có `dapAn` và
 * được test tự động (vidu.test.js) nên không thể lệch với thuật toán: nếu ai
 * sửa thuật toán mà ví dụ không còn ra đúng đáp án, test sẽ báo ngay.
 *
 * `nguon: 'that'` = lấy từ tài liệu sinh hoạt Đoàn – Đội có đáp án sẵn.
 * `nguon: 'dung'` = tự dựng bằng chính thuật toán, để minh hoạ khuôn dạng.
 */

export const VI_DU = [
  {
    id: 'khanhhoa',
    ten: 'Khánh Hoà',
    ott: 'HOAXUAN BANLINHSOSANGTUONGLAI',
    banMa: 'TUIDENRFOAOANW',
    dapAn: 'VIDGTHQUANANHX',
    nguon: 'that',
  },
  {
    id: 'camranh',
    ten: 'Cam Ranh',
    ott: 'CAM RANH',
    banMa: 'KI - LH - DX - BO - SN - UA - CC',
    dapAn: 'DKSCLUBXINCHAO',
    nguon: 'that',
  },
  {
    id: 'morse',
    ten: 'Morse',
    ott: 'Tích te tích te',
    // Dấu '/' ngăn từ; khoảng trắng chỉ ngăn chữ trong cùng một từ.
    banMa: '-.. .. / ...- . / .... ..- --- -. --. / -... .- -.-.',
    dapAn: 'DI VE HUONG BAC',
    nguon: 'dung',
  },
  {
    id: 'docnguoc',
    ten: 'Đọc ngược',
    ott: 'Nước chảy đá mòn',
    banMa: 'GNOURT NAS IAT POH PAT',
    dapAn: 'TAP HOP TAI SAN TRUONG',
    nguon: 'dung',
  },
  {
    id: 'sothaychu',
    ten: 'Số thay chữ',
    ott: 'A là một',
    banMa: '4 9 22 5 8 21 15 14 7 2 1 3',
    dapAn: 'DIVEHUONGBAC',
    nguon: 'dung',
  },
  {
    id: 'semaphore',
    ten: 'Semaphore (cờ tay)',
    ott: 'Hai lá cờ',
    banMa: '12 13 14 15',
    dapAn: 'HIKL',
    nguon: 'dung',
  },
  {
    id: 'maphuong',
    ten: 'Ma phương',
    ott: 'Ô số tổng 65',
    banMa: '17 24 1 8 15',
    dapAn: 'ABCDE',
    nguon: 'dung',
  },
  {
    id: 'phuonghuong',
    ten: 'Phương hướng',
    ott: 'La bàn chỉ lối',
    banMa: 'Đ1 T1 N1 B1',
    dapAn: 'ABCD',
    nguon: 'dung',
  },
  {
    id: 'polybius',
    ten: 'Bảng hàng - cột',
    ott: 'Hàng trước cột sau',
    banMa: '11 12 13 14 15',
    dapAn: 'ABCDE',
    nguon: 'dung',
  },
  {
    id: 'phimnokia',
    ten: 'Phím Nokia',
    ott: 'Bấm phím điện thoại',
    banMa: '22 333 7777 8',
    dapAn: 'BFST',
    nguon: 'dung',
  },
  {
    id: 'taynam',
    ten: 'Đọc chéo Tây Nam',
    ott: 'Lạ nhĩ! Mùa này gió thổi hướng tây nam',
    banMa: 'NGYAPA - AFIJNE - MHDFEM - ODTUOD - OHSWOF - INRAQA - ADNUNS',
    dapAn: 'NGAYFMAIHOPJDDOANFTHIEEUSNAMOWRDDOANFQUANS',
    nguon: 'that',
  },
  {
    id: 'senvang',
    ten: 'Dời cụm (khóa SEN VÀNG)',
    ott: 'SEN VÀNG',
    banMa: 'HNESH - DUAEM - OSDRW - IOMEJ - EGXTU - DHNDA - TWSNT',
    dapAn: 'DDITHEOHUOWNGSNAMSEXDDEENSTRAMJTHUW',
    nguon: 'that',
  },
  {
    id: 'songchet',
    ten: 'Một sống một chết',
    ott: 'Một sống, một chết',
    banMa: 'N A G E O T A M I D F C T G A M K Q H P O C O X N E G L C B O A S R K V H P O V B Y A V U F S',
    // Bạch văn viết theo kiểu gõ telex: NGOAIF = "ngoài", KHOONG = "không",
    // COS = "có", BAUS = "báu" → "Ngoài ta không có kho báu".
    dapAn: 'NGOAIFTAKHOONGCOSKHOBAUS',
    nguon: 'that',
  },
  {
    id: 'bosan',
    ten: 'Bỏ chữ sân',
    ott: 'Khởi một niệm sân đốt cả rừng công đức',
    banMa: 'THSEOHUAOWANNGSSDDOONAGAGANWPJNGUYHIEEMR',
    dapAn: 'THEOHUOWNGSDDOONGGAWPJNGUYHIEEMR',
    nguon: 'that',
  },
  {
    id: 'docnguocgdpt',
    ten: 'Đọc ngược (Được ngọc)',
    ott: 'Được ngọc',
    banMa: 'ATGNORTJTAAHPFMITSIOOHSMASFAUHCFEEV',
    dapAn: 'VEEFCHUAFSAMSHOOISTIMFPHAATJTRONGTA',
    nguon: 'that',
  },
  {
    id: 'andausauhe',
    ten: 'Ẩn dấu chữ cuối (rau đắng mọc sau hè)',
    ott: 'Còn thương rau đắng mọc sau hè',
    banMa: 'TAT - NGHIR - KHU - KY - NHỀ - THÂN - KẾT - NHANH - TRÔ - CẦN - BÔNG - 135 - 357 - BẬN - TĂ - THĂM - TRANH - CỘ - THI - BILL - CHÍNH - BẮT - TIÊN',
    dapAn: 'TRUYỀNTHÔNG57NĂMHỘILHTN',
    nguon: 'that',
  },
  {
    id: 'andau',
    ten: 'Ẩn dấu (chữ đầu)',
    ott: 'Người đứng đầu',
    banMa: 'DEN NGAY MAI ANH HAY',
    dapAn: 'DNMAH',
    nguon: 'dung',
  },
  // ── Các dạng hay gặp trong sinh hoạt Đoàn – Đội ──
  {
    id: 'battavet',
    ten: 'Bắt tà vẹt',
    ott: 'Bắt tà vẹt',
    banMa: 'KOW-HON-ONG-OHF-NIN-GEG-DEH-DME-UXC-OMH-WOU-COW-JIA-LTB-ARA-MUN-FOJ',
    dapAn: 'KHOONGDDUOWCJLAMFOONHIEEMXMOOITRUOWNGFNGHECHUWABANJ',
    nguon: 'that',
  },
  {
    id: 'morseso',
    ten: 'Morse số chẵn lẻ (N=12)',
    ott: 'N=12',
    banMa: '124606800302340460268001240461012011203645',
    dapAn: 'BI TRIS DUNGX',
    nguon: 'that',
  },
  {
    id: 'morseghep',
    ten: 'Morse ghép (X = NA = TU)',
    ott: 'X = NA = TU',
    banMa: 'II . TM . MT . EE . EO - ES . EE . E . E . IT . IE',
    dapAn: 'HOOIJ HIEEUS',
    nguon: 'that',
  },
  {
    id: 'pheptinhchu',
    ten: 'Chữ trừ chữ (D − A = C)',
    ott: 'D - A = C, R - M = E',
    banMa: 'Z - M, K - J, O - N, Y - E, T - J ; W - C, J - B, Z - E, Y - B',
    dapAn: 'MAATJ THUW',
    nguon: 'that',
  },
  {
    id: 'thutudayso',
    ten: 'Thứ tự theo dãy số',
    ott: '13579 8642',
    banMa: 'AHAMPAMNN',
    dapAn: 'ANHNAMMAP',
    nguon: 'that',
  },
  {
    id: 'chudunggiua',
    ten: 'Chữ đứng giữa',
    ott: 'Tôi yêu người đứng chính giữa tôi',
    banMa: 'SU, GI, NP, PN, MO, HF, TR - MO, GI, ZB, BZ, SU, TR - GI, BZ, HJ - LN, HJ, DF, FD, OM, GE - MO, ZB, LN - CA, BZ, VX, BD, TR',
    dapAn: 'THOONGS NHAATS HAI MIEENF NAM BAWCS',
    nguon: 'that',
  },
  {
    id: 'caesar',
    ten: 'Thay thế dịch chuyển (Trẻ em như búp)',
    // "Trẻ em NHƯ búp" → T như B. Lời giải: dịch 19 trên bảng EN 26.
    ott: 'TRẺ EM NHƯ BÚP TRÊN CÀNH',
    banMa: 'AOPOSCJHWTVAAOHUOWOVKHUHUN',
    dapAn: 'THIHLVCAPMOTTHANHPHODANANG',
    nguon: 'that',
  },
  // Đề sưu tầm từ bình luận sotayhuongdao.com/giaimatthu (xem data/de-suu-tam.json)
  {
    id: 'bonganba',
    ten: 'Dịch chữ (Con bò đứng giữa ngã ba)',
    ott: 'Con bò đứng giữa ngã ba',
    banMa: 'ZGA/LJSA/LJMQWF/LZGFY/NMFY/TMGU/LMGFY/DSA',
    dapAn: 'HOI TRAI TRUYEN THONG VUNG BUOC TUONG LAI',
    nguon: 'that',
  },
  {
    id: 'sohoc',
    ten: 'Số học (Em năm nay 16 tuổi)',
    // "Em" = M = 16, nên mỗi số trừ 3 rồi đổi sang chữ (1=A).
    ott: 'Em năm nay 16 tuổi',
    banMa: '23,12,8,8,19,22//5,24,18,26,6,22//15,8,8,17//7,7,4,17,10,9',
    dapAn: 'TIEEPS BUOWCS LEEN DDANGF',
    nguon: 'that',
  },
];

/**
 * Vài ví dụ mang tên riêng (Sen Vàng, Một sống một chết…) nhưng thực chất
 * giải bằng một quy luật lõi khác. Dùng chung cho script đánh giá và trang
 * hướng dẫn từng loại.
 */
export const LOAI_GIAI = {
  taynam: ['taynam'],
  senvang: ['camranh'],
  songchet: ['andau'],
  bosan: ['andau'],
  docnguocgdpt: ['docnguoc'],
  andausauhe: ['andau'],
  bonganba: ['caesar'],
};
