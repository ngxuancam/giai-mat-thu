/**
 * Nhập hàng loạt: dán nhiều mật thư một lúc, mỗi cái mở thành một tab.
 *
 * Nhận hai khuôn dạng, tự nhận biết:
 *   - mỗi dòng một mật thư:  "OTT | bản mã"  (hoặc chỉ bản mã)
 *   - nhiều khối cách nhau bằng dòng trống, mỗi khối có OTT:/NW…AR
 */

import { useState } from 'react';
import { Button, Textarea } from '@/ui/components/ui/primitives';

const MAU = `HOAXUAN BANLINHSOSANGTUONGLAI | TUIDENRFOAOANW
Nước chảy đá mòn | GNOURT NAS IAT POH PAT
| 12 13 14`;

/**
 * Trần số mật thư mở một lượt.
 *
 * Mỗi mục thành một tab và một phiên giải riêng. Dán nhầm cả một tệp nghìn
 * dòng sẽ dựng nghìn thành phần React và xếp nghìn việc vào worker — trình
 * duyệt đứng hẳn. Ngưỡng này rộng hơn mọi buổi sinh hoạt thật, chỉ để chặn
 * trường hợp dán nhầm.
 */
export const MAX_MUC = 50;

/** Trần độ dài một mục, khớp với giới hạn của worker và của storage. */
const MAX_OTT = 2000;
const MAX_BAN_MA = 20000;

/**
 * Bóc tách văn bản dán vào thành danh sách { ott, banMa }.
 * Hàm thuần, tách riêng để test được mà không cần dựng giao diện.
 */
export function phanTich(text) {
  const raw = String(text ?? '').trim();
  if (!raw) return [];

  /** Cắt mỗi mục về trần độ dài, rồi cắt cả danh sách về trần số mục. */
  const gon = (ds) =>
    ds
      .filter((x) => x.banMa)
      .slice(0, MAX_MUC)
      .map((x) => ({ ott: x.ott.slice(0, MAX_OTT), banMa: x.banMa.slice(0, MAX_BAN_MA) }));

  // Dạng khối: có "OTT:" hoặc "NW … AR" thì tách theo dòng trống.
  if (/\bOTT\s*[:=]/i.test(raw) || /\bNW\b[\s\S]*\bAR\b/i.test(raw)) {
    return gon(
      raw
        .split(/\n\s*\n/)
        // Cắt rộng tay trước khi phân tích để không tốn công với tệp khổng lồ,
        // nhưng vẫn dư chỗ cho dòng trống và dòng rác bị loại ở bước `gon`.
        .slice(0, MAX_MUC * 4)
        .map((khoi) => {
          const ott = khoi.match(/\bOTT\s*[:=]?\s*(.+)/i)?.[1]?.trim() ?? '';
          const giua = khoi.match(/\bNW\b([\s\S]*?)\bAR\b/i)?.[1];
          const banMa = (giua ?? khoi.replace(/\bOTT\s*[:=]?.*/i, '')).trim().replace(/\s+/g, ' ');
          return { ott, banMa };
        })
    );
  }

  // Dạng dòng: "ott | bản mã", thiếu dấu | thì coi cả dòng là bản mã.
  return gon(
    raw
      .split('\n')
      .slice(0, MAX_MUC * 4)
      .map((dong) => {
        const [a, b] = dong.split('|');
        const co2 = b !== undefined;
        return {
          ott: co2 ? a.trim() : '',
          banMa: (co2 ? b : a).trim(),
        };
      })
  );
}

export function BulkImport({ onImport, onCancel }) {
  const [text, setText] = useState('');
  const items = phanTich(text);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Mỗi dòng một mật thư, dạng <code className="font-mono">OTT | bản mã</code>. Hoặc dán nhiều
        khối <code className="font-mono">OTT: … NW … AR</code> cách nhau bằng dòng trống.
      </p>

      <Textarea
        rows={7}
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        placeholder={MAU}
        aria-label="Danh sách mật thư"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={!items.length} onClick={() => onImport(items)}>
          Mở {items.length || ''} mật thư
        </Button>
        <Button variant="outline" onClick={() => setText(MAU)}>
          Dán mẫu
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Đóng
        </Button>
      </div>
    </div>
  );
}
