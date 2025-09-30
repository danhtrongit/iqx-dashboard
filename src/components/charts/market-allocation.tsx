'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAllocatedValue } from "@/features/market/api/useMarket";
import { type market } from "@/lib/schemas";
import ECharts from '@/components/ui/echarts';

type Group = 'ALL' | 'HOSE' | 'HNX' | 'UPCOM';
type TimeFrame = 'ONE_DAY' | 'ONE_WEEK' | 'ONE_MONTH' | 'YTD' | 'ONE_YEAR';

export default function MarketAllocation() {
  const [group, setGroup] = useState<Group>('ALL');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('ONE_WEEK');

  const { data, isLoading, error } = useAllocatedValue({ group, timeFrame });

  function firstNumeric(obj: Record<string, unknown> | undefined): number {
    if (!obj) return 0;
    for (const [key, val] of Object.entries(obj)) {
      if (key === 'group') continue;
      const n = Number(val as any);
      if (Number.isFinite(n)) return n;
    }
    return 0;
  }

  function aggregateFor(items: market.AllocatedValueResponse | undefined, wanted: Group | 'ALL') {
    if (!items || items.length === 0) {
      return {
        money: { increase: 0, nochange: 0, decrease: 0 },
        symbols: { inc: 0, zero: 0, dec: 0, total: 1, pctInc: 0, pctZero: 0, pctDec: 0 },
      };
    }

    const pickers = (item: market.AllocatedValueItem) => {
      const inc = firstNumeric(item.totalIncrease?.[0] as any);
      const zer = firstNumeric(item.totalNochange?.[0] as any);
      const dec = firstNumeric(item.totalDecrease?.[0] as any);

      const sInc = firstNumeric(item.totalSymbolIncrease?.[0] as any);
      const sZer = firstNumeric(item.totalSymbolNochange?.[0] as any);
      const sDec = firstNumeric(item.totalSymbolDecrease?.[0] as any);
      return { inc, zer, dec, sInc, sZer, sDec };
    };

    let filtered = items;
    if (wanted !== 'ALL') {
      filtered = items.filter((it) => (it.totalIncrease?.[0] as any)?.group === wanted);
    }

    const acc = filtered.reduce(
      (sum, it) => {
        const p = pickers(it);
        sum.inc += p.inc;
        sum.zer += p.zer;
        sum.dec += p.dec;
        sum.sInc += p.sInc;
        sum.sZer += p.sZer;
        sum.sDec += p.sDec;
        return sum;
      },
      { inc: 0, zer: 0, dec: 0, sInc: 0, sZer: 0, sDec: 0 }
    );

    const totalSymbols = Math.max(acc.sInc + acc.sZer + acc.sDec, 1);
    return {
      money: { increase: acc.inc, nochange: acc.zer, decrease: acc.dec },
      symbols: {
        inc: acc.sInc,
        zero: acc.sZer,
        dec: acc.sDec,
        total: totalSymbols,
        pctInc: Math.round((acc.sInc / totalSymbols) * 1000) / 10,
        pctZero: Math.round((acc.sZer / totalSymbols) * 1000) / 10,
        pctDec: Math.round((acc.sDec / totalSymbols) * 1000) / 10,
      },
    };
  }

  const computed = useMemo(() => aggregateFor(data, group), [data, group]);
  const money = computed.money;
  const symbols = computed.symbols;

  const timeFrameOptions: { value: TimeFrame; label: string }[] = [
    { value: 'ONE_DAY', label: 'Hôm nay' },
    { value: 'ONE_WEEK', label: '1W' },
    { value: 'ONE_MONTH', label: '1M' },
    { value: 'YTD', label: 'YTD' },
    { value: 'ONE_YEAR', label: '1Y' },
  ];

  const formatTy = (vnd: number) => {
    // Convert to "tỷ" (1e9 VND). Then scale with K/M if large
    const ty = vnd / 1e9;
    const absTy = Math.abs(ty);
    if (absTy >= 1e6) return `${(ty / 1e6).toFixed(1)} M tỷ`;
    if (absTy >= 1e3) return `${(ty / 1e3).toFixed(1)} K tỷ`;
    if (absTy >= 1) return `${ty.toFixed(1)} tỷ`;
    return `${ty.toFixed(3)} tỷ`;
  };

  const barOption = {
    textStyle: { fontFamily: 'inherit' },
    grid: { left: 12, right: 12, top: 24, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Tăng', 'Không đổi', 'Giảm'],
      axisLabel: { color: 'var(--muted-foreground)' },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: 'var(--border)' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: [money.increase, money.nochange, money.decrease],
        itemStyle: {
          color: (params: any) => ['#16a34a', '#9ca3af', '#dc2626'][params.dataIndex],
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: true,
          position: 'top',
          formatter: (p: any) => formatTy(p.value as number),
          fontFamily: 'inherit',
        },
        barWidth: 36,
      },
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (items: any[]) => {
        const it = items?.[0];
        return `${it.axisValue}: <b>${formatTy(it.value as number)}</b>`;
      },
      textStyle: { fontFamily: 'inherit' },
    },
  } as const;

  const pieOption = {
    textStyle: { fontFamily: 'inherit' },
    tooltip: {
      trigger: 'item',
      formatter: (it: any) => `${it.marker} ${it.name}: <b>${it.value}</b> (${it.percent}%)`,
      textStyle: { fontFamily: 'inherit' },
    },
    series: [
      {
        name: 'Symbols',
        type: 'pie',
        radius: ['50%', '80%'],
        left: '8%',
        right: '8%',
        avoidLabelOverlap: false,
        minAngle: 5,
        label: {
          show: true,
          position: 'outside',
          formatter: (p: any) => `${p.name}\n${p.value} (${p.percent}%)`,
          fontFamily: 'inherit',
        },
        labelLayout: { hideOverlap: true },
        labelLine: {
          show: true,
          length: 10,
          length2: 8,
          smooth: false,
          lineStyle: {},
        },
        data: [
          { value: symbols.inc, name: 'Tăng', itemStyle: { color: '#16a34a' } },
          { value: symbols.zero, name: 'Không đổi', itemStyle: { color: '#9ca3af' } },
          { value: symbols.dec, name: 'Giảm', itemStyle: { color: '#dc2626' } },
        ],
      },
    ],
  } as const;

  return (
    <Card className="p-0">
      <CardHeader>
        <div className="flex items-center justify-between mt-4">
          <CardTitle className="text-lg">Phân bổ</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0 border rounded-md w-fit border-border">
              {timeFrameOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant={timeFrame === opt.value ? 'default' : 'ghost'}
                  size="sm"
                  className="px-2"
                  onClick={() => setTimeFrame(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
            <Select value={group} onValueChange={(g: Group) => setGroup(g)}>
              <SelectTrigger size="sm">
                <SelectValue placeholder="Nhóm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">ALL</SelectItem>
                <SelectItem value="HOSE" className="text-xs">HOSE</SelectItem>
                <SelectItem value="HNX" className="text-xs">HNX</SelectItem>
                <SelectItem value="UPCOM" className="text-xs">UPCOM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[320px]">
            <div className="flex items-end justify-around">
              {['', '', ''].map((_, i) => (
                <div key={i} className="w-20 h-64 bg-muted rounded-md animate-pulse" />
              ))}
            </div>
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-muted w-[220px] h-[220px] animate-pulse" />
            </div>
          </div>
        )}
        {error && (
          <div className="text-center text-red-500">{(error as Error).message}</div>
        )}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="text-base font-semibold mb-2">Dòng tiền</div>
              <ECharts option={barOption as any} style={{ height: 320, width: '100%' }} notMerge lazyUpdate />
            </div>
            <div className="space-y-2">
              <div className="text-base font-semibold mb-2">Số lượng cổ phiếu</div>
              <ECharts option={pieOption as any} style={{ height: 320, width: '100%' }} notMerge lazyUpdate />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


