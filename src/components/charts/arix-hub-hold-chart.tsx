import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface BubbleData {
  id: string;
  symbol: string;
  value: number;
  volume: number;
  details?: {
    price: number;
    date: string;
    totalValue: number;
  };
}

interface BubbleNode extends d3.SimulationNodeDatum {
  id: string;
  symbol: string;
  value: number;
  volume: number;
  radius: number;
  details?: BubbleData['details'];
}

interface AriXHubHoldChartProps {
  data?: BubbleData[];
  width?: number;
  height?: number;
  onBubbleClick?: (bubble: BubbleData) => void;
}

export default function AriXHubHoldChart({
  data = [],
  width = 1200,
  height = 500,
  onBubbleClick
}: AriXHubHoldChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<BubbleNode, undefined> | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Tạo defs cho gradients và filters
    const defs = svg.append('defs');

    // Gradient cho bubbles (màu xanh dương cho holdings)
    const blueGradient = defs
      .append('radialGradient')
      .attr('id', 'blueGradient');
    blueGradient.append('stop').attr('offset', '0%').attr('stop-color', '#93c5fd');
    blueGradient.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6');

    // Gradient cho bubbles lớn (màu tím)
    const purpleGradient = defs
      .append('radialGradient')
      .attr('id', 'purpleGradient');
    purpleGradient.append('stop').attr('offset', '0%').attr('stop-color', '#c4b5fd');
    purpleGradient.append('stop').attr('offset', '100%').attr('stop-color', '#8b5cf6');

    // Shadow filter
    const filter = defs.append('filter').attr('id', 'shadow-hold');
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

    // Tạo scale cho radius dựa trên total value (price * volume)
    const radiusScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.value) || 100])
      .range([20, 60]);

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
      .force('charge', d3.forceManyBody().strength(5))
      .force(
        'collision',
        d3.forceCollide<BubbleNode>().radius((d) => d.radius + 4)
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

    // Circles - màu xanh dương cho giá trị nhỏ, màu tím cho giá trị lớn
    bubbles
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) =>
        d.value > (d3.max(data, (d) => d.value) || 0) / 2 
          ? 'url(#purpleGradient)' 
          : 'url(#blueGradient)'
      )
      .attr('opacity', 0.85)
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#shadow-hold)');

    // Symbol text
    bubbles
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .attr('fill', 'hsl(var(--foreground))')
      .attr('font-weight', 'bold')
      .attr('font-size', (d) => Math.min(d.radius / 2, 14))
      .attr('pointer-events', 'none')
      .text((d) => d.symbol);

    // Volume text
    bubbles
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('fill', 'hsl(var(--foreground))')
      .attr('font-size', (d) => Math.min(d.radius / 3.5, 10))
      .attr('opacity', 0.8)
      .attr('pointer-events', 'none')
      .text((d) => `${d.volume.toLocaleString('vi-VN')}`);

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
        <div className="text-muted-foreground">Không có dữ liệu nắm giữ</div>
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

