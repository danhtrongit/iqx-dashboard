'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAllocatedICB } from "@/features/market/api/useMarket";
// Using native overflow container for reliable sticky header + clipping
import { icb_codes } from "@/data/icb_codes";

type Group = 'ALL' | 'HOSE' | 'HNX' | 'UPCOM';
type TimeFrame = 'ONE_DAY' | 'ONE_WEEK' | 'ONE_MONTH' | 'YTD' | 'ONE_YEAR';

function zeroPad4(code: number): string {
  const raw = String(code);
  if (raw.length >= 4) return raw;
  return raw.padStart(4, '0');
}

function getIcbMeta(code: number): { nameVi: string; nameEn: string; level?: number } {
  const raw = String(code);
  const padded = zeroPad4(code);
  const found = icb_codes.find((c) => c.name === raw) || icb_codes.find((c) => c.name === padded);
  return {
    nameVi: found?.viSector ?? padded,
    nameEn: found?.enSector ?? padded,
    level: (found as any)?.icbLevel,
  };
}

function getIcbName(code: number): string {
  const meta = getIcbMeta(code);
  return meta.nameVi || meta.nameEn;
}

function formatPercent(n?: number | null): string {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '-';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

function formatTyShort(vnd: number | string | null | undefined): string {
  const num = Number(vnd ?? 0);
  if (!Number.isFinite(num)) return '-';
  const ty = num / 1e9;
  const absTy = Math.abs(ty);
  if (absTy >= 1e3) return `${(ty / 1e3).toFixed(2)} K`;
  return `${ty.toFixed(2)} K`.replace(' K', ' K');
}

export default function AllocatedICBTable() {
  const [group, setGroup] = useState<Group>('ALL');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('ONE_WEEK');
  const [expandedParents, setExpandedParents] = useState<Record<number, boolean>>({});

  const { data, isLoading, error } = useAllocatedICB({ group, timeFrame });

  const { parents, childrenByParent } = useMemo(() => {
    const all = Array.isArray(data) ? data : [];
    const parentsArr = all.filter((x) => x.icbCodeParent == null);
    const childMap: Record<number, typeof all> = {};
    for (const item of all) {
      if (item.icbCodeParent != null) {
        const p = Number(item.icbCodeParent);
        if (!childMap[p]) childMap[p] = [] as any;
        childMap[p].push(item);
      }
    }
    // Sort parents and children by change percent desc
    const sortByChange = (a: any, b: any) => (b.icbChangePercent ?? 0) - (a.icbChangePercent ?? 0);
    parentsArr.sort(sortByChange);
    for (const k of Object.keys(childMap)) {
      childMap[Number(k)].sort(sortByChange);
    }
    return { parents: parentsArr, childrenByParent: childMap } as const;
  }, [data]);

  const timeFrameOptions: { value: TimeFrame; label: string }[] = [
    { value: 'ONE_DAY', label: 'Hôm nay' },
    { value: 'ONE_WEEK', label: '1W' },
    { value: 'ONE_MONTH', label: '1M' },
    { value: 'YTD', label: 'YTD' },
    { value: 'ONE_YEAR', label: '1Y' },
  ];

  function toggleParent(code: number) {
    setExpandedParents((prev) => ({ ...prev, [code]: !prev[code] }));
  }

  function FlowBar({ inc = 0, zero = 0, dec = 0 }: { inc?: number; zero?: number; dec?: number }) {
    const total = Math.max(inc + zero + dec, 1);
    const incPct = (inc / total) * 100;
    const zeroPct = (zero / total) * 100;
    const decPct = 100 - incPct - zeroPct;
    return (
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full" style={{ width: `${incPct}%`, backgroundColor: '#16a34a', display: 'inline-block' }} />
        <div className="h-full" style={{ width: `${zeroPct}%`, backgroundColor: '#f59e0b', display: 'inline-block' }} />
        <div className="h-full" style={{ width: `${decPct}%`, backgroundColor: '#dc2626', display: 'inline-block' }} />
      </div>
    );
  }

  return (
    <Card className="p-0">
      <CardHeader>
        <div className="flex items-center justify-between mt-4">
          <CardTitle className="text-lg">Ngành</CardTitle>
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
        {isLoading && <div className="min-h-[320px]" />}
        {error && (
          <div className="text-center text-red-500">{(error as Error).message}</div>
        )}
        {!isLoading && !error && (
          <div className="md:h-[320px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="sticky top-0 z-10 bg-background">
                <TableHead className="w-[40%]">Ngành</TableHead>
                <TableHead className="w-[15%] text-right">Biến động</TableHead>
                <TableHead className="w-[15%] text-right">Giá trị (tỷ VND)</TableHead>
                <TableHead className="w-[30%]">Dòng tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parents.map((p) => {
                const parentMeta = getIcbMeta(p.icb_code);
                const childrenRaw = childrenByParent[p.icb_code] ?? [];
                const children = childrenRaw.filter((c) => getIcbMeta(c.icb_code).nameVi !== parentMeta.nameVi);
                const isExpanded = !!expandedParents[p.icb_code];
                const value = p.totalValue ?? 0;
                return (
                  <React.Fragment key={p.icb_code}>
                    <TableRow className="cursor-pointer" onClick={() => toggleParent(p.icb_code)}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{children.length > 0 ? (isExpanded ? '−' : '+') : ''}</span>
                          <span className="font-medium">{getIcbName(p.icb_code)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right" style={{ color: (p.icbChangePercent ?? 0) >= 0 ? '#16a34a' : '#dc2626' }}>
                        {formatPercent(p.icbChangePercent)}
                      </TableCell>
                      <TableCell className="text-right">{formatTyShort(value)}</TableCell>
                      <TableCell>
                        <FlowBar inc={p.totalStockIncrease ?? 0} zero={p.totalStockNoChange ?? 0} dec={p.totalStockDecrease ?? 0} />
                      </TableCell>
                    </TableRow>
                    {isExpanded && children.map((c) => (
                      <TableRow key={`c-${p.icb_code}-${c.icb_code}`}>
                        <TableCell>
                          <div className="flex items-center gap-2 pl-7">
                            <span className="text-muted-foreground">•</span>
                            <span>{getIcbName(c.icb_code)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right" style={{ color: (c.icbChangePercent ?? 0) >= 0 ? '#16a34a' : '#dc2626' }}>
                          {formatPercent(c.icbChangePercent)}
                        </TableCell>
                        <TableCell className="text-right">{formatTyShort(c.totalValue ?? 0)}</TableCell>
                        <TableCell>
                          <FlowBar inc={c.totalStockIncrease ?? 0} zero={c.totalStockNoChange ?? 0} dec={c.totalStockDecrease ?? 0} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
            </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


