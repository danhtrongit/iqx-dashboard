import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";
import type { ArixHoldPosition } from "@/types/arix-hold";

interface AriXHubHoldTableProps {
  data: ArixHoldPosition[];
  isLoading?: boolean;
}

export default function AriXHubHoldTable({ data, isLoading }: AriXHubHoldTableProps) {
  // Format number with thousand separators
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Format currency
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    
    try {
      // Check if date is in DD/MM/YYYY format
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        const date = new Date(`${year}-${month}-${day}`);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("vi-VN");
        }
      }
      
      // Try parsing as standard date format
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("vi-VN");
      }
      
      // If still invalid, return original string
      return dateStr;
    } catch {
      return dateStr;
    }
  };
  // Show loading state
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Đang tải dữ liệu...</div>
        </div>
      </Card>
    );
  }

  // Show no data state
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Không có dữ liệu nắm giữ</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden pt-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Mã CK</TableHead>
              <TableHead>Ngày mua</TableHead>
              <TableHead className="text-right">Giá mua</TableHead>
              <TableHead className="text-right">Giá hiện tại</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
              <TableHead className="text-right">Giá trị gốc</TableHead>
              <TableHead className="text-right">Giá trị hiện tại</TableHead>
              <TableHead className="text-right">% LN/L</TableHead>
              <TableHead className="text-right">P/L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((position, index) => {
              const originalValue = position.price * position.volume;
              const currentValue = (position.currentPrice || position.price) * position.volume;
              const hasCurrentPrice = position.currentPrice !== undefined;
              const isProfitable = hasCurrentPrice && (position.profitLoss || 0) >= 0;

              return (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell className="font-bold">{position.symbol}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(position.date)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(position.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {hasCurrentPrice ? (
                      <span className={position.currentPrice! > position.price ? "text-green-600" : position.currentPrice! < position.price ? "text-red-600" : ""}>
                        {formatCurrency(position.currentPrice!)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(position.volume)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(originalValue)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {hasCurrentPrice ? (
                      <span className={isProfitable ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(currentValue)}
                      </span>
                    ) : (
                      formatCurrency(currentValue)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {hasCurrentPrice && position.profitLossPercent !== undefined ? (
                      <div
                        className={`flex items-center justify-end gap-1 font-semibold ${
                          isProfitable ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isProfitable ? (
                          <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4" />
                        )}
                        {position.profitLossPercent >= 0 ? '+' : ''}
                        {position.profitLossPercent.toFixed(2)}%
                      </div>
                    ) : (
                      <span className="text-muted-foreground flex items-center justify-end gap-1">
                        <MinusIcon className="h-4 w-4" />
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {hasCurrentPrice && position.profitLoss !== undefined ? (
                      <span
                        className={`font-semibold ${
                          isProfitable ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {position.profitLoss >= 0 ? "+" : ""}
                        {formatCurrency(position.profitLoss)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow className="font-bold bg-muted/30">
              <TableCell colSpan={5} className="text-right">
                Tổng cộng:
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatCurrency(
                  data.reduce((sum, pos) => sum + (pos.price * pos.volume), 0)
                )}
              </TableCell>
              <TableCell className="text-right text-blue-600">
                {formatCurrency(
                  data.reduce((sum, pos) => sum + ((pos.currentPrice || pos.price) * pos.volume), 0)
                )}
              </TableCell>
              <TableCell className="text-right">
                {(() => {
                  const totalOriginal = data.reduce((sum, pos) => sum + (pos.price * pos.volume), 0);
                  const totalCurrent = data.reduce((sum, pos) => sum + ((pos.currentPrice || pos.price) * pos.volume), 0);
                  const totalPLPercent = totalOriginal > 0 ? ((totalCurrent - totalOriginal) / totalOriginal) * 100 : 0;
                  return (
                    <span className={totalPLPercent >= 0 ? "text-green-600" : "text-red-600"}>
                      {totalPLPercent >= 0 ? '+' : ''}
                      {totalPLPercent.toFixed(2)}%
                    </span>
                  );
                })()}
              </TableCell>
              <TableCell className="text-right">
                {(() => {
                  const totalPL = data.reduce((sum, pos) => sum + (pos.profitLoss || 0), 0);
                  return (
                    <span className={totalPL >= 0 ? "text-green-600" : "text-red-600"}>
                      {totalPL >= 0 ? '+' : ''}
                      {formatCurrency(totalPL)}
                    </span>
                  );
                })()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

