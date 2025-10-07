import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  Shield,
  Settings as SettingsIcon,
  CheckCircle,
  AlertCircle,
  Smartphone
} from "lucide-react";
import { useUpdateProfile, useChangePassword, usePhoneVerification, usePhoneConfirmation } from "@/hooks/auth.hooks";

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  fullName: string;
  phoneE164: string;
  phoneVerifiedAt: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProfileData {
  displayName: string;
  fullName: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PhoneData {
  phoneNumber: string;
  otpCode: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string>("");

  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const phoneVerificationMutation = usePhoneVerification();
  const phoneConfirmationMutation = usePhoneConfirmation();

  // Profile form
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: "",
    fullName: "",
  });

  // Password form
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Phone verification
  const [phoneData, setPhoneData] = useState<PhoneData>({
    phoneNumber: "",
    otpCode: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  // OTP Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

      const response = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setProfileData({
          displayName: userData.displayName || "",
          fullName: userData.fullName || "",
        });
        setPhoneData(prev => ({
          ...prev,
          phoneNumber: userData.phoneE164 || "",
        }));
      }
    } catch (error) {
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfileMutation.mutateAsync(profileData);
      setSuccess("Cập nhật thông tin thành công");
      setUser(prev => prev ? { ...prev, ...profileData } : null);
      toast.success("Cập nhật thông tin thành công");
      setErrors({});
    } catch (error: any) {
      const message = error.message || "Có lỗi xảy ra khi cập nhật thông tin";
      setErrors({ profile: message });
      toast.error(message);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Mật khẩu hiện tại là bắt buộc";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "Mật khẩu mới là bắt buộc";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(passwordData.newPassword)) {
      newErrors.newPassword = "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess("Đổi mật khẩu thành công");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Đổi mật khẩu thành công");
      setErrors({});
    } catch (error: any) {
      const message = error.message || "Có lỗi xảy ra khi đổi mật khẩu";
      setErrors({ password: message });
      toast.error(message);
    }
  };

  const handleSendOTP = async () => {
    if (!phoneData.phoneNumber) {
      setErrors({ phone: "Số điện thoại là bắt buộc" });
      toast.error("Số điện thoại là bắt buộc");
      return;
    }

    try {
      await phoneVerificationMutation.mutateAsync({
        phoneNumber: phoneData.phoneNumber,
      });
      setOtpSent(true);
      setOtpTimer(300); // 5 minutes
      setSuccess("Mã xác thực đã được gửi đến số điện thoại");
      toast.success("Mã xác thực đã được gửi đến số điện thoại");
      setErrors({});
    } catch (error: any) {
      const message = error.message || "Có lỗi xảy ra khi gửi mã xác thực";
      setErrors({ phone: message });
      toast.error(message);
    }
  };

  const handleVerifyOTP = async () => {
    if (!phoneData.otpCode) {
      setErrors({ otp: "Mã xác thực là bắt buộc" });
      toast.error("Mã xác thực là bắt buộc");
      return;
    }

    try {
      await phoneConfirmationMutation.mutateAsync({
        phoneNumber: phoneData.phoneNumber,
        otpCode: phoneData.otpCode,
      });
      setSuccess("Xác thực số điện thoại thành công");
      setOtpSent(false);
      setPhoneData(prev => ({ ...prev, otpCode: "" }));
      loadUserProfile(); // Reload to get updated phone verification status
      toast.success("Xác thực số điện thoại thành công");
      setErrors({});
    } catch (error: any) {
      const message = error.message || "Mã xác thực không đúng hoặc đã hết hạn";
      setErrors({ otp: message });
      toast.error(message);
    }
  };

  const formatTimer = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Cài đặt tài khoản</h1>
          <p className="text-muted-foreground">Quản lý thông tin và bảo mật tài khoản</p>
        </div>
      </div>

      {success && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
          <TabsTrigger value="phone">Số điện thoại</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleProfileUpdate}>
              <CardContent className="space-y-4">
                {errors.profile && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.profile}</AlertDescription>
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
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email không thể thay đổi
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="displayName" className="text-sm font-medium">
                    Tên hiển thị
                  </label>
                  <Input
                    id="displayName"
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      displayName: e.target.value
                    }))}
                    placeholder="Tên hiển thị của bạn"
                    disabled={updateProfileMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium">
                    Họ và tên đầy đủ
                  </label>
                  <Input
                    id="fullName"
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      fullName: e.target.value
                    }))}
                    placeholder="Họ và tên đầy đủ"
                    disabled={updateProfileMutation.isPending}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between text-sm">
                  <span>Vai trò:</span>
                  <Badge variant="secondary">{user?.role}</Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Trạng thái tài khoản:</span>
                  <Badge variant={user?.isActive ? "default" : "destructive"}>
                    {user?.isActive ? "Hoạt động" : "Bị khóa"}
                  </Badge>
                </div>
              </CardContent>

              <CardFooter>
                <Button type="submit" disabled={updateProfileMutation.isPending} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {updateProfileMutation.isPending ? "Đang cập nhật..." : "Cập nhật thông tin"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Đổi mật khẩu
              </CardTitle>
            </CardHeader>

            <form onSubmit={handlePasswordChange}>
              <CardContent className="space-y-4">
                {errors.password && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.password}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                      placeholder="Nhập mật khẩu hiện tại"
                      disabled={changePasswordMutation.isPending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        current: !prev.current
                      }))}
                      disabled={changePasswordMutation.isPending}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-sm text-destructive">{errors.currentPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      placeholder="Nhập mật khẩu mới"
                      disabled={changePasswordMutation.isPending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        new: !prev.new
                      }))}
                      disabled={changePasswordMutation.isPending}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-sm text-destructive">{errors.newPassword}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      placeholder="Nhập lại mật khẩu mới"
                      disabled={changePasswordMutation.isPending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        confirm: !prev.confirm
                      }))}
                      disabled={changePasswordMutation.isPending}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button type="submit" disabled={changePasswordMutation.isPending} className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {changePasswordMutation.isPending ? "Đang cập nhật..." : "Đổi mật khẩu"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Phone Tab */}
        <TabsContent value="phone">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Xác thực số điện thoại
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {(errors.phone || errors.otp) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.phone || errors.otp}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium">Trạng thái xác thực:</span>
                {user?.phoneVerifiedAt ? (
                  <Badge className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Đã xác thực
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Chưa xác thực
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="text-sm font-medium">
                  Số điện thoại
                </label>
                <div className="flex gap-2">
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneData.phoneNumber}
                    onChange={(e) => setPhoneData(prev => ({
                      ...prev,
                      phoneNumber: e.target.value
                    }))}
                    placeholder="+84901234567"
                    disabled={phoneVerificationMutation.isPending || user?.phoneVerifiedAt !== null}
                  />
                  {!user?.phoneVerifiedAt && (
                    <Button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={phoneVerificationMutation.isPending || otpTimer > 0}
                      className="whitespace-nowrap"
                    >
                      {otpTimer > 0 ? formatTimer(otpTimer) : "Gửi mã"}
                    </Button>
                  )}
                </div>
              </div>

              {otpSent && !user?.phoneVerifiedAt && (
                <div className="space-y-2">
                  <label htmlFor="otpCode" className="text-sm font-medium">
                    Mã xác thực
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="otpCode"
                      type="text"
                      value={phoneData.otpCode}
                      onChange={(e) => setPhoneData(prev => ({
                        ...prev,
                        otpCode: e.target.value.replace(/\D/g, "").slice(0, 6)
                      }))}
                      placeholder="123456"
                      disabled={phoneConfirmationMutation.isPending}
                      maxLength={6}
                    />
                    <Button
                      type="button"
                      onClick={handleVerifyOTP}
                      disabled={phoneConfirmationMutation.isPending || phoneData.otpCode.length !== 6}
                    >
                      Xác thực
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nhập mã 6 chữ số được gửi đến số điện thoại của bạn
                  </p>
                </div>
              )}

              {user?.phoneVerifiedAt && (
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Số điện thoại đã được xác thực vào {new Date(user.phoneVerifiedAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}