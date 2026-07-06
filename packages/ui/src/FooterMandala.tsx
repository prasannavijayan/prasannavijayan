import type { ReactElement } from "react";

type MandalaVariant = "bloom" | "rings" | "star";

function Bloom() {
  const petals = Array.from({ length: 16 }, (_, i) => i * 22.5);
  return (
    <g className="stroke-accent" fill="none" strokeWidth="1">
      <circle cx="100" cy="100" r="96" />
      <circle cx="100" cy="100" r="64" />
      <circle cx="100" cy="100" r="32" />
      {petals.map((deg) => (
        <path key={deg} d="M100 4 Q116 44 100 96 Q84 44 100 4 Z" transform={`rotate(${deg} 100 100)`} />
      ))}
    </g>
  );
}

function Rings() {
  const spokes = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <g className="stroke-accent" fill="none" strokeWidth="1">
      <circle cx="100" cy="100" r="92" />
      <circle cx="100" cy="100" r="72" />
      <circle cx="100" cy="100" r="52" />
      <circle cx="100" cy="100" r="16" />
      {spokes.map((deg) => (
        <line key={deg} x1="100" y1="100" x2="100" y2="8" transform={`rotate(${deg} 100 100)`} />
      ))}
    </g>
  );
}

function Star() {
  const points = Array.from({ length: 10 }, (_, i) => i * 36);
  return (
    <g className="stroke-accent" fill="none" strokeWidth="1">
      <circle cx="100" cy="100" r="88" />
      <circle cx="100" cy="100" r="40" />
      {points.map((deg) => (
        <path key={deg} d="M100 12 L108 100 L100 188" transform={`rotate(${deg} 100 100)`} />
      ))}
    </g>
  );
}

const variants: Record<MandalaVariant, () => ReactElement> = {
  bloom: Bloom,
  rings: Rings,
  star: Star,
};

/** A faint decorative mandala. Always square — scale it via width/height on the
 * wrapping element rather than stretching the viewBox, or it distorts into an oval. */
export function FooterMandala({
  variant = "rings",
  className = "",
}: {
  variant?: MandalaVariant;
  className?: string;
}) {
  const Pattern = variants[variant];
  return (
    <svg
      className={`pointer-events-none absolute z-0 opacity-[0.16] theme-light:opacity-30 ${className}`.trim()}
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
    >
      <Pattern />
    </svg>
  );
}
