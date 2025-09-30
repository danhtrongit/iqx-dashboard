import { useMemo } from 'react'

// const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) }
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  thickness: number
) {
  const outerStart = polarToCartesian(cx, cy, r, endAngle)
  const outerEnd = polarToCartesian(cx, cy, r, startAngle)
  const innerStart = polarToCartesian(cx, cy, r - thickness, endAngle)
  const innerEnd = polarToCartesian(cx, cy, r - thickness, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${r - thickness} ${r - thickness} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ")
}

export interface TechnicalGaugeProps {
  title: string
  buy: number
  neutral: number
  sell: number
  recommendation?: string
}

// Softer, more legible palette and localized labels align with UI copy
const BANDS = [
  { label: "Bi quan quá mức", color: "#DC2626" }, // strong sell - red-600
  { label: "Bi quan", color: "#FCA5A5" },        // sell - red-300
  { label: "Trung tính", color: "#94A3B8" },     // neutral - slate-400
  { label: "Lạc quan", color: "#86EFAC" },       // buy - green-300
  { label: "Lạc quan quá mức", color: "#059669" }, // strong buy - emerald-600
]

export default function TechnicalGauge({ 
  title,
  buy = 0,
  neutral = 0, 
  sell = 0,
  recommendation = "Trung lập"
}: TechnicalGaugeProps) {
  const width = 360
  const height = 180
  const cx = width / 2
  const cy = height - 10
  const radius = 120
  const thickness = 20

  const start = -90
  const end = 90
  const bandCount = 5
  const bandSweep = (end - start) / bandCount

  // Calculate pointer position based on buy/sell/neutral counts
  const total = buy + neutral + sell
  
  // Determine recommendation and band based on counts
  const { pointerPercent, activeBandIndex } = useMemo(() => {
    if (total === 0) return { pointerPercent: 50, activeBandIndex: 2 }
    
    const buyRatio = buy / total
    const sellRatio = sell / total
    
    // Special case: All buys (like 12/0/0)
    if (buy > 0 && sell === 0 && neutral === 0) {
      return { 
        pointerPercent: 90, // Far right in "Mua mạnh" band
        activeBandIndex: 4 
      }
    }
    
    // Special case: All sells
    if (sell > 0 && buy === 0 && neutral === 0) {
      return { 
        pointerPercent: 10, // Far left in "Bán mạnh" band
        activeBandIndex: 0 
      }
    }
    
    // Calculate net score
    const score = buy - sell
    
    // More precise logic based on actual data patterns
    // Case: 5/1/4 (Dao động) - Sell slightly more than Buy
    if (sell > buy && sell <= 5 && buy >= 4) {
      return { 
        pointerPercent: 30, // "Bán" band
        activeBandIndex: 1 
      }
    }
    
    // Case: 5/1/16 (Tổng quan) - Strong Buy
    if (buy >= 16 && sell <= 5) {
      return { 
        pointerPercent: 85, // "Mua mạnh" band
        activeBandIndex: 4 
      }
    }
    
    // Case: 0/0/12 (Trung bình động) - All Buy
    if (buy >= 12 && sell === 0 && neutral === 0) {
      return { 
        pointerPercent: 90, // Far right in "Mua mạnh" band
        activeBandIndex: 4 
      }
    }
    
    // General cases based on ratios
    if (buyRatio > 0.7) {
      // Strong buy (>70% buy signals)
      return { 
        pointerPercent: 85,
        activeBandIndex: 4 
      }
    } else if (buyRatio > 0.5) {
      // Buy (>50% buy signals)
      return { 
        pointerPercent: 70,
        activeBandIndex: 3 
      }
    } else if (sellRatio > 0.6) {
      // Strong sell (>60% sell signals)
      return { 
        pointerPercent: 15,
        activeBandIndex: 0 
      }
    } else if (sellRatio > 0.4 || (sell > buy && score < 0)) {
      // Sell (>40% sell signals or sell > buy)
      return { 
        pointerPercent: 30,
        activeBandIndex: 1 
      }
    } else {
      // Neutral/balanced
      return { 
        pointerPercent: 50,
        activeBandIndex: 2 
      }
    }
  }, [buy, sell, neutral, total])

  const pointerAngle = start + (pointerPercent / 100) * (end - start)
  const clampedActiveBand = activeBandIndex

  // Get recommendation color
  const getRecommendationColor = () => {
    if (recommendation.includes("mạnh")) {
      if (recommendation.includes("Mua")) return "#059669" // emerald-600
      if (recommendation.includes("Bán")) return "#DC2626" // red-600
    }
    if (recommendation.includes("Mua")) return "#10B981" // emerald-500
    if (recommendation.includes("Bán")) return "#EF4444" // red-500
    return "#6B7280" // gray-500
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Draw gauge bands */}
        {BANDS.map((band, i) => {
          const s = start + i * bandSweep
          const e = s + bandSweep
          const d = describeArc(cx, cy, radius, s, e, thickness)
          const isActive = i === clampedActiveBand
          
          return (
            <path 
              key={i} 
              d={d} 
              fill={band.color}
              opacity={isActive ? 0.95 : 0.25}
            />
          )
        })}

        {/* Draw white gaps between bands */}
        {Array.from({ length: bandCount - 1 }).map((_, i) => {
          const gapAngle = start + (i + 1) * bandSweep
          const p1 = polarToCartesian(cx, cy, radius, gapAngle)
          const p2 = polarToCartesian(cx, cy, radius - thickness, gapAngle)
          return (
            <line
              key={`gap-${i}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="#FFFFFF"
              strokeWidth={2}
              opacity={0.9}
            />
          )
        })}

        {/* Draw pointer as a simple triangle */}
        {(() => {
          const pointerLength = 25
          // base width (unused)
          // const _pointerBase = 8
          const pointerRadius = radius - thickness - 10
          
          // Calculate pointer tip position
          const tipPos = polarToCartesian(cx, cy, pointerRadius + pointerLength, pointerAngle)
          
          // Calculate base points
          const baseAngle1 = pointerAngle - 5
          const baseAngle2 = pointerAngle + 5
          const base1 = polarToCartesian(cx, cy, pointerRadius, baseAngle1)
          const base2 = polarToCartesian(cx, cy, pointerRadius, baseAngle2)
          
          return (
            <g>
              {/* Pointer shadow */}
              <polygon
                points={`${tipPos.x},${tipPos.y} ${base1.x},${base1.y} ${base2.x},${base2.y}`}
                fill="rgba(0,0,0,0.2)"
                transform={`translate(2, 2)`}
              />
              {/* Pointer */}
              <polygon
                points={`${tipPos.x},${tipPos.y} ${base1.x},${base1.y} ${base2.x},${base2.y}`}
              fill="#111827"
              />
              {/* Pointer center dot */}
              <circle
                cx={cx}
                cy={cy}
                r={6}
                fill="#111827"
              />
            </g>
          )
        })()}

        {/* Draw band labels */}
        {BANDS.map((band, i) => {
          const mid = start + i * bandSweep + bandSweep / 2
          const p = polarToCartesian(cx, cy, radius + 18, mid)
          const isActive = i === clampedActiveBand
          
          return (
            <text
              key={`label-${i}`}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fontWeight={isActive ? 700 : 500}
              fill={isActive ? band.color : "#94A3B8"}
            >
              {band.label}
            </text>
          )
        })}

        {/* Center display - Recommendation text */}
        <text 
          x={cx} 
          y={cy - 40} 
          textAnchor="middle" 
          fontSize={22} 
          fontWeight={700} 
          fill={getRecommendationColor()}
        >
          {recommendation}
        </text>
      </svg>

      {/* Title */}
      <div className="text-center mt-2">
        <div className="text-base font-semibold">{title}</div>
      </div>

      {/* Counts display */}
      <div className="mt-3 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-sm text-gray-500">Bán</div>
          <div className="text-xl font-bold text-red-500">{sell}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Trung lập</div>
          <div className="text-xl font-bold text-gray-500">{neutral}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Mua</div>
          <div className="text-xl font-bold text-emerald-500">{buy}</div>
        </div>
      </div>
    </div>
  )
}