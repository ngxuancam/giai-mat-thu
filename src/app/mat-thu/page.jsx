import Link from 'next/link';
import { CIPHERS } from '@/core/registry';
import { NHOM, MO_TA_NHOM } from '@/lib/huongDan';
import { duongDanLoai } from '@/lib/site';
import { JsonLd, dongDuong } from '@/lib/jsonLd';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Các loại mật thư và cách giải',
  description: `Hướng dẫn ${CIPHERS.length} loại mật thư hướng đạo: thay thế, toạ độ, đổi chỗ — nguyên lý, dấu hiệu nhận biết qua OTT và ví dụ có lời giải từng bước.`,
  alternates: { canonical: '/mat-thu' },
};

export default function CacLoaiMatThu() {
  return (
    <main className="mx-auto max-w-[1100px] px-4 pt-8 md:pt-12">
      <JsonLd
        data={[
          dongDuong([
            ['Giải Mật Thư', '/'],
            ['Các loại mật thư', '/mat-thu'],
          ]),
          {
            '@type': 'ItemList',
            name: 'Các loại mật thư',
            itemListElement: CIPHERS.map((c, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: c.name,
              url: `${SITE.url}${duongDanLoai(c.id)}`,
            })),
          },
        ]}
      />

      <nav aria-label="Đường dẫn" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Giải Mật Thư</Link> <span aria-hidden>/</span> Các loại mật thư
      </nav>

      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Các loại mật thư và cách giải</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        Mọi mật thư đều thuộc một trong ba nhóm. Biết nhóm là đã đi được nửa đường: nhìn khuôn dạng bản mã
        và đọc OTT để đoán nhóm, rồi thử từng quy luật trong nhóm đó.
      </p>

      <div className="mt-10 space-y-12">
        {NHOM.map((n) => (
          <section key={n.id} aria-labelledby={`nhom-${n.id}`}>
            <h2 id={`nhom-${n.id}`} className="text-2xl font-bold">
              {n.ten}
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{MO_TA_NHOM[n.id]}</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {n.loai.map((c) => (
                <li key={c.id}>
                  <Link
                    href={duongDanLoai(c.id)}
                    className="block h-full rounded-(--radius) border border-border bg-card p-4 transition-colors hover:border-primary"
                  >
                    <span className="font-display text-base font-bold">{c.name}</span>
                    <span className="mt-1 line-clamp-3 block text-sm leading-relaxed text-muted-foreground">{c.moTa}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
