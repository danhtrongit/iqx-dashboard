import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface BubbleData {
  id: string;
  symbol: string;
  value: number;
  percentChange: number;
  volume?: number;
  details?: {
    profit: number;
    daysHeld: number;
    buyDate: string;
    quantity: number;
    buyPrice: number;
    sellPrice: number;
    sellDate: string;
    status: string;
  };
}

interface BubbleNode extends d3.SimulationNodeDatum {
  id: string;
  symbol: string;
  value: number;
  percentChange: number;
  radius: number;
  volume?: number;
  details?: BubbleData['details'];
}

interface AriXHubSellChartProps {
  data?: BubbleData[];
  width?: number;
  height?: number;
  onBubbleClick?: (bubble: BubbleData) => void;
}

export default function AriXHubSellChart({
  data = [],
  width = 1200,
  height = 500,
  onBubbleClick
}: AriXHubSellChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<BubbleNode, undefined> | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Tạo defs cho gradients và filters
    const defs = svg.append('defs');

    // Gradient cho bubbles xanh
    const greenGradient = defs
      .append('radialGradient')
      .attr('id', 'greenGradient');
    greenGradient.append('stop').attr('offset', '0%').attr('stop-color', '#86efac');
    greenGradient.append('stop').attr('offset', '100%').attr('stop-color', '#22c55e');

    // Gradient cho bubbles đỏ
    const redGradient = defs
      .append('radialGradient')
      .attr('id', 'redGradient');
    redGradient.append('stop').attr('offset', '0%').attr('stop-color', '#fca5a5');
    redGradient.append('stop').attr('offset', '100%').attr('stop-color', '#ef4444');

    // Shadow filter
    const filter = defs.append('filter').attr('id', 'shadow');
    filter
      .append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 3);
    filter
      .append('feOffset')
      .attr('dx', 0)
      .attr('dy', 2)
      .attr('result', 'offsetblur');
    filter
      .append('feComponentTransfer')
      .append('feFuncA')
      .attr('type', 'linear')
      .attr('slope', 0.3);
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Container group
    const g = svg.append('g');

    // Tạo scale cho radius dựa trên returnPercent (%)
    const radiusScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.value) || 100])
      .range([15, 50]);

    // Tạo scale cho opacity dựa trên returnPercent
    const opacityScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => Math.abs(d.percentChange)) || 100])
      .range([0.5, 1]);

    // Chuẩn bị nodes
    const nodes: BubbleNode[] = data.map((d) => ({
      ...d,
      radius: radiusScale(d.value),
      x: width / 2 + (Math.random() - 0.5) * (width) * 0.8,
      y: height / 2 + (Math.random() - 0.5) * height * 0.8,
    }));

    // Force simulation
    const simulation = d3
      .forceSimulation<BubbleNode>(nodes)
      .force('charge', d3.forceManyBody().strength(3))
      .force(
        'collision',
        d3.forceCollide<BubbleNode>().radius((d) => d.radius + 3)
      )
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    simulationRef.current = simulation;

    // Create bubble groups
    const bubbles = g
      .selectAll<SVGGElement, BubbleNode>('.bubble')
      .data(nodes)
      .join('g')
      .attr('class', 'bubble')
      .attr('cursor', 'grab')
      .call(
        d3
          .drag<SVGGElement, BubbleNode>()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      );

    // Circles
    bubbles
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) =>
        d.percentChange >= 0 ? 'url(#greenGradient)' : 'url(#redGradient)'
      )
      .attr('opacity', (d) => opacityScale(Math.abs(d.percentChange)))
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 1.5)
      .attr('filter', 'url(#shadow)');

    // Symbol text
    bubbles
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('fill', 'hsl(var(--foreground))')
      .attr('font-weight', 'bold')
      .attr('font-size', (d) => Math.min(d.radius / 2, 12))
      .attr('pointer-events', 'none')
      .text((d) => d.symbol);

    // Percentage text
    bubbles
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('fill', 'hsl(var(--foreground))')
      .attr('font-size', (d) => Math.min(d.radius / 3, 10))
      .attr('pointer-events', 'none')
      .text((d) => `${d.percentChange >= 0 ? '+' : ''}${d.percentChange.toFixed(1)}%`);

    // Animation on load
    bubbles
      .style('opacity', 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .style('opacity', 1);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      bubbles.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    function dragStarted(event: d3.D3DragEvent<SVGGElement, BubbleNode, BubbleNode>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
      d3.select(event.sourceEvent.target.parentNode).attr('cursor', 'grabbing');
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, BubbleNode, BubbleNode>) {
      const radius = event.subject.radius;
      // Giới hạn vị trí trong khung hình
      const constrainedX = Math.max(radius, Math.min(width - radius, event.x));
      const constrainedY = Math.max(radius, Math.min(height - radius, event.y));
      
      event.subject.fx = constrainedX;
      event.subject.fy = constrainedY;
    }

    function dragEnded(event: d3.D3DragEvent<SVGGElement, BubbleNode, BubbleNode>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
      d3.select(event.sourceEvent.target.parentNode).attr('cursor', 'grab');
    }

    return () => {
      simulation.stop();
    };
  }, [data, width, height, onBubbleClick]);

  // Show no data state
  if (!data || data.length === 0) {
    return (
      <div className="relative w-full h-full max-h-[500px] flex items-center justify-center bg-background/50 rounded-lg">
        <div className="text-muted-foreground">Không có dữ liệu giao dịch</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full max-h-[500px]">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-background/50 rounded-lg"
      />
    </div>
  );
}