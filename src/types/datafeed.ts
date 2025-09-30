import {
  type SearchSymbolResultItem,
  type ResolutionString,
  type Bar,
  type LibrarySymbolInfo,
  type DatafeedConfiguration,
  type OnReadyCallback,
  type SearchSymbolsCallback,
  type ResolveCallback,
  type HistoryCallback,
  type SubscribeBarsCallback,
  type PeriodParams,
  type DatafeedErrorCallback,
  type HistoryMetadata,
} from '@/charting_library/datafeed-api.d.ts';

const PROXY_URL = (import.meta as any).env?.VITE_PROXY_URL || 'https://proxy.iqx.vn/proxy';
const API_URL = (import.meta as any).env?.VITE_API_URL || 'https://proxy.iqx.vn';

// Map TradingView resolutions to our API timeframes
const resolutionToTimeFrame: Record<string, string> = {
  '1': 'ONE_MINUTE',
  '5': 'FIVE_MINUTES',
  '15': 'FIFTEEN_MINUTES',
  '30': 'THIRTY_MINUTES',
  '60': 'ONE_HOUR',
  '1H': 'ONE_HOUR',
  '240': 'FOUR_HOURS',
  '4H': 'FOUR_HOURS',
  '1D': 'ONE_DAY',
  'D': 'ONE_DAY',
  '1W': 'ONE_WEEK',
  'W': 'ONE_WEEK',
  '1M': 'ONE_MONTH',
  'M': 'ONE_MONTH',
};

// Cache for symbol info
const symbolCache = new Map<string, LibrarySymbolInfo>();

export class Datafeed {
  private lastBarsCache = new Map<string, Bar>();
  private subscribers: Record<string, SubscribeBarsCallback> = {};

  onReady(callback: OnReadyCallback): void {
    console.log('[Datafeed]: onReady');
    setTimeout(() => {
      callback({
        exchanges: [
          { value: 'HSX', name: 'HOSE', desc: 'Ho Chi Minh Stock Exchange' },
          { value: 'HNX', name: 'HNX', desc: 'Hanoi Stock Exchange' },
          { value: 'UPCOM', name: 'UPCOM', desc: 'Unlisted Public Company Market' },
        ],
        symbols_types: [
          { name: 'Stock', value: 'stock' },
          { name: 'Index', value: 'index' },
        ],
        supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M'] as ResolutionString[],
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
      } as DatafeedConfiguration);
    }, 0);
  }

  searchSymbols(
    userInput: string,
    _exchange: string,
    _symbolType: string,
    onResult: SearchSymbolsCallback
  ): void {
    fetch(`${API_URL}/api/stocks/quick-search?q=${encodeURIComponent(userInput)}&limit=30`)
      .then(response => response.json())
      .then(data => {
        const results: SearchSymbolResultItem[] = data.map((item: any) => ({
          symbol: item.symbol,
          full_name: `${item.board}:${item.symbol}`,
          description: item.organShortName || item.name,
          exchange: item.board,
          ticker: item.symbol,
          type: item.type || 'stock',
        }));
        onResult(results);
      })
      .catch(error => {
        console.error('[Datafeed]: searchSymbols error', error);
        onResult([]);
      });
  }

  resolveSymbol(
    symbolName: string,
    onSymbolResolvedCallback: ResolveCallback,
    _onResolveErrorCallback: DatafeedErrorCallback,
    _extension?: any
  ): void {
    // Check cache first
    const cached = symbolCache.get(symbolName);
    if (cached) {
      setTimeout(() => onSymbolResolvedCallback(cached), 0);
      return;
    }

    // Extract the actual symbol from format like "HSX:VNM" or just "VNM"
    const actualSymbol = symbolName.includes(':') ? symbolName.split(':')[1] : symbolName;
    
    // Fetch symbol info from API
    fetch(`${API_URL}/api/stocks/exact/${actualSymbol}`)
      .then(response => {
        if (!response.ok) throw new Error('Symbol not found');
        return response.json();
      })
      .then(data => {
        const symbolInfo: LibrarySymbolInfo = {
          ticker: data.symbol,
          name: data.symbol,
          description: data.organShortName || data.name || data.symbol,
          type: data.symbol === 'VNINDEX' || data.symbol.includes('INDEX') ? 'index' : 'stock',
          session: '0900-1500',
          timezone: 'Asia/Ho_Chi_Minh',
          exchange: data.board || 'HSX',
          minmov: 1,
          pricescale: 100,
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: true,
          supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M'] as ResolutionString[],
          volume_precision: 0,
          data_status: 'endofday', // Tắt realtime, chỉ hiển thị data cuối ngày
          listed_exchange: data.board || 'HSX',
          format: 'price',
        };
        
        // Cache the symbol info
        symbolCache.set(symbolName, symbolInfo);
        symbolCache.set(actualSymbol, symbolInfo);
        
        onSymbolResolvedCallback(symbolInfo);
      })
      .catch(error => {
        const basicSymbolInfo: LibrarySymbolInfo = {
          ticker: actualSymbol,
          name: actualSymbol,
          description: actualSymbol,
          type: actualSymbol.includes('INDEX') ? 'index' : 'stock',
          session: '0900-1500',
          timezone: 'Asia/Ho_Chi_Minh',
          exchange: 'HSX',
          minmov: 1,
          pricescale: 100,
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: true,
          supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M'] as ResolutionString[],
          volume_precision: 0,
          data_status: 'endofday', // Tắt realtime, chỉ hiển thị data cuối ngày
          listed_exchange: 'HSX',
          format: 'price',
        };
        onSymbolResolvedCallback(basicSymbolInfo);
      });
  }

  getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onHistoryCallback: HistoryCallback,
    onErrorCallback: DatafeedErrorCallback
  ): void {
    
    const timeFrame = resolutionToTimeFrame[resolution] || 'ONE_DAY';
    const { from, to, countBack } = periodParams;
    
    // Calculate count back based on the time range if not provided
    let actualCountBack = countBack || 300;
    if (from && to && !countBack) {
      const diffInSeconds = to - from;
      const diffInDays = Math.ceil(diffInSeconds / 86400);
      
      switch (timeFrame) {
        case 'ONE_MINUTE':
          actualCountBack = Math.min(diffInDays * 78, 5000);
          break;
        case 'FIVE_MINUTES':
          actualCountBack = Math.min(diffInDays * 16, 2000);
          break;
        case 'FIFTEEN_MINUTES':
          actualCountBack = Math.min(diffInDays * 5, 1000);
          break;
        case 'THIRTY_MINUTES':
          actualCountBack = Math.min(diffInDays * 3, 1000);
          break;
        case 'ONE_HOUR':
          actualCountBack = Math.min(diffInDays * 2, 1000);
          break;
        case 'FOUR_HOURS':
          actualCountBack = Math.min(diffInDays / 2, 500);
          break;
        case 'ONE_DAY':
          actualCountBack = Math.min(diffInDays, 1300);
          break;
        case 'ONE_WEEK':
          actualCountBack = Math.min(Math.ceil(diffInDays / 7), 260);
          break;
        case 'ONE_MONTH':
          actualCountBack = Math.min(Math.ceil(diffInDays / 30), 60);
          break;
        default:
          actualCountBack = 300;
      }
    }
    
    const requestBody = {
      timeFrame,
      symbols: [symbolInfo.ticker],
      to: to || Math.floor(Date.now() / 1000),
      countBack: actualCountBack,
    };
    
    fetch(`${PROXY_URL}/trading/api/chart/OHLCChart/gap-chart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data: any[]) => {
        if (!data || !Array.isArray(data) || data.length === 0) {
          onHistoryCallback([], { noData: true });
          return;
        }
        
        const ohlcData = data[0];
        if (!ohlcData || !ohlcData.t || ohlcData.t.length === 0) {
          onHistoryCallback([], { noData: true });
          return;
        }
        
        const bars: Bar[] = [];
        for (let i = 0; i < ohlcData.t.length; i++) {
          const time = Number(ohlcData.t[i]);
          if (!Number.isFinite(time)) continue;
          
          const bar: Bar = {
            time: time * 1000, // Convert to milliseconds
            open: Number(ohlcData.o?.[i] ?? 0),
            high: Number(ohlcData.h?.[i] ?? 0),
            low: Number(ohlcData.l?.[i] ?? 0),
            close: Number(ohlcData.c?.[i] ?? 0),
            volume: Number(ohlcData.v?.[i] ?? 0),
          };
          
          // Validate bar data
          if (bar.open > 0 && bar.high > 0 && bar.low > 0 && bar.close > 0) {
            bars.push(bar);
          }
        }
        
        // Sort bars by time
        bars.sort((a, b) => a.time - b.time);
        
        // Filter bars by requested time range
        const filteredBars = bars.filter(bar => {
          const barTimeInSeconds = bar.time / 1000;
          return (!from || barTimeInSeconds >= from) && (!to || barTimeInSeconds <= to);
        });
        
        if (filteredBars.length > 0) {
          // Cache the last bar
          const lastBar = filteredBars[filteredBars.length - 1];
          const cacheKey = `${symbolInfo.ticker}_${resolution}`;
          this.lastBarsCache.set(cacheKey, lastBar);
        }
        
        const meta: HistoryMetadata = filteredBars.length === 0 ? { noData: true } : {};
        onHistoryCallback(filteredBars, meta);
      })
      .catch(error => {
        onErrorCallback(error.message || 'Failed to load data');
      });
  }

  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onRealtimeCallback: SubscribeBarsCallback,
    subscriberUID: string,
    _onResetCacheNeededCallback: () => void
  ): void {
    // Tắt tính năng realtime - chỉ lưu subscriber không thực hiện cập nhật
    this.subscribers[subscriberUID] = onRealtimeCallback;
    
    // DISABLED: Không cập nhật realtime
    // Nếu cần bật lại realtime trong tương lai, uncomment code bên dưới:
    /*
    const cacheKey = `${symbolInfo.ticker}_${resolution}`;
    const lastBar = this.lastBarsCache.get(cacheKey);
    
    if (lastBar) {
      // Simulate updates every 5 seconds for demo
      const interval = setInterval(() => {
        if (!this.subscribers[subscriberUID]) {
          clearInterval(interval);
          return;
        }
        
        // Create a simulated bar update
        const update: Bar = {
          ...lastBar,
          time: Date.now(),
          close: lastBar.close * (1 + (Math.random() - 0.5) * 0.002), // Random price movement
          volume: (lastBar.volume ?? 0) + Math.floor(Math.random() * 1000),
        };
        
        onRealtimeCallback(update);
      }, 5000);
    }
    */
  }

  unsubscribeBars(subscriberUID: string): void {
    delete this.subscribers[subscriberUID];
  }

  // Optional methods
  getServerTime?(callback: (time: number) => void): void {
    callback(Math.floor(Date.now() / 1000));
  }

  getMarks?(_symbolInfo: LibrarySymbolInfo, _from: number, _to: number, onDataCallback: any, _resolution: ResolutionString): void {
    // Not implemented for now
    onDataCallback([]);
  }

  getTimescaleMarks?(_symbolInfo: LibrarySymbolInfo, _from: number, _to: number, onDataCallback: any, _resolution: ResolutionString): void {
    // Not implemented for now
    onDataCallback([]);
  }
}