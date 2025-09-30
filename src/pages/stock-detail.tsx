import StockDetail from '@/features/stock'
import { useParams } from 'react-router-dom'

export default function StockDetailPage() {
  const { symbol } = useParams<{ symbol: string }>()

  if (!symbol) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Không tìm thấy mã chứng khoán
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Vui lòng kiểm tra lại đường dẫn
          </p>
        </div>
      </div>
    )
  }

  return <StockDetail ticker={symbol.toUpperCase()} />
}