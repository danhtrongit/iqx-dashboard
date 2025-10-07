import { FibonacciCalculator } from "@/components/tools/fibonacci-calculator";
import Title from "@/components/title";

export default function FibonacciPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Title>Bộ Tính Toán Fibonacci</Title>
      
      {/* Page Header */}
      <div className="max-w-2xl mx-auto text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Bộ Tính Toán Fibonacci
        </h1>
        <p className="text-muted-foreground">
          Tính toán các mức Fibonacci Retracement và Extension
        </p>
      </div>

      {/* Calculator Component */}
      <FibonacciCalculator />

      {/* Instructions */}
      <div className="max-w-6xl mx-auto">
        <div className="text-sm text-muted-foreground space-y-2 px-8">
          <p><strong>Điểm A:</strong> Điểm bắt đầu của xu hướng (thấp nhất cho uptrend, cao nhất cho downtrend)</p>
          <p><strong>Điểm B:</strong> Điểm kết thúc của xu hướng (cao nhất cho uptrend, thấp nhất cho downtrend)</p>
          <p><strong>Điểm C:</strong> Giá hiện tại hoặc giá bạn muốn kiểm tra mức retracement</p>
        </div>
      </div>
    </div>
  );
}


