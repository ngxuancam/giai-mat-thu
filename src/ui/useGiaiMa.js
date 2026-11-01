/**
 * Hook gọi bộ giải qua Web Worker, nhận kết quả dần.
 *
 * Trả về `giai(khoa, ott, banMa, tuyChon, nhan)`: mỗi lần gọi sẽ bắn kết quả
 * về qua `nhan` nhiều lần — mỗi đợt là một ảnh chụp đầy đủ đã xếp hạng lại,
 * cho tới đợt cuối có `xong: true`. Nhờ vậy lời giải hiện lên ngay khi loại
 * đầu tiên cho ra kết quả, thay vì chờ loại chậm nhất.
 *
 * `khoa` là đơn vị huỷ — thường là id của tab. Bấm giải lại cùng một tab thì
 * yêu cầu trước của tab ĐÓ bị bỏ qua, nhưng các tab khác vẫn chạy bình
 * thường. Quan trọng khi nhập hàng loạt: 20 tab cùng giải, không tab nào
 * được phép huỷ tab khác.
 */

import { useCallback, useEffect, useRef } from 'react';
import { giaiMa } from '@/core/giaiMa';

export function useGiaiMa() {
  const workerRef = useRef(null);
  const demRef = useRef(0);
  /** khoa → id yêu cầu mới nhất của khoá đó. */
  const moiNhatRef = useRef(new Map());
  /** id yêu cầu → hàm nhận kết quả. */
  const nhanRef = useRef(new Map());

  useEffect(() => {
    /*
     * Không có Worker (trình duyệt quá cũ, hoặc chạy trong test) thì vẫn phải
     * giải được — chỉ là giải đồng bộ, giao diện khựng một nhịp. Thà chậm còn
     * hơn hỏng.
     */
    if (typeof Worker === 'undefined') return undefined;

    let w;
    try {
      w = new Worker(new URL('../core/giaiMa.worker.js', import.meta.url), { type: 'module' });
    } catch {
      return undefined; // dựng worker thất bại — dùng lối đồng bộ
    }

    w.onmessage = (e) => {
      const { id, loai, ...phanConLai } = e.data ?? {};
      // Bỏ qua kết quả của yêu cầu đã bị thay bằng yêu cầu mới hơn.
      const nhan = nhanRef.current.get(id);
      if (!nhan) return;

      if (loai === 'loi') {
        nhan({ ghiChu: [`Lỗi khi giải: ${phanConLai.thongBao}`], ketQua: [], thongKe: {}, xong: true });
        nhanRef.current.delete(id);
        return;
      }

      nhan(phanConLai);
      if (loai === 'xong') nhanRef.current.delete(id);
    };

    workerRef.current = w;
    return () => {
      w.terminate();
      workerRef.current = null;
    };
  }, []);

  return useCallback((khoa, ott, banMa, tuyChon, nhan) => {
    if (!workerRef.current) {
      // Lối dự phòng: giải thẳng trên luồng chính, trả một lần duy nhất.
      nhan({ ...giaiMa({ ott, banMa }, tuyChon), xong: true });
      return;
    }

    // Huỷ yêu cầu trước CỦA CHÍNH KHOÁ NÀY, không đụng tới khoá khác.
    const cu = moiNhatRef.current.get(khoa);
    if (cu !== undefined) nhanRef.current.delete(cu);

    const id = ++demRef.current;
    moiNhatRef.current.set(khoa, id);
    nhanRef.current.set(id, nhan);
    workerRef.current.postMessage({ id, ott, banMa, ...tuyChon });
  }, []);
}
