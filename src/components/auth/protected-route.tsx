import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, AlertCircle, Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
  requireEmailVerification?: boolean;
  requirePhoneVerification?: boolean;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredRoles,
  requireEmailVerification = false,
  requirePhoneVerification = false,
  fallback,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
                <p className="text-sm text-muted-foreground">Đang tải...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Check role requirements
  if (requiredRole && user.role !== requiredRole) {
    return <UnauthorizedAccess requiredRole={requiredRole} userRole={user.role} />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <UnauthorizedAccess requiredRoles={requiredRoles} userRole={user.role} />;
  }

  // Check email verification requirement
  if (requireEmailVerification && !user.emailVerifiedAt) {
    return <EmailVerificationRequired email={user.email} />;
  }

  // Check phone verification requirement
  if (requirePhoneVerification && !user.phoneVerifiedAt) {
    return <PhoneVerificationRequired />;
  }

  // Check if user account is active
  if (!user.isActive) {
    return <AccountSuspended />;
  }

  // All checks passed - render children
  return <>{children}</>;
}

// Admin-only route wrapper
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
}

// Member or admin route wrapper
export function MemberRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={["member", "admin"]}>
      {children}
    </ProtectedRoute>
  );
}

// Email verified route wrapper
export function EmailVerifiedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireEmailVerification>
      {children}
    </ProtectedRoute>
  );
}

// Phone verified route wrapper
export function PhoneVerifiedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requirePhoneVerification>
      {children}
    </ProtectedRoute>
  );
}

// Unauthorized access component
function UnauthorizedAccess({
  requiredRole,
  requiredRoles,
  userRole,
}: {
  requiredRole?: string;
  requiredRoles?: string[];
  userRole: string;
}) {
  const requiredText = requiredRole
    ? `"${requiredRole}"`
    : requiredRoles?.join('", "') || "appropriate";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold">Không có quyền truy cập</h1>
              <p className="text-muted-foreground">
                Bạn cần quyền {requiredText} để truy cập trang này.
              </p>
            </div>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vai trò hiện tại: <strong>{userRole}</strong>
              </AlertDescription>
            </Alert>
            <div className="flex space-x-2">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/80 rounded-md transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Email verification required component
function EmailVerificationRequired({ email }: { email: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
              <AlertCircle className="h-8 w-8 text-warning" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold">Yêu cầu xác thực email</h1>
              <p className="text-muted-foreground">
                Bạn cần xác thực email để truy cập trang này.
              </p>
            </div>
            <Alert>
              <AlertDescription>
                Email xác thực đã được gửi đến: <strong>{email}</strong>
              </AlertDescription>
            </Alert>
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.href = `/verification?type=email&email=${encodeURIComponent(email)}`}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/80 rounded-md transition-colors"
              >
                Xác thực ngay
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Phone verification required component
function PhoneVerificationRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
              <AlertCircle className="h-8 w-8 text-warning" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold">Yêu cầu xác thực số điện thoại</h1>
              <p className="text-muted-foreground">
                Bạn cần xác thực số điện thoại để truy cập trang này.
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.href = "/verification?type=phone"}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/80 rounded-md transition-colors"
              >
                Xác thực ngay
              </button>
              <button
                onClick={() => window.location.href = "/settings"}
                className="px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                Đi đến cài đặt
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Account suspended component
function AccountSuspended() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold">Tài khoản bị khóa</h1>
              <p className="text-muted-foreground">
                Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên.
              </p>
            </div>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tài khoản không thể truy cập vào hệ thống
              </AlertDescription>
            </Alert>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/80 rounded-md transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedRoute;