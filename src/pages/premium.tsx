import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Crown,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Zap,
  TrendingUp,
  BarChart3,
  Shield,
  Clock,
} from "lucide-react";
import {
  useSubscriptionPackages,
  useCurrentPlan,
  useCreatePayment,
} from "@/hooks/use-payment";
import SubscriptionService from "@/services/subscription.service";
import type { SubscriptionPackage } from "@/types/subscription";
import type { CreatePaymentRequest } from "@/types/payment";

export default function PremiumUpgradePage() {
  const navigate = useNavigate();

  // Fetch data using hooks
  const {
    data: packages,
    isLoading: isLoadingPackages,
    error: packagesError,
  } = useSubscriptionPackages();

  const {
    data: currentPlan,
    isLoading: isLoadingPlan,
    error: planError,
  } = useCurrentPlan();

  const createPaymentMutation = useCreatePayment();

  const isLoading = isLoadingPackages || isLoadingPlan;
  const hasError = packagesError || planError;

  const handleUpgrade = async (packageId: string) => {
    const paymentData: CreatePaymentRequest = {
      packageId,
      returnUrl: `${window.location.origin}/payment/success`,
      cancelUrl: `${window.location.origin}/premium`,
    };

    createPaymentMutation.mutate(paymentData);
  };

  const getPackageFeatures = (pkg: SubscriptionPackage) => {
    const features = [];

    if (pkg.maxVirtualPortfolios) {
      features.push({
        icon: <BarChart3 className="h-4 w-4" />,
        text: `${pkg.maxVirtualPortfolios} danh mục đầu tư`,
      });
    }

    if (pkg.dailyApiLimit) {
      features.push({
        icon: <Zap className="h-4 w-4" />,
        text: `${pkg.dailyApiLimit.toLocaleString()} API calls/ngày`,
      });
    }

    if (pkg.features?.realTimeData) {
      features.push({
        icon: <TrendingUp className="h-4 w-4" />,
        text: "Dữ liệu thời gian thực",
      });
    }

    if (pkg.features?.advancedCharts) {
      features.push({
        icon: <BarChart3 className="h-4 w-4" />,
        text: "Biểu đồ nâng cao",
      });
    }

    if (pkg.features?.portfolioAnalysis) {
      features.push({
        icon: <TrendingUp className="h-4 w-4" />,
        text: "Phân tích danh mục đầu tư",
      });
    }

    if (pkg.features?.prioritySupport) {
      features.push({
        icon: <Shield className="h-4 w-4" />,
        text: "Hỗ trợ ưu tiên",
      });
    }

    if (pkg.features?.customAlerts) {
      features.push({
        icon: <Clock className="h-4 w-4" />,
        text: "Cảnh báo tùy chỉnh",
      });
    }

    if (pkg.features?.apiAccess) {
      features.push({
        icon: <Zap className="h-4 w-4" />,
        text: "Truy cập API",
      });
    }

    return features;
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {packagesError?.message || planError?.message || "Có lỗi xảy ra khi tải dữ liệu"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại
      </Button>

      <div className="flex items-center gap-3 mb-2">
        <Crown className="h-8 w-8 text-yellow-500" />
        <h1 className="text-3xl font-bold">Nâng cấp Premium</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Mở khóa toàn bộ tính năng và nâng cao trải nghiệm đầu tư của bạn
      </p>

      {currentPlan && currentPlan.hasPlan && (
        <Alert className="mb-8">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Bạn đang sử dụng gói <strong>{currentPlan.planName}</strong>
            {currentPlan.expiresAt && (
              <span>
                {" "}
                - Hết hạn vào{" "}
                {new Date(currentPlan.expiresAt).toLocaleDateString("vi-VN")}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages?.map((pkg) => {
          const features = getPackageFeatures(pkg);
          const isPopular = pkg.name.includes("Chuyên Nghiệp");
          const isCurrent =
            currentPlan?.planName === pkg.name && currentPlan?.hasPlan;
          const isProcessing =
            createPaymentMutation.isPending &&
            createPaymentMutation.variables?.packageId === pkg.id;

          return (
            <Card
              key={pkg.id}
              className={`relative ${
                isPopular ? "border-primary shadow-lg scale-105" : ""
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Phổ biến nhất
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {pkg.name}
                  {isCurrent && (
                    <Badge variant="outline" className="text-xs">
                      Đang dùng
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="min-h-[3rem]">
                  {pkg.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-3xl font-bold">
                    {SubscriptionService.formatPrice(pkg.price, pkg.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    / {pkg.durationDays} ngày
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      {feature.icon}
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={isPopular ? "default" : "outline"}
                  disabled={
                    isCurrent || createPaymentMutation.isPending || isProcessing
                  }
                  onClick={() => handleUpgrade(pkg.id)}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : isCurrent ? (
                    "Gói hiện tại"
                  ) : (
                    "Nâng cấp ngay"
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Alert className="mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Lưu ý:</strong> Thanh toán được xử lý an toàn qua PayOS. Sau
          khi thanh toán thành công, gói đăng ký sẽ được kích hoạt ngay lập
          tức.
        </AlertDescription>
      </Alert>
    </div>
  );
}
