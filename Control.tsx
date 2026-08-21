--- src/components/Controls.tsx (原始)


+++ src/components/Controls.tsx (修改后)
import type { ReactNode } from "react";

/* ---------- Pemilih jumlah digit (1-5) ---------- */
export function DigitSelector({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? "pointer-events-none opacity-60" : ""}>
      <p className="mb-1.5 text-[10px] font-bold tracking-[0.3em] text-muted">JUMLAH DIGIT</p>
      <div className="relative flex w-56 rounded-xl border border-black/50 bg-black/40 p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
        <span
          aria-hidden
          className="absolute bottom-1 left-1 top-1 w-[calc((100%-0.5rem)/5)] rounded-lg bg-gradient-to-b from-gold-400 to-gold-600 shadow-[0_2px_12px_rgba(246,196,83,0.45)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ transform: `translateX(${(value - 1) * 100}%)` }}
        />
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={value === n}
            aria-label={`${n} digit`}
            className={`relative z-10 flex-1 rounded-lg py-2 font-display text-sm transition-colors duration-200 ${
              value === n ? "text-[#2b1c05]" : "text-muted hover:text-cream"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-[10px] font-semibold text-muted/80">
        Maks 5 digit · geser untuk mengubah
      </p>
    </div>
  );
}

/* ---------- Sakelar opsi ---------- */
export function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="group flex items-center gap-2.5 text-left disabled:opacity-50"
    >
      <span
        className={`relative h-[22px] w-10 shrink-0 rounded-full p-[3px] transition-colors duration-200 ${
          checked
            ? "bg-gold-500 shadow-[0_0_12px_rgba(246,196,83,0.4)]"
            : "border border-white/10 bg-black/60"
        }`}
      >
        <span
          className={`block h-4 w-4 rounded-full shadow transition-transform duration-200 ${
            checked ? "translate-x-[18px] bg-[#3a2a08]" : "translate-x-0 bg-cream-dim"
          }`}
        />
      </span>
      <span className="text-xs font-semibold text-cream-dim transition-colors group-hover:text-cream">
        {label}
      </span>
    </button>
  );
}

/* ---------- Tombol logam kecil (suara / reset) ---------- */
export function MetalButton({
  onClick,
  children,
  label,
  active,
}: {
  onClick: () => void;
  children: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      data-on={active ? "true" : "false"}
      className="btn-metal"
    >
      {children}
    </button>
  );
}

/* ---------- Tombol PUTAR besar ---------- */
export function SpinButton({ spinning, onClick }: { spinning: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={spinning}
      aria-label="Putar mesin nomor acak"
      className="group relative h-32 w-32 select-none outline-none sm:h-36 sm:w-36 disabled:cursor-default"
    >
      {!spinning && <span className="pulse-ring" aria-hidden />}
      <span
        aria-hidden
        className="absolute inset-0 translate-y-2 rounded-full bg-gradient-to-b from-[#7a5212] to-[#432b06] shadow-[0_14px_30px_rgba(0,0,0,0.6)]"
      />
      <span
        className={`absolute inset-1 flex flex-col items-center justify-center gap-1 rounded-full border border-[#ff9d8d]/50 bg-gradient-to-b from-[#ff7a68] via-[#e23d3d] to-[#9c1d1d] shadow-[inset_0_5px_12px_rgba(255,255,255,0.35),inset_0_-10px_18px_rgba(0,0,0,0.45),0_6px_18px_rgba(226,61,61,0.4)] transition-transform duration-100 group-active:translate-y-[7px] ${
          spinning ? "brightness-90 saturate-[0.72]" : ""
        }`}
      >
        {spinning ? (
          <span className="flex items-end gap-1.5 py-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="spin-dot" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </span>
        ) : (
          <>
            <span className="font-display text-[22px] leading-none text-[#fff3dd] [text-shadow:0_2px_0_rgba(0,0,0,0.5)] sm:text-2xl">
              PUTAR
            </span>
            <span className="text-[9px] font-bold tracking-[0.35em] text-[#ffd9c9]/75">SPASI</span>
          </>
        )}
      </span>
    </button>
  );
}
