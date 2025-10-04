import Logo from "@/components/layout/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link } from "react-router-dom";
import UserButton from "@/components/layout/user-button";
import { Search } from "./search-button";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon, Crown, User, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const { isAuthenticated } = useAuth();

    const navigation = [
        {
            name: "Trang chủ",
            href: "/",
        },
        {
            name: "Bộ lọc cổ phiếu",
            href: "/bo-loc-co-phieu",
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
            name: "Bảng xếp hạng",
            href: "/virtual-trading/leaderboard",
        },
    ]

    return (
        <header className="bg-background header-fixed peer/header sticky top-0 w-[inherit] z-50 py-1 shadow-xs min-h-16 md:h-28">
            <div className="container mx-auto px-4 space-y-1">
                {/* header main */}
                <div className="flex items-center justify-between h-14">
                    <Link to="/">
                        <Logo className="size-10 md:size-12" />
                    </Link>

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