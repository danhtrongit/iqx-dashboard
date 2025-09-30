import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  DollarSign,
  Trophy,
  BarChart3,
  Wallet,
  Shield,
  CheckCircle,
  AlertTriangle,
  Users,
  Crown
} from "lucide-react";
import { useCreatePortfolio, useVirtualPortfolio } from "@/hooks/use-virtual-trading";
import { VirtualTradingService } from "@/services/virtual-trading.service";

const INITIAL_BALANCE = 10000000000; // 10 tỷ VND

export default function VirtualTradingPage() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();

  const createPortfolioMutation = useCreatePortfolio();
  const { data: existingPortfolio, isLoading: isCheckingPortfolio } = useVirtualPortfolio({
    enabled: true,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleCreatePortfolio = async () => {
    try {
      await createPortfolioMutation.mutateAsync();
      setShowConfirmDialog(false);
      // Navigate to portfolio dashboard or trading page after creation
      navigate("/virtual-trading/portfolio");
    } catch (error) {
      // Error is handled by the mutation hook
      setShowConfirmDialog(false);
    }
  };

  // If user already has a portfolio, show different content
  if (existingPortfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-300" />
              </div>
              <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-300">
                Portfolio đã được tạo!
              </CardTitle>
              <CardDescription className="text-lg">
                Bạn đã có portfolio đấu trường ảo và sẵn sàng giao dịch
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <Wallet className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-sm text-muted-foreground">Số dư tiền mặt</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(existingPortfolio.cashBalance)}
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                  <BarChart3 className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <p className="text-sm text-muted-foreground">Tổng tài sản</p>
                  <p className="text-xl font-bold text-purple-600">
                    {formatCurrency(existingPortfolio.totalAssetValue)}
                  </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-center">
                  <TrendingUp className="h-8 w-8 mx-auto text-amber-600 mb-2" />
                  <p className="text-sm text-muted-foreground">Lãi/Lỗ</p>
                  <p className={`text-xl font-bold ${existingPortfolio.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(existingPortfolio.totalProfitLoss)}
                    ({VirtualTradingService.parsePercentage(existingPortfolio.profitLossPercentage).toFixed(2)}%)
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate("/ca-nhan")}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-5 w-5" />
                  Xem Portfolio
                </Button>

                <Button
                  onClick={() => navigate("/virtual-trading/leaderboard")}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Trophy className="h-5 w-5" />
                  Bảng xếp hạng
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
            <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-300" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Đấu trường Chứng khoán Ảo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Tham gia giao dịch chứng khoán với vốn ảo 10 tỷ VND. Trải nghiệm thực tế với giá real-time, không rủi ro tài chính.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold">Vốn khởi điểm</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Bắt đầu với {formatCurrency(INITIAL_BALANCE)} tiền ảo
              </p>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Hoàn toàn miễn phí
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-semibold">Giá thực tế</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Giao dịch với giá cổ phiếu real-time từ thị trường
              </p>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Cập nhật liên tục
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="h-6 w-6 text-amber-600" />
                <h3 className="text-lg font-semibold">Bảng xếp hạng</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Cạnh tranh với người chơi khác để giành vị trí top
              </p>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                Thi đấu hấp dẫn
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold">Không rủi ro</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Học hỏi và trải nghiệm mà không lo mất tiền thật
              </p>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                An toàn 100%
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 dark:border-indigo-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-6 w-6 text-indigo-600" />
                <h3 className="text-lg font-semibold">Cộng đồng</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Kết nối và học hỏi từ cộng đồng trader
              </p>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                Chia sẻ kinh nghiệm
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="h-6 w-6 text-orange-600" />
                <h3 className="text-lg font-semibold">Phí giao dịch</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Phí như thực tế: 0.15% mua/bán + 0.1% thuế bán
              </p>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Mô phỏng thực tế
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              Sẵn sàng bắt đầu hành trình đầu tư?
            </CardTitle>
            <CardDescription className="text-lg">
              Tạo portfolio ảo ngay để trải nghiệm giao dịch chứng khoán không rủi ro
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vốn khởi điểm</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(INITIAL_BALANCE)}
                </p>
              </div>
            </div>

            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="px-8 py-3 text-lg font-semibold"
                  disabled={isCheckingPortfolio || createPortfolioMutation.isPending}
                >
                  {isCheckingPortfolio ? "Đang kiểm tra..." : "Tạo Portfolio Ngay"}
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Xác nhận tạo Portfolio
                  </DialogTitle>
                  <DialogDescription className="space-y-3 pt-2">
                    <p>Bạn sắp tạo một portfolio đấu trường ảo với:</p>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Vốn ban đầu:</span>
                        <span className="font-bold text-blue-600">
                          {formatCurrency(INITIAL_BALANCE)}
                        </span>
                      </div>
                    </div>

                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Đây là tiền ảo dùng để giao dịch thử nghiệm. Bạn có thể mua/bán cổ phiếu với giá thực tế mà không có rủi ro tài chính.
                      </AlertDescription>
                    </Alert>
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                    disabled={createPortfolioMutation.isPending}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleCreatePortfolio}
                    disabled={createPortfolioMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {createPortfolioMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent"></div>
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4" />
                        Xác nhận tạo
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Bạn chỉ có thể tạo một portfolio duy nhất
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}