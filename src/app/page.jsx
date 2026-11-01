import Link from 'next/link';
import Solver from '@/ui/Solver';
import { CIPHERS } from '@/core/registry';
import { NHOM } from '@/lib/huongDan';
import { duongDanLoai } from '@/lib/site';
import { JsonLd, ungDung, trangWeb, tacGia } from '@/lib/jsonLd';

export const metadata = { alternates: { canonical: '/' } };

const BUOC = [
  ['Chép đề', 'Dán OTT (câu gợi ý) và bản mã — phần nằm giữa NW và AR. Không có OTT cũng giải được.'],
  ['Bấm giải', `Bộ giải thử cả ${CIPHERS.length} quy luật ngay trên máy bạn, chấm từng bạch văn bằng mô hình tiếng Việt.`],
  ['Đọc lời giải', 'Lời giải xếp theo độ tin, kèm từng bước làm và bảng làm việc như khi giải tay trên giấy.'],
];

const HOI_DAP = [
  [
    'Công cụ giải được những loại mật thư nào?',
    `Hiện có ${CIPHERS.length} quy luật thuộc ba nhóm: thay thế (Morse, Semaphore, số thay chữ, phím Nokia, tiến chữ…), toạ độ (bảng hàng–cột, ma phương, phương hướng, kim tự tháp) và đổi chỗ (đọc ngược, Cam Ranh, đường rào, viết hàng đọc cột…).`,
  ],
  [
    'Không có OTT thì có giải được không?',
    'Được. Khi thiếu OTT, bộ giải thử mọi quy luật hợp với khuôn dạng bản mã rồi xếp hạng theo độ giống tiếng Việt. OTT chỉ giúp đẩy đúng loại lên cao hơn.',
  ],
  [
    'Nút “Hỏi AI về OTT” làm gì?',
    'Nó gửi riêng câu OTT lên máy chủ của trang, nơi một mô hình ngôn ngữ nhỏ so nghĩa câu đó với cách ra đề của từng loại mật thư và đoán loại khả dĩ. Bản mã không bị gửi đi, và OTT không được lưu.',
  ],
  [
    'Dữ liệu của tôi có bị gửi đi không?',
    'Không. Việc giải mã chạy hoàn toàn trên trình duyệt; phiên làm việc chỉ lưu trong máy bạn (localStorage) để mở lại không mất đề.',
  ],
];

export default function TrangChu() {
  return (
    <>
      <JsonLd
        data={[
          ungDung,
          trangWeb,
          tacGia,
          {
            '@type': 'FAQPage',
            mainEntity: HOI_DAP.map(([q, a]) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: { '@type': 'Answer', text: a },
            })),
          },
        ]}
      />

      <div className="mx-auto max-w-[1320px] px-4 pb-2 pt-8 md:pt-12">
        <p className="font-hand text-xl text-primary">Sổ tay trại · trò chơi lớn</p>
        <h1 className="mt-1 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
          Giải mật thư hướng đạo trong một lần dán.
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          Dán OTT và bản mã, công cụ thử {CIPHERS.length} quy luật — Morse, Semaphore, Cam Ranh, Khánh Hoà,
          toạ độ, đọc ngược… — chấm điểm bằng mô hình tiếng Việt và xếp hạng lời giải. Chạy ngay trên
          trình duyệt, kèm một mô hình AI nhỏ đọc hiểu câu OTT khi bạn cần.
        </p>
      </div>

      <Solver />

      <div className="mx-auto max-w-[1320px] space-y-16 px-4 pt-12">
        <section aria-labelledby="cach-dung">
          <h2 id="cach-dung" className="text-2xl font-bold">Cách dùng</h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-3">
            {BUOC.map(([ten, moTa], i) => (
              <li key={ten} className="rounded-(--radius) border border-border bg-card p-5">
                <span className="font-hand text-3xl leading-none text-primary">{i + 1}.</span>
                <h3 className="mt-2 text-lg font-bold">{ten}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{moTa}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="cac-loai">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="cac-loai" className="text-2xl font-bold">Các loại mật thư</h2>
            <Link href="/mat-thu" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
              Xem cách giải từng loại →
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {NHOM.map((n) => (
              <div key={n.id} className="duong-khau rounded-(--radius) border border-border bg-card p-5">
                <h3 className="text-lg font-bold">
                  {n.ten} <span className="font-mono text-sm font-normal text-muted-foreground">({n.loai.length})</span>
                </h3>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {n.loai.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={duongDanLoai(c.id)}
                        className="inline-block rounded-full border border-border bg-background px-2.5 py-1 text-[13px] hover:border-primary hover:text-primary"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="hoi-dap">
          <h2 id="hoi-dap" className="text-2xl font-bold">Hỏi đáp</h2>
          <div className="mt-5 divide-y divide-border rounded-(--radius) border border-border bg-card">
            {HOI_DAP.map(([q, a]) => (
              <details key={q} className="group px-5 py-4">
                <summary className="cursor-pointer list-none font-semibold marker:hidden">
                  <span className="mr-2 inline-block font-mono text-primary transition-transform group-open:rotate-90">›</span>
                  {q}
                </summary>
                <p className="mt-2 pl-5 text-sm leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
