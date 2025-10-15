import { useState, useMemo, useEffect } from "react";
import { useXGBoost } from "@/lib/xgboost/hooks";
import type { XGBPrediction, FeatureRow } from "@/lib/xgboost/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

/* =========================
 * Feature display name mapping
 * ========================= */
const FEATURE_LABELS: Record<string, string> = {
    pct_from_ema20: "Giá đóng cửa so với EMA20",
    ret_1d: "Tỷ suất 1 phiên",
    ret_5d: "Tỷ suất 5 phiên",
    ret_20d: "Tỷ suất 20 phiên",
    macd_hist: "MACD histogram",
    rsi_14: "RSI 14",
    atr14_pct: "Biên độ giá",
    volume: "Khối lượng giao dịch",
    close: "Giá đóng cửa",
    pct_from_ema50: "Giá đóng cửa so với EMA50",
};
function displayFeatureName(raw: string) {
    return FEATURE_LABELS[raw] ?? raw;
}

/* =========================
 * UI Helpers
 * ========================= */
function formatPct(n: number, digits = 2) {
    return `${(n * 100).toFixed(digits)}%`;
}
function strengthBar(p: number) {
    const pct = Math.max(0, Math.min(100, Math.round(p * 100)));
    return (
        <div className="h-2 w-full rounded-full bg-muted">
            <div
                className="h-2 rounded-full bg-primary transition-[width]"
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}
function shapWidth(shap: number, maxAbs: number) {
    if (!maxAbs) return "0%";
    const pct = Math.round((Math.abs(shap) / maxAbs) * 100);
    return `${Math.min(100, Math.max(0, pct))}%`;
}
function DirectionBadge({ d }: { d: "up" | "down" }) {
    return d === "up" ? (
        <Badge className="bg-emerald-600 hover:bg-emerald-700">↑ Tăng</Badge>
    ) : (
        <Badge variant="destructive">↓ Giảm</Badge>
    );
}

/* =========================
 * Sub-components
 * ========================= */
function TickerCard({
    p,
    active,
    onClick,
}: {
    p: XGBPrediction;
    active?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left transition border rounded p-3 hover:shadow-sm ${active ? "border-primary shadow" : "border-border"
                }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">{p.dateLabel}</Badge>
                    <span className="text-lg font-semibold tracking-wide">{p.ticker}</span>
                </div>
                <div className="min-w-[96px] text-right font-medium">
                    {formatPct(p.pWin, 0)}
                </div>
            </div>
            <div className="mt-2">{strengthBar(p.pWin)}</div>
        </button>
    );
}

function FeatureRowItem({ f, maxAbs }: { f: FeatureRow; maxAbs: number }) {
    const shap = f.shapValueLogit ?? 0;
    const label = displayFeatureName(f.feature);
    
    // Format as percentage for specific features
    const percentageFeatures = ['pct_from_ema20', 'ret_1d', 'ret_5d', 'ret_20d', 'atr14_pct'];
    // Round to integer for MACD histogram and RSI_14
    const integerFeatures = ['macd_hist', 'rsi_14'];
    
    const formattedValue = f.featureValue !== null && f.featureValue !== undefined
        ? percentageFeatures.includes(f.feature)
            ? formatPct(Number(f.featureValue), 2)
            : integerFeatures.includes(f.feature)
                ? Math.round(Number(f.featureValue)).toString()
                : f.featureValue
        : "—";
    
    return (
        <div className="grid grid-cols-12 items-center gap-2 py-2">
            <div className="col-span-4 truncate">
                <div className="font-medium truncate">{label}</div>
            </div>
            <div className="col-span-3 text-sm text-foreground tabular-nums">
                {formattedValue}
            </div>
            <div className="col-span-3 text-sm tabular-nums">{(shap).toFixed(3)}</div>
            <div className="col-span-2">
                <DirectionBadge d={shap >= 0 ? "up" : "down"} />
            </div>
        </div>
    );
}

function FeatureListAll({ items }: { items: FeatureRow[] }) {
    // Chia nhóm Tăng / Giảm & sort theo |SHAP| giảm dần
    const positives = useMemo(
        () =>
            [...items]
                .filter((x) => (x.shapValueLogit ?? 0) >= 0)
                .sort(
                    (a, b) =>
                        Math.abs(b.shapValueLogit ?? 0) - Math.abs(a.shapValueLogit ?? 0)
                ),
        [items]
    );
    const negatives = useMemo(
        () =>
            [...items]
                .filter((x) => (x.shapValueLogit ?? 0) < 0)
                .sort(
                    (a, b) =>
                        Math.abs(b.shapValueLogit ?? 0) - Math.abs(a.shapValueLogit ?? 0)
                ),
        [items]
    );
    const maxAbs = useMemo(
        () => Math.max(0, ...items.map((x) => Math.abs(x.shapValueLogit ?? 0))),
        [items]
    );

    const Header = () => (
        <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground">
            <div className="col-span-4">Biến ảnh hưởng</div>
            <div className="col-span-3">Giá trị</div>
            <div className="col-span-3">SHAP (logit)</div>
            <div className="col-span-2">Chiều hướng</div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Nhóm Tăng */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-emerald-600">TĂNG</Badge>
                    <span className="text-sm text-muted-foreground">
                        {positives.length} yếu tố
                    </span>
                </div>
                <Header />
                <Separator className="my-2" />
                <div className="space-y-3">
                    {positives.map((f, idx) => (
                        <FeatureRowItem key={`pos-${f.feature}-${idx}`} f={f} maxAbs={maxAbs} />
                    ))}
                    {positives.length === 0 && (
                        <div className="text-sm text-muted-foreground">Không có yếu tố “Tăng”.</div>
                    )}
                </div>
            </div>

            {/* Nhóm Giảm */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive">GIẢM</Badge>
                    <span className="text-sm text-muted-foreground">
                        {negatives.length} yếu tố
                    </span>
                </div>
                <Header />
                <Separator className="my-2" />
                <div className="space-y-3">
                    {negatives.map((f, idx) => (
                        <FeatureRowItem key={`neg-${f.feature}-${idx}`} f={f} maxAbs={maxAbs} />
                    ))}
                    {negatives.length === 0 && (
                        <div className="text-sm text-muted-foreground">Không có yếu tố “Giảm”.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ModelHeader({ selected }: { selected?: XGBPrediction }) {
    return (
        <Card className="rounded-2xl">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">XGBoost — Model Explorer</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {selected ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl border">
                            <div className="text-md text-muted-foreground">Mã chứng khoán</div>
                            <div className="text-lg font-semibold">{selected.ticker}</div>
                        </div>
                        <div className="p-3 rounded-xl border">
                            <div className="text-md text-muted-foreground">Ngày dự báo</div>
                            <div className="text-lg font-semibold">{selected.dateLabel}</div>
                        </div>
                        <div className="p-3 rounded-xl border">
                            <div className="text-md text-muted-foreground">Win Rate</div>
                            <div className="text-lg font-semibold">
                                {formatPct(selected.pWin, 0)}
                            </div>
                            <div className="mt-2">{strengthBar(selected.pWin)}</div>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground">
                        Chọn một mã để xem chi tiết.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/* =========================
 * Main component (props tối giản)
 * ========================= */
export interface XGBoostDashboardProps {
    initialTicker?: string;
}

export default function XGBoostDashboard({
    initialTicker,
}: XGBoostDashboardProps) {
    const { data, isLoading, error, topList } = useXGBoost();
    const [q, setQ] = useState("");
    const [active, setActive] = useState<string | null>(initialTicker ?? null);

    // Lấy danh sách các ngày có dữ liệu (unique dates)
    const availableDates = useMemo(() => {
        const dates = new Set<string>();
        topList.forEach((p) => dates.add(p.dateISO));
        return Array.from(dates).sort((a, b) => b.localeCompare(a)); // Sort descending (latest first)
    }, [topList]);

    // Mặc định chọn ngày mới nhất
    const [selectedDate, setSelectedDate] = useState<string>("");

    // Set ngày mới nhất khi dữ liệu load xong
    useEffect(() => {
        if (availableDates.length > 0 && !selectedDate) {
            setSelectedDate(availableDates[0]);
        }
    }, [availableDates, selectedDate]);

    // Lọc dữ liệu theo ngày đã chọn
    const dateFilteredList = useMemo(() => {
        if (!selectedDate) return topList;
        return topList.filter((x) => x.dateISO === selectedDate);
    }, [selectedDate, topList]);

    const filtered = useMemo(() => {
        const query = q.trim().toUpperCase();
        if (!query) return dateFilteredList;
        return dateFilteredList.filter((x) => x.ticker.toUpperCase().includes(query));
    }, [q, dateFilteredList]);

    const selected = useMemo(() => {
        if (active) {
            const found = dateFilteredList.find((x) => x.ticker === active);
            if (found) return found;
        }
        return dateFilteredList[0];
    }, [active, dateFilteredList]);

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-96 rounded-2xl md:col-span-1" />
                <Skeleton className="h-96 rounded-2xl md:col-span-2" />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Lỗi tải dữ liệu</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-destructive">{error.message}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="conainer mx-auto p-4">
            <TooltipProvider delayDuration={150}>
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Header */}
                    <div className="md:col-span-3">
                        <ModelHeader selected={selected} />
                    </div>

                    {/* Left: filter + list */}
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Danh sách mã</CardTitle>
                                <Badge className="text-lg" variant="secondary">{filtered.length} mã</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Date selector */}
                            <div>
                                <label className="text-xs text-muted-foreground mb-1.5 block">
                                    Chọn ngày
                                </label>
                                <Select value={selectedDate} onValueChange={setSelectedDate}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn ngày..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableDates.map((dateISO) => {
                                            // Tìm một prediction với date này để lấy dateLabel
                                            const pred = topList.find((p) => p.dateISO === dateISO);
                                            const label = pred?.dateLabel || dateISO;
                                            return (
                                                <SelectItem key={dateISO} value={dateISO}>
                                                    {label}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            <ScrollArea className="h-[520px] pr-2">
                                <div className="space-y-2">
                                    {filtered.map((p) => (
                                        <TickerCard
                                            key={`${p.ticker}-${p.dateISO}`}
                                            p={p}
                                            active={selected?.ticker === p.ticker}
                                            onClick={() => setActive(p.ticker)}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Right: ALL features, tách Tăng/Giảm */}
                    <Card className="rounded-2xl md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                        
                        </CardHeader>
                        <CardContent>
                            {selected ? (
                                <FeatureListAll items={selected.features} />
                            ) : (
                                <div className="text-sm text-muted-foreground">Không có dữ liệu.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </TooltipProvider>
        </div>
    );
}
