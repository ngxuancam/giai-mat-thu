/**
 * Nút "Hỏi AI về OTT" và kết quả đoán loại.
 *
 * Bật theo ý người dùng: chưa bấm thì không gì rời khỏi trình duyệt. Bấm thì
 * chỉ câu OTT được gửi lên hàm của chính trang này (xem app/api/goi-y-ott),
 * nơi một mô hình nhúng câu nhỏ so nghĩa OTT với cách ra đề của từng loại.
 */

import { Sparkles, Loader2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GoiYAi({ ott, ai, loc, onHoi, onChiThu }) {
  const coOtt = ott.trim().length > 0;
  const dangHoi = ai?.dangHoi;

  return (
    <div className="mt-2.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={onHoi}
          disabled={!coOtt || dangHoi}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-dashed border-khaki px-3 py-1 text-xs font-semibold',
            'text-foreground transition-colors hover:border-solid hover:bg-secondary',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          {dangHoi ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5 text-primary" />}
          {dangHoi ? 'AI đang đọc OTT…' : 'Hỏi AI về OTT'}
        </button>
        <span className="text-[11px] text-muted-foreground">
          Chỉ gửi câu OTT để đoán loại mật thư, không lưu lại.
        </span>
      </div>

      {ai?.loi && (
        <p role="alert" className="mt-2 text-xs text-primary">
          {ai.loi}
        </p>
      )}

      {loc && (
        <div className="mt-3 rounded-lg border border-border bg-background/60 p-3" aria-live="polite">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="font-hand text-base leading-none">
              {loc.chacChan ? 'AI đoán OTT này là…' : 'AI chưa chắc — có thể là…'}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">{ai.moHinh?.split('/').pop()}</span>
          </div>
          <ul className="space-y-1.5">
            {loc.goiY.map((g, i) => (
              <li key={g.id} className="flex items-center gap-2 text-[13px]">
                <span className={cn('w-40 shrink-0 truncate', i === 0 && 'font-semibold')}>{g.ten}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <span
                    className={cn('block h-full rounded-full', i === 0 ? 'bg-primary' : 'bg-khaki')}
                    style={{ width: `${Math.max(4, g.xacSuat * 100)}%` }}
                  />
                </span>
                <span className="w-10 text-right font-mono text-xs tabular text-muted-foreground">
                  {Math.round(g.xacSuat * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => onChiThu(g.id)}
                  title={`Chỉ thử loại ${g.ten}`}
                  aria-label={`Chỉ thử loại ${g.ten}`}
                  className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <Filter className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {loc.soBiLoai > 0 && `Đã bỏ ${loc.soBiLoai} loại không hợp khuôn dạng bản mã. `}
            {loc.chacChan
              ? 'Gợi ý này đã được cộng vào điểm “Gợi ý OTT” của các lời giải.'
              : 'OTT này không giống cách ra đề quen thuộc của loại nào, nên gợi ý không được tính vào điểm.'}{' '}
            Bấm phễu để chỉ thử một loại.
          </p>
        </div>
      )}
    </div>
  );
}
