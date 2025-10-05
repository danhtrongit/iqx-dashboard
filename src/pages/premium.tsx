import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  Zap,
  Star,
  Users,
  TrendingUp,
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

  const getPackageFeatures = () => {
    // Tất cả các gói đều có cùng 4 tính năng Premium
    const features = [
      {
        icon: <Sparkles className="h-5 w-5" />,
        text: "AI Arix Pro – chuyên gia định giá cổ phiếu",
        subtitle: "10 câu hỏi/tháng",
      },
      {
        icon: <Zap className="h-5 w-5" />,
        text: "Đấu trường ảo đầu tư chứng khoán",
        subtitle: "Thực hành không giới hạn",
      },
      {
        icon: <Star className="h-5 w-5" />,
        text: "Dashboard quản lý danh mục chuyên nghiệp",
        subtitle: "Theo dõi hiệu suất realtime",
      },
      {
        icon: <Crown className="h-5 w-5" />,
        text: "Tín hiệu & cảnh báo realtime",
        subtitle: "Không bỏ lỡ cơ hội đầu tư",
      },
    ];

    return features;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950">
        <div className="container max-w-7xl mx-auto py-20 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
              <div className="absolute inset-0 blur-xl bg-purple-500/30 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950">
        <div className="container max-w-7xl mx-auto py-20 px-4">
          <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-600 font-medium">
                {packagesError?.message || planError?.message || "Có lỗi xảy ra khi tải dữ liệu"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container max-w-7xl mx-auto py-12 px-4 relative z-10">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-8 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border border-white/20 hover:bg-white/70 dark:hover:bg-gray-900/70 transition-all duration-300" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <Crown className="h-20 w-20 text-yellow-500 drop-shadow-2xl" />
              <div className="absolute inset-0 blur-2xl bg-yellow-500/40 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Nâng cấp Premium
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Mở khóa toàn bộ tính năng và nâng cao trải nghiệm đầu tư của bạn
          </p>
        </div>

        {/* Current Plan Alert */}
        {currentPlan && currentPlan.hasPlan && (
          <div className="mb-12 max-w-2xl mx-auto">
            <div className="backdrop-blur-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div className="absolute inset-0 blur-lg bg-green-500/30" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Bạn đang sử dụng gói <span className="text-green-600">{currentPlan.planName}</span>
                  </p>
                  {currentPlan.expiresAt && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Hết hạn vào {new Date(currentPlan.expiresAt).toLocaleDateString("vi-VN")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {packages?.sort((a, b) => a.durationDays - b.durationDays).map((pkg, index) => {
            const features = getPackageFeatures();
            const isCurrent =
              currentPlan?.planName === pkg.name && currentPlan?.hasPlan;
            const isProcessing =
              createPaymentMutation.isPending &&
              createPaymentMutation.variables?.packageId === pkg.id;

            const gradients = [
              "from-blue-500/20 via-cyan-500/20 to-teal-500/20",
              "from-purple-500/20 via-pink-500/20 to-rose-500/20",
              "from-orange-500/20 via-yellow-500/20 to-amber-500/20",
            ];

            const borderGradients = [
              "from-blue-500 via-cyan-500 to-teal-500",
              "from-purple-500 via-pink-500 to-rose-500",
              "from-orange-500 via-yellow-500 to-amber-500",
            ];

            return (
              <div
                key={pkg.id}
                className="group relative"
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${borderGradients[index % 3]} rounded-3xl blur-xl opacity-25 group-hover:opacity-50 transition-all duration-500`} />
                
                {/* Card */}
                <div className="relative backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl">
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % 3]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Content */}
                  <div className="relative p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {pkg.name}
                      </h3>
                      {isCurrent && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                          Đang dùng
                        </Badge>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {SubscriptionService.formatPrice(pkg.price, pkg.currency)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {pkg.durationDays} ngày sử dụng
                      </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                      {features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 group/feature"
                        >
                          <div className={`flex-shrink-0 p-2 rounded-lg bg-gradient-to-br ${gradients[index % 3]} border border-white/20`}>
                            {feature.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm leading-tight">
                              {feature.text}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {feature.subtitle}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                      className={`w-full h-12 text-base font-semibold bg-gradient-to-r ${borderGradients[index % 3]} hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 text-white`}
                      disabled={
                        isCurrent || createPaymentMutation.isPending || isProcessing
                      }
                      onClick={() => handleUpgrade(pkg.id)}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : isCurrent ? (
                        "Gói hiện tại"
                      ) : (
                        <>
                          Nâng cấp ngay
                          <Sparkles className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Referral Program Section */}
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-50 transition-all duration-500" />
            
            {/* Card */}
            <div className="relative backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl p-8 md:p-12">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Content */}
              <div className="relative">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
                        <Users className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute inset-0 blur-2xl bg-green-500/40 animate-pulse" />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Trở thành Cộng tác viên IQX
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                      Giới thiệu bạn bè và nhận hoa hồng định kỳ lên đến{" "}
                      <span className="font-bold text-green-600">15%</span> từ mỗi giao dịch
                    </p>
                    <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700 dark:text-gray-300">Thu nhập thụ động</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700 dark:text-gray-300">Hoa hồng định kỳ</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700 dark:text-gray-300">Không giới hạn cấp</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="flex-shrink-0">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 text-white px-8"
                      onClick={() => navigate("/partner-policy")}
                    >
                      Tìm hiểu thêm
                      <Sparkles className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
