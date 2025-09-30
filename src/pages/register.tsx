import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, UserPlus, Mail, Lock, User } from "lucide-react";
import { useRegister } from "@/hooks/auth.hooks";
import { type RegisterRequest, AuthError } from "@/types/auth";

interface RegisterData extends RegisterRequest {
  confirmPassword: string;
}

interface RegisterErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  displayName?: string;
  fullName?: string;
  general?: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    fullName: "",
  });

  const [errors, setErrors] = useState<RegisterErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerMutation = useRegister();

  const validateForm = (): boolean => {
    const newErrors: RegisterErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    // Display name validation
    if (formData.displayName && formData.displayName.length < 2) {
      newErrors.displayName = "Tên hiển thị phải có ít nhất 2 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin đăng ký");
      return;
    }

    try {
      await registerMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName || undefined,
        fullName: formData.fullName || undefined,
      });
      toast.success("Đăng ký thành công! Hãy kiểm tra email để xác thực tài khoản.");
    } catch (error) {
      if (error instanceof AuthError) {
        if (error.statusCode === 409) {
          toast.error("Email đã được sử dụng");
          setErrors({ email: "Email đã được sử dụng" });
        } else if (error.errors && Array.isArray(error.errors)) {
          const fieldErrors: RegisterErrors = {};
          error.errors.forEach((msg: string) => {
            if (msg.includes("email")) fieldErrors.email = msg;
            if (msg.includes("password")) fieldErrors.password = msg;
          });
          setErrors(fieldErrors);
          toast.error("Vui lòng kiểm tra lại thông tin đăng ký");
        } else {
          toast.error(error.message || "Có lỗi xảy ra khi đăng ký");
          setErrors({ general: error.message || "Có lỗi xảy ra khi đăng ký" });
        }
      } else {
        toast.error("Không thể kết nối đến server");
        setErrors({ general: "Không thể kết nối đến server" });
      }
    }
  };

  const handleInputChange = (field: keyof RegisterData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  if (registerMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <UserPlus className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-300">
              Đăng ký thành công!
            </CardTitle>
            <CardDescription>
              Tài khoản của bạn đã được tạo thành công
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/login" className="w-full">
              <Button className="w-full">
                Đăng nhập ngay
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Đăng ký tài khoản</CardTitle>
          <CardDescription>
            Tạo tài khoản mới để bắt đầu sử dụng
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errors.general && (
              <Alert variant="destructive">
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                placeholder="example@email.com"
                disabled={registerMutation.isPending}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Tên hiển thị
              </label>
              <Input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleInputChange("displayName")}
                placeholder="Tên hiển thị của bạn"
                disabled={registerMutation.isPending}
                aria-invalid={!!errors.displayName}
              />
              {errors.displayName && (
                <p className="text-sm text-destructive">{errors.displayName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Họ và tên đầy đủ
              </label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange("fullName")}
                placeholder="Nguyễn Văn A"
                disabled={registerMutation.isPending}
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Mật khẩu *
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  placeholder="Nhập mật khẩu"
                  disabled={registerMutation.isPending}
                  aria-invalid={!!errors.password}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={registerMutation.isPending}
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
              <p className="text-xs text-muted-foreground">
                Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Xác nhận mật khẩu *
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange("confirmPassword")}
                  placeholder="Nhập lại mật khẩu"
                  disabled={registerMutation.isPending}
                  aria-invalid={!!errors.confirmPassword}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={registerMutation.isPending}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Đang đăng ký..." : "Đăng ký"}
            </Button>

            <div className="text-center text-sm">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}