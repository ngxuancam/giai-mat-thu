import Link from 'next/link';
import { SITE } from '@/lib/site';

/** La bàn tám cánh — dấu hiệu của trang, vẽ tay bằng SVG để không tải ảnh. */
export function LaBan({ className }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="1.5 2" />
      <path d="M16 3.5 19 16 16 28.5 13 16Z" fill="currentColor" opacity="0.25" />
      <path d="M16 3.5 19 16h-6Z" fill="var(--stamp)" />
      <path d="M3.5 16 16 13v6Z M28.5 16 16 19v-6Z" fill="currentColor" opacity="0.55" />
      <circle cx="16" cy="16" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${SITE.ten} — trang chủ`}>
          <LaBan className="size-7 text-foreground" />
          <span className="whitespace-nowrap font-display text-lg font-bold leading-none">Giải Mật Thư</span>
        </Link>

        <nav aria-label="Chính" className="ml-auto flex items-center gap-1 whitespace-nowrap text-sm">
          <Link href="/#bo-giai" className="hidden rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground sm:inline-block">
            Bộ giải
          </Link>
          <Link href="/mat-thu" className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <span className="sm:hidden">Các loại</span>
            <span className="hidden sm:inline">Các loại mật thư</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
