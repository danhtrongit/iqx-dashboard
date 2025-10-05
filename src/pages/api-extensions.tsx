import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Zap,
  TrendingUp,
  ShoppingCart,
  Package,
  Clock,
  DollarSign,
} from "lucide-react";
import {
  useApiExtensionPackages,
  useMyExtensions,
  useCreateExtensionPayment,
  usePurchaseHistory,
} from "@/hooks/use-api-extensions";
import { useCurrentPlan } from "@/hooks/use-payment";
import ApiExtensionService from "@/services/api-extension.service";
import type { ApiExtensionPackage } from "@/types/api-extension";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ApiExtensionsPage() {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<ApiExtensionPackage | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Fetch data
  const { data: packages, isLoading: isLoadingPackages, error: packagesError } = useApiExtensionPackages();
  const { data: myExtensions, isLoading: isLoadingMyExtensions } = useMyExtensions();
  const { data: history, isLoading: isLoadingHistory } = usePurchaseHistory();
  const { data: currentPlan } = useCurrentPlan();
  
  const createPaymentMutation = useCreateExtensionPayment();

  const isLoading = isLoadingPackages || isLoadingMyExtensions;
  const hasError = packagesError;

  const handlePurchaseClick = (pkg: ApiExtensionPackage) => {
    setSelectedPackage(pkg);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPackage) return;

    createPaymentMutation.mutate(
      {
        packageId: selectedPackage.id,
      },
      {
        onSuccess: () => {
          setIsConfirmDialogOpen(false);
          setSelectedPackage(null);
        },
      }
    );
  };

  const calculateSavings = (price: number, calls: number) => {
    const basePrice = 50; // Base price per call from smallest package
    const baseCost = calls * basePrice;
    const savings = ((baseCost - price) / baseCost) * 100;
    return savings > 0 ? savings.toFixed(0) : 0;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-semibold">Có lỗi xảy ra</h3>
          <p className="mt-2 text-muted-foreground">
            {packagesError?.message || "Không thể tải danh sách gói mở rộng"}
          </p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Zap className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Gói Mở Rộng API
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Tăng thêm API calls cho gói subscription hiện tại của bạn
        </p>
      </div>

      {/* Current Subscription Status */}
      {currentPlan && (
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Gói hiện tại</h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {currentPlan.planName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">API Limit</p>
                <p className="text-2xl font-bold">
                  {currentPlan.features.apiLimit?.toLocaleString() || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="packages" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="packages">
            <Package className="mr-2 h-4 w-4" />
            Gói mở rộng
          </TabsTrigger>
          <TabsTrigger value="my-extensions">
            <CheckCircle className="mr-2 h-4 w-4" />
            Gói đã mua
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="mr-2 h-4 w-4" />
            Lịch sử
          </TabsTrigger>
        </TabsList>

        {/* Available Packages Tab */}
        <TabsContent value="packages" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages?.map((pkg, index) => {
              const pricePerCall = ApiExtensionService.calculatePricePerCall(
                pkg.price,
                pkg.additionalCalls
              );
              const savings = calculateSavings(pkg.price, pkg.additionalCalls);

              return (
                <Card
                  key={pkg.id}
                  className="relative overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {savings > 0 && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-500 hover:bg-green-600 text-white">
                        Tiết kiệm {savings}%
                      </Badge>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                    <CardDescription className="text-base">
                      {pkg.description || "Tăng thêm API calls cho gói của bạn"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Price */}
                    <div>
                      <div className="text-4xl font-bold text-primary">
                        {ApiExtensionService.formatPrice(pkg.price, pkg.currency)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {pricePerCall.toLocaleString()}đ/call
                      </p>
                    </div>

                    {/* Additional Calls */}
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-100">
                          +{pkg.additionalCalls.toLocaleString()} API calls
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Thêm vào gói hiện tại
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Kích hoạt ngay lập tức</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Áp dụng cho subscription hiện tại</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Không giới hạn thời gian sử dụng</span>
                      </li>
                    </ul>

                    {/* Purchase Button */}
                    <Button
                      onClick={() => handlePurchaseClick(pkg)}
                      className="w-full"
                      size="lg"
                      disabled={!currentPlan?.hasPlan}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Mua ngay
                    </Button>

                    {!currentPlan?.hasPlan && (
                      <p className="text-xs text-center text-red-500">
                        Cần có subscription để mua gói mở rộng
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Info Note */}
          <Card className="mt-8 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    Lưu ý quan trọng:
                  </p>
                  <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                    <li>• Gói mở rộng chỉ áp dụng cho subscription ACTIVE hiện tại</li>
                    <li>• Khi gia hạn subscription, API calls sẽ reset về limit gốc</li>
                    <li>• Gói mở rộng không được chuyển sang subscription mới</li>
                    <li>• API calls được cộng dồn nếu mua nhiều gói</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Extensions Tab */}
        <TabsContent value="my-extensions" className="mt-6">
          {isLoadingMyExtensions ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : myExtensions?.extensions && myExtensions.extensions.length > 0 ? (
            <div className="space-y-4">
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Tổng API calls đã mua thêm
                    </p>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                      +{myExtensions.totalAdditionalCalls.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {myExtensions.extensions.map((ext) => (
                  <Card key={ext.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{ext.extensionPackageName}</CardTitle>
                      <CardDescription>
                        Mua ngày {new Date(ext.purchasedAt || ext.createdAt).toLocaleDateString("vi-VN")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">API calls:</span>
                          <span className="font-semibold">
                            +{ext.additionalCalls.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Giá:</span>
                          <span className="font-semibold">
                            {ApiExtensionService.formatPrice(ext.price, ext.currency)}
                          </span>
                        </div>
                        {ext.paymentReference && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Mã thanh toán:</span>
                            <span className="font-mono text-xs">
                              {ext.paymentReference}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có gói mở rộng</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Bạn chưa mua gói mở rộng nào cho subscription hiện tại
                </p>
                <Button onClick={() => document.querySelector('[value="packages"]')?.dispatchEvent(new Event('click'))}>
                  Xem gói mở rộng
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          {isLoadingHistory ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : history?.history && history.history.length > 0 ? (
            <div className="space-y-4">
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Tổng số lần mua
                      </p>
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {history.totalPurchases}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Tổng chi tiêu
                      </p>
                      <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                        {ApiExtensionService.formatPrice(history.totalSpent)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {history.history.map((ext) => (
                  <Card key={ext.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold">{ext.extensionPackageName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(ext.purchasedAt || ext.createdAt).toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {ApiExtensionService.formatPrice(ext.price, ext.currency)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            +{ext.additionalCalls.toLocaleString()} calls
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có lịch sử</h3>
                <p className="text-muted-foreground text-center">
                  Bạn chưa mua gói mở rộng nào
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirm Purchase Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận mua gói mở rộng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn mua gói này không?
            </DialogDescription>
          </DialogHeader>

          {selectedPackage && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between">
                <span className="font-medium">Gói:</span>
                <span>{selectedPackage.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">API calls:</span>
                <span>+{selectedPackage.additionalCalls.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Giá:</span>
                <span className="text-lg font-bold text-primary">
                  {ApiExtensionService.formatPrice(selectedPackage.price, selectedPackage.currency)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={createPaymentMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmPurchase}
              disabled={createPaymentMutation.isPending}
            >
              {createPaymentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Xác nhận mua
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

