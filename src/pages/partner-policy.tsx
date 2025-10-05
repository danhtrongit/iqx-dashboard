import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Users,
  TrendingUp,
  CheckCircle2,
  FileText,
  Rocket,
} from "lucide-react";

export default function PartnerPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
     
      <div className="text-center mb-12 space-y-4">
        <Badge variant="secondary" className="mb-2">
          <Users className="mr-1 h-3 w-3" />
          Chính sách Cộng tác viên
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Chính sách thành viên Premium – IQX
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Giới thiệu càng nhiều, thu nhập càng đều. Mỗi lần người bạn giới thiệu
          thanh toán, bạn được nhận hoa hồng
        </p>
      </div>

      
      <div className="space-y-8">
       
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              IQX đối tác là gì?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <p className="text-muted-foreground">
                  Bạn chia sẻ link/mã giới thiệu.
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <p className="text-muted-foreground">
                  Người đăng ký qua link/mã của bạn sẽ trở thành{" "}
                  <span className="font-semibold text-foreground">
                    Người bạn giới thiệu
                  </span>{" "}
                  và được gắn cố định và theo dõi minh bạch trên hệ thống phân cấp.
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <p className="text-muted-foreground">
                  Mỗi kỳ thanh toán của Người bạn giới thiệu, bạn nhận hoa hồng theo
                  cấu trúc.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

       
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Cấu trúc tuyến và tỷ lệ hoa hồng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Hệ thống hoa hồng IQX hoạt động theo{" "}
              <span className="font-semibold text-foreground">
                3 tuyến chia hoa hồng
              </span>
              .
            </p>

            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <p className="text-sm text-muted-foreground">
                Nếu phát sinh thêm tuyến mới (A5), cấu trúc sẽ tự lùi xuống —
                nghĩa là A2 trở thành A1 của A5, và mô hình vẫn giữ nguyên nguyên
                tắc tính hoa hồng.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-2xl font-bold text-primary">A1</div>
                <div className="flex-1">
                  <p className="font-semibold">Bạn (người giới thiệu)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-500">A2</div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">A2 thanh toán</p>
                  <p className="text-muted-foreground">
                    → A1 nhận <span className="font-bold text-blue-500">15% × G</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-500">A3</div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">A3 thanh toán</p>
                  <p className="text-muted-foreground">
                    → A2 nhận <span className="font-bold text-purple-500">15% × G</span>
                  </p>
                  <p className="text-muted-foreground">
                    → A1 nhận <span className="font-bold text-purple-500">5% × G</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-orange-500/5 rounded-lg border border-orange-500/20">
                <div className="text-2xl font-bold text-orange-500">A4</div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">A4 thanh toán</p>
                  <p className="text-muted-foreground">
                    → A3 nhận <span className="font-bold text-orange-500">15% × G</span>
                  </p>
                  <p className="text-muted-foreground">
                    → A2 nhận <span className="font-bold text-orange-500">2.5% × G</span>
                  </p>
                  <p className="text-muted-foreground">
                    → A1 nhận <span className="font-bold text-orange-500">2.5% × G</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

       
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Ví dụ minh họa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="font-semibold mb-3">
                Thanh toán G = 1.000.000 VND
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">A2 thanh toán</span>
                  <span className="font-bold text-blue-500">
                    A1 nhận 150.000 VND
                  </span>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="mb-2 text-muted-foreground">A3 thanh toán</div>
                  <div className="space-y-1 ml-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">A2 nhận</span>
                      <span className="font-bold text-purple-500">150.000 VND</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">A1 nhận</span>
                      <span className="font-bold text-purple-500">50.000 VND</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="mb-2 text-muted-foreground">A4 thanh toán</div>
                  <div className="space-y-1 ml-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">A3 nhận</span>
                      <span className="font-bold text-orange-500">150.000 VND</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">A2 nhận</span>
                      <span className="font-bold text-orange-500">25.000 VND</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">A1 nhận</span>
                      <span className="font-bold text-orange-500">25.000 VND</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
              <p className="font-semibold text-green-600 dark:text-green-400">
                💰 Ví dụ thực tế:
              </p>
              <p className="text-muted-foreground mt-2">
                Có 10 khách A2 mỗi người thanh toán 1.000.000 VND
                <br />
                <span className="font-bold text-foreground">
                  ⇒ A1 nhận ~1.500.000 VND
                </span>{" "}
                (chưa kể A3/A4)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Chính sách đối tác hấp dẫn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Thu nhập định kỳ</p>
                  <p className="text-sm text-muted-foreground">
                    Người bạn giới thiệu thanh toán là bạn được nhận hoa hồng,
                    không cần giới thiệu lại.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Gắn tuyến cố định</p>
                  <p className="text-sm text-muted-foreground">
                    Hệ thống phân cấp bền vững, minh bạch.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Theo dõi realtime</p>
                  <p className="text-sm text-muted-foreground">
                    Dashboard đối tác đơn giản, minh bạch.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Không giới hạn</p>
                  <p className="text-sm text-muted-foreground">
                    Không giới hạn số tuyến dưới: mở rộng theo cộng đồng của bạn.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

       
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Quy định
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
              <div>
                <p className="font-semibold">Ghi nhận tuyến</p>
                <p className="text-sm text-muted-foreground">
                  Theo link/mã giới thiệu ngay từ lúc đăng ký tài khoản.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
              <div>
                <p className="font-semibold">Đối soát & thanh toán</p>
                <p className="text-sm text-muted-foreground">
                  Sau khi kỳ thanh toán hoàn tất sẽ được đối soát trước khi duyệt.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
              <div>
                <p className="font-semibold">Nâng gói</p>
                <p className="text-sm text-muted-foreground">
                  Hoa hồng tính theo giá gói mới từ kỳ tiếp theo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

       
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Cách tham gia (3 bước)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">Nâng cấp Premium</p>
                <p className="text-sm text-muted-foreground">
                  Nâng cấp tài khoản lên Premium → nhận link/mã giới thiệu.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">Chia sẻ</p>
                <p className="text-sm text-muted-foreground">
                  Chia sẻ cho khách hàng, cộng đồng, mạng xã hội.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                3
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">Theo dõi & nhận hoa hồng</p>
                <p className="text-sm text-muted-foreground">
                  Theo dõi đơn & renew trên dashboard → nhận hoa hồng tự động theo
                  cấu trúc.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

       
        <div className="text-center py-8 space-y-4">
          <h3 className="text-2xl font-bold">Sẵn sàng trở thành đối tác IQX?</h3>
          <p className="text-muted-foreground">
            Bắt đầu hành trình kiếm thu nhập thụ động cùng IQX ngay hôm nay
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/referral")}
            className="gap-2"
          >
            Truy cập trang Cộng tác viên
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

