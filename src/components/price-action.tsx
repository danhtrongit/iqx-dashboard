import { useState, useMemo, useEffect } from "react";
import { usePriceAction } from "@/hooks/use-price-action";
import { priceActionService } from "@/services/price-action.service";
import type { PriceActionItem } from "@/types/price-action";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  BarChart3,
  Activity,
} from "lucide-react";

/* =========================
 * UI Helpers
 * ========================= */
function formatNumber(num: number, decimals: number = 0) {
  return num.toLocaleString("vi-VN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatPercent(num: number) {
  const formatted = num.toFixed(2);
  const sign = num > 0 ? "+" : "";
  return `${sign}${formatted}%`;
}

function getChangeColor(change: number) {
  if (change > 0) return "text-emerald-600 font-semibold";
  if (change < 0) return "text-rose-600 font-semibold";
  return "text-gray-600";
}

function getChangeBadge(change: number) {
  if (change > 0) {
    return (
      <Badge className="bg-emerald-600 hover:bg-emerald-700">
        <TrendingUp className="w-3 h-3 mr-1" />
        {formatPercent(change)}
      </Badge>
    );
  }
  if (change < 0) {
    return (
      <Badge className="bg-rose-600 hover:bg-rose-700">
        <TrendingDown className="w-3 h-3 mr-1" />
        {formatPercent(change)}
      </Badge>
    );
  }
  return <Badge variant="outline">{formatPercent(change)}</Badge>;
}

/* =========================
 * Sub-components
 * ========================= */
function StatsCards({ data }: { data: PriceActionItem[] }) {
  const stats = useMemo(() => priceActionService.calculateStats(data), [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tổng số mã
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalStocks}</div>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-emerald-600">
              ↑ {stats.positiveChange1D}
            </span>
            <span className="text-rose-600">
              ↓ {stats.negativeChange1D}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Trung bình 1D
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getChangeColor(stats.avgChange1D)}`}>
            {formatPercent(stats.avgChange1D)}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            7D: <span className={getChangeColor(stats.avgChange7D)}>{formatPercent(stats.avgChange7D)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tăng mạnh nhất
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.highestGainer1D ? (
            <>
              <div className="text-2xl font-bold">{stats.highestGainer1D.ticker}</div>
              <div className="text-emerald-600 font-semibold mt-1">
                {formatPercent(stats.highestGainer1D.change1D)}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">N/A</div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Giảm mạnh nhất
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.highestLoser1D ? (
            <>
              <div className="text-2xl font-bold">{stats.highestLoser1D.ticker}</div>
              <div className="text-rose-600 font-semibold mt-1">
                {formatPercent(stats.highestLoser1D.change1D)}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">N/A</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface PriceActionTableProps {
  data: PriceActionItem[];
}

function PriceActionTable({ data }: PriceActionTableProps) {
  const [sortBy, setSortBy] = useState<keyof PriceActionItem>("change1D");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedData = useMemo(() => {
    return priceActionService.sortData(data, sortBy, sortOrder);
  }, [data, sortBy, sortOrder]);

  const handleSort = (column: keyof PriceActionItem) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const SortButton = ({ column, label }: { column: keyof PriceActionItem; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(column)}
      className="h-8 font-semibold"
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
      {sortBy === column && (
        <span className="ml-1 text-xs">
          {sortOrder === "asc" ? "↑" : "↓"}
        </span>
      )}
    </Button>
  );

  return (
    <div className="rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
              <SortButton column="ticker" label="Mã CK" />
            </TableHead>
            <TableHead className="w-[120px]">
              <SortButton column="date" label="Ngày" />
            </TableHead>
            <TableHead className="text-right">
              <SortButton column="currentPrice" label="Giá" />
            </TableHead>
            <TableHead className="text-right">
              <SortButton column="change1D" label="1D %" />
            </TableHead>
            <TableHead className="text-right">
              <SortButton column="change7D" label="7D %" />
            </TableHead>
            <TableHead className="text-right">
              <SortButton column="change30D" label="30D %" />
            </TableHead>
            <TableHead className="text-right">
              <SortButton column="volume" label="KL" />
            </TableHead>
            <TableHead className="text-right">
              <SortButton column="percentFromHigh3M" label="% từ đỉnh 3M" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, index) => (
            <TableRow key={`${item.ticker}-${index}`}>
              <TableCell className="font-bold">{item.ticker}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {item.date}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatNumber(item.currentPrice)}
              </TableCell>
              <TableCell className="text-right">
                {getChangeBadge(item.change1D)}
              </TableCell>
              <TableCell className={`text-right ${getChangeColor(item.change7D)}`}>
                {formatPercent(item.change7D)}
              </TableCell>
              <TableCell className={`text-right ${getChangeColor(item.change30D)}`}>
                {formatPercent(item.change30D)}
              </TableCell>
              <TableCell className="text-right text-sm">
                {formatNumber(item.volume)}
              </TableCell>
              <TableCell className={`text-right ${getChangeColor(item.percentFromHigh3M)}`}>
                {formatPercent(item.percentFromHigh3M)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* =========================
 * Main component
 * ========================= */
export default function PriceActionDashboard() {
  const { data, isLoading, error } = usePriceAction();
  
  const allPriceData = data?.data || [];

  // Lấy danh sách các ngày có dữ liệu (unique dates)
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    allPriceData.forEach((item) => dates.add(item.date));
    return Array.from(dates).sort((a, b) => {
      // Parse DD/MM/YYYY to compare dates
      const parseDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      };
      return parseDate(b).getTime() - parseDate(a).getTime(); // Sort descending (latest first)
    });
  }, [allPriceData]);

  // Mặc định chọn ngày mới nhất
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Set ngày mới nhất khi dữ liệu load xong
  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  // Lọc dữ liệu theo ngày đã chọn
  const priceData = useMemo(() => {
    if (!selectedDate) return allPriceData;
    return allPriceData.filter((item) => item.date === selectedDate);
  }, [selectedDate, allPriceData]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-[600px] rounded-2xl" />
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

  if (priceData.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Không có dữ liệu Price Action</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-xl">Price Action Dashboard</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Theo dõi biến động giá và khối lượng giao dịch
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {priceData.length} mã CK
            </Badge>
          </div>
          
          <Separator className="my-4" />
          
          {/* Date Filter */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-muted-foreground">
              Chọn ngày:
            </label>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn ngày..." />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="ml-auto">
              Ngày mới nhất: {availableDates[0] || "N/A"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <StatsCards data={priceData} />

      {/* Data Table */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Danh sách cổ phiếu</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click vào tiêu đề cột để sắp xếp
          </p>
        </CardHeader>
        <CardContent>
          <PriceActionTable data={priceData} />
        </CardContent>
      </Card>
    </div>
  );
}
