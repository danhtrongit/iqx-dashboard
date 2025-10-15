import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ArixPlanPosition } from "@/types/arix-plan";
import { TrendingUpIcon, ShieldAlertIcon, TargetIcon } from "lucide-react";

interface AriXHubPlanTableProps {
  data: ArixPlanPosition[];
  isLoading?: boolean;
}

export default function AriXHubPlanTable({ data, isLoading }: AriXHubPlanTableProps) {
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

  // Calculate potential return percentage
  const calculateReturnPercent = (buyPrice: number, target: number) => {
    if (buyPrice === 0) return 0;
    return ((target - buyPrice) / buyPrice) * 100;
  };

  // Calculate risk percentage
  const calculateRiskPercent = (buyPrice: number, stopLoss: number) => {
    if (buyPrice === 0) return 0;
    return ((buyPrice - stopLoss) / buyPrice) * 100;
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
          <div className="text-muted-foreground">Không có kế hoạch giao dịch</div>
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
              <TableHead className="text-right">Giá mua đề xuất</TableHead>
              <TableHead className="text-right">Giá cắt lỗ</TableHead>
              <TableHead className="text-right">Giá mục tiêu</TableHead>
              <TableHead className="text-right">Lợi nhuận tiềm năng</TableHead>
              <TableHead className="text-right">Rủi ro</TableHead>
              <TableHead className="text-right">Tỷ lệ Lãi/Rủi ro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((position, index) => {
              const returnPercent = calculateReturnPercent(position.buyPrice, position.target);
              const riskPercent = calculateRiskPercent(position.buyPrice, position.stopLoss);
              const isHighReturnRisk = position.returnRisk >= 5;
              const potentialGain = position.target - position.buyPrice;
              const potentialLoss = position.buyPrice - position.stopLoss;

              return (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell className="font-bold text-lg">{position.symbol}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(position.buyPrice)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrency(position.stopLoss)}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatCurrency(position.target)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-semibold text-green-600">
                    +{returnPercent.toFixed(2)}%
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-semibold text-red-600">
                      -{riskPercent.toFixed(2)}%
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant={isHighReturnRisk ? "default" : "secondary"}
                      className="font-bold"
                    >
                      {formatNumber(position.returnRisk)}
                    </Badge>
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

