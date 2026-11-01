/**
 * Dữ liệu ngôn ngữ tiếng Việt dùng để chấm điểm bạch văn.
 *
 * Bạch văn trong mật thư hầu như luôn viết KHÔNG DẤU (bảng chữ cái mã hoá
 * không có dấu), nên mọi dữ liệu ở đây đều ở dạng không dấu.
 */

/** Phụ âm đầu hợp lệ của âm tiết tiếng Việt, xếp dài trước để khớp tham lam. */
export const PHU_AM_DAU = [
  'NGH', 'NGH',
  'CH', 'GH', 'GI', 'KH', 'NG', 'NH', 'PH', 'QU', 'TH', 'TR',
  'B', 'C', 'D', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'X',
];

/** Vần (phần sau phụ âm đầu) thường gặp, dạng không dấu. */
export const VAN = new Set([
  'A','AC','ACH','AI','AM','AN','ANG','ANH','AO','AP','AT','AU','AY',
  'E','EC','EM','EN','ENG','EO','EP','ET',
  'I','ICH','IA','IEC','IEM','IEN','IENG','IEP','IET','IEU','IM','IN','INH','IP','IT','IU',
  'O','OA','OAC','OACH','OAI','OAM','OAN','OANG','OANH','OAP','OAT','OAY','OC','OI','OM','ON','ONG','OP','OT',
  'U','UA','UAN','UAT','UC','UE','UI','UM','UN','UNG','UOC','UOI','UOM','UON','UONG','UOP','UOT','UP','UT','UY','UYEN','UYET',
  'Y','YEN','YET','YEU',
]);

/**
 * Từ vựng tiếng Việt phổ biến (không dấu), tập trung vào vốn từ hay xuất hiện
 * trong mật thư Đoàn – Đội: mệnh lệnh, phương hướng, địa điểm, sinh hoạt trại.
 * Danh sách cố ý gọn để giữ bundle nhẹ; điểm số vẫn phân biệt tốt vì bạch văn
 * sai thường không khớp được từ nào.
 *
 * KHÔNG chứa từ một chữ cái: một chữ đơn lẻ xuất hiện trong mọi chuỗi ngẫu
 * nhiên nên không phải bằng chứng đây là tiếng Việt, chỉ làm nhiễu điểm.
 */
