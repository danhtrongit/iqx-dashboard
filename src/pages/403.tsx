import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { Lock, Home, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="h-10 w-10 text-destructive" />
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-destructive">403</h1>
              <h2 className="text-xl font-semibold">Truy cập bị từ chối</h2>
              <p className="text-muted-foreground">
                Bạn không có quyền truy cập vào trang này
              </p>
            </div>

            {user && (
              <div className="text-center text-sm text-muted-foreground border rounded-lg p-3 bg-muted/50">
                <p>Đăng nhập với vai trò: <span className="font-medium">{user.role}</span></p>
                <p>Email: <span className="font-medium">{user.email}</span></p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
              <Button
                onClick={() => window.location.href = "/"}
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" />
                Về trang chủ
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ quản trị viên
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}