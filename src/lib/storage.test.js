import { describe, it, expect, beforeEach, vi } from 'vitest';
import { load, save, clear } from './storage.js';

/**
 * localStorage là RANH GIỚI TIN CẬY: nội dung sửa được bằng DevTools, bằng
 * tiện ích mở rộng, hay bằng bất kỳ mã nào từng chạy trên cùng gốc. Các test
 * dưới đây kiểm tra rằng dữ liệu độc hại hoặc dị dạng không lọt vào ứng dụng.
 */

const KEY = 'giaimatthu:v1';

beforeEach(() => {
  const kho = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (k) => kho.get(k) ?? null,
    setItem: (k, v) => kho.set(k, v),
    removeItem: (k) => kho.delete(k),
  });
});

describe('storage — kiểm tra dữ liệu đọc từ localStorage', () => {
  it('JSON hỏng không làm sập ứng dụng', () => {
    localStorage.setItem(KEY, '{khong phai json');
    expect(load()).toBeNull();
  });

  it('bỏ qua dữ liệu sai hình dạng', () => {
    for (const rac of ['null', '[]', '"chuoi"', '{"tabs":"khong phai mang"}', '{"tabs":[]}']) {
      localStorage.setItem(KEY, rac);
      expect(load(), rac).toBeNull();
    }
  });

  it('cắt mảng tab bị nhồi về trần an toàn', () => {
    const nhieu = Array.from({ length: 5000 }, () => ({ ott: 'a', banMa: 'b' }));
    localStorage.setItem(KEY, JSON.stringify({ tabs: nhieu }));
    expect(load().tabs.length).toBeLessThanOrEqual(50);
  });

  it('cắt chuỗi quá dài — chặn làm treo trang khi giải', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ tabs: [{ ott: 'x'.repeat(999999), banMa: 'y'.repeat(999999) }] })
    );
    const { tabs } = load();
    expect(tabs[0].ott.length).toBeLessThanOrEqual(2000);
    expect(tabs[0].banMa.length).toBeLessThanOrEqual(20000);
  });

  it('trường sai kiểu được đưa về chuỗi rỗng, không lọt object vào', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ tabs: [{ ott: { ac: 'y' }, banMa: ['mang'] }] })
    );
    const { tabs } = load();
    expect(tabs[0].ott).toBe('');
    expect(tabs[0].banMa).toBe('');
  });

  it('chỉ nhận id loại mật thư đúng khuôn dạng', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        tabs: [{ ott: '', banMa: 'ABC' }],
        selected: ['morse', '<script>', '../../etc', 'a'.repeat(100), 42, null, 'caesar'],
      })
    );
    expect(load().selected).toEqual(['morse', 'caesar']);
  });

  it('tuỳ chọn ngoài danh sách cho phép bị đưa về mặc định', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        tabs: [{ ott: '', banMa: 'ABC' }],
        bangChu: 'ac-y',
        view: { khong: 'phai chuoi' },
      })
    );
    const d = load();
    expect(d.bangChu).toBe('auto');
    expect(d.view).toBe('grid');
  });

  it('ghi rồi đọc lại giữ nguyên dữ liệu hợp lệ', () => {
    save({ tabs: [{ ott: 'CAM RANH', banMa: 'KI LH' }], selected: ['camranh'], bangChu: 'en', view: 'table' });
    const d = load();
    expect(d.tabs).toEqual([{ ott: 'CAM RANH', banMa: 'KI LH' }]);
    expect(d.selected).toEqual(['camranh']);
    expect(d.bangChu).toBe('en');
    expect(d.view).toBe('table');
  });

  it('xoá phiên thì đọc lại ra null', () => {
    save({ tabs: [{ ott: '', banMa: 'ABC' }] });
    clear();
    expect(load()).toBeNull();
  });
});
