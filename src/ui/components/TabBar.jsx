/**
 * Thanh tab kiểu VS Code — mỗi tab giữ một mật thư riêng.
 *
 * Cho phép mở nhiều bản mã cùng lúc để đối chiếu, mỗi tab nhớ OTT, bản mã và
 * kết quả của chính nó. Nhãn tab lấy theo bản mã, cắt ngắn cho vừa.
 */

import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Nhãn hiển thị: ưu tiên bản mã, chưa có thì tới OTT, rốt cuộc là số thứ tự. */
export function tabLabel(tab, index) {
  const raw = tab.banMa.trim() || tab.ott.trim();
  if (!raw) return `Mật thư ${index + 1}`;
  return raw.length > 18 ? raw.slice(0, 18) + '…' : raw;
}

export function TabBar({ tabs, activeId, onSelect, onClose, onAdd }) {
  return (
    <div role="tablist" aria-label="Các mật thư đang mở" className="flex items-stretch overflow-x-auto overflow-y-hidden border-b border-border pt-1">
      {tabs.map((tab, i) => {
        const active = tab.id === activeId;
        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={active}
            tabIndex={0}
            onClick={() => onSelect(tab.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(tab.id)}
            title={tab.banMa || tab.ott || 'Mật thư mới'}
            className={cn(
              'group -mb-px flex shrink-0 cursor-pointer items-center gap-2 rounded-t-md border border-b-0',
              'mr-1 px-3 py-2 text-[13px] transition-colors',
              active
                ? 'border-border border-t-2 border-t-primary bg-card text-foreground'
                : 'border-transparent text-muted-foreground hover:bg-card/60'
            )}
          >
            <span className="max-w-[160px] truncate font-mono">{tabLabel(tab, i)}</span>

            {/* Tab cuối cùng không cho đóng, tránh rơi vào trạng thái rỗng. */}
            {tabs.length > 1 && (
              <button
                type="button"
                aria-label="Đóng tab"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(tab.id);
                }}
                className={cn(
                  'rounded p-0.5 opacity-0 transition-opacity hover:bg-secondary',
                  'group-hover:opacity-100 focus-visible:opacity-100',
                  active && 'opacity-60'
                )}
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={onAdd}
        aria-label="Thêm mật thư"
        title="Thêm mật thư (Ctrl+N)"
        className="shrink-0 px-3 text-muted-foreground hover:bg-card hover:text-foreground"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
