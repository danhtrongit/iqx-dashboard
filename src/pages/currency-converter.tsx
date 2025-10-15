import { CurrencyConverter } from "@/components/tools/currency-converter";
import Title from "@/components/title";

export default function CurrencyConverterPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Title>Chuyển Đổi Tiền Tệ</Title>
      
      <div className="max-w-2xl mx-auto text-center space-y-2">
        <h1 className="text-2xl font-bold">Chuyển Đổi Tiền Tệ</h1>
        <p className="text-sm text-muted-foreground">
          Tỷ giá thời gian thực từ Hexarate API
        </p>
      </div>

      <CurrencyConverter />

      <div className="max-w-2xl mx-auto">
        <p className="text-xs text-center text-muted-foreground">
          Tỷ giá chỉ mang tính chất tham khảo. Vui lòng kiểm tra tỷ giá chính thức từ ngân hàng.
        </p>
      </div>
    </div>
  );
}

