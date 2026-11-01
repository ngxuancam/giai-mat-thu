/** Bảng chọn loại mật thư — cố định trên desktop, trượt ra trên mobile. */

import { X } from 'lucide-react';
import { CIPHERS } from '@/core/registry';
import { FAMILIES } from '@/core/types';
import { Button, Checkbox } from '@/ui/components/ui/primitives';
import { cn } from '@/lib/utils';

const GROUPS = CIPHERS.reduce((acc, c) => {
  (acc[c.family] ||= []).push(c);
  return acc;
}, {});

export function CipherFilter({ selected, onChange, bangChu, onBangChu, open, onClose }) {
  const toggle = (id) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  /** Bật cả nhóm, hoặc tắt cả nhóm nếu đã bật đủ. */
  const toggleGroup = (list) => {
    const ids = list.map((c) => c.id);
    const allOn = ids.every((id) => selected.includes(id));
    onChange(allOn ? selected.filter((id) => !ids.includes(id)) : [...new Set([...selected, ...ids])]);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={onClose} aria-hidden />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[270px] overflow-y-auto border-r border-border bg-card p-4',
          'transition-transform md:sticky md:top-[4.5rem] md:z-0 md:my-3 md:h-[calc(100dvh-5.5rem)] md:w-auto',
          'md:translate-x-0 md:rounded-(--radius) md:border',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Chọn loại mật thư"
      >
        <div className="mb-4 flex items-center justify-between">
          <strong className="font-display text-base">Loại mật thư</strong>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose} aria-label="Đóng">
            <X className="size-4" />
          </Button>
        </div>

        <div className="mb-4">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Bảng chữ cái
          </div>
          <div className="inline-flex w-full rounded-lg border border-border p-0.5">
            {[
              ['auto', 'Cả hai'],
              ['en', 'EN 26'],
              ['vn', 'VN 29'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => onBangChu(id)}
                aria-pressed={bangChu === id}
                className={cn(
                  'flex-1 rounded-md px-2 py-1 text-xs transition-colors',
                  bangChu === id
                    ? 'bg-foreground font-semibold text-background'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onChange(CIPHERS.map((c) => c.id))}>
            Chọn tất cả
          </Button>
          <Button variant="outline" size="sm" onClick={() => onChange([])}>
            Bỏ chọn
          </Button>
        </div>

        <div className="space-y-5">
          {Object.entries(GROUPS).map(([family, list]) => (
            <div key={family}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {FAMILIES[family] || family} ({list.length})
                </span>
                <button
                  type="button"
                  onClick={() => toggleGroup(list)}
                  className="rounded-full border border-border px-2 py-0.5 text-[11px] text-primary hover:bg-secondary"
                >
                  tất cả
                </button>
              </div>

              {list.map((c) => (
                <label
                  key={c.id}
                  title={c.moTa}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] hover:bg-secondary"
                >
                  <Checkbox checked={selected.includes(c.id)} onChange={() => toggle(c.id)} />
                  {c.name}
                </label>
              ))}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
