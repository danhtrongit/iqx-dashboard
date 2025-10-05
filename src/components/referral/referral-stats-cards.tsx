import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, TrendingUp, Users, Gift } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ReferralStatsCardsProps {
  totalCommission?: any;
  stats?: any;
  isLoadingTotal: boolean;
  isLoadingStats: boolean;
}

export function ReferralStatsCards({
  totalCommission,
  stats,
  isLoadingTotal,
  isLoadingStats,
}: ReferralStatsCardsProps) {
  return (
    <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
      {/* Total Commission Card */}
      <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tổng hoa hồng</CardTitle>
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
            <Wallet className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingTotal ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              <div className="text-2xl font-bold">
                {formatCurrency(totalCommission?.total || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Đã nhận: {formatCurrency(totalCommission?.paid || 0)}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Approved Commission Card */}
      <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
          <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
            <TrendingUp className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingTotal ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              <div className="text-2xl font-bold">
                {formatCurrency(totalCommission?.approved || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Chờ thanh toán
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Total Referrals Card */}
      <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Số lượt giới thiệu</CardTitle>
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Users className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingStats ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              <div className="text-2xl font-bold">
                {stats?.totalReferrals || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Người được giới thiệu
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Direct Referrals Card */}
      <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tổng số người giới thiệu</CardTitle>
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Gift className="size-4 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingStats ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              <div className="text-2xl font-bold">
                {stats?.directReferrals?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Thành viên
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

