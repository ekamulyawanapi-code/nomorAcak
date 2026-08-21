--- src/components/Marquee.tsx (原始)


+++ src/components/Marquee.tsx (修改后)
import type { ReactNode } from "react";

function BulbRow({ count = 12 }: { count?: number }) {
  return (
    <div className="bulb-row" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="bulb" style={{ animationDelay: `${(i % 7) * 0.14}s` }} />
      ))}
    </div>
  );
}

/** Papan nama mesin dengan deretan bohlam yang berkejar-kejaran. */
export default function Marquee({ children }: { children: ReactNode }) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-gold-600/60 bg-gradient-to-b from-[#3a1515] via-[#4a1919] to-[#2c0f0f] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-12px_26px_rgba(0,0,0,0.5),0_10px_24px_rgba(0,0,0,0.45)]">
      <div className="py-2.5">
        <BulbRow />
      </div>
      <div className="relative overflow-hidden px-4 pb-4 pt-1.5 text-center sm:px-8">
        <span className="marquee-shine" aria-hidden />
        {children}
      </div>
      <div className="py-2.5">
        <BulbRow />
      </div>
    </header>
  );
}
