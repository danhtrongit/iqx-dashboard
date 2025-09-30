import { useState } from "react";
import { useScreening } from "@/features/screening/api/useScreening";
import type { screening } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ScreeningFilters, { buildDefaultFilters } from "@/components/screening/filters";

export default function ScreeningPage() {
  const [body, setBody] = useState<screening.ScreeningRequest>(() => buildDefaultFilters());
  const { data, isLoading, isError } = useScreening(body);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Bộ lọc cổ phiếu</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sàn</span>
              <select className="px-3 py-1 border rounded-md text-sm bg-blue-50 text-blue-700 border-blue-200">
                <option>Tất cả</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Ngành</span>
              <select className="px-3 py-1 border rounded-md text-sm bg-blue-50 text-blue-700 border-blue-200">
                <option>Tất cả</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-4 bg-gray-50/40 border-b">
        <ScreeningFilters initial={body} onApply={setBody} />
      </div>

      {/* Results Section */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4">
          <div className="text-sm text-gray-600">
            Chọn tối đa <span className="text-green-600 font-medium">0/20</span> chỉ số
          </div>
        </div>

        {isLoading && <div className="flex items-center justify-center h-32 text-gray-500">Đang tải...</div>}
        {isError && <div className="flex items-center justify-center h-32 text-red-500">Không thể tải dữ liệu</div>}
        {!isLoading && data && (
          <div className="bg-white border rounded-lg">
            <div className="p-3 bg-gray-50 border-b">
              <div className="text-sm text-blue-600 font-medium">
                Mã: {data.content.length} kết quả
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-medium text-gray-700">Mã</TableHead>
                  <TableHead className="font-medium text-gray-700 text-right">Giá</TableHead>
                  <TableHead className="font-medium text-gray-700 text-right">Thay đổi giá</TableHead>
                  <TableHead className="font-medium text-gray-700 text-right">Sức mạnh giá</TableHead>
                  <TableHead className="font-medium text-gray-700">Sàn</TableHead>
                  <TableHead className="font-medium text-gray-700">Ngành</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.content.map((x) => (
                  <TableRow key={x.ticker} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium text-blue-600">{x.ticker}</TableCell>
                    <TableCell className="text-right font-medium">
                      {x.marketPrice?.toLocaleString() || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {x.dailyPriceChangePercent !== undefined ? (
                        <span className={x.dailyPriceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {x.dailyPriceChangePercent.toFixed(2)}%
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {x.stockStrength !== undefined ? x.stockStrength.toFixed(0) : '-'}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 uppercase">
                        {x.exchange}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {x.industryName || 'Không xác định'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}


