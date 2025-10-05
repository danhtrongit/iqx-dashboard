import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Zap, TrendingUp, ShoppingCart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import type { UsageResponse } from "@/types/arix-pro";

interface ApiUsageDisplayProps {
  usage: UsageResponse | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  compact?: boolean;
}

export function ApiUsageDisplay({
  usage,
  isLoading,
  onRefresh,
  compact = false,
}: ApiUsageDisplayProps) {
  const navigate = useNavigate();

  // Auto refresh on mount
  useEffect(() => {
    if (onRefresh && !usage) {
      onRefresh();
    }
  }, [onRefresh, usage]);

  if (isLoading) {
    return (
      <Card className={compact ? "w-full" : "w-full"}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">
              Đang tải thông tin sử dụng...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return null;
  }

  const percentageUsed = (usage.currentUsage / usage.limit) * 100;
  const isNearLimit = percentageUsed >= 80;
  const isAtLimit = percentageUsed >= 100;

  // Determine status color
  const getStatusColor = () => {
    if (isAtLimit) return "text-red-600 dark:text-red-400";
    if (isNearLimit) return "text-orange-600 dark:text-orange-400";
    return "text-green-600 dark:text-green-400";
  };

  // Determine progress color
  const getProgressColor = () => {
    if (isAtLimit) return "bg-red-500";
    if (isNearLimit) return "bg-orange-500";
    return "bg-green-500";
  };

  // Compact view for embedding in chat interface
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">API Usage</span>
          <span className={`font-bold ${getStatusColor()}`}>
            {usage.currentUsage.toLocaleString()} / {usage.limit.toLocaleString()}
          </span>
        </div>
        <Progress
          value={percentageUsed}
          className={`h-2 ${getProgressColor()}`}
        />
        {isNearLimit && (
          <div className="flex items-start space-x-2 text-xs text-orange-600 dark:text-orange-400">
            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>
              {isAtLimit
                ? "Đã hết quota. Vui lòng mua gói mở rộng."
                : "Sắp hết quota. Xem xét mua gói mở rộng."}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Full card view
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            API Usage
          </CardTitle>
          <Badge variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "default"}>
            {percentageUsed.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage Statistics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">
              {usage.currentUsage.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Đã dùng</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {usage.remaining.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Còn lại</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-muted-foreground">
              {usage.limit.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Tổng cộng</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress
            value={percentageUsed}
            className={`h-3 ${getProgressColor()}`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>{usage.limit.toLocaleString()}</span>
          </div>
        </div>

        {/* Reset Date */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Reset date:</span>
          <span className="font-medium">
            {usage.resetDate === "N/A - Free tier has no expiration"
              ? "Free tier"
              : new Date(usage.resetDate).toLocaleDateString("vi-VN")}
          </span>
        </div>

        {/* Warnings */}
        {isAtLimit && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Đã hết quota API</AlertTitle>
            <AlertDescription>
              Bạn đã sử dụng hết số lượng API calls. Vui lòng mua gói mở rộng để tiếp tục sử dụng.
            </AlertDescription>
          </Alert>
        )}

        {isNearLimit && !isAtLimit && (
          <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-600">Sắp hết quota</AlertTitle>
            <AlertDescription className="text-orange-600">
              Bạn đã sử dụng {percentageUsed.toFixed(1)}% quota. Xem xét mua gói mở rộng để không bị gián đoạn.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => navigate("/api-extensions")}
            className="flex-1"
            variant={isNearLimit ? "default" : "outline"}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Mua gói mở rộng
          </Button>
          <Button
            onClick={() => navigate("/premium")}
            variant="outline"
            className="flex-1"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Nâng cấp gói
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

