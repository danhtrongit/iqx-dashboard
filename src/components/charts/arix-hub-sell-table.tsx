import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import type { ArixSellTrade } from "@/types/arix-sell";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface AriXHubSellTableProps {
  data: ArixSellTrade[];
  isLoading?: boolean;
}

export default function AriXHubSellTable({ data, isLoading }: AriXHubSellTableProps) {
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
          <div className="text-muted-foreground">Không có dữ liệu giao dịch</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Mã CK</TableHead>
              <TableHead>Ngày mua</TableHead>
              <TableHead className="text-right">Giá mua</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
              <TableHead>Ngày bán</TableHead>
              <TableHead className="text-right">Giá bán</TableHead>
              <TableHead className="text-right">% Lợi nhuận</TableHead>
              <TableHead className="text-right">P/L</TableHead>
              <TableHead className="text-right">Số ngày nắm giữ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((trade, index) => {
              const returnPercent = parseFloat(trade.returnPercent.replace("%", "")) || 0;
              const isProfit = returnPercent >= 0;

              return (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell className="font-bold">{trade.stockCode}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(trade.buyDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(trade.buyPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(trade.quantity)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(trade.sellDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(trade.sellPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className={`flex items-center justify-end gap-1 font-semibold ${
                        isProfit ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isProfit ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      )}
                      {trade.returnPercent}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-semibold ${
                        trade.profitLoss >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {trade.profitLoss >= 0 ? "+" : ""}
                      {formatCurrency(trade.profitLoss)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {trade.daysHeld} ngày
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

