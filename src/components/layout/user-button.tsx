import { Button } from "../ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useLogout } from "@/hooks/auth.hooks";
import { useNavigate } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuGroup,
    DropdownMenuShortcut,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { LayoutGrid, User, Shield, Settings, LogOut, Crown, CheckCircle, AlertCircle, TrendingUp, Gift, Users, Zap } from "lucide-react";

export default function UserButton() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const logoutMutation = useLogout();
    const navigate = useNavigate();

    // Show loading skeleton while auth is loading
    if (isLoading) {
        return (
            <div className="flex items-center gap-2 p-2">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
        );
    }

    // Show login button if not authenticated
    if (!isAuthenticated || !user) {
        return (
            <Button
                onClick={() => navigate("/login")}
                variant="outline"
                size="sm"
            >
                Đăng nhập
            </Button>
        );
    }

    const handleLogout = async () => {
        try {
            await logoutMutation.mutateAsync();
        } catch (error) {
            console.error("Logout error:", error);
            // Logout will be handled by the mutation's onSuccess/onError
        }
    };

    // Generate avatar from display name or email
    const getInitials = () => {
        if (user.displayName) {
            return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return user.email.charAt(0).toUpperCase();
    };

    const getRoleIcon = () => {
        switch (user.role) {
            case "admin":
                return <Crown className="size-3" />;
            case "member":
                return <User className="size-3" />;
            default:
                return <User className="size-3" />;
        }
    };

    const getRoleColor = () => {
        switch (user.role) {
            case "admin":
                return "bg-yellow-500";
            case "member":
                return "bg-blue-500";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="lg"
                    className="rounded-full p-2 px-0 !bg-background hover:bg-accent"
                    disabled={logoutMutation.isPending}
                >
                    <div className="flex items-center gap-2">
                        <div className={`size-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getRoleColor()}`}>
                            {getInitials()}
                        </div>
                        <div className="hidden md:flex flex-col items-start">
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-medium">
                                    {user.displayName || user.email.split('@')[0]}
                                </span>
                                {user.role === "admin" && (
                                    <Crown className="size-3 text-yellow-500" />
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                    </div>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex flex-col items-start pb-2">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">
                            {user.displayName || user.email.split('@')[0]}
                        </span>
                        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                            {getRoleIcon()}
                            {user.role === "admin" ? "Quản trị viên" : "Thành viên"}
                        </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{user.email}</span>

                    {/* Verification status */}
                    <div className="flex gap-2 mt-2">
                        {user.emailVerifiedAt ? (
                            <Badge variant="outline" className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle className="size-3" />
                                Email đã xác thực
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="flex items-center gap-1 text-xs text-orange-600">
                                <AlertCircle className="size-3" />
                                Email chưa xác thực
                            </Badge>
                        )}

                        {user.phoneVerifiedAt ? (
                            <Badge variant="outline" className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle className="size-3" />
                                SĐT đã xác thực
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="flex items-center gap-1 text-xs text-orange-600">
                                <AlertCircle className="size-3" />
                                SĐT chưa xác thực
                            </Badge>
                        )}
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate("/ca-nhan")}>
                        <LayoutGrid className="size-4" />
                        <span>Trang cá nhân</span>
                        <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate("/premium")}>
                        <Crown className="size-4" />
                        <span>Nâng cấp Premium</span>
                        <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate("/api-extensions")}>
                        <Zap className="size-4" />
                        <span>Gói mở rộng API</span>
                        <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate("/referral")}>
                        <Gift className="size-4" />
                        <span>Giới thiệu & Hoa hồng</span>
                        <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate("/virtual-trading")}>
                        <TrendingUp className="size-4" />
                        <span>Đăng ký đấu trường ảo</span>
                        <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                        <Settings className="size-4" />
                        <span>Cài đặt tài khoản</span>
                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    {user.role === "admin" && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate("/admin/users")}>
                                <Users className="size-4" />
                                <span>Quản lý người dùng</span>
                                <DropdownMenuShortcut>⌘U</DropdownMenuShortcut>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/admin/commission")}>
                                <Shield className="size-4" />
                                <span>Cài đặt hoa hồng</span>
                                <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    variant="destructive"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                >
                    <LogOut className="size-4" />
                    <span>{logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}</span>
                    <DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}               