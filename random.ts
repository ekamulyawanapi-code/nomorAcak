--- src/lib/random.ts (原始)


+++ src/lib/random.ts (修改后)
/** RNG berbasis crypto.getRandomValues agar hasil benar-benar acak. */
export function randomInt(maxExclusive: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % maxExclusive;
}

export interface GenerateOptions {
  allowLeadingZero: boolean;
  allowRepeat: boolean;
}

/**
 * Membuat deretan digit acak sepanjang `count` (maks 5).
 * - allowLeadingZero=false  → digit pertama bukan 0 (bila count > 1)
 * - allowRepeat=false       → semua digit unik (sampling tanpa pengembalian)
 */
export function generateDigits(count: number, opts: GenerateOptions): number[] {
  const n = Math.min(Math.max(count, 1), 5);
  const digits: number[] = [];

  if (opts.allowRepeat) {
    for (let i = 0; i < n; i++) {
      const noZero = i === 0 && !opts.allowLeadingZero && n > 1;
      const min = noZero ? 1 : 0;
      digits.push(min + randomInt(10 - min));
    }
    return digits;
  }

  const pool = Array.from({ length: 10 }, (_, i) => i);
  for (let i = 0; i < n; i++) {
    const noZero = i === 0 && !opts.allowLeadingZero && n > 1;
    const candidates = noZero ? pool.filter((d) => d !== 0) : pool;
    const pick = candidates[randomInt(candidates.length)];
    digits.push(pick);
    pool.splice(pool.indexOf(pick), 1);
  }
  return digits;
}

/** Jackpot = minimal 2 digit dan semuanya kembar. */
export function isJackpot(digits: number[]): boolean {
  return digits.length >= 2 && digits.every((d) => d === digits[0]);
}