export const TU_DIEN = new Set(`
ai am an anh ao ap at au ay ba bac bai ban bang banh bao bat bay be ben bep bi bien biet binh bo bon bong bua
buoc buoi but ca cac cach cai cam can cang canh cao cap cat cau cay che chi chia chiec chien chieu chinh cho
choi chon chong chu chua chuan chuc chung chuoi chuong chuyen co coi con cong cot cua cuoc cuoi cuong da dai
dam dan dang danh dao dat dau day de den deo di dia dich diem dien dieu dinh do doan doc doi don dong du dua
duc dung duoc duong em en ga gan gang gao gap gat gay ghe ghi gi gia giai giam gian giang giao giay gio gioi
giu giua go goi gom gon ha hai ham han hang hanh hao hat hay he hen heo hi hien hieu hinh ho hoa hoac hoan
hoang hoc hoi hom hon hong hop hu hua huong huyen ich it ke keo khac khach khai kham khan khang khi khi kho
khoa khoang khoi khong khu kien kiem kip ky la lac lai lam lan lang lanh lao lap lat lau lay le len leo li
lich lien lieu linh lo loai loan loc loi lon long lua luc luon luong luu ly ma mac mach mai mam man mang manh
mao mat mau may me men meo mi mien mieng minh mo moi mon mong mot mua muc mui muoi muon muu my na nam nan nang
nanh nao nap nay ne nen neo net nghe nghi nghia nghiem nghin ngo ngoai ngoi ngon ngu nguoi nguon nguyen nha
nhac nhan nhanh nhat nhau nhe nhieu nho nhom nhu nhung nhung ni nin no noi non nong nua nui nuoc nuoi oi om on
ong pha phai pham phan phap phat phe phi phia phieu phim phong phu phuc phuong qua quan quang quay que qui
quoc quy quyen ra rac rach rai ram ran rang ranh rao rap rat rau ray re ren reo ri rieng ro roi rong rua rui
rung ruoi ruou sa sac sach sai sam san sang sanh sao sap sat sau say se sen si sinh so soc soi son song sot su
sua suc suoi sung suong suy ta tac tach tai tam tan tang tanh tao tap tat tau tay te ten teo thanh thang thao
thap that thau thay the then theo thi thich thiec thien thiet thieu thinh tho thoi thong thu thua thuc thuoc
thuong thuy ti tich tiec tiem tien tieng tiep tiet tieu tim tin tinh to toa toan toc toi tom ton tong tot tra
trach trai tram tran trang tranh trao trat trau tre tren treo tri trieu trinh tro troi trong tru truc trung
truoc truong truyen tu tuan tuc tui tuoi tuong tuy tuyen ua uc ui um un ung uoc uoi uom uon uong ut uy va vac
vach vai vam van vang vanh vao vay ve ven veo vi via viec vien viet vinh vo voi von vong vua vuc vui vung vuon
vuot xa xac xach xam xan xang xanh xao xap xat xau xay xe xem xen xeo xet xi xich xin xinh xo xoa xoi xom xong
xu xua xuat xuc xung xuong xuyen yen yeu chao chau chay chac chan chang chap chat che chem chen cheo chet chi
chia chiu cho choi chot chu chua chuc chum chung chuot chuyen co coc coi com con cong cot cu cua cuc cui cum
cung cuoi cuu da dac dai dam dan dang danh dao dap dat dau day de dem den deo dep det di dich dieu dinh diu do
doc doi don dong dot du dua dui dung duoi duy ga gac gai gam gan gang gao gap gat gau gay ghe ghen ghep ghi
gio giong giu ha hai ham han hang hanh hao hap hat hau hay he hen heo hep het hi hiem hien hieu hinh ho hoa
hoi hom hon hong hop hu hut huy it keo kep ket khap khat khau khe khen kheo khi kho khoa khoe khoi khop khu
kim kin kip ky la lac lai lam lan lang lanh lao lap lat lau lay le len leo lo loc loi lon long lot lua luc lui
lum lung luoc luoi luon luot ly ma mac mach mai mam man mang manh mao mat mau may me mem men meo met mi mia
mien mieng mo moc moi mom mon mot mua muc mui mun muon na nai nam nan nang nanh nao nap nat nau nay ne nem nen
neo nep net nga ngai ngam ngan ngang nganh ngao ngap ngat ngay nghe nghi nghia nghiem ngo ngoc ngoi ngon ngot
ngu nguoi nguyen nha nhac nhai nham nhan nhanh nhat nhau nhe nhen nheo nhi nhieu nho nhoc nhom nhu nhung
nhuong ni nia nin no noc noi nom non nong not nua nui num nuoc nuoi nuot oc oi om on ong op pha phai pham phan
phao phat phe phep phi phia phim phong phu phun phut qua quan quang quat quay que quen queo qui quy ra rac
rach rai ram ran rang ranh rao rap rat rau ray re ren reo ret ri rieng ro roc roi rom ron rong rot rua rui
rung ruoi rut sa sac sach sai sam san sang sanh sao sap sat sau say se sen seo si sinh so soc soi son song sot
su sua suc sui sum sung suoi suot sut ta tac tach tai tam tan tang tanh tao tap tat tau tay te tem ten teo tet
thac thach thai tham than thang thanh thao thap that thau thay the them then theo thep thet thi thich thiec
thiet thieu thinh tho thoc thoi thom thon thong thot thu thua thuc thui thung thuoc thuong ti tia tich tiec
tiem tien tieng tiep tiet tieu tim tin tinh to toa toan toc toi tom ton tong tot tra trac trach trai tram tran
trang tranh trao trat trau tre trem tren treo tret tri trich triu tro troc troi trom tron trong trot tru truc
trung truoc truong trut tu tua tuc tui tum tung tuoi tuoc tuong tut tuy ua uc ui um un ung uoc uoi uon uong up
ut uy va vac vach vai vam van vang vanh vao vay ve ven veo vet vi via viec vien viet vinh vo voc voi von vong
vot vu vua vuc vui vun vung vuon vuot xa xac xach xam xan xang xanh xao xap xat xau xay xe xem xen xeo xep xet
xi xia xich xin xinh xo xoa xoc xoi xom xong xot xu xua xuan xuat xuc xui xung xuong xuyen yen yeu club team
tour vip fan cup game online video web app photo camera
`.trim().split(/\s+/));

/**
 * Tần suất chữ cái tiếng Việt không dấu (%, xấp xỉ từ văn bản phổ thông).
 * Dùng để chấm những bạch văn không tách được thành từ rõ ràng.
 */
export const TAN_SUAT = {
  A: 11.8, B: 1.4, C: 5.6, D: 3.4, E: 3.4, G: 3.9, H: 4.9, I: 6.3,
  K: 1.9, L: 2.9, M: 3.1, N: 11.2, O: 7.4, P: 1.8, Q: 0.5, R: 2.0,
  S: 1.4, T: 7.3, U: 4.6, V: 1.3, X: 0.7, Y: 1.3,
  F: 0.05, J: 0.05, W: 0.05, Z: 0.05,
};
