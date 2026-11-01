import { describe, it, expect } from 'vitest';
import { chuanHoa, boDau } from './types.js';

describe('chuanHoa — ký tự dán từ Word / Facebook', () => {
  it('đưa mọi loại gạch ngang về dấu trừ', () => {
    expect(chuanHoa('KI – LH – DX')).toBe('KI - LH - DX'); // en dash
    expect(chuanHoa('A — B')).toBe('A - B'); // em dash
    expect(chuanHoa('A − B')).toBe('A - B'); // minus sign
    expect(chuanHoa('A － B')).toBe('A - B'); // fullwidth
  });

  it('tách dấu ba chấm để Morse không bị hiểu sai', () => {
    expect(chuanHoa('… --- …')).toBe('... --- ...');
  });

  it('đổi dấu chấm giữa dòng thành dấu chấm thường', () => {
    expect(chuanHoa('•••')).toBe('...');
  });

  it('gộp khoảng trắng đặc biệt và bỏ ký tự rộng-không', () => {
    expect(chuanHoa('A B')).toBe('A B'); // NBSP
    expect(chuanHoa('​ABC﻿')).toBe('ABC'); // zero-width + BOM
    expect(chuanHoa('  A   B  ')).toBe('A B');
  });

  it('chuyển nháy cong về nháy thẳng', () => {
    expect(chuanHoa('‘A’')).toBe("'A'");
    expect(chuanHoa('“A”')).toBe('"A"');
  });

  it('không làm hỏng bản mã bình thường', () => {
    expect(chuanHoa('ki - lh - dx')).toBe('KI - LH - DX');
    expect(chuanHoa('... --- ...')).toBe('... --- ...');
  });
});

describe('boDau', () => {
  it('bỏ dấu tiếng Việt kể cả ơ, ư, đ', () => {
    expect(boDau('Nước chảy đá mòn')).toBe('Nuoc chay da mon');
    expect(boDau('Đường đi khó')).toBe('Duong di kho');
  });
});
