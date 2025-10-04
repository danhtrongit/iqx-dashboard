import { useAuth } from "@/contexts/auth-context";
import { AriXProChatbot } from "@/components/chatbot/AriXProChatbot";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SubscriptionService } from "@/services/subscription.service";

export default function AriXProPage() {
  const { isAuthenticated, user } = useAuth();

  // Query to check if user has active subscription
  const { data: subscription, isLoading } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: () => SubscriptionService.getMySubscription(),
    enabled: isAuthenticated,
  });

  // Check if user has active subscription
  const hasActiveSubscription = subscription?.status === "active";

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang kiểm tra gói đăng ký...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - require login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-950 dark:to-purple-950/20">
        <Card className="max-w-md w-full p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/30">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Yêu cầu đăng nhập
          </h2>
          <p className="text-muted-foreground mb-6">
            Bạn cần đăng nhập để truy cập AriX Pro - Trợ lý AI chuyên nghiệp.
          </p>
          <Link to="/login">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
              Đăng nhập ngay
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Not subscribed - require subscription
  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-950 dark:to-purple-950/20">
        <Card className="max-w-2xl w-full p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-500/30">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              AriX Pro - Phiên bản Premium
            </h2>
            <p className="text-muted-foreground">
              Bạn cần gói Premium để sử dụng AriX Pro
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Phân tích AI ARIX Pro</h3>
                <p className="text-sm text-muted-foreground">
                  Phân tích chuyên sâu cổ phiếu với AI thế hệ mới nhất
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
              <Sparkles className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Chuyên gia phân tích</h3>
                <p className="text-sm text-muted-foreground">
                  Tổng hợp từ các báo cáo chuyên sâu của các chuyên gia phân tích IQX
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-violet-50 dark:bg-violet-950/30 rounded-lg">
              <Sparkles className="w-6 h-6 text-violet-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Dữ liệu Real-time</h3>
                <p className="text-sm text-muted-foreground">
                  Cập nhật liên tục từ thị trường chứng khoán
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-pink-50 dark:bg-pink-950/30 rounded-lg">
              <Sparkles className="w-6 h-6 text-pink-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Không giới hạn truy vấn</h3>
                <p className="text-sm text-muted-foreground">
                  Phân tích không giới hạn số lượng cổ phiếu
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/premium" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-purple-500/30">
                <Crown className="w-4 h-4 mr-2" />
                Nâng cấp Premium
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Quay lại trang chủ
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Has subscription - show chatbot
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/30 dark:from-gray-950 dark:via-purple-950/10 dark:to-indigo-950/10">
      <AriXProChatbot />
    </div>
  );
}

