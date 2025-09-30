import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ArrowRight from './ArrowRight';

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

export interface MarketSentimentGaugeProps {
  index: number; // Percentage value 0-100
  result: string; // Result text like "Lạc quan"
}

const SENTIMENT_BANDS = [
  { label: "Bi quan quá mức", color: "#DC2626" }, // Red-600
  { label: "Bi quan", color: "#F87171" }, // Red-400
  { label: "Trung tính", color: "#9CA3AF" }, // Gray-400
  { label: "Lạc quan", color: "#4ADE80" }, // Green-400
  { label: "Lạc quan quá mức", color: "#16A34A" }, // Green-600
];

export default function CashFlowAllocation({
  index = 67,
  result = "Lạc quan"
}: MarketSentimentGaugeProps) {
  const width = 300;
  const height = 150;
  const cx = width / 2;
  const cy = height - 20;
  const radius = 100;
  const thickness = 20;

  const start = -90;
  const end = 90;

  const bandCount = 5;
  const bandSweep = (end - start) / bandCount;

  // Calculate which band the index falls into
  const percentPerBand = 100 / bandCount;
  const activeBandIndex = Math.floor(clamp(index, 0, 99.99) / percentPerBand);

  // Calculate pointer angle based on index
  const pointerPercent = clamp(index, 0, 100);
  const pointerAngle = start + (pointerPercent / 100) * (end - start);

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle> Tâm lý thị trường </CardTitle>
      </CardHeader>
      <CardContent>

        <svg className='mx-auto' width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Draw gauge bands */}
          {SENTIMENT_BANDS.map((band, i) => {
            const s = start + i * bandSweep;
            const e = s + bandSweep;
            const d = describeArc(cx, cy, radius, s, e, thickness);
            const isActive = i === activeBandIndex;

            return (
              <path
                key={i}
                d={d}
                fill={band.color}
                opacity={isActive ? 1 : 0.3}
              />
            );
          })}

          {/* Draw white gaps between bands */}
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
                strokeWidth={2}
              />
            );
          })}

          {/* Draw pointer using ArrowRight component */}
          <g transform={`translate(${cx}, ${cy}) rotate(${pointerAngle - 90}) translate(${radius - thickness - 8}, 0)`}>
            <ArrowRight width={10} height={10} />
          </g>

          {/* Draw band labels */}
          {SENTIMENT_BANDS.map((band, i) => {
            const mid = start + i * bandSweep + bandSweep / 2;
            const p = polarToCartesian(cx, cy, radius + 12, mid);
            const isActive = i === activeBandIndex;

            return (
              <text
                key={`label-${i}`}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontWeight={isActive ? 600 : 400}
                fill={isActive ? band.color : "#9CA3AF"}
              >
                {band.label}
              </text>
            );
          })}

          {/* Center display */}
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            fontSize={24}
            fontWeight={700}
            fill={SENTIMENT_BANDS[activeBandIndex]?.color || "#000"}
          >
            {index}%
          </text>
        </svg>

        {/* Result text */}
        <div className="text-center mt-2">
          <span
            className="text-base font-semibold"
            style={{ color: SENTIMENT_BANDS[activeBandIndex]?.color || "#000" }}
          >
            {result}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}