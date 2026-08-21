--- src/hooks/useSound.ts (原始)


+++ src/hooks/useSound.ts (修改后)
import { useCallback, useRef } from "react";

interface ToneOpts {
  type?: OscillatorType;
  gain?: number;
  when?: number;
  slide?: number;
}

/** Efek suara sintetis via Web Audio API — tanpa aset eksternal. */
export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    const AC: typeof AudioContext =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!ctxRef.current) ctxRef.current = new AC();
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const tone = useCallback(
    (freq: number, dur: number, opts: ToneOpts = {}) => {
      const ctx = getCtx();
      if (!ctx) return;
      const { type = "square", gain = 0.06, when = 0, slide } = opts;
      const t0 = ctx.currentTime + when;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    },
    [getCtx]
  );

  /** Klik detak saat gulungan berputar. */
  const tick = useCallback(
    () => tone(1900 + Math.random() * 500, 0.035, { type: "square", gain: 0.026 }),
    [tone]
  );

  /** Suara tuas ditarik. */
  const whoosh = useCallback(() => {
    tone(280, 0.28, { type: "triangle", gain: 0.09, slide: 940 });
    tone(120, 0.2, { type: "sawtooth", gain: 0.03, slide: 60 });
  }, [tone]);

  /** Gedebuk saat satu gulungan berhenti. */
  const thud = useCallback(() => {
    tone(210, 0.15, { type: "triangle", gain: 0.16, slide: 68 });
    tone(1500, 0.05, { type: "square", gain: 0.045 });
  }, [tone]);

  /** Ding kemenangan biasa. */
  const win = useCallback(() => {
    [660, 880, 1320].forEach((f, i) =>
      tone(f, 0.16, { type: "triangle", gain: 0.12, when: i * 0.09 })
    );
  }, [tone]);

  /** Fanfare jackpot. */
  const fanfare = useCallback(() => {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) =>
      tone(f, 0.18, { type: "triangle", gain: 0.13, when: i * 0.095 })
    );
    tone(2093, 0.55, { type: "sine", gain: 0.06, when: 0.72 });
  }, [tone]);

  return { tick, whoosh, thud, win, fanfare };
}
