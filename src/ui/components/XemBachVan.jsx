/**
 * Cửa sổ xem bạch văn đầy đủ.
 *
 * Lý do cần: trên điện thoại, bạch văn dài tràn ra ngoài khung thẻ. Danh sách
 * cắt ngắn bằng "…" cho gọn, còn muốn đọc trọn vẹn thì mở cửa sổ này — chữ
 * xuống dòng thoải mái, cỡ chữ to hơn, có nút chép.
 *
 * Dùng thẻ <dialog> của trình duyệt thay vì tự dựng lớp phủ: nó có sẵn bẫy
 * tiêu điểm (Tab không thoát ra ngoài), đóng bằng Esc, và lớp nền ::backdrop
 * — tất cả đều là hành vi chuẩn mà người dùng trình đọc màn hình mong đợi.
 */

import { useEffect, useRef } from 'react';
import { Copy, X } from 'lucide-react';
import { Button } from '@/ui/components/ui/primitives';
import { cn } from '@/lib/utils';

export function XemBachVan({ ketQua, onDong, onCopy }) {
  const hopRef = useRef(null);

  // Mở / đóng theo trạng thái. showModal() mới có lớp nền và bẫy tiêu điểm.
  useEffect(() => {
    const hop = hopRef.current;
    if (!hop) return;
    if (ketQua && !hop.open) hop.showModal();
    if (!ketQua && hop.open) hop.close();
  }, [ketQua]);

  return (
    <dialog
      ref={hopRef}
      // Người dùng bấm Esc hoặc bấm ra ngoài — báo ngược lên để xoá trạng thái.
      onClose={onDong}
      onClick={(e) => {
        // Bấm vào chính thẻ dialog nghĩa là bấm trúng lớp nền, không phải nội dung.
        if (e.target === hopRef.current) onDong();
      }}
      aria-label="Bạch văn đầy đủ"
      /*
        `m-auto` để căn giữa cả dọc lẫn ngang. Mặc định trình duyệt dính
        <dialog> lên mép trên, trông như bị lỗi trên màn hình điện thoại.
      */
      className={cn(
        'm-auto w-[min(92vw,42rem)] rounded-(--radius) border border-border bg-card p-0',
        'text-card-foreground backdrop:bg-black/60'
      )}
    >
      {ketQua && (
        <div className="p-4 md:p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold">{ketQua.cipherName}</div>
              <div className="mt-0.5 break-words font-mono text-xs text-muted-foreground">
                {ketQua.nhan}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onDong} aria-label="Đóng">
              <X className="size-4" />
            </Button>
          </div>

          {/*
            `break-all` chứ không phải `break-words`: bạch văn mật thư thường
            là một khối chữ liền không dấu cách, nên phải cho phép ngắt giữa
            chữ, nếu không nó vẫn tràn ra ngoài đúng như lúc chưa sửa.
          */}
          <p
            className={cn(
              'max-h-[50dvh] overflow-y-auto rounded-lg border-l-4 border-success bg-background',
              'px-4 py-3 font-mono text-base leading-relaxed tracking-wide break-all'
            )}
          >
            {ketQua.bv}
          </p>

          <p className="mt-3 whitespace-pre-line text-xs text-muted-foreground">{ketQua.cach}</p>

          <Button className="mt-4 w-full" onClick={() => onCopy(ketQua.bv)}>
            <Copy className="size-4" />
            Chép bạch văn
          </Button>
        </div>
      )}
    </dialog>
  );
}
