import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import { useLogin } from "@/hooks/auth.hooks";
import { LoginRequestSchema, type LoginRequest, AuthError } from "@/types/auth";

interface LoginData extends LoginRequest {
  rememberMe: boolean;
}

interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const loginMutation = useLogin();

  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
    rememberMe: true, // Default to true for better UX - stays logged in across tabs
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    try {
      LoginRequestSchema.parse({
        email: formData.email,
        password: formData.password,
      });
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: LoginErrors = {};

      if (error.issues) {
        error.issues.forEach((issue: any) => {
          if (issue.path[0] === 'email') {
            newErrors.email = issue.message;
          } else if (issue.path[0] === 'password') {
            newErrors.password = issue.message;
          }
        });
      }

      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin đăng nhập");
      return;
    }

    try {
      await loginMutation.mutateAsync({
        credentials: {
          email: formData.email,
          password: formData.password,
        },
        rememberMe: formData.rememberMe,
      });
      toast.success("Đăng nhập thành công!");
    } catch (error: any) {
      if (error instanceof AuthError) {
        toast.error(error.message || "Đăng nhập thất bại");
        setErrors({ general: error.message || "Đăng nhập thất bại" });
      } else {
        toast.error("Có lỗi xảy ra khi đăng nhập");
        setErrors({ general: "Có lỗi xảy ra khi đăng nhập" });
      }
    }
  };

  const handleInputChange = (field: keyof LoginData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === "rememberMe" ? e.target.checked : e.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (field !== "rememberMe" && errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleForgotPassword = () => {
    window.location.href = "/forgot-password";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
          <CardDescription>
            Đăng nhập vào tài khoản của bạn
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {(errors.general || loginMutation.isError) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {errors.general ||
                   (loginMutation.error instanceof Error
                     ? loginMutation.error.message
                     : "Có lỗi xảy ra khi đăng nhập")}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                placeholder="example@email.com"
                disabled={loginMutation.isPending}
                aria-invalid={!!errors.email}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Mật khẩu
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  placeholder="Nhập mật khẩu"
                  disabled={loginMutation.isPending}
                  aria-invalid={!!errors.password}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loginMutation.isPending}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({
                      ...prev,
                      rememberMe: checked === true,
                    }))
                  }
                  disabled={loginMutation.isPending}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleForgotPassword}
                disabled={loginMutation.isPending}
                className="px-0 font-normal"
              >
                Quên mật khẩu?
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? (
                <>
                  <LogIn className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Đăng nhập
                </>
              )}
            </Button>

            <div className="text-center text-sm">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="font-medium text-primary hover:underline"
              >
                Đăng ký ngay
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}