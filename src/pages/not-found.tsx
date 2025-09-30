import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="mx-auto w-48 h-48 relative">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--primary) / 0.6)" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="90" fill="url(#g)" opacity="0.08" />
            <path d="M40 120c20-40 100-40 120 0" stroke="hsl(var(--primary))" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="75" cy="80" r="6" fill="currentColor" className="text-foreground/70" />
            <circle cx="125" cy="80" r="6" fill="currentColor" className="text-foreground/70" />
            <path d="M78 112c12 8 32 8 44 0" stroke="currentColor" className="text-foreground/40" strokeWidth="4" fill="none" strokeLinecap="round" />
            <text x="100" y="175" textAnchor="middle" fontSize="28" fontWeight="700" fill="currentColor" className="text-foreground/70">404</text>
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Không tìm thấy trang</h1>
          <p className="text-muted-foreground">
            Xin lỗi, chúng tôi không thể tìm thấy nội dung bạn yêu cầu. Hãy kiểm tra lại đường dẫn
            hoặc sử dụng các nút bên dưới để tiếp tục.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link to="/">
            <Button>
              Về trang chủ
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline">
              Khám phá cổ phiếu tốt
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}


