import Logo from "@/components/layout/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link } from "react-router-dom";
import UserButton from "@/components/layout/user-button";
import { Search } from "./search-button";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon, Crown, User, Sparkles, Zap, ChevronDown, Calculator } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const { isAuthenticated } = useAuth();

    const navigation = [
        {
            name: "Trang chủ",
            href: "/",
        },
        {
            name: "Bộ lọc",
            href: "/bo-loc",
        },
        {
            name: "Biểu đồ kỹ thuật",
            href: "/bieu-do-ky-thuat",
        },
        {
            name: "Tin tức",
            href: "/tin-tuc",
        },

        {
            name: "Xếp hạng",
            href: "/virtual-trading/leaderboard",
        },
        {
            name: "Dự báo",
            href: "/du-bao",
        },
    ]

    return (
        <header className="bg-background header-fixed peer/header sticky top-0 w-[inherit] z-50 py-1 shadow-xs min-h-16 md:h-28">
            {/* Mobile promotional banner - Top of header */}
            <div className="md:hidden w-full overflow-hidden bg-gradient-to-r from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-950/20 dark:via-violet-950/20 dark:to-indigo-950/20 py-1.5 px-4">
                <div className="flex animate-marquee">
                    <span className="text-xs font-medium bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap px-3">
                        🎉 Khuyến mãi tháng 10-11-12: Nâng cấp Premium nhận gấp đôi lượt sử dụng Arix Pro AI • Phân tích chuyên nghiệp từ IQX ✨
                    </span>
                    <span className="text-xs font-medium bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap px-3">
                        🎉 Khuyến mãi tháng 10-11-12: Nâng cấp Premium nhận gấp đôi lượt sử dụng Arix Pro AI • Phân tích chuyên nghiệp từ IQX ✨
                    </span>
                </div>
            </div>
            <div className="container mx-auto px-4 space-y-1">
                {/* header main */}
                <div className="flex items-center justify-between h-14">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Link to="/" className="shrink-0">
                            <Logo className="size-10 md:size-12" />
                        </Link>

                        {/* Running promotional text */}
                        <div className="hidden md:flex items-center overflow-hidden flex-1 min-w-0 max-w-2xl relative mr-2">
                            <div className="flex animate-marquee">
                                <span className="text-base font-medium bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap px-4">
                                    🎉 Khuyến mãi tháng 10-11-12: Nâng cấp Premium nhận gấp đôi lượt sử dụng Arix Pro AI • Phân tích chuyên nghiệp từ IQX ✨
                                </span>
                                <span className="text-base font-medium bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap px-4">
                                    🎉 Khuyến mãi tháng 10-11-12: Nâng cấp Premium nhận gấp đôi lượt sử dụng Arix Pro AI • Phân tích chuyên nghiệp từ IQX ✨
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-2">
                        <Search />
                        <ThemeToggle />
                        <UserButton />
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex md:hidden items-center gap-2">
                        <Search />
                        <ThemeToggle />
                        <UserButton />
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MenuIcon className="size-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-80">
                                <SheetHeader>
                                    <SheetTitle>Menu</SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-3 mt-6">
                                    {navigation.map((item) => (
                                        <Link to={item.href} key={item.href} onClick={() => setIsOpen(false)}>
                                            <Button variant="ghost" className="w-full justify-start text-left h-12">
                                                {item.name}
                                            </Button>
                                        </Link>
                                    ))}

                                    {/* Tools Section */}
                                    <div className="my-2 border-t" />
                                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                                        Công cụ
                                    </div>
                                    <Link to="/cong-cu/fibonacci" onClick={() => setIsOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start text-left h-12">
                                            <Calculator className="size-5 mr-2" />
                                            Bộ Tính Toán Fibonacci
                                        </Button>
                                    </Link>

                                    {/* Premium & Personal Links - Only when authenticated */}
                                    {isAuthenticated && (
                                        <>
                                            <div className="my-2 border-t" />

                                            <Link to="/arix-pro" onClick={() => setIsOpen(false)}>
                                                <Button
                                                    className={cn(
                                                        "w-full justify-start text-left h-12 font-semibold",
                                                        "bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600",
                                                        "hover:from-purple-600 hover:via-violet-600 hover:to-indigo-700",
                                                        "text-white shadow-lg hover:shadow-xl",
                                                        "transition-all duration-300",
                                                        "border-2 border-purple-400/50"
                                                    )}
                                                >
                                                    <Sparkles className="size-5 mr-2" />
                                                    <span>AriX Pro</span>
                                                    <Zap className="size-4 ml-auto" />
                                                </Button>
                                            </Link>

                                            <Link to="/premium" onClick={() => setIsOpen(false)}>
                                                <Button
                                                    className={cn(
                                                        "w-full justify-start text-left h-12 font-semibold",
                                                        "bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500",
                                                        "hover:from-yellow-600 hover:via-amber-600 hover:to-orange-600",
                                                        "text-white shadow-lg hover:shadow-xl",
                                                        "transition-all duration-300",
                                                        "border-2 border-yellow-400/50"
                                                    )}
                                                >
                                                    <Crown className="size-5 mr-2" />
                                                    <span>Nâng cấp Premium</span>
                                                    <Sparkles className="size-4 ml-auto" />
                                                </Button>
                                            </Link>

                                            <Link to="/ca-nhan" onClick={() => setIsOpen(false)}>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left h-12 font-medium",
                                                        "border-2 hover:bg-primary/10 hover:border-primary"
                                                    )}
                                                >
                                                    <User className="size-5 mr-2" />
                                                    <span>Trang cá nhân</span>
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* Desktop Navigation - hidden on mobile */}
                <div className="hidden md:flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {navigation.map((item) => (
                            <Link to={item.href} key={item.href}>
                                <Button variant="ghost" size="sm" className="rounded-none uppercase whitespace-nowrap">
                                    <span>{item.name}</span>
                                </Button>
                            </Link>
                        ))}

                        {/* Tools Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="rounded-none uppercase whitespace-nowrap">
                                    <span>Công cụ</span>
                                    <ChevronDown className="ml-1 size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem asChild>
                                    <Link to="/cong-cu/fibonacci" className="flex items-center gap-2 cursor-pointer">
                                        <Calculator className="size-4" />
                                        <span>Bộ Tính Toán Fibonacci</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Premium & Personal Links - Only when authenticated */}
                        {isAuthenticated && (
                            <>
                                <Link to="/arix-pro">
                                    <Button
                                        size="sm"
                                        className={cn(
                                            "rounded-full uppercase whitespace-nowrap font-semibold",
                                            "bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600",
                                            "hover:from-purple-600 hover:via-violet-600 hover:to-indigo-700",
                                            "text-white shadow-lg hover:shadow-xl",
                                            "transition-all duration-300 hover:scale-105",
                                            "border-2 border-purple-400/50"
                                        )}
                                    >
                                        <Sparkles className="size-4 mr-1.5" />
                                        <span>AriX Pro</span>
                                        <Zap className="size-3 ml-1.5" />
                                    </Button>
                                </Link>

                                <Link to="/premium">
                                    <Button
                                        size="sm"
                                        className={cn(
                                            "rounded-full uppercase whitespace-nowrap font-semibold",
                                            "bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500",
                                            "hover:from-yellow-600 hover:via-amber-600 hover:to-orange-600",
                                            "text-white shadow-lg hover:shadow-xl",
                                            "transition-all duration-300 hover:scale-105",
                                            "border-2 border-yellow-400/50"
                                        )}
                                    >
                                        <Crown className="size-4 mr-1.5" />
                                        <span>Nâng cấp Premium</span>
                                        <Sparkles className="size-3 ml-1.5" />
                                    </Button>
                                </Link>

                                <Link to="/ca-nhan">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className={cn(
                                            "rounded-full uppercase whitespace-nowrap font-medium",
                                            "border-2 hover:bg-primary/10 hover:border-primary",
                                            "transition-all duration-300 hover:scale-105"
                                        )}
                                    >
                                        <User className="size-4 mr-1.5" />
                                        <span>Trang cá nhân</span>
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}