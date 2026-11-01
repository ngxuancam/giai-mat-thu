/**
 * Hiển thị lời giải ở hai dạng: lưới thẻ hoặc bảng.
 *
 * Thẻ dùng khi cần đọc kỹ lời giải và phân tích điểm; bảng dùng khi cần quét
 * nhanh nhiều ứng viên cùng lúc.
 */

import { useState } from 'react';
import { Copy } from 'lucide-react';
import { Card, CardContent, Progress } from '@/ui/components/ui/primitives';
import { XemBachVan } from '@/ui/components/XemBachVan';
import { SCORE_TIERS } from '@/core/data/constants';
import { cn } from '@/lib/utils';

const SIGNALS = {
  nguGram: 'N-gram',
  tuDien: 'Từ điển',
  amTiet: 'Âm tiết',
  ott: 'Gợi ý OTT',
  dauHieu: 'Dấu hiệu',
};

/**
 * Bằng chứng tính bằng BIT — thước đo chính, khác hẳn điểm 0..100.
 *
 * Điểm chỉ so sánh được trong cùng một bản mã. Bit thì có đơn vị tuyệt đối:
 * "+20 bit" nghĩa là giả thuyết đây là tiếng Việt khả dĩ hơn giả thuyết rác
 * 2²⁰ ≈ một triệu lần, bất kể đề nào. Xem core/scoring/nguGram.js.
 */
function Evidence({ bit }) {
  if (typeof bit !== 'number') return null;
  const manh = bit >= 15 ? 'text-success' : bit >= 0 ? 'text-primary' : 'text-muted-foreground';
  const nhan = bit >= 15 ? 'bằng chứng mạnh' : bit >= 0 ? 'bằng chứng yếu' : 'giống chuỗi ngẫu nhiên';
  return (
    <span className={cn('font-mono text-[11px]', manh)} title={`${nhan} — xem nguGram.js`}>
      {bit > 0 ? '+' : ''}
      {bit} bit
    </span>
  );
}

/** Hạng nhất luôn nổi bật — điểm chỉ có ý nghĩa so sánh trong cùng bản mã. */
const scoreColor = (diem, i) =>
  i === 0 || diem >= SCORE_TIERS.cao
    ? 'text-success'
    : diem >= SCORE_TIERS.trungBinh
      ? 'text-primary'
      : 'text-muted-foreground';

/**
 * Bạch văn trong danh sách — luôn gói gọn trong một dòng.
 *
 * Bạch văn mật thư thường là khối chữ liền không dấu cách, dài 30–60 ký tự.
 * Trên điện thoại nó tràn ra ngoài khung thẻ, đẩy cả bố cục lệch. Ở đây cắt
 * bằng `truncate` (CSS tự thêm "…" đúng chỗ tràn, không cần đoán số ký tự),
 * bấm vào thì mở cửa sổ xem đầy đủ có xuống dòng và nút chép.
 *
 * Chép nhanh vẫn giữ: nút chép riêng bên phải, bấm không mở cửa sổ.
 */
function Plaintext({ text, onXem, onCopy, className }) {
  return (
    /*
      `min-w-0` bắt buộc ở ĐÂY, không chỉ ở nút con.
      Mặc định flex item có min-width:auto, nghĩa là không bao giờ co nhỏ hơn
      nội dung — nên một bạch văn 72 chữ sẽ kéo cả hàng giãn ra 662px dù khung
      chỉ có 375px, và `truncate` bên trong không có mốc nào để cắt. Chuỗi
      min-w-0 phải liền mạch từ thẻ ngoài vào tới phần tử bị cắt.
    */
    <div className={cn('flex w-full min-w-0 items-center gap-1', className)}>
      <button
        type="button"
        onClick={() => onXem(text)}
        title="Bấm để xem đầy đủ"
        className="min-w-0 flex-1 truncate text-left font-mono tracking-wide"
      >
        {text}
      </button>
      <button
        type="button"
        onClick={() => onCopy(text)}
        aria-label="Chép bạch văn"
        title="Chép"
        className="shrink-0 rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Copy className="size-3.5" />
      </button>
    </div>
  );
}

/**
 * Bảng làm việc — dựng lại đúng cách giải tay trên giấy: hàng nhãn khoá,
 * hàng số thứ tự, rồi các hàng ký tự đọc ngang ra bạch văn.
 */
function WorkTable({ bang }) {
  const cell = 'border border-border px-2 py-1 text-center font-mono text-xs';
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="border-collapse">
        <tbody>
          <tr>
            {bang.nhanCot.map((c, i) => (
              <td key={i} className={cn(cell, 'font-semibold text-primary')}>{c}</td>
            ))}
          </tr>
          <tr>
            {bang.soCot.map((n, i) => (
              <td key={i} className={cn(cell, 'text-muted-foreground')}>{n}</td>
            ))}
          </tr>
          {bang.hang.map((dong, h) => (
            <tr key={h}>
              {dong.map((ch, i) => (
                <td key={i} className={cn(cell, 'text-foreground')}>{ch || '·'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultCard({ r, index, onXem, onCopy }) {
  return (
    <Card
      as="article"
      className={cn(
        'transition-colors',
        index === 0 && 'duong-khau bang-dinh border-primary/60'
      )}
    >
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-display text-base font-bold">
              <span className="mr-1.5 font-mono text-sm font-normal text-muted-foreground">{index + 1}.</span>
              {r.cipherName}
            </div>
            {index === 0 && <span className="con-dau mt-2">Khả dĩ nhất</span>}
            <div className="mt-0.5 break-words font-mono text-xs text-muted-foreground">{r.nhan}</div>
          </div>
          <div className="shrink-0 text-right">
            <div className={cn('font-mono text-2xl font-bold tabular', scoreColor(r.diem, index))}>
              {r.diem}
            </div>
            <Evidence bit={r.bit} />
          </div>
        </div>

        <Plaintext
          text={r.bv}
          onXem={() => onXem(r)}
          onCopy={onCopy}
          className="my-4 rounded-md border-l-4 border-success bg-background px-3 py-3 text-base"
        />

        <p className="whitespace-pre-line text-xs text-muted-foreground">{r.cach}</p>

        {r.bang && <WorkTable bang={r.bang} />}

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-4 md:grid-cols-5">
          {Object.entries(SIGNALS).map(([key, label]) => (
            <div key={key}>
              <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                <span>{label}</span>
                <span className="font-mono text-foreground">{r.chiTiet[key] ?? 0}%</span>
              </div>
              <Progress value={r.chiTiet[key] ?? 0} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ResultTable({ list, onXem, onCopy }) {
  const th = 'sticky top-0 bg-card px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground';
  return (
    <div className="overflow-x-auto rounded-(--radius) border border-border bg-card">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-border">
            <th className={cn(th, 'text-right')}>#</th>
            <th className={cn(th, 'text-right')}>Điểm</th>
            <th className={cn(th, 'text-right')} title="Bằng chứng, tính bằng bit">
              Bit
            </th>
            <th className={th}>Bạch văn</th>
            <th className={th}>Loại</th>
            <th className={th}>Biến thể</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r, i) => (
            <tr key={`${r.cipherId}-${r.bv}`} className="border-b border-border hover:bg-secondary/40">
              <td className="px-4 py-2.5 text-right font-mono tabular text-muted-foreground">{i + 1}</td>
              <td className={cn('px-4 py-2.5 text-right font-mono font-bold tabular', scoreColor(r.diem, i))}>
                {r.diem}
              </td>
              <td className="px-4 py-2.5 text-right">
                <Evidence bit={r.bit} />
              </td>
              {/* max-w buộc ô co lại thay vì giãn theo nội dung — nếu không
                  `truncate` bên trong không có mốc nào để cắt. */}
              <td className="max-w-[14rem] px-4 py-2.5">
                <Plaintext text={r.bv} onXem={() => onXem(r)} onCopy={onCopy} />
              </td>
              <td className="px-4 py-2.5">{r.cipherName}</td>
              <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.nhan}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Results({ result, view, onCopy }) {
  // Lời giải đang mở trong cửa sổ xem, null là đang đóng.
  // Hook phải gọi TRƯỚC mọi lệnh return sớm — quy tắc hook của React.
  const [dangXem, setDangXem] = useState(null);

  if (!result) return null;
  const { ghiChu, ketQua } = result;

  return (
    <div className="space-y-4">
      {ghiChu.length > 0 && (
        <div className="rounded-md border-l-4 border-khaki bg-card px-4 py-3 text-sm text-muted-foreground">
          <ul className="list-disc space-y-1 pl-5">
            {ghiChu.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
      )}

      {/*
        Đang giải mà chưa có lời giải nào: nói rõ là đang chạy, đừng để người
        dùng tưởng hệ thống bó tay. Có lời giải rồi thì danh sách tự hiện dần,
        không cần chắn màn hình bằng ô chờ.
      */}
      {!result.xong && ketQua.length === 0 ? (
        <p className="py-10 text-center font-hand text-xl text-muted-foreground">Đang thử các quy luật…</p>
      ) : ketQua.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          Chưa tìm được lời giải. Thử bỏ bớt bộ lọc loại mật thư.
        </p>
      ) : view === 'table' ? (
        <ResultTable list={ketQua} onXem={setDangXem} onCopy={onCopy} />
      ) : (
        /*
          `min-w-0` trên ô lưới: cũng như flex, ô lưới mặc định không co nhỏ
          hơn nội dung, nên một bạch văn dài sẽ kéo cả cột giãn ra. Thiếu dòng
          này thì `truncate` bên trong thẻ không có tác dụng.
        */
        <div className="grid gap-4 [&>*]:min-w-0 xl:grid-cols-2">
          {ketQua.map((r, i) => (
            <ResultCard
              key={`${r.cipherId}-${r.bv}`}
              r={r}
              index={i}
              onXem={setDangXem}
              onCopy={onCopy}
            />
          ))}
        </div>
      )}

      <XemBachVan ketQua={dangXem} onDong={() => setDangXem(null)} onCopy={onCopy} />
    </div>
  );
}
