import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CIPHERS } from '@/core/registry';
import { FAMILIES } from '@/core/types';
import { timLoai, viDuCuaLoai, dauHieuOtt, loaiLienQuan } from '@/lib/huongDan';
import { SITE, duongDanLoai } from '@/lib/site';
import { JsonLd, dongDuong, tacGia } from '@/lib/jsonLd';

export const dynamicParams = false;

export function generateStaticParams() {
  return CIPHERS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const c = timLoai(id);
  if (!c) return {};
  const tieuDe = `Mật thư ${c.name}: nguyên lý, cách giải và ví dụ`;
  return {
    title: tieuDe,
    description: `${c.moTa} Dấu hiệu nhận biết qua OTT, ví dụ có lời giải từng bước và công cụ giải tự động.`.slice(0, 300),
    alternates: { canonical: duongDanLoai(c.id) },
    openGraph: { type: 'article', title: tieuDe, url: duongDanLoai(c.id) },
  };
}

/** Bảng làm việc — giống cách giải tay trên giấy (bản tĩnh của Results.jsx). */
function BangLamViec({ bang }) {
  const o = 'border border-border px-2 py-1 text-center font-mono text-xs';
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="border-collapse">
        <tbody>
          <tr>{bang.nhanCot.map((x, i) => <td key={i} className={`${o} font-semibold text-primary`}>{x}</td>)}</tr>
          <tr>{bang.soCot.map((x, i) => <td key={i} className={`${o} text-muted-foreground`}>{x}</td>)}</tr>
          {bang.hang.map((dong, h) => (
            <tr key={h}>{dong.map((x, i) => <td key={i} className={o}>{x || '·'}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function LoaiMatThu({ params }) {
  const { id } = await params;
  const c = timLoai(id);
  if (!c) notFound();

  const viDu = viDuCuaLoai(c.id);
  const dauHieu = dauHieuOtt(c);
  const lienQuan = loaiLienQuan(c);
  const url = `${SITE.url}${duongDanLoai(c.id)}`;

  return (
    <main className="mx-auto max-w-[860px] px-4 pt-8 md:pt-12">
      <JsonLd
        data={[
          dongDuong([
            ['Giải Mật Thư', '/'],
            ['Các loại mật thư', '/mat-thu'],
            [c.name, duongDanLoai(c.id)],
          ]),
          {
            '@type': 'TechArticle',
            headline: `Mật thư ${c.name}`,
            description: c.moTa,
            inLanguage: 'vi',
            url,
            author: { '@id': tacGia['@id'] },
            about: { '@type': 'Thing', name: `Mật thư ${c.name}` },
            isPartOf: { '@id': `${SITE.url}/#website` },
          },
        ]}
      />

      <nav aria-label="Đường dẫn" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Giải Mật Thư</Link> <span aria-hidden>/</span>{' '}
        <Link href="/mat-thu" className="hover:text-foreground">Các loại mật thư</Link> <span aria-hidden>/</span> {c.name}
      </nav>

      <p className="mt-5 font-hand text-lg text-primary">Nhóm {FAMILIES[c.family]?.toLowerCase()}</p>
      <h1 className="text-3xl font-bold sm:text-4xl">Mật thư {c.name}</h1>
      <p className="mt-4 text-[15px] leading-relaxed sm:text-base">{c.moTa}</p>

      {dauHieu.length > 0 && (
        <section aria-labelledby="dau-hieu" className="mt-10">
          <h2 id="dau-hieu" className="text-xl font-bold">Nhận biết qua OTT</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Người ra đề hiếm khi gọi thẳng tên loại. Những câu OTT dưới đây là cách nói bóng gió thường gặp:
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {dauHieu.map((d) => (
              <li key={d} className="rounded-full border border-dashed border-khaki bg-card px-3 py-1 font-hand text-base">
                “{d}”
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="vi-du" className="mt-10">
        <h2 id="vi-du" className="text-xl font-bold">Ví dụ có lời giải</h2>
        {viDu.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Chưa có ví dụ mẫu cho loại này. Dán đề của bạn vào{' '}
            <Link href="/#bo-giai" className="font-semibold text-primary underline-offset-4 hover:underline">bộ giải</Link>{' '}
            — nó sẽ thử loại {c.name} cùng mọi loại khác.
          </p>
        ) : (
          <div className="mt-4 space-y-5">
            {viDu.map((v) => (
              <article key={v.id} className="duong-khau rounded-(--radius) border border-border bg-card p-5">
                <h3 className="font-display text-lg font-bold">{v.ten}</h3>
                <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[7rem_1fr]">
                  <dt className="font-semibold text-muted-foreground">OTT</dt>
                  <dd className="break-words">{v.ott || '—'}</dd>
                  <dt className="font-semibold text-muted-foreground">Bản mã</dt>
                  <dd className="break-all font-mono">{v.banMa}</dd>
                  <dt className="font-semibold text-muted-foreground">Bạch văn</dt>
                  <dd className="break-all font-mono font-semibold text-success">{v.dapAn}</dd>
                </dl>
                {v.loiGiai && (
                  <>
                    <p className="mt-4 whitespace-pre-line rounded-md border-l-4 border-khaki bg-background px-3 py-2.5 text-sm leading-relaxed text-muted-foreground">
                      {v.loiGiai.cach}
                    </p>
                    {v.loiGiai.bang && <BangLamViec bang={v.loiGiai.bang} />}
                  </>
                )}
                <Link
                  href={`/?${new URLSearchParams({ ott: v.ott, banMa: v.banMa })}#bo-giai`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Mở ví dụ này trong bộ giải →
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {lienQuan.length > 0 && (
        <section aria-labelledby="lien-quan" className="mt-12">
          <h2 id="lien-quan" className="text-xl font-bold">Cùng nhóm {FAMILIES[c.family]?.toLowerCase()}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {lienQuan.map((x) => (
              <li key={x.id}>
                <Link
                  href={duongDanLoai(x.id)}
                  className="inline-block rounded-full border border-border bg-card px-3 py-1 text-sm hover:border-primary hover:text-primary"
                >
                  {x.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
