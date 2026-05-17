// src/components/Tailor/MatchScoreRing.tsx
"use client";

interface Props {
  score: number | null;
  size?: number;
}

/** Circular JD-match score indicator. Renders a muted ring while score is null. */
export default function MatchScoreRing({ score, size = 88 }: Props) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = score ?? 0;
  const offset = circumference - (pct / 100) * circumference;

  const color =
    score === null ? "#cbd5e1" : pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold">{score === null ? "—" : `${pct}%`}</span>
        <span className="text-[10px] text-slate-500">match</span>
      </div>
    </div>
  );
}
