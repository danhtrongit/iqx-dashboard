import { Link } from "react-router-dom"
import Logo from "./logo"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <Logo className="size-32" />
            <p className="text-sm text-muted-foreground">
              Nền tảng phân tích và giao dịch chứng khoán thông minh Việt Nam
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Bảng điều khiển
                </Link>
              </li>
              <li>
                <Link to="/screening" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sàng lọc cổ phiếu
                </Link>
              </li>
              <li>
                <Link to="/arix-hub" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  ARIX Hub
                </Link>
              </li>
              <li>
                <Link to="/virtual-trading" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Giao dịch ảo
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/partner-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Chính sách đối tác
                </Link>
              </li>
              <li>
                <Link to="/premium" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Gói Premium
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Liên hệ</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">
                <strong>Email:</strong> support@vnse.vn
              </li>
              <li className="text-sm text-muted-foreground">
                <strong>Hotline:</strong> 1900 1509
              </li>
              <li className="text-sm text-muted-foreground">
                <strong>Địa chỉ:</strong> P.702A, Tầng 7, Tòa nhà Centre Point, 106 Nguyễn Văn Trỗi, Phường Phú Nhuận, Quận Phú Nhuận, TP. Hồ Chí Minh
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-border pt-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {currentYear} VNSE - Việt Nam Stock Express. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Business License */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              <strong>CÔNG TY TNHH VIỆT NAM STOCK EXPRESS</strong> (VIET NAM STOCK EXPRESS COMPANY LIMITED)
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              <strong>Giấy chứng nhận đăng ký doanh nghiệp số:</strong> 0319077430
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Đăng ký lần đầu ngày 01/08/2025 - Cấp bởi Phòng Đăng ký Kinh doanh - Sở Tài chính TP. Hồ Chí Minh
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              <strong>Người đại diện pháp luật:</strong> Lê Phan Huy (Giám đốc)
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              VNSE là nền tảng công nghệ cung cấp thông tin và công cụ phân tích chứng khoán. 
              Chúng tôi không phải là công ty chứng khoán và không cung cấp dịch vụ môi giới.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

