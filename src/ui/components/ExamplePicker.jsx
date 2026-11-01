/**
 * Thư viện ví dụ — chọn một hoặc nhiều ví dụ mẫu, mỗi ví dụ mở thành một tab.
 *
 * Mọi ví dụ ở đây đều được test tự động, nên chúng luôn giải ra đúng đáp án.
 */

import { useState } from 'react';
import { Check } from 'lucide-react';
import { VI_DU } from '@/core/data/vidu';
import { Button } from '@/ui/components/ui/primitives';
import { cn } from '@/lib/utils';

export function ExamplePicker({ onPick, onCancel }) {
  const [chon, setChon] = useState([]);

  const toggle = (id) =>
    setChon((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const danhSach = VI_DU.filter((v) => chon.includes(v.id));

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Chọn một hoặc nhiều ví dụ — mỗi ví dụ mở thành một tab riêng. Tất cả đều có đáp án đã kiểm
        chứng.
      </p>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {VI_DU.map((v) => {
          const active = chon.includes(v.id);
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => toggle(v.id)}
              aria-pressed={active}
              className={cn(
                'rounded-lg border p-3 text-left transition-colors',
                active ? 'border-primary bg-primary/10' : 'border-border hover:bg-secondary'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold">{v.ten}</span>
                {active && <Check className="size-3.5 shrink-0 text-primary" />}
              </div>
              <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                {v.banMa}
              </div>
              <div className="mt-0.5 truncate font-mono text-[11px] text-success">→ {v.dapAn}</div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button disabled={!danhSach.length} onClick={() => onPick(danhSach)}>
          Mở {danhSach.length || ''} ví dụ
        </Button>
        <Button variant="outline" onClick={() => setChon(VI_DU.map((v) => v.id))}>
          Chọn tất cả
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Đóng
        </Button>
      </div>
    </div>
  );
}
