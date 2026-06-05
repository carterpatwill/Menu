"use client";

import { useMemo, useState } from "react";
import type { DailyPoint } from "@/lib/analytics-service";

const OPENS_COLOR = "#3a7bd5";
const TAPS_COLOR = "#e8a52b";

function niceMax(raw: number): number {
  if (raw <= 5) return 5;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  if (n <= 1) return pow;
  if (n <= 2) return 2 * pow;
  if (n <= 5) return 5 * pow;
  return 10 * pow;
}

function formatDate(iso: string, short = false): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
    weekday: short ? undefined : undefined,
  });
}

export function TrendChart({ data }: { data: DailyPoint[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const W = 800;
  const H = 280;
  const padL = 36;
  const padR = 16;
  const padT = 12;
  const padB = 32;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const max = useMemo(() => {
    const m = Math.max(1, ...data.flatMap((d) => [d.opens, d.taps]));
    return niceMax(m);
  }, [data]);

  const xAt = (i: number) =>
    data.length <= 1 ? padL + innerW / 2 : padL + (i / (data.length - 1)) * innerW;
  const yAt = (v: number) => padT + innerH - (v / max) * innerH;

  const opensPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${xAt(i)},${yAt(d.opens)}`)
    .join(" ");
  const tapsPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${xAt(i)},${yAt(d.taps)}`)
    .join(" ");

  const opensArea =
    data.length > 0
      ? `${opensPath} L${xAt(data.length - 1)},${padT + innerH} L${xAt(0)},${padT + innerH} Z`
      : "";

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((p) => ({
    y: padT + innerH - p * innerH,
    label: Math.round(max * p),
  }));

  const xTickIdx = data.length <= 1 ? [0] : [0, Math.floor((data.length - 1) / 2), data.length - 1];

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    if (px < padL || px > padL + innerW) {
      setHoverIdx(null);
      return;
    }
    const rel = (px - padL) / innerW;
    const idx = Math.round(rel * (data.length - 1));
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  }

  const total = data.reduce((s, d) => s + d.opens + d.taps, 0);
  if (total === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-gray-400">
        Not enough data yet.
      </div>
    );
  }

  const hover = hoverIdx !== null ? data[hoverIdx] : null;
  const hoverX = hoverIdx !== null ? xAt(hoverIdx) : 0;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
        role="img"
        aria-label="Opens and taps trend"
      >
        <defs>
          <linearGradient id="opens-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={OPENS_COLOR} stopOpacity="0.18" />
            <stop offset="100%" stopColor={OPENS_COLOR} stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((g) => (
          <g key={g.y}>
            <line
              x1={padL}
              x2={padL + innerW}
              y1={g.y}
              y2={g.y}
              stroke="#f1f1f1"
              strokeWidth={1}
            />
            <text
              x={padL - 8}
              y={g.y + 3}
              fontSize={10}
              fill="#9ca3af"
              textAnchor="end"
            >
              {g.label}
            </text>
          </g>
        ))}

        <path d={opensArea} fill="url(#opens-fill)" />
        <path d={opensPath} fill="none" stroke={OPENS_COLOR} strokeWidth={2} />
        <path d={tapsPath} fill="none" stroke={TAPS_COLOR} strokeWidth={2} />

        {xTickIdx.map((i) => (
          <text
            key={i}
            x={xAt(i)}
            y={padT + innerH + 18}
            fontSize={10}
            fill="#9ca3af"
            textAnchor="middle"
          >
            {formatDate(data[i].date)}
          </text>
        ))}

        {hoverIdx !== null && hover && (
          <g pointerEvents="none">
            <line
              x1={hoverX}
              x2={hoverX}
              y1={padT}
              y2={padT + innerH}
              stroke="#d1d5db"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <circle cx={hoverX} cy={yAt(hover.opens)} r={4} fill="#fff" stroke={OPENS_COLOR} strokeWidth={2} />
            <circle cx={hoverX} cy={yAt(hover.taps)} r={4} fill="#fff" stroke={TAPS_COLOR} strokeWidth={2} />
          </g>
        )}
      </svg>

      {hover && hoverIdx !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md"
          style={{
            left: `${(hoverX / W) * 100}%`,
            top: 0,
          }}
        >
          <div className="font-medium text-gray-900">{formatDate(hover.date)}</div>
          <div className="mt-1 flex items-center gap-2 text-gray-600">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: OPENS_COLOR }} />
            <span className="tabular-nums">{hover.opens}</span>
            <span className="text-gray-400">opens</span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-gray-600">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: TAPS_COLOR }} />
            <span className="tabular-nums">{hover.taps}</span>
            <span className="text-gray-400">taps</span>
          </div>
        </div>
      )}
    </div>
  );
}
