import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Datafeed } from '@/types/datafeed';

// Type definitions for TradingView
declare global {
  interface Window {
    TradingView: {
      widget: new (options: any) => any;
    };
  }
}

interface ChartingLibraryWidgetOptions {
  symbol: string;
  datafeed: any;
  interval: string;
  container: string;
  library_path: string;
  locale: string;
  disabled_features?: string[];
  enabled_features?: string[];
  fullscreen?: boolean;
  autosize?: boolean;
  timezone?: string;
  theme?: string;
}

interface IChartingLibraryWidget {
  onChartReady(callback: () => void): void;
  remove(): void;
}

type ResolutionString = string;

interface TradingViewChartProps {
  symbol?: string;
  interval?: ResolutionString;
  height?: number | string;
}

export function TradingViewChart({
  symbol = 'VNINDEX',
  interval = '1D' as ResolutionString,
  height = 650,
}: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Use a stable container ID with useRef to prevent recreation on re-renders
  const containerIdRef = useRef(`tv_chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const containerId = containerIdRef.current;

  useEffect(() => {
    const loadTradingViewLibrary = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.TradingView) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = '/charting_library/charting_library.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load TradingView library'));
        document.head.appendChild(script);
      });
    };

    const initWidget = async () => {
      try {
        // Load the TradingView library first
        await loadTradingViewLibrary();

        // Wait a bit for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 200));

        if (!chartContainerRef.current) {
          return;
        }

        // Verify the element exists in DOM before initializing
        const containerElement = document.getElementById(containerId);
        if (!containerElement) {
          // Retry after a delay
          await new Promise(resolve => setTimeout(resolve, 500));
          const retryElement = document.getElementById(containerId);
          if (!retryElement) {
            setIsLoading(false);
            return;
          }
        }

        const widgetOptions: ChartingLibraryWidgetOptions = {
          symbol: symbol,
          datafeed: new Datafeed(),
          interval: interval as ResolutionString,
          container: containerId,
          library_path: '/charting_library/',
          locale: 'vi',
          disabled_features: [
            'header_saveload',
            'use_localstorage_for_settings',
          ],
          enabled_features: [
            'header_symbol_search',
            'header_chart_type',
            'header_indicators',
            'header_compare',
            'header_undo_redo',
            'header_screenshot',
            'header_settings',
            'left_toolbar',
            'control_bar',
          ],
          fullscreen: true,
          autosize: true,
          timezone: 'Asia/Ho_Chi_Minh',
          theme: 'light',
        };

        const tvWidget = new window.TradingView.widget(widgetOptions);

        tvWidget.onChartReady(() => {
          setIsLoading(false);
        });

        tvWidgetRef.current = tvWidget;
      } catch (error) {
        setIsLoading(false);
      }
    };

    initWidget();

    return () => {
      if (tvWidgetRef.current) {
        try {
          tvWidgetRef.current.remove();
        } catch (e) {
        }
        tvWidgetRef.current = null;
      }
    };
  }, []); // Only initialize once


  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className="relative w-full" style={{ height: heightStyle }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Đang tải biểu đồ TradingView...</p>
          </div>
        </div>
      )}
      <div
        ref={chartContainerRef}
        id={containerId}
        className="w-full h-96"
      />
    </div>
  );
}