const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  thickness: number
) {
  const outerStart = polarToCartesian(cx, cy, r, endAngle);
  const outerEnd = polarToCartesian(cx, cy, r, startAngle);
  const innerStart = polarToCartesian(cx, cy, r - thickness, endAngle);
  const innerEnd = polarToCartesian(cx, cy, r - thickness, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${r - thickness} ${r - thickness} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

import ArrowRight from './ArrowRight'

export type Band = {
  label: string;
};

export interface GaugeSentimentProps {
  value?: number;
  bands?: Band[];
  activeBandIndex?: number;
  statusText?: string;
  sectionTitle?: string;
  sell?: number;
  neutral?: number;
  buy?: number;
}

const DEFAULT_BANDS: Band[] = [
  { label: "Rất xấu" },
  { label: "Xấu" },
  { label: "Trung lập" },
  { label: "Tốt" },
  { label: "Rất tốt" },
];

export default function GaugeSentiment({
  value = 70,
  bands = DEFAULT_BANDS,
  activeBandIndex = 3,
  statusText = "Tốt",
  sectionTitle = "Dao Động",
  sell = 2,
  neutral = 5,
  buy = 3,
}: GaugeSentimentProps) {
  const width = 360;
  const height = 180; // restore height to avoid clipping
  const cx = width / 2;
  const cy = height / 2 + 10; // still pull gauge up slightly
  const radius = 130;
  const thickness = 16;

  const start = -90;
  const end = 90;

  const bandCount = 5;
  const bandSweep = (end - start) / bandCount;

  // Compute pointer by sentiment score when counts are available; fallback to provided value
  const total = buy + neutral + sell;
  const derivedPercent = total > 0 ? ((buy - sell) / total + 1) / 2 * 100 : undefined;
  const pointerPercent = clamp(derivedPercent ?? value, 0, 100);
  const pointerAngle = start + (pointerPercent / 100) * (end - start);

  const baseTrack = "#E6E6E6"; // default gray
  const labelMuted = "#ABABAB";
  const activeColor = "#16A34A";
  // pointerFill kept for earlier implementation; not used now

  return (
    <div className="w-full max-w-sm mx-auto select-none">
      <svg width={width} height={height} viewBox={`0 0 ${width} 30`}>
        {Array.from({ length: bandCount }).map((_, i) => {
          const s = start + i * bandSweep;
          const e = s + bandSweep;
          const d = describeArc(cx, cy, radius, s, e, thickness);
          const isActive = i === activeBandIndex;
          const palette = ["#EF4444", "#F87171", "#9CA3AF", "#22C55E", "#10B981"]; // strong red, red, gray, green, strong green
          const bandColor = palette[i] ?? baseTrack;
          // desaturate non-active bands slightly
          const fillColor = isActive ? bandColor : bandColor;
          return <path key={i} d={d} fill={fillColor} opacity={isActive ? 1 : 1} />;
        })}

        {Array.from({ length: bandCount - 1 }).map((_, i) => {
          const gapAngle = start + (i + 1) * bandSweep;
          const p1 = polarToCartesian(cx, cy, radius, gapAngle);
          const p2 = polarToCartesian(cx, cy, radius - thickness, gapAngle);
          return (
            <line
              key={`gap-${i}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="#FFFFFF"
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })}

        {(() => {
          // Place pointer by rotating around center then translating to radius r.
          // The imported arrow points roughly to the right, but has an inherent tilt.
          // Apply a calibration offset so the tip points radially outward.
          const rotationOffset = -90; // degrees; adjust if your SVG baseline differs
          const angle = pointerAngle + rotationOffset;
          const size = 14; // px
          const r = radius - thickness - 6; // tip at inner edge
          return (
            <g transform={`translate(${cx}, ${cy}) rotate(${angle}) translate(${r}, 0)`}>
              <ArrowRight width={size} height={size} />
            </g>
          )
        })()}

        {bands.map((b, i) => {
          const mid = start + i * bandSweep + bandSweep / 2;
          const p = polarToCartesian(cx, cy, radius + 14, mid); // closer to arc
          const isActive = i === activeBandIndex;
          return (
            <text
              key={`label-${i}`}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={500}
              fill={isActive ? activeColor : labelMuted}
            >
              {b.label}
            </text>
          );
        })}

        <text x={cx} y={cy - 24} textAnchor="middle" fontSize={26} fontWeight={800} fill={activeColor}>
          {statusText}
        </text>
      </svg>

      <div className="mt-1 text-center">
        <div className="text-base font-semibold">{sectionTitle}</div>

        <div className="mt-1 grid grid-cols-3 gap-1 max-w-xs mx-auto">
          <div className="text-gray-500">Bán</div>
          <div className="text-gray-500">Trung lập</div>
          <div className="text-gray-500">Mua</div>

          <div className="text-xl font-bold text-gray-900">{sell}</div>
          <div className="text-xl font-bold text-gray-900">{neutral}</div>
          <div className="text-xl font-bold text-gray-900">{buy}</div>
        </div>
      </div>
    </div>
  );
}
