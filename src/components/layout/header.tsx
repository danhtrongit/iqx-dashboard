import Logo from "@/components/layout/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link } from "react-router-dom";
import UserButton from "@/components/layout/user-button";
import { Search } from "./search-button";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { useState } from "react";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false)

    const navigation = [
        {
            name: "Trang chủ",
            href: "/",
        },
        {
            name: "Danh mục cổ phiếu",
            href: "/danh-muc-co-phieu",
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
        {
            name: "Cá nhân",
            href: "/ca-nhan",
        }
        
    ]

    return (
        <header className="bg-background header-fixed peer/header sticky top-0 w-[inherit] z-50 py-1 shadow-xs min-h-16 md:h-24">
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
                                <div className="flex flex-col gap-2 mt-6">
                                    {navigation.map((item) => (
                                        <Link to={item.href} key={item.href} onClick={() => setIsOpen(false)}>
                                            <Button variant="ghost" className="w-full justify-start text-left h-12">
                                                {item.name}
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* Desktop Navigation - hidden on mobile */}
                <div className="hidden md:flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-x-auto">
                        {navigation.map((item) => (
                            <Link to={item.href} key={item.href}>
                                <Button variant="ghost" size="sm" className="rounded-none uppercase whitespace-nowrap">
                                    <span>{item.name}</span>
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    )
}