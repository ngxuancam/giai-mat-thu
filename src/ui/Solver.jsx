'use client';

/**
 * Bộ giải mật thư — phần tương tác của trang chủ.
 *
 * Mỗi tab giữ một mật thư độc lập (OTT, bản mã, kết quả), cho phép mở nhiều
 * bản cùng lúc để đối chiếu. Toàn bộ việc giải nằm ở `core/` và chạy trong
 * Web Worker; tầng này chỉ thu thập đầu vào, gọi bộ giải rồi trình bày.
 *
 * Trang được dựng sẵn trên máy chủ (cho SEO), nên trạng thái ban đầu phải
 * giống hệt nhau ở hai phía: phiên cũ trong localStorage và tham số trên URL
 * chỉ được đọc SAU khi trang đã gắn vào trình duyệt.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { SlidersHorizontal, Layers, BookOpen, Sparkles, Eraser, Wand2 } from 'lucide-react';
import { CIPHERS } from '@/core/registry';
import { useGiaiMa } from '@/ui/useGiaiMa';
import { Button, Card, CardContent, Input, Label, Textarea } from '@/ui/components/ui/primitives';
import { CipherFilter } from '@/ui/components/CipherFilter';
import { Results } from '@/ui/components/Results';
import { TabBar } from '@/ui/components/TabBar';
import { BulkImport } from '@/ui/components/BulkImport';
import { ExamplePicker } from '@/ui/components/ExamplePicker';
import { GoiYAi } from '@/ui/components/GoiYAi';
import { locGoiYAi } from '@/ui/locGoiYAi';
import { cn } from '@/lib/utils';
import { load, save } from '@/lib/storage';

const VI_DU = { ott: 'HOAXUAN BANLINHSOSANGTUONGLAI', banMa: 'TUIDENRFOAOANW' };

let seq = 1;
const newTab = (init = {}) => ({ id: ++seq, ott: '', banMa: '', result: null, ai: null, ...init });
// Tab đầu cố định id 1 để HTML dựng trên máy chủ và trên trình duyệt khớp nhau.
const TAB_DAU = { id: 1, ott: '', banMa: '', result: null, ai: null };

/**
 * Bảng { id → độ tin } đưa vào bộ chấm điểm. Gợi ý được lọc theo khuôn dạng
 * bản mã trước; nếu AI vẫn chưa chắc thì không đưa vào điểm.
 */
const bangDoTin = (ai, banMa) => {
  if (!ai?.goiY) return null;
  const { goiY, chacChan } = locGoiYAi(ai.goiY, banMa);
  return chacChan ? Object.fromEntries(goiY.map((g) => [g.id, g.doTin])) : null;
};

export default function Solver() {
  const [tabs, setTabs] = useState([TAB_DAU]);
  const [activeId, setActiveId] = useState(1);
  const [selected, setSelected] = useState([]);
  const [bangChu, setBangChu] = useState('auto');
  const [view, setView] = useState('grid');
  const [menuOpen, setMenuOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [viDuOpen, setViDuOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [daNap, setDaNap] = useState(false);

  const tab = tabs.find((t) => t.id === activeId) ?? tabs[0];
  const patch = (id, fields) =>
    setTabs((ts) => ts.map((t) => (t.id === id ? { ...t, ...fields } : t)));

  const chayGiai = useGiaiMa();

  /**
   * Giải một tab. Kết quả về theo nhiều đợt: loại nào xong trước hiện trước,
   * nên người dùng không phải chờ loại dò khoá chạy xong.
   */
  const solve = useCallback(
    (id, ott, banMa, ai = null, chiLoai = selected) => {
      if (!banMa.trim()) return patch(id, { result: null });
      patch(id, { dangGiai: true });
      chayGiai(id, ott, banMa, { chiLoai, bangChu, goiYAi: bangDoTin(ai, banMa) }, (moc) =>
        patch(id, { result: moc, dangGiai: !moc.xong })
      );
    },
    [selected, bangChu, chayGiai]
  );

  // Khôi phục phiên trước và nhận mật thư gửi qua URL (?ott=…&banMa=…).
  const daKhoiPhuc = useRef(false);
  useEffect(() => {
    if (daKhoiPhuc.current) return;
    daKhoiPhuc.current = true;

    const saved = load();
    const thamSo = new URLSearchParams(window.location.search);
    const tuUrl = { ott: thamSo.get('ott') ?? '', banMa: thamSo.get('banMa') ?? '' };

    let ds = saved?.tabs?.map((t) => newTab({ ott: t.ott, banMa: t.banMa })) ?? [];
    if (tuUrl.banMa) {
      const moi = newTab({ ott: tuUrl.ott.slice(0, 2000), banMa: tuUrl.banMa.slice(0, 20000) });
      ds = [...ds.filter((t) => t.ott || t.banMa), moi];
      history.replaceState(null, '', window.location.pathname + '#bo-giai');
    }
    if (ds.length) {
      setTabs(ds);
      setActiveId(ds[ds.length - 1].id);
    }
    if (saved) {
      setSelected(saved.selected);
      setBangChu(saved.bangChu);
      setView(saved.view);
    }
    setDaNap(true);

    if (tuUrl.banMa) {
      const cuoi = ds[ds.length - 1];
      // Đợi worker dựng xong ở lượt vẽ kế tiếp rồi mới giải.
      requestAnimationFrame(() => solve(cuoi.id, cuoi.ott, cuoi.banMa, null, saved?.selected ?? []));
    }
  }, [solve]);

  // Ghi lại phiên mỗi khi đầu vào hoặc tuỳ chọn thay đổi (sau khi đã khôi phục).
  useEffect(() => {
    if (!daNap) return;
    save({ tabs: tabs.map(({ ott, banMa }) => ({ ott, banMa })), selected, bangChu, view });
  }, [daNap, tabs, selected, bangChu, view]);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1800);
  };

  const copy = useCallback((text) => {
    navigator.clipboard?.writeText(text).then(() => flash('Đã chép bạch văn'), () => {});
  }, []);

  const addTab = () => {
    const t = newTab();
    setTabs((ts) => [...ts, t]);
    setActiveId(t.id);
  };

  const closeTab = (id) => {
    setTabs((ts) => {
      const rest = ts.filter((t) => t.id !== id);
      if (id === activeId && rest.length) setActiveId(rest[rest.length - 1].id);
      return rest;
    });
  };

  /**
   * Mở mỗi mật thư dán vào thành một tab rồi giải tất cả — qua worker, nên
   * dán 20 mật thư cũng không làm trình duyệt đứng hình.
   */
  const importMany = (items) => {
    const created = items.map((it) => newTab({ ...it, dangGiai: !!it.banMa }));
    setTabs((ts) => {
      const base = ts.length === 1 && !ts[0].banMa && !ts[0].ott ? [] : ts;
      return [...base, ...created];
    });
    setActiveId(created[created.length - 1].id);
    setBulkOpen(false);
    flash(`Đã mở ${created.length} mật thư`);
    for (const t of created) if (t.banMa) solve(t.id, t.ott, t.banMa);
  };

  /**
   * Hỏi mô hình AI loại mật thư nào hợp với OTT. Chỉ câu OTT được gửi đi.
   * Có bản mã thì giải lại ngay, lần này có gợi ý AI trong điểm "Gợi ý OTT".
   */
  const hoiAi = async (t) => {
    const ott = t.ott.trim();
    if (!ott) return;
    patch(t.id, { ai: { dangHoi: true } });
    try {
      const res = await fetch('/api/goi-y-ott', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ott }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.thongBao || 'Không hỏi được AI.');
      const ai = { ott, goiY: data.goiY, moHinh: data.moHinh };
      patch(t.id, { ai });
      if (t.banMa.trim()) solve(t.id, t.ott, t.banMa, ai);
    } catch (err) {
      patch(t.id, { ai: { loi: String(err.message || err) } });
    }
  };

  /** Gợi ý AI chỉ còn đúng khi OTT chưa đổi. */
  const aiHienTai = tab.ai && (tab.ai.dangHoi || tab.ai.loi || tab.ai.ott === tab.ott.trim()) ? tab.ai : null;

  const tk = tab.result?.thongKe ?? {};
  const stats = tab.result
    ? [
        ['Lời giải', tk.soLoiGiai ?? 0, true],
        // Bằng chứng tính bằng bit — thước đo chính, xem nguGram.js.
        ['Bằng chứng', tab.result.ketQua[0] ? `${tab.result.ketQua[0].bit} bit` : '—', true],
        ['Điểm cao nhất', tab.result.ketQua[0]?.diem ?? '—', true],
        [
          'Loại đã thử',
          tab.dangGiai ? `${tk.soLoaiXong ?? 0}/${tk.soLoaiThu ?? 0}…` : `${tk.soLoaiThu}/${tk.soLoaiTong}`,
          false,
        ],
        ['Biến thể', (tk.soBienThe ?? 0).toLocaleString('vi-VN'), false],
        ['Thời gian', `${tk.thoiGian}ms`, false],
      ]
    : [];

  return (
    <section id="bo-giai" aria-label="Bộ giải mật thư" className="scroll-mt-16">
      <div className="mx-auto max-w-[1320px] md:grid md:grid-cols-[260px_1fr] md:gap-6 md:px-4">
        <CipherFilter
          selected={selected}
          onChange={setSelected}
          bangChu={bangChu}
          onBangChu={setBangChu}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />

        <div className="min-w-0 px-4 md:px-0">
          {/* Thanh công cụ */}
          <div className="flex flex-wrap items-center gap-2 py-3">
            <Button variant="outline" size="sm" className="md:hidden" onClick={() => setMenuOpen(true)}>
              <SlidersHorizontal className="size-3.5" />
              Loại mật thư
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setViDuOpen((v) => !v);
                setBulkOpen(false);
              }}
              aria-expanded={viDuOpen}
            >
              <BookOpen className="size-3.5" />
              Ví dụ mẫu
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBulkOpen((v) => !v);
                setViDuOpen(false);
              }}
              aria-expanded={bulkOpen}
            >
              <Layers className="size-3.5" />
              Nhập hàng loạt
            </Button>
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              {selected.length === 0 ? `thử cả ${CIPHERS.length} loại` : `thử ${selected.length}/${CIPHERS.length} loại`}
            </span>
          </div>

          <TabBar tabs={tabs} activeId={tab.id} onSelect={setActiveId} onClose={closeTab} onAdd={addTab} />

          <div className="space-y-5 py-5">
            {viDuOpen && (
              <Card>
                <CardContent>
                  <ExamplePicker
                    onPick={(ds) => {
                      importMany(ds.map(({ ott, banMa }) => ({ ott, banMa })));
                      setViDuOpen(false);
                    }}
                    onCancel={() => setViDuOpen(false)}
                  />
                </CardContent>
              </Card>
            )}

            {bulkOpen && (
              <Card>
                <CardContent>
                  <BulkImport onImport={importMany} onCancel={() => setBulkOpen(false)} />
                </CardContent>
              </Card>
            )}

            {/* Trang giấy nhập đề */}
            <Card className="giay-ke overflow-hidden">
              <div className="py-4 pl-12 pr-4 md:py-5 md:pl-14 md:pr-6">
                <Label htmlFor="ott" hint="khoá / gợi ý — để trống cũng được">
                  OTT
                </Label>
                <Input
                  id="ott"
                  value={tab.ott}
                  onChange={(e) => patch(tab.id, { ott: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && solve(tab.id, tab.ott, tab.banMa, aiHienTai)}
                  spellCheck={false}
                  autoComplete="off"
                  placeholder={VI_DU.ott}
                />

                <GoiYAi
                  ott={tab.ott}
                  ai={aiHienTai}
                  loc={aiHienTai?.goiY ? locGoiYAi(aiHienTai.goiY, tab.banMa) : null}
                  onHoi={() => hoiAi(tab)}
                  onChiThu={(id) => {
                    setSelected([id]);
                    solve(tab.id, tab.ott, tab.banMa, aiHienTai, [id]);
                  }}
                />

                <div className="mt-5">
                  <Label htmlFor="banma" hint="phần giữa NW và AR">
                    Bản mã
                  </Label>
                  <Textarea
                    id="banma"
                    rows={3}
                    value={tab.banMa}
                    onChange={(e) => patch(tab.id, { banMa: e.target.value })}
                    onKeyDown={(e) =>
                      (e.ctrlKey || e.metaKey) && e.key === 'Enter' && solve(tab.id, tab.ott, tab.banMa, aiHienTai)
                    }
                    spellCheck={false}
                    placeholder={VI_DU.banMa}
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => solve(tab.id, tab.ott, tab.banMa, aiHienTai)}
                    aria-busy={tab.dangGiai || undefined}
                  >
                    <Wand2 className="size-4" />
                    {tab.dangGiai ? 'Đang giải…' : 'Giải mật thư'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      patch(tab.id, { ...VI_DU, ai: null });
                      solve(tab.id, VI_DU.ott, VI_DU.banMa);
                    }}
                  >
                    <Sparkles className="size-4" />
                    Thử ví dụ
                  </Button>
                  <Button variant="ghost" onClick={() => patch(tab.id, { ott: '', banMa: '', result: null, ai: null })}>
                    <Eraser className="size-4" />
                    Xoá
                  </Button>
                </div>
              </div>
            </Card>

            {tab.result && (
              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {stats.map(([label, value, nhan]) => (
                  <div key={label} className="rounded-(--radius) border border-border bg-card px-3 py-2.5">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
                    <dd className={cn('mt-0.5 font-mono text-xl font-bold tabular', nhan ? 'text-primary' : 'text-foreground')}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {tab.result && (
              <div className="flex justify-end">
                <div className="inline-flex rounded-full border border-border bg-card p-1" role="group" aria-label="Kiểu hiển thị">
                  {[
                    ['grid', 'Thẻ'],
                    ['table', 'Bảng'],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setView(id)}
                      aria-pressed={view === id}
                      className={cn(
                        'rounded-full px-4 py-1.5 text-[13px] transition-colors',
                        view === id
                          ? 'bg-foreground font-semibold text-background'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!tab.result && !bulkOpen && !viDuOpen && (
              <p className="py-8 text-center font-hand text-xl text-muted-foreground">
                Chép đề vào trang giấy ở trên rồi bấm “Giải mật thư”.
              </p>
            )}

            <Results result={tab.result} view={view} onCopy={copy} />
          </div>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-lg"
        >
          {toast}
        </div>
      )}
    </section>
  );
}
