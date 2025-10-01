import { useState, useMemo } from "react";
import { useXGBoost } from "@/lib/xgboost/hooks";
import { XGBPrediction, FeatureRow } from "@/lib/xgboost/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

/* =========================
 * Feature display name mapping
 * ========================= */
const FEATURE_LABELS: Record<string, string> = {
    pct_from_ema20: "Giá đóng cửa so với EMA20",
    ret_1d: "Tỷ suất 1 phiên",
    ret_5d: "Tỷ suất 5 phiên",
    ret_20d: "Tỷ suất 20 phiên",
    macd_hist: "MACD histogram",
    rsi_14: "RSI_14",
    atr14_pct: "Biên độ giá",
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
            className={`w-full text-left transition border rounded-2xl p-3 hover:shadow-sm ${active ? "border-primary shadow" : "border-border"
                }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">{p.dateLabel}</Badge>
                    <span className="text-lg font-semibold tracking-wide">{p.ticker}</span>
                </div>
                <div className="min-w-[96px] text-right font-medium">
                    {formatPct(p.pWin, 2)}
                </div>
            </div>
            <div className="mt-2">{strengthBar(p.pWin)}</div>
        </button>
    );
}

function FeatureRowItem({ f, maxAbs }: { f: FeatureRow; maxAbs: number }) {
    const shap = f.shapValueLogit ?? 0;
    const label = displayFeatureName(f.feature);
    return (
        <div className="grid grid-cols-12 items-center gap-2 py-2">
            <div className="col-span-4 truncate">
                <div className="font-medium truncate">{label}</div>
                {label !== f.feature && (
                    <div className="text-xs text-muted-foreground truncate">({f.feature})</div>
                )}
            </div>
            <div className="col-span-2 text-sm text-muted-foreground tabular-nums">
                {f.featureValue ?? "—"}
            </div>
            <div className="col-span-2 text-sm tabular-nums">{(shap).toFixed(3)}</div>
            <div className="col-span-2">
                <DirectionBadge d={shap >= 0 ? "up" : "down"} />
            </div>
            <div className="col-span-12">
                <div className="h-2 rounded-full bg-muted">
                    <div
                        className={`h-2 rounded-full ${shap >= 0 ? "bg-emerald-600" : "bg-rose-600"
                            }`}
                        style={{ width: shapWidth(shap, maxAbs) }}
                    />
                </div>
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
            <div className="col-span-4">Yếu tố</div>
            <div className="col-span-2">Giá trị</div>
            <div className="col-span-2">SHAP (logit)</div>
            <div className="col-span-2">Chiều hướng</div>
            <div className="col-span-12">Độ ảnh hưởng</div>
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
                    <Badge variant="outline">All features</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {selected ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl border">
                            <div className="text-xs text-muted-foreground">Ticker</div>
                            <div className="text-lg font-semibold">{selected.ticker}</div>
                        </div>
                        <div className="p-3 rounded-xl border">
                            <div className="text-xs text-muted-foreground">Date</div>
                            <div className="text-lg font-semibold">{selected.dateLabel}</div>
                        </div>
                        <div className="p-3 rounded-xl border">
                            <div className="text-xs text-muted-foreground">p_win</div>
                            <div className="text-lg font-semibold">
                                {formatPct(selected.pWin, 3)}
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
    searchPlaceholder?: string; // default "Tìm mã (VD: FPT)"
}

export default function XGBoostDashboard({
    initialTicker,
    searchPlaceholder = "Tìm mã (VD: FPT)",
}: XGBoostDashboardProps) {
    const { data, isLoading, error, topList } = useXGBoost();
    const [q, setQ] = useState("");
    const [active, setActive] = useState<string | null>(initialTicker ?? null);

    const filtered = useMemo(() => {
        const query = q.trim().toUpperCase();
        if (!query) return topList;
        return topList.filter((x) => x.ticker.toUpperCase().includes(query));
    }, [q, topList]);

    const selected = useMemo(() => {
        if (active) {
            const found = topList.find((x) => x.ticker === active);
            if (found) return found;
        }
        return topList[0];
    }, [active, topList]);

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
        <TooltipProvider delayDuration={150}>
            <div className="grid gap-4 md:grid-cols-3">
                {/* Header */}
                <div className="md:col-span-3">
                    <ModelHeader selected={selected} />
                </div>

                {/* Left: filter + list */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">Danh sách mã</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder={searchPlaceholder}
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                            <Button variant="secondary" onClick={() => setQ("")}>
                                Clear
                            </Button>
                        </div>
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
                        <CardTitle className="text-base">Tất cả features</CardTitle>
                        <div className="text-xs text-muted-foreground">
                            {data?.updatedAt ? (
                                <span>Cập nhật: {new Date(data.updatedAt).toLocaleString()}</span>
                            ) : null}
                        </div>
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
    );
}
