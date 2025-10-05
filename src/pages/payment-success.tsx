import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { usePaymentStatus } from "@/hooks/use-payment";
import PaymentService from "@/services/payment.service";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Parse payment result from URL
  const { orderCode, status } = PaymentService.parsePaymentResult(searchParams);

  // Use payment status hook to verify payment
  const {
    data: payment,
    isLoading,
    error,
  } = usePaymentStatus(orderCode);

  // Determine payment status
  const isSuccess = payment?.status === "completed";
  const isFailed = payment?.status === "failed" || !!error;
  const isPending =
    !isSuccess && !isFailed && payment?.status !== "cancelled";

  useEffect(() => {
    // If status param indicates failure, we know immediately
    if (status === "CANCELLED" || status === "FAILED") {
      // Don't need to poll
      return;
    }
    
    // Clear stored orderCode after checking payment
    if (payment?.status === "completed") {
      localStorage.removeItem('extensionPaymentOrderCode');
    }
  }, [status, payment]);

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              Đang xác nhận thanh toán...
            </h2>
            <p className="text-muted-foreground text-center">
              Vui lòng đợi trong giây lát
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-16 w-16 animate-spin text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              Thanh toán đang xử lý...
            </h2>
            <p className="text-muted-foreground text-center mb-4">
              Giao dịch của bạn đang được xử lý. Vui lòng đợi trong giây lát.
            </p>
            <p className="text-sm text-muted-foreground">
              Mã đơn hàng: {orderCode}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-16 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            {isSuccess ? (
              <>
                <CheckCircle className="h-8 w-8 text-green-500" />
                <span>Thanh toán thành công!</span>
              </>
            ) : (
              <>
                <XCircle className="h-8 w-8 text-red-500" />
                <span>Thanh toán thất bại</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSuccess ? (
            <>
              <p className="text-center text-muted-foreground">
                {payment?.paymentType === 'extension' 
                  ? `Cảm ơn bạn đã mua gói mở rộng API! Bạn đã được thêm ${payment?.extension?.additionalCalls?.toLocaleString() || ''} API calls.`
                  : 'Cảm ơn bạn đã nâng cấp lên gói Premium! Gói đăng ký của bạn đã được kích hoạt thành công.'
                }
              </p>
              {payment && (
                <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã đơn hàng:</span>
                    <span className="font-medium">{payment.orderCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số tiền:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: payment.currency || "VND",
                      }).format(payment.amount)}
                    </span>
                  </div>
                  {payment.reference && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Mã tham chiếu:
                      </span>
                      <span className="font-medium">{payment.reference}</span>
                    </div>
                  )}
                  {payment.transactionDateTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Thời gian giao dịch:
                      </span>
                      <span className="font-medium">
                        {new Date(
                          payment.transactionDateTime
                        ).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button onClick={() => navigate("/dashboard")}>
                  Về trang chủ
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(payment?.paymentType === 'extension' ? "/api-extensions" : "/settings")}
                >
                  {payment?.paymentType === 'extension' ? 'Xem gói mở rộng' : 'Xem gói đăng ký'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-center text-muted-foreground">
                Rất tiếc, thanh toán của bạn chưa thành công. Vui lòng thử lại
                hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.
              </p>
              {payment && payment.failedReason && (
                <div className="bg-destructive/10 p-4 rounded-md text-sm text-center">
                  <span className="text-destructive">
                    Lý do: {payment.failedReason}
                  </span>
                </div>
              )}
              {orderCode && (
                <p className="text-sm text-muted-foreground text-center">
                  Mã đơn hàng: {orderCode}
                </p>
              )}
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button onClick={() => navigate("/premium")}>Thử lại</Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Về trang chủ
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
