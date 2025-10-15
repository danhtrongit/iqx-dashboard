import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface BubbleData {
  id: string;
  symbol: string;
  value: number; // returnRisk value
  returnPercent: number;
  riskPercent: number;
  details?: {
    buyPrice: number;
    stopLoss: number;
    target: number;
    returnRisk: number;
    potentialGain: number;
    potentialLoss: number;
  };
}

interface BubbleNode extends d3.SimulationNodeDatum {
  id: string;
  symbol: string;
  value: number;
  returnPercent: number;
  riskPercent: number;
  radius: number;
  details?: BubbleData['details'];
}

interface AriXHubPlanChartProps {
  data?: BubbleData[];
  width?: number;
  height?: number;
  onBubbleClick?: (bubble: BubbleData) => void;
}

export default function AriXHubPlanChart({
  data = [],
  width = 1200,
  height = 500,
  onBubbleClick
}: AriXHubPlanChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<BubbleNode, undefined> | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create defs for gradients and filters
    const defs = svg.append('defs');

    // Gradient for high return/risk bubbles (green)
    const greenGradient = defs
      .append('radialGradient')
      .attr('id', 'greenGradient');
    greenGradient.append('stop').attr('offset', '0%').attr('stop-color', '#86efac');
    greenGradient.append('stop').attr('offset', '100%').attr('stop-color', '#22c55e');

    // Gradient for medium return/risk bubbles (yellow)
    const yellowGradient = defs
      .append('radialGradient')
      .attr('id', 'yellowGradient');
    yellowGradient.append('stop').attr('offset', '0%').attr('stop-color', '#fde047');
    yellowGradient.append('stop').attr('offset', '100%').attr('stop-color', '#eab308');

    // Gradient for low return/risk bubbles (orange)
    const orangeGradient = defs
      .append('radialGradient')
      .attr('id', 'orangeGradient');
    orangeGradient.append('stop').attr('offset', '0%').attr('stop-color', '#fdba74');
    orangeGradient.append('stop').attr('offset', '100%').attr('stop-color', '#f97316');

    // Shadow filter
    const filter = defs.append('filter').attr('id', 'shadow-plan');
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

    // Create scale for radius based on return/risk ratio
    const radiusScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.value) || 10])
      .range([30, 70]);

    // Prepare nodes
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

    // Circles - color based on return/risk ratio
    bubbles
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => {
        if (d.value >= 5) return 'url(#greenGradient)';
        if (d.value >= 3) return 'url(#yellowGradient)';
        return 'url(#orangeGradient)';
      })
      .attr('opacity', 0.85)
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#shadow-plan)');

    // Symbol text
    bubbles
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .attr('fill', 'hsl(var(--foreground))')
      .attr('font-weight', 'bold')
      .attr('font-size', (d) => Math.min(d.radius / 2, 16))
      .attr('pointer-events', 'none')
      .text((d) => d.symbol);

    // Return/Risk ratio text
    bubbles
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.7em')
      .attr('fill', 'hsl(var(--foreground))')
      .attr('font-size', (d) => Math.min(d.radius / 3, 12))
      .attr('font-weight', 'bold')
      .attr('opacity', 0.9)
      .attr('pointer-events', 'none')
      .text((d) => `R/R: ${d.value.toFixed(1)}`);

    // Return percentage text
    bubbles
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.8em')
      .attr('fill', 'hsl(var(--foreground))')
      .attr('font-size', (d) => Math.min(d.radius / 3.5, 10))
      .attr('opacity', 0.7)
      .attr('pointer-events', 'none')
      .text((d) => `+${d.returnPercent.toFixed(1)}%`);

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
      // Constrain position within bounds
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
        <div className="text-muted-foreground">Không có kế hoạch giao dịch</div>
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

