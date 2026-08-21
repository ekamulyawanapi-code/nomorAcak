--- src/App.tsx (原始)
export default function App() {
  return (
    <div/>
  );
}


+++ src/App.tsx (修改后)
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import SlotReel from "./components/SlotReel";
import Marquee from "./components/Marquee";
import { DigitSelector, MetalButton, SpinButton, ToggleSwitch } from "./components/Controls";
import HistoryPanel, { StatsTray, type HistoryItem } from "./components/HistoryPanel";
import {
  CheckIcon,
  CopyIcon,
  ResetIcon,
  SoundOffIcon,
  SoundOnIcon,
  SparkIcon,
} from "./components/icons";
import { useSound } from "./hooks/useSound";
import { generateDigits, isJackpot } from "./lib/random";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* penyimpanan penuh / privat — abaikan */
  }
}

const Bolt = ({ className = "" }: { className?: string }) => (
  <span
    aria-hidden
    className={`pointer-events-none absolute h-2.5 w-2.5 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffe9a8,#d99b26_55%,#5d3d0c)] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.5)] ${className}`}
  />
);

const PaylineArrow = ({ side }: { side: "left" | "right" }) => (
  <svg
    aria-hidden
    viewBox="0 0 12 20"
    className={`pointer-events-none absolute top-1/2 z-10 h-5 w-3 -translate-y-1/2 text-cherry-500 drop-shadow-[0_0_6px_rgba(226,61,61,0.8)] ${
      side === "left" ? "left-1.5" : "right-1.5 rotate-180"
    }`}
  >
    <path d="M1 1l10 9L1 19z" fill="currentColor" />
  </svg>
);

