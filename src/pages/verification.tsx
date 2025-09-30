import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  KeyRound,
  Timer,
  RefreshCw,
  ArrowLeft,
  Shield
} from "lucide-react";
import {
  useEmailVerification,
  useResendEmailVerification,
  usePhoneVerification,
  usePhoneConfirmation,
  useResetPassword
} from "@/hooks/auth.hooks";
import { AuthError } from "@/types/auth";

type VerificationType = "email" | "phone" | "reset-password";

interface VerificationState {
  type: VerificationType;
  isVerified: boolean;
  isLoading: boolean;
  error: string;
  success: string;
  timer: number;
}

export default function VerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get verification type and token from URL
  const type = (searchParams.get("type") as VerificationType) || "email";
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [state, setState] = useState<VerificationState>({
    type,
    isVerified: false,
    isLoading: false,
    error: "",
    success: "",
    timer: 0,
  });

  // Hooks for API calls
  const emailVerificationMutation = useEmailVerification();
  const resendEmailVerificationMutation = useResendEmailVerification();
  const phoneVerificationMutation = usePhoneVerification();
  const phoneConfirmationMutation = usePhoneConfirmation();
  const resetPasswordMutation = useResetPassword();

  // Phone verification specific
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // Reset password specific
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Auto-verify email on mount if token is present
  useEffect(() => {
    if (type === "email" && token) {
      handleEmailVerification();
    }
  }, [type, token]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.timer > 0) {
      interval = setInterval(() => {
        setState(prev => ({ ...prev, timer: prev.timer - 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.timer]);

  const handleEmailVerification = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: "", success: "" }));

    try {
      if (token) {
        await emailVerificationMutation.mutateAsync(token);
        setState(prev => ({
          ...prev,
          isVerified: true,
          success: "Email đã được xác thực thành công",
        }));
      }
    } catch (error) {
      if (error instanceof AuthError) {
        setState(prev => ({
          ...prev,
          error: error.message || "Token không hợp lệ hoặc đã hết hạn",
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: "Không thể kết nối đến server",
        }));
      }
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleResendEmailVerification = async () => {
    if (!email) {
      setState(prev => ({ ...prev, error: "Email không hợp lệ" }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: "", success: "" }));

    try {
      await resendEmailVerificationMutation.mutateAsync(email);
      setState(prev => ({
        ...prev,
        success: "Email xác thực đã được gửi lại",
        timer: 60, // 60 seconds cooldown
      }));
    } catch (error) {
      if (error instanceof AuthError) {
        setState(prev => ({
          ...prev,
          error: error.message || "Có lỗi xảy ra khi gửi email",
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: "Không thể kết nối đến server",
        }));
      }
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handlePhoneVerification = async () => {
    if (!phoneNumber) {
      setState(prev => ({ ...prev, error: "Số điện thoại là bắt buộc" }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: "", success: "" }));

    try {
      await phoneVerificationMutation.mutateAsync({ phoneNumber });
      setState(prev => ({
        ...prev,
        success: "Mã xác thực đã được gửi đến số điện thoại",
        timer: 300, // 5 minutes
      }));
    } catch (error) {
      if (error instanceof AuthError) {
        setState(prev => ({
          ...prev,
          error: error.message || "Có lỗi xảy ra khi gửi mã xác thực",
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: "Không thể kết nối đến server",
        }));
      }
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handlePhoneOTPVerification = async () => {
    if (!otpCode) {
      setState(prev => ({ ...prev, error: "Mã xác thực là bắt buộc" }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: "", success: "" }));

    try {
      await phoneConfirmationMutation.mutateAsync({
        phoneNumber,
        otpCode,
      });
      setState(prev => ({
        ...prev,
        isVerified: true,
        success: "Số điện thoại đã được xác thực thành công",
      }));
    } catch (error) {
      if (error instanceof AuthError) {
        setState(prev => ({
          ...prev,
          error: error.message || "Mã xác thực không đúng hoặc đã hết hạn",
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: "Không thể kết nối đến server",
        }));
      }
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (!newPassword) {
      setState(prev => ({ ...prev, error: "Mật khẩu mới là bắt buộc" }));
      return;
    }

    if (newPassword.length < 8) {
      setState(prev => ({ ...prev, error: "Mật khẩu phải có ít nhất 8 ký tự" }));
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)) {
      setState(prev => ({
        ...prev,
        error: "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt",
      }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setState(prev => ({ ...prev, error: "Mật khẩu không khớp" }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: "", success: "" }));

    try {
      if (token) {
        await resetPasswordMutation.mutateAsync({
          token,
          newPassword,
        });
        setState(prev => ({
          ...prev,
          isVerified: true,
          success: "Mật khẩu đã được đặt lại thành công",
        }));
      }
    } catch (error) {
      if (error instanceof AuthError) {
        setState(prev => ({
          ...prev,
          error: error.message || "Token không hợp lệ hoặc đã hết hạn",
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: "Không thể kết nối đến server",
        }));
      }
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const formatTimer = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getIcon = () => {
    switch (type) {
      case "email":
        return <Mail className="h-8 w-8" />;
      case "phone":
        return <Phone className="h-8 w-8" />;
      case "reset-password":
        return <KeyRound className="h-8 w-8" />;
      default:
        return <Shield className="h-8 w-8" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "email":
        return "Xác thực Email";
      case "phone":
        return "Xác thực Số điện thoại";
      case "reset-password":
        return "Đặt lại mật khẩu";
      default:
        return "Xác thực";
    }
  };

  const getDescription = () => {
    switch (type) {
      case "email":
        return "Xác thực địa chỉ email để hoàn tất đăng ký";
      case "phone":
        return "Xác thực số điện thoại để bảo mật tài khoản";
      case "reset-password":
        return "Tạo mật khẩu mới cho tài khoản của bạn";
      default:
        return "Hoàn tất quá trình xác thực";
    }
  };

  // Success state
  if (state.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-300">
              Xác thực thành công!
            </CardTitle>
            <CardDescription>
              {state.success}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            {type === "reset-password" ? (
              <Button className="w-full" onClick={() => navigate("/login")}>
                Đăng nhập ngay
              </Button>
            ) : (
              <Button className="w-full" onClick={() => navigate("/")}>
                Về trang chủ
              </Button>
            )}
            {type === "phone" && (
              <Button variant="outline" className="w-full" onClick={() => navigate("/settings")}>
                Cài đặt tài khoản
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Main verification interface
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl font-bold">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state.success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{state.success}</AlertDescription>
            </Alert>
          )}

          {/* Email Verification */}
          {type === "email" && (
            <div className="space-y-4">
              {token ? (
                <div className="text-center">
                  {state.isLoading || emailVerificationMutation.isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Đang xác thực email...</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Đang xác thực email của bạn...
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-center">
                    Email xác thực đã được gửi đến <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    Kiểm tra email (bao gồm cả thư mục spam) và click vào link xác thực
                  </p>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleResendEmailVerification}
                    disabled={resendEmailVerificationMutation.isPending || state.timer > 0}
                  >
                    {state.timer > 0 ? (
                      <>
                        <Timer className="mr-2 h-4 w-4" />
                        Gửi lại sau {formatTimer(state.timer)}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Gửi lại email xác thực
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Phone Verification */}
          {type === "phone" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="text-sm font-medium">
                  Số điện thoại
                </label>
                <div className="flex gap-2">
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+84901234567"
                    disabled={phoneVerificationMutation.isPending || state.timer > 0}
                  />
                  <Button
                    onClick={handlePhoneVerification}
                    disabled={phoneVerificationMutation.isPending || state.timer > 0 || !phoneNumber}
                  >
                    {state.timer > 0 ? formatTimer(state.timer) : "Gửi mã"}
                  </Button>
                </div>
              </div>

              {state.timer > 0 && (
                <div className="space-y-2">
                  <label htmlFor="otpCode" className="text-sm font-medium">
                    Mã xác thực
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="otpCode"
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                      disabled={phoneConfirmationMutation.isPending}
                      maxLength={6}
                    />
                    <Button
                      onClick={handlePhoneOTPVerification}
                      disabled={phoneConfirmationMutation.isPending || otpCode.length !== 6}
                    >
                      Xác thực
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nhập mã 6 chữ số được gửi đến số điện thoại của bạn
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Password Reset */}
          {type === "reset-password" && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">
                  Mật khẩu mới
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  disabled={resetPasswordMutation.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Xác nhận mật khẩu
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  disabled={resetPasswordMutation.isPending}
                />
              </div>

              <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
                {resetPasswordMutation.isPending ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Về trang chủ
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}