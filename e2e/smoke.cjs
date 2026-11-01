/**
 * Kiểm thử đầu-cuối trên trình duyệt thật.
 *
 * Chạy:  npm run build && npm start (cửa sổ khác) && npm run e2e
 * Ảnh chụp lưu ở e2e/.out/ (đã bị .gitignore bỏ qua).
 *
 * Kiểm: giải đúng ví dụ Khánh Hoà, đủ hai kiểu hiển thị, bộ lọc theo nhóm,
 * ngăn kéo trên mobile, và không có lỗi console.
 */

const { chromium } = require('playwright');
const path = require('node:path');

const URL = process.env.E2E_URL || 'http://127.0.0.1:3000/';
const OUT = path.join(__dirname, '.out');
const shot = (name) => path.join(OUT, name);

const DAP_AN = 'VIDGTHQUANANHX';
/**
 * Chờ bộ giải hiện ra và đã gắn vào trình duyệt (trang dựng sẵn trên máy chủ,
 * nút chỉ bấm được sau khi React nhận trang). Dùng sau mọi lần goto/reload.
 */
async function choBoGiai(page) {
  await page.waitForSelector('#banma', { timeout: 15000 });
  await page.waitForFunction(() => document.querySelector('#bo-giai') && window.__NEXT_HYDRATED__ !== false, null, { timeout: 15000 });
  await page.waitForTimeout(300);
}

let failed = 0;
function check(label, actual, expected) {
  const ok = expected === undefined ? !!actual : actual === expected;
  if (!ok) failed++;
  const detail = expected === undefined ? actual : `${actual} (mong đợi ${expected})`;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: ${detail}`);
}

(async () => {
  const browser = await chromium.launch();
  const errors = [];

  // ── Desktop ──
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1150 } });
  const d = await ctx.newPage();
  d.on('console', (m) => m.type() === 'error' && errors.push('desktop: ' + m.text()));
  d.on('pageerror', (e) => errors.push('desktop pageerror: ' + e.message));

  await d.goto(URL, { waitUntil: 'networkidle' });
  await choBoGiai(d);
  check('cổng mật khẩu mở được', (await d.locator('#banma').count()) === 1, true);
  await d.evaluate(() => localStorage.clear());
  await d.reload({ waitUntil: 'networkidle' });
  await choBoGiai(d);
  // Nút "Ví dụ" nằm trong tab đã giải, không phải nút ví dụ mẫu.
  await d.locator('main button:has-text("Ví dụ")').first().click();
  await d.waitForSelector('article', { timeout: 5000 });

  check('đáp án Khánh Hoà đứng đầu', (await d.locator('article').first().innerText()).includes(DAP_AN), true);
  check('sidebar hiện trên desktop', await d.locator('aside').isVisible(), true);
  await d.screenshot({ path: shot('desktop-grid.png') });

  await d.click('button:has-text("Bảng")');
  await d.waitForSelector('table', { timeout: 3000 });
  check('bảng có dòng', (await d.locator('tbody tr').count()) > 0, true);
  check('dòng đầu là đáp án', (await d.locator('tbody tr').first().innerText()).includes(DAP_AN), true);
  await d.screenshot({ path: shot('desktop-table.png') });

  // Chọn cả nhóm rồi kiểm bộ đếm ở thanh trên.
  await d.click('button:has-text("Chọn tất cả")');
  await d.waitForTimeout(150);
  // Không ghi cứng số loại: thêm một cipher vào registry là test sẽ hỏng oan.
  // Chỉ kiểm bộ đếm có dạng "n/n", tức đã chọn hết.
  const demLoai = (await d.locator('header span').last().innerText()).match(/(\d+)\/(\d+)/);
  check('chọn tất cả cập nhật bộ đếm', !!demLoai && demLoai[1] === demLoai[2], true);

  // ── Mobile ──
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  m.on('pageerror', (e) => errors.push('mobile pageerror: ' + e.message));
  await m.goto(URL, { waitUntil: 'networkidle' });
  await choBoGiai(m);

  check('ngăn kéo đóng nằm ngoài màn hình', (await m.locator('aside').boundingBox()).x < 0, true);
  await m.click('[aria-label="Mở bảng chọn loại"]');
  await m.waitForTimeout(400);
  check('ngăn kéo mở trượt vào', (await m.locator('aside').boundingBox()).x, 0);
  await m.screenshot({ path: shot('mobile-menu.png') });

  await m.click('[aria-label="Đóng"]');
  await m.waitForTimeout(400);
  await m.evaluate(() => localStorage.clear());
  await m.reload({ waitUntil: 'networkidle' });
  await choBoGiai(m);
  await m.locator('main button:has-text("Ví dụ")').first().click();
  await m.waitForSelector('article', { timeout: 5000 });
  check('mobile giải đúng', (await m.locator('article').first().innerText()).includes(DAP_AN), true);
  await m.screenshot({ path: shot('mobile-grid.png') });

  /*
   * Bạch văn dài trên điện thoại: phải cắt bằng "…" chứ không được kéo giãn
   * bố cục. Đã từng hỏng đúng ở đây — thiếu `min-w-0` trên ô lưới và trên
   * hàng flex khiến nút giãn ra 662px trong khung 375px.
   */
  await m.fill('#banma', 'TAPHOPTAISANTRUONGLUCBAYGIOSANGMAITATCADOIVIENPHAICOMATDAYDUKHONGVANGMAT');
  await m.click('button:has-text("Giải mật thư")');
  await m.waitForSelector('article', { timeout: 25000 });
  await m.waitForTimeout(2000);

  const nutBV = m.locator('article').first().locator('button').first();
  const doBV = await nutBV.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
  check('bạch văn dài bị cắt bằng "…"', doBV.scroll > doBV.client, true);
  check('nút bạch văn vừa khung máy', doBV.client <= 375, true);

  const cuonNgang = await m.evaluate(() => {
    window.scrollTo(9999, 0);
    const x = window.scrollX;
    window.scrollTo(0, 0);
    return x;
  });
  check('trang không cuộn ngang', cuonNgang, 0);

  // Bấm vào bạch văn mở cửa sổ xem đầy đủ.
  await nutBV.click({ timeout: 10000 });
  await m.waitForSelector('dialog[open]', { timeout: 5000 });
  const trongModal = await m.locator('dialog p').first().evaluate((el) => ({
    dai: el.textContent.trim().length,
    scroll: el.scrollWidth,
    client: el.clientWidth,
  }));
  check('modal hiện đủ bạch văn', trongModal.dai, 72);
  check('modal xuống dòng, không tràn', trongModal.scroll <= trongModal.client, true);
  check('modal có nút chép', await m.locator('dialog button:has-text("Chép bạch văn")').count(), 1);
  await m.screenshot({ path: shot('mobile-modal.png') });

  await m.keyboard.press('Escape');
  await m.waitForTimeout(400);
  check('Esc đóng modal', await m.locator('dialog[open]').count(), 0);

  // Trả tab mobile về ví dụ cũ cho các kiểm tra sau.
  await m.evaluate(() => localStorage.clear());
  await m.reload({ waitUntil: 'networkidle' });
  await choBoGiai(m);

  // ── Tab & nhập hàng loạt (desktop) ──
  await d.click('button:has-text("Nhập hàng loạt")');
  await d.click('button:has-text("Dán mẫu")');
  await d.click('button:has-text("Mở 3 mật thư")');
  await d.waitForTimeout(400);
  // Tab 1 đã có dữ liệu từ bước "Ví dụ" nên được giữ lại: 1 + 3 = 4.
  check('nhập hàng loạt thêm 3 tab', await d.locator('[role="tab"]').count(), 4);

  await d.locator('[role="tab"]').first().click();
  await d.waitForTimeout(300);
  // Vẫn đang ở kiểu "Bảng" từ bước trước, nên đọc kết quả trong bảng.
  check('tab 1 giữ kết quả riêng', (await d.locator('tbody tr').first().innerText()).includes(DAP_AN), true);

  await d.locator('[role="tab"]').first().hover();
  await d.locator('[role="tab"] [aria-label="Đóng tab"]').first().click();
  await d.waitForTimeout(300);
  check('đóng tab còn lại 3', await d.locator('[role="tab"]').count(), 3);

  // ── Bảng chữ cái + lưu phiên ──
  await d.click('button:has-text("VN 29")');
  await d.waitForTimeout(150);
  check('chọn bảng VN', await d.locator('button:has-text("VN 29")').getAttribute('aria-pressed'), 'true');

  // Phải mở trong CÙNG context thì mới chung localStorage, như khi người dùng
  // mở lại tab trên chính trình duyệt của họ.
  const p2 = await ctx.newPage();
  await p2.goto(URL, { waitUntil: 'networkidle' });
  await choBoGiai(p2);
  await p2.waitForTimeout(300);
  check('mở lại giữ bảng VN', await p2.locator('button:has-text("VN 29")').getAttribute('aria-pressed'), 'true');
  check('mở lại giữ các tab', (await p2.locator('[role="tab"]').count()) > 1, true);
  check('mở lại giữ nội dung ô', await p2.locator('#banma').inputValue(), 'TUIDENRFOAOANW');

  // ── Thư viện ví dụ: mở nhiều ví dụ vào các tab ──
  const tabTruoc = await d.locator('[role="tab"]').count();
  await d.click('button:has-text("Ví dụ mẫu")');
  await d.click('[aria-label="Thêm mật thư"]');
  await d.waitForTimeout(300);
  check('nut them tab hoat dong', await d.locator('[role="tab"]').count(), tabTruoc + 1);

  check('không có lỗi console', errors.length ? errors.join(' | ') : 0, 0);

  await browser.close();
  console.log(failed ? `\n${failed} kiểm tra THẤT BẠI` : '\nTất cả kiểm tra đạt');
  process.exit(failed ? 1 : 0);
})();
