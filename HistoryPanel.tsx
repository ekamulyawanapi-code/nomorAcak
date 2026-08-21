--- src/components/HistoryPanel.tsx (原始)


+++ src/components/HistoryPanel.tsx (修改后)
import { CheckIcon, CopyIcon, StarIcon, TrashIcon } from "./icons";

export interface HistoryItem {
  id: number;
  value: string;
  digits: number;
  jackpot: boolean;
  ts: number;
}

const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

/* ---------- Baki statistik ---------- */
export function StatsTray({
  spins,
  jackpots,
  hotDigit,
}: {
  spins: number;
  jackpots: number;
  hotDigit: string;
}) {
  const items = [
    { label: "TOTAL PUTARAN", value: String(spins), accent: false },
    { label: "JACKPOT", value: String(jackpots), accent: true },
    { label: "ANGKA PANAS", value: hotDigit, accent: false },
  ];
  return (
    <div className="grid grid-cols-3 divide-x divide-white/5 rounded-xl border border-white/5 bg-black/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
      {items.map((it) => (
        <div key={it.label} className="px-2 py-3 text-center">
          <p className="text-[9px] font-bold tracking-[0.25em] text-muted">{it.label}</p>
          <p
            className={`mt-1.5 font-digits text-2xl leading-none ${
              it.accent ? "text-cherry-400" : "text-gold-400"
            }`}
          >
            {it.value}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ---------- Baki riwayat ---------- */
export default function HistoryPanel({
  items,
  copiedId,
  onCopyItem,
  onClear,
}: {
  items: HistoryItem[];
  copiedId: string | null;
  onCopyItem: (value: string, id: string) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-[11px] tracking-[0.3em] text-gold-500">RIWAYAT</h2>
        {items.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold tracking-wider text-muted transition-colors hover:bg-white/5 hover:text-cherry-400"
          >
            <TrashIcon />
            BERSIHKAN
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line/70 px-4 py-5 text-center text-xs leading-relaxed text-muted">
          Belum ada putaran — tekan{" "}
          <span className="font-display text-[10px] text-gold-400">PUTAR</span> atau{" "}
          <kbd className="kbd">SPASI</kbd> untuk menarik tuas.
        </div>
      ) : (
        <div className="tray-scroll flex gap-2 overflow-x-auto pb-1.5">
          {items.map((it) => {
            const id = String(it.id);
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => onCopyItem(it.value, id)}
                title="Salin nomor"
                className={`history-chip group relative shrink-0 rounded-lg border px-3 py-1.5 text-left transition-transform duration-150 hover:-translate-y-0.5 ${
                  it.jackpot
                    ? "border-gold-500/70 bg-gradient-to-b from-gold-700/40 to-cherry-700/30 shadow-[0_0_14px_rgba(246,196,83,0.2)]"
                    : "border-line/60 bg-felt-700/70 hover:border-gold-600/50"
                }`}
              >
                <span className="flex items-center gap-2">
                  {it.jackpot && <StarIcon className="h-3.5 w-3.5 shrink-0 text-gold-400" />}
                  <span
                    className={`font-digits text-xl leading-none ${
                      it.jackpot ? "text-gold-300" : "text-cream"
                    }`}
                  >
                    {it.value}
                  </span>
                  {copiedId === id ? (
                    <CheckIcon className="h-3.5 w-3.5 shrink-0 text-jade-400" />
                  ) : (
                    <CopyIcon className="h-3.5 w-3.5 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </span>
                <span className="mt-1 block text-[9px] font-semibold tracking-widest text-muted">
                  {it.digits} DIGIT · {fmtTime(it.ts)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
