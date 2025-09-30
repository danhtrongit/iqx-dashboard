import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

type EChartsOption = echarts.EChartsOption;

interface EChartsProps {
  option: EChartsOption;
  style?: React.CSSProperties;
  notMerge?: boolean;
  lazyUpdate?: boolean;
  opts?: {
    renderer?: 'canvas' | 'svg';
  };
}

export default function ECharts({ option, style, notMerge = false, lazyUpdate = false, opts }: EChartsProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        renderer: opts?.renderer || 'canvas',
      });
    }

    // Set option
    chartInstance.current.setOption(option, { notMerge, lazyUpdate });

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [option, notMerge, lazyUpdate, opts?.renderer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  return <div ref={chartRef} style={style} />;
}
