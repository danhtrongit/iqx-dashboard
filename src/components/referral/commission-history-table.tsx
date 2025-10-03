import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp } from "lucide-react";
import { CommissionStatus } from "@/types/referral";
import { formatCurrency } from "@/lib/utils";

interface CommissionHistoryTableProps {
  commissions?: any[];
  isLoading: boolean;
}

export function CommissionHistoryTable({
  commissions,
  isLoading,
}: CommissionHistoryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử hoa hồng</CardTitle>
        <CardDescription>
          Theo dõi các khoản hoa hồng bạn nhận được
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : commissions && commissions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Cấp độ</TableHead>
                <TableHead>Giá trị gốc</TableHead>
                <TableHead>% Hoa hồng</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>
                    {new Date(commission.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">cấp {commission.tier}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(commission.originalAmount || 0)}</TableCell>
                  <TableCell>
                    {((commission.commissionPct || 0) * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(commission.amount || 0)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        commission.status === CommissionStatus.PAID
                          ? "default"
                          : commission.status === CommissionStatus.APPROVED
                          ? "secondary"
                          : commission.status === CommissionStatus.CANCELLED
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {commission.status === CommissionStatus.PAID
                        ? "Đã thanh toán"
                        : commission.status === CommissionStatus.APPROVED
                        ? "Đã duyệt"
                        : commission.status === CommissionStatus.CANCELLED
                        ? "Đã hủy"
                        : "Chờ duyệt"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="size-12 mx-auto mb-4 opacity-20" />
            <p>Chưa có hoa hồng nào</p>
            <p className="text-sm mt-1">
              Bắt đầu giới thiệu để nhận hoa hồng
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

