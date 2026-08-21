--- src/components/icons.tsx (原始)


+++ src/components/icons.tsx (修改后)
interface IconProps {
  className?: string;
}

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SoundOnIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...svgProps} className={className} aria-hidden>
      <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 6a9 9 0 0 1 0 12" />
    </svg>
  );
}

export function SoundOffIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...svgProps} className={className} aria-hidden>
      <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
      <path d="m16 9 6 6" />
      <path d="m22 9-6 6" />
    </svg>
  );
}

export function CopyIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...svgProps} className={className} aria-hidden>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

export function CheckIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...svgProps} className={className} aria-hidden>
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  );
}

export function TrashIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg {...svgProps} className={className} aria-hidden>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function ResetIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...svgProps} className={className} aria-hidden>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

export function StarIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.5 15 9l7 .8-5.2 4.7 1.4 6.9L12 17.9 5.8 21.4l1.4-6.9L2 9.8 9 9z" />
    </svg>
  );
}

export function SparkIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2c.6 4.9 2.4 6.9 7.5 7.5-5.1.6-6.9 2.6-7.5 7.5-.6-4.9-2.4-6.9-7.5-7.5C9.6 8.9 11.4 6.9 12 2z" />
      <path d="M19 14c.3 2.4 1.2 3.4 3.7 3.7-2.5.3-3.4 1.3-3.7 3.7-.3-2.4-1.2-3.4-3.7-3.7 2.5-.3 3.4-1.3 3.7-3.7z" />
    </svg>
  );
}

export function DiceIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...svgProps} className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
