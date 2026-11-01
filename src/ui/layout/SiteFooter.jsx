import Link from 'next/link';
import { SITE } from '@/lib/site';

/** "GIAI MAT THU" bằng Morse — đường viền trang trí cuối trang. */
const MORSE = '−−· ·· ·− ·· / −− ·− − / − ···· ··−';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto max-w-[1320px] px-4 py-8">
        <p aria-hidden="true" className="mb-5 select-none overflow-hidden whitespace-nowrap font-mono text-xs tracking-[0.3em] text-khaki">
          {MORSE}
        </p>
        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Giải mã chạy ngay trên trình duyệt của bạn. Chỉ khi bấm “Hỏi AI về OTT”, câu OTT mới được
            gửi lên máy chủ của trang để đoán loại — và không được lưu lại.
          </p>
          <div className="flex shrink-0 gap-4">
            <Link href="/mat-thu" className="hover:text-foreground">Các loại mật thư</Link>
            <a href={SITE.github} className="hover:text-foreground" rel="noopener">Mã nguồn</a>
            <a href={SITE.tacGia.url} className="hover:text-foreground" rel="noopener">{SITE.tacGia.ten}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
