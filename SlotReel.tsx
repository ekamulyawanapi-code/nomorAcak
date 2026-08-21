--- src/components/SlotReel.tsx (原始)


+++ src/components/SlotReel.tsx (修改后)
import { useEffect, useRef } from "react";

const VMAX = 22; // sel/detik kecepatan penuh
const ACC = 80; // percepatan sel/detik^2
const EXTRA = 8; // jarak tempuh tambahan saat pengereman (sel)
const BOUNCE = 0.38; // tinggi pantulan (sel)
const SETTLE_MS = 380;

type Phase = "idle" | "run" | "land" | "settle";

interface ReelState {
  p: number;
  v: number;
  phase: Phase;
  spinStart: number;
  last: number;
  raf: number;
  lastCell: number;
  landFrom: number;
  landDist: number;
  landT: number;
  landStart: number;
  settleStart: number;
  settleFrom: number;
  target: number;
  stopDelay: number;
}

interface SlotReelProps {
  index: number;
  /** Naikkan nilai ini untuk memicu putaran baru. */
  spinId: number;
  /** Digit 0-9 tempat gulungan harus berhenti. */
  target: number;
  /** Milidetik setelah putaran dimulai sebelum gulungan ini mengerem. */
  stopDelay: number;
  onDone: (index: number) => void;
  onTick: () => void;
}

/**
 * Satu gulungan ala mesin jackpot. Semua perhitungan dalam satuan "sel"
 * (tinggi satu digit) sehingga bebas dari ukuran piksel nyata.
 */
export default function SlotReel({
  index,
  spinId,
  target,
  stopDelay,
  onDone,
  onTick,
}: SlotReelProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cb = useRef({ onDone, onTick, index });
  cb.current = { onDone, onTick, index };

  const st = useRef<ReelState>({
    p: Math.floor(Math.random() * 10),
    v: 0,
    phase: "idle",
    spinStart: 0,
    last: 0,
    raf: 0,
    lastCell: -1,
    landFrom: 0,
    landDist: 0,
    landT: 1000,
    landStart: 0,
    settleStart: 0,
    settleFrom: 0,
    target,
    stopDelay,
  });

  const paint = (p: number, v: number) => {
    const center = Math.round(p);
    for (let o = -2; o <= 2; o++) {
      const el = cellRefs.current[o + 2];
      if (!el) continue;
      const ci = center + o;
      el.textContent = String(((ci % 10) + 10) % 10);
      const off = ci - p;
      el.style.setProperty("--off", off.toFixed(4));
      const fade = 1 - Math.min(Math.max(Math.abs(off) - 0.45, 0) / 1.05, 0.88);
      el.style.setProperty("--fade", fade.toFixed(3));
    }
    if (stripRef.current) {
      const blur = Math.min(v / VMAX, 1) * 3;
      stripRef.current.style.setProperty("--blur", `${blur.toFixed(2)}px`);
    }
  };

  const loop = (now: number) => {
    const s = st.current;
    const dt = Math.min((now - s.last) / 1000, 0.05);
    s.last = now;

    if (s.phase === "run") {
      s.v = Math.min(s.v + ACC * dt, VMAX);
      s.p += s.v * dt;
      const cell = Math.floor(s.p);
      if (cell !== s.lastCell) {
        s.lastCell = cell;
        cb.current.onTick();
      }
      if (now - s.spinStart >= s.stopDelay) {
        const base = Math.round(s.p);
        const delta = (((s.target - base) % 10) + 10) % 10;
        s.landFrom = s.p;
        s.landDist = delta + EXTRA;
        s.landT =
          Math.min(Math.max((2 * s.landDist) / Math.max(s.v, 12), 0.75), 1.35) * 1000;
        s.landStart = now;
        s.phase = "land";
      }
    } else if (s.phase === "land") {
      const t = Math.min((now - s.landStart) / s.landT, 1);
      const e = 1 - (1 - t) * (1 - t); // easeOutQuad — pengereman konstan
      s.p = s.landFrom + s.landDist * e;
      s.v = ((2 * s.landDist) / s.landT) * 1000 * (1 - t);
      const cell = Math.floor(s.p);
      if (cell !== s.lastCell) {
        s.lastCell = cell;
        cb.current.onTick();
      }
      if (t >= 1) {
        s.settleFrom = s.landFrom + s.landDist;
        s.p = s.settleFrom;
        s.settleStart = now;
        s.phase = "settle";
      }
    } else if (s.phase === "settle") {
      const u = Math.min((now - s.settleStart) / SETTLE_MS, 1);
      s.p = s.settleFrom + BOUNCE * Math.sin(Math.PI * u); // lewat sedikit, balik lagi
      s.v = 0;
      if (u >= 1) {
        s.p = s.settleFrom;
        s.phase = "idle";
        paint(s.p, 0);
        const fr = frameRef.current;
        if (fr) {
          fr.classList.remove("reel-land");
          void fr.offsetWidth; // restart animasi
          fr.classList.add("reel-land");
        }
        cb.current.onDone(cb.current.index);
        return;
      }
    }

    paint(s.p, s.v);
    s.raf = requestAnimationFrame(loop);
  };

  // Lukis posisi awal sekali saat mount.
  useEffect(() => {
    paint(st.current.p, 0);
    const s = st.current;
    return () => cancelAnimationFrame(s.raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mulai putaran setiap spinId berubah.
  useEffect(() => {
    if (spinId === 0) return;
    const s = st.current;
    cancelAnimationFrame(s.raf);
    s.target = target;
    s.stopDelay = stopDelay;
    s.v = 4;
    s.phase = "run";
    const now = performance.now();
    s.spinStart = now;
    s.last = now;
    s.lastCell = -1;
    frameRef.current?.classList.remove("reel-land");
    s.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(s.raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinId]);

  return (
    <div ref={frameRef} className="reel-frame" data-index={index}>
      <div className="reel-window">
        <div ref={stripRef} className="reel-strip">
          {[-2, -1, 0, 1, 2].map((o, i) => (
            <div
              key={o}
              ref={(el) => {
                cellRefs.current[i] = el;
              }}
              className="reel-cell"
            />
          ))}
        </div>
        <div className="reel-shade" />
      </div>
    </div>
  );
}