export default function App() {
  const [digitCount, setDigitCount] = useState<number>(() => load("jrng:digits", 4));
  const [allowLeadingZero, setAllowLeadingZero] = useState<boolean>(() => load("jrng:zero", false));
  const [allowRepeat, setAllowRepeat] = useState<boolean>(() => load("jrng:repeat", true));
  const [soundOn, setSoundOn] = useState<boolean>(() => load("jrng:sound", true));
  const [history, setHistory] = useState<HistoryItem[]>(() => load("jrng:history", []));
  const [counters, setCounters] = useState<{ spins: number; jackpots: number }>(() =>
    load("jrng:stats", { spins: 0, jackpots: 0 })
  );

  const [spinning, setSpinning] = useState(false);
  const [spinId, setSpinId] = useState(0);
  const [result, setResult] = useState<{ value: string; jackpot: boolean } | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const [leverPulled, setLeverPulled] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);

  const snd = useSound();

  // Cermin nilai ke ref agar callback rAF selalu membaca nilai terbaru.
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;
  const countRef = useRef(digitCount);
  countRef.current = digitCount;
  const spinningRef = useRef(spinning);
  spinningRef.current = spinning;
  const zeroRef = useRef(allowLeadingZero);
  zeroRef.current = allowLeadingZero;
  const repeatRef = useRef(allowRepeat);
  repeatRef.current = allowRepeat;

  const pendingRef = useRef<number[]>([]);
  const doneRef = useRef(0);
  const lastTickRef = useRef(0);
  const toastTimer = useRef<number | undefined>(undefined);

  /* ---------- persistensi ---------- */
  useEffect(() => save("jrng:digits", digitCount), [digitCount]);
  useEffect(() => save("jrng:zero", allowLeadingZero), [allowLeadingZero]);
  useEffect(() => save("jrng:repeat", allowRepeat), [allowRepeat]);
  useEffect(() => save("jrng:sound", soundOn), [soundOn]);
  useEffect(() => save("jrng:history", history), [history]);
  useEffect(() => save("jrng:stats", counters), [counters]);

  /* ---------- util ---------- */
  const showToast = useCallback((msg: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ msg, key: Date.now() });
    toastTimer.current = window.setTimeout(() => setToast(null), 1700);
  }, []);

  const copyText = useCallback(
    async (text: string, id: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
        } catch {
          /* abaikan */
        }
        document.body.removeChild(ta);
      }
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
      showToast(`Nomor ${text} tersalin`);
    },
    [showToast]
  );

  const fireConfetti = useCallback(() => {
    const colors = ["#f6c453", "#ffd166", "#e23d3d", "#f4ead2", "#4fd695"];
    confetti({ particleCount: 110, spread: 80, origin: { y: 0.5 }, colors, ticks: 240, scalar: 1.05 });
    window.setTimeout(
      () => confetti({ particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: 0.55 }, colors }),
      200
    );
    window.setTimeout(
      () => confetti({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.55 }, colors }),
      380
    );
  }, []);

  /* ---------- alur putaran ---------- */
  const finalize = useCallback(() => {
    const digits = pendingRef.current;
    const value = digits.join("");
    const jack = isJackpot(digits);
    setSpinning(false);
    setResult({ value, jackpot: jack });
    setFlashKey((k) => k + 1);
    setHistory((h) =>
      [{ id: Date.now(), value, digits: digits.length, jackpot: jack, ts: Date.now() }, ...h].slice(
        0,
        30
      )
    );
    setCounters((c) => ({ spins: c.spins + 1, jackpots: c.jackpots + (jack ? 1 : 0) }));
    if (soundRef.current) (jack ? snd.fanfare() : snd.win());
    if (jack) {
      fireConfetti();
      showToast("JACKPOT! Semua angka kembar!");
    }
  }, [snd, fireConfetti, showToast]);

  const handleReelDone = useCallback(
    (_i: number) => {
      if (soundRef.current) snd.thud();
      doneRef.current += 1;
      if (doneRef.current >= countRef.current) finalize();
    },
    [snd, finalize]
  );

  const handleTick = useCallback(() => {
    const now = performance.now();
    if (soundRef.current && now - lastTickRef.current > 70) {
      lastTickRef.current = now;
      snd.tick();
    }
  }, [snd]);

  const spin = useCallback(() => {
    if (spinningRef.current) return;
    const digits = generateDigits(countRef.current, {
      allowLeadingZero: zeroRef.current,
      allowRepeat: repeatRef.current,
    });
    pendingRef.current = digits;
    doneRef.current = 0;
    setSpinning(true);
    setSpinId((id) => id + 1);
    setLeverPulled(true);
    window.setTimeout(() => setLeverPulled(false), 550);
    if (soundRef.current) snd.whoosh();
  }, [snd]);

  const spinRef = useRef(spin);
  spinRef.current = spin;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "BUTTON" || t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      e.preventDefault();
      spinRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const resetAll = useCallback(() => {
    setHistory([]);
    setCounters({ spins: 0, jackpots: 0 });
    setResult(null);
    showToast("Riwayat & statistik direset");
  }, [showToast]);

  /* ---------- turunan ---------- */
  const hotDigit = useMemo(() => {
    const freq = new Array<number>(10).fill(0);
    history.forEach((h) =>
      h.value.split("").forEach((ch) => {
        freq[Number(ch)] += 1;
      })
    );
    let best = 0;
    let bestDigit = -1;
    freq.forEach((f, d) => {
      if (f > best) {
        best = f;
        bestDigit = d;
      }
    });
    return bestDigit >= 0 ? String(bestDigit) : "—";
  }, [history]);

  const sparks = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: `${(i * 61 + 7) % 100}%`,
        top: `${16 + ((i * 37) % 72)}%`,
        delay: `${(i * 0.83) % 7}s`,
        duration: `${6 + ((i * 1.7) % 6)}s`,
        size: 3 + (i % 3),
      })),
    []
  );

  /* ---------- render ---------- */
  return (
    <div className="relative min-h-screen">
      {/* Latar hidup */}
      <div className="bg-layers" aria-hidden>
        <div className="rays" />
        {sparks.map((s) => (
          <span
            key={s.id}
            className="spark"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          />
        ))}
        <div className="vignette" />
        <div className="noise" />
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-3 py-8 sm:px-6">
        {/* ===== MESIN ===== */}
        <div className="w-full max-w-[760px] rounded-[34px] bg-gradient-to-b from-[#e9bd55] via-[#8a5f16] to-[#c9973a] p-[3px] shadow-[0_30px_80px_rgba(0,0,0,0.6),0_0_70px_rgba(246,196,83,0.09)]">
          <div className="machine-skin relative flex flex-col gap-5 rounded-[31px] px-4 py-6 sm:px-8 sm:py-8">
            <Bolt className="left-3 top-3" />
            <Bolt className="right-3 top-3" />
            <Bolt className="bottom-3 left-3" />
            <Bolt className="bottom-3 right-3" />

            {/* Tuas samping */}
            <div
              aria-hidden
              className={`absolute -right-9 top-[30%] hidden h-[150px] w-[34px] lg:block ${
                leverPulled ? "lever-pulled" : ""
              }`}
            >
              <div className="lever-arm">
                <div className="lever-knob" />
              </div>
              <div className="lever-base" />
            </div>

            {/* Papan nama */}
            <Marquee>
              <p className="text-[10px] font-bold tracking-[0.4em] text-[#e8c9a0]/80 sm:text-[11px]">
                <SparkIcon className="mr-1 inline h-3 w-3 text-gold-400" />
                MESIN NOMOR ACAK
                <SparkIcon className="ml-1 inline h-3 w-3 text-gold-400" />
              </p>
              <h1 className="title-glow font-display text-[28px] leading-tight text-gold-400 sm:text-[40px]">
                JACKPOT RNG
              </h1>
              <p className="mt-1 text-[11px] font-semibold tracking-[0.22em] text-cream-dim sm:text-xs">
                PILIH DIGIT · TARIK TUAS · MENANG
              </p>
            </Marquee>

            {/* Panel gulungan */}
            <section
              aria-label="Gulungan angka"
              className="relative rounded-2xl border border-gold-700/40 bg-[radial-gradient(120%_140%_at_50%_0%,#1e3527,#0d1a12_72%)] p-4 shadow-[inset_0_2px_18px_rgba(0,0,0,0.65)] sm:p-6"
            >
              <PaylineArrow side="left" />
              <PaylineArrow side="right" />
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {Array.from({ length: digitCount }, (_, i) => (
                  <SlotReel
                    key={`${digitCount}-${i}`}
                    index={i}
                    spinId={spinId}
                    target={pendingRef.current[i] ?? 0}
                    stopDelay={750 + i * 380}
                    onDone={handleReelDone}
                    onTick={handleTick}
                  />
                ))}
              </div>
              <p className="mt-4 text-center text-[9px] font-semibold uppercase tracking-[0.3em] text-muted/90 sm:text-[10px]">
                Pantau garis tengah · rezeki tak ke mana
              </p>
              {flashKey > 0 && <div key={flashKey} className="flash-overlay" />}
            </section>

            {/* Layar LED hasil */}
            <div className="flex items-center justify-between gap-4 rounded-xl border border-black/60 bg-[#0a0d08] px-4 py-3 shadow-[inset_0_2px_12px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.06)]">
              <div className="min-w-0">
                <p className="text-[9px] font-bold tracking-[0.3em] text-[#7a8a72]">HASIL PUTARAN</p>
                <p
                  key={flashKey}
                  className={`led-value truncate text-3xl sm:text-4xl ${
                    result?.jackpot ? "led-jackpot" : ""
                  }`}
                >
                  {result ? result.value : "–".repeat(digitCount)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                {result?.jackpot && <span className="jackpot-tag">JACKPOT!</span>}
                {result && (
                  <button
                    type="button"
                    onClick={() => copyText(result.value, "led")}
                    aria-label="Salin hasil"
                    title="Salin hasil"
                    className="btn-metal"
                    style={{ width: 38, height: 38, borderRadius: 8 }}
                  >
                    {copiedId === "led" ? (
                      <CheckIcon className="h-4 w-4 text-jade-400" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Opsi */}
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
              <DigitSelector value={digitCount} onChange={setDigitCount} disabled={spinning} />
              <div className="flex flex-col gap-2.5 pb-1">
                <ToggleSwitch
                  checked={allowLeadingZero}
                  onChange={setAllowLeadingZero}
                  label="Boleh nol di depan"
                  disabled={spinning}
                />
                <ToggleSwitch
                  checked={allowRepeat}
                  onChange={setAllowRepeat}
                  label="Angka boleh kembar"
                  disabled={spinning}
                />
              </div>
            </div>

            {/* Tombol utama */}
            <div className="flex items-center justify-center gap-6 pt-1 sm:gap-10">
              <MetalButton
                label={soundOn ? "Matikan suara" : "Nyalakan suara"}
                active={soundOn}
                onClick={() => setSoundOn((s) => !s)}
              >
                {soundOn ? <SoundOnIcon /> : <SoundOffIcon />}
              </MetalButton>
              <SpinButton spinning={spinning} onClick={spin} />
              <MetalButton label="Reset riwayat dan statistik" onClick={resetAll}>
                <ResetIcon />
              </MetalButton>
            </div>

            {/* Statistik & riwayat */}
            <StatsTray spins={counters.spins} jackpots={counters.jackpots} hotDigit={hotDigit} />
            <HistoryPanel
              items={history}
              copiedId={copiedId}
              onCopyItem={copyText}
              onClear={() => {
                setHistory([]);
                showToast("Riwayat dibersihkan");
              }}
            />

            <div className="flex items-center justify-between text-[9px] font-bold tracking-[0.25em] text-muted/70">
              <span>SERI Nº 000-888</span>
              <span className="text-gold-600/80">KREDIT ∞</span>
            </div>
          </div>
        </div>

        <footer className="mt-6 flex flex-col items-center gap-1.5 pb-2 text-center text-xs text-muted">
          <p>
            Tekan <kbd className="kbd">SPASI</kbd> untuk memutar · hasil diacak dengan{" "}
            <span className="font-semibold text-cream-dim">crypto.getRandomValues</span>
          </p>
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted/70">
            Jackpot RNG · mesin hoki digital
          </p>
        </footer>
      </main>

      {/* Toast */}
      {toast && (
        <div
          key={toast.key}
          role="status"
          className="toast-pop fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-gold-600/50 bg-felt-700/95 px-4 py-2 text-xs font-semibold text-gold-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
