import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, Filter, TrendingUp, Building2 } from "lucide-react";
import { SymbolsService } from "@/services/symbols.service";
import { SYMBOLS_QUERY_KEYS } from "@/types/symbols";
import type {
  GetSymbolsRequest,
  SymbolsPageFilters,
  Symbol,
  SymbolWithPrice,
  SymbolType,
  BoardType
} from "@/types/symbols";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function DanhMucCoPhieuPage() {
  // State for filters and pagination
  const [filters, setFilters] = useState<SymbolsPageFilters>({
    search: "",
    type: "STOCK",
    board: undefined,
    includePrices: true,
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  // Build query params
  const queryParams: GetSymbolsRequest = {
    page,
    limit,
    search: filters.search || undefined,
    type: filters.type,
    board: filters.board,
    includePrices: filters.includePrices,
  };

  // Fetch symbols data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: SYMBOLS_QUERY_KEYS.list(queryParams),
    queryFn: () => SymbolsService.getSymbols(queryParams),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch total count for stats
  const { data: countData } = useQuery({
    queryKey: SYMBOLS_QUERY_KEYS.count(),
    queryFn: () => SymbolsService.getSymbolsCount(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Handle filter changes
  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((key: keyof SymbolsPageFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      type: "STOCK",
      board: undefined,
      includePrices: true,
    });
    setPage(1);
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Render price column with enhanced data
  const renderPrice = (symbol: Symbol | SymbolWithPrice) => {
    if (!SymbolsService.hasPrice(symbol)) {
      return <span className="text-gray-400">-</span>;
    }

    const percentageChange = symbol.percentageChange || 0;
    const { text: percentText, colorClass } = SymbolsService.getFormattedPercentageChange(percentageChange);

    return (
      <div className="text-right">
        <div className="font-medium text-gray-900">
          {SymbolsService.formatCurrency(symbol.currentPrice)}
        </div>
        <div className={`text-xs font-medium ${colorClass}`}>
          {percentText}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(symbol.priceUpdatedAt).toLocaleTimeString('vi-VN')}
        </div>
      </div>
    );
  };

  // Render volume column
  const renderVolume = (symbol: Symbol | SymbolWithPrice) => {
    if (!SymbolsService.hasPrice(symbol) || !symbol.volume) {
      return <span className="text-gray-400">-</span>;
    }

    return (
      <div className="text-right">
        <div className="font-medium text-gray-900">
          {SymbolsService.formatVolume(symbol.volume)}
        </div>
        <div className="text-xs text-gray-500">
          Khối lượng
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Filters */}
      <div className="p-4 bg-gray-50/40 border-b">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <Label htmlFor="search" className="text-sm font-medium text-gray-700">
              Tìm kiếm
            </Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Nhập mã CK hoặc tên công ty..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Type filter */}
          <div>
            <Label htmlFor="type" className="text-sm font-medium text-gray-700">
              Loại
            </Label>
            <Select value={filters.type || "all"} onValueChange={(value: string) =>
              handleFilterChange('type', value === "all" ? undefined : value as SymbolType)
            }>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Tất cả loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="STOCK">Cổ phiếu</SelectItem>
                <SelectItem value="BOND">Trái phiếu</SelectItem>
                <SelectItem value="FU">Phái sinh</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Board filter */}
          <div>
            <Label htmlFor="board" className="text-sm font-medium text-gray-700">
              Sàn
            </Label>
            <Select value={filters.board || "all"} onValueChange={(value: string) =>
              handleFilterChange('board', value === "all" ? undefined : value as BoardType)
            }>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Tất cả sàn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả sàn</SelectItem>
                <SelectItem value="HSX">HSX</SelectItem>
                <SelectItem value="HNX">HNX</SelectItem>
                <SelectItem value="UPCOM">UPCoM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="includePrices"
                checked={filters.includePrices}
                onCheckedChange={(checked) => handleFilterChange('includePrices', checked)}
              />
              <Label htmlFor="includePrices" className="text-sm text-gray-700">
                Hiển thị giá
              </Label>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading && (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            Đang tải dữ liệu...
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center h-32 text-red-500">
            <div className="text-center">
              <p>Không thể tải dữ liệu</p>
              {error && (
                <p className="text-sm text-gray-500 mt-1">
                  {error instanceof Error ? error.message : 'Có lỗi xảy ra'}
                </p>
              )}
            </div>
          </div>
        )}

        {!isLoading && data?.data && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-blue-600">
                  Kết quả: {SymbolsService.formatNumber(data.meta?.total || 0)} mã chứng khoán
                </CardTitle>
                <div className="text-sm text-gray-600">
                  Trang {data.meta?.page || 1} / {data.meta?.totalPages || 1}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-medium text-gray-700">Mã CK</TableHead>
                      <TableHead className="font-medium text-gray-700">Loại</TableHead>
                      <TableHead className="font-medium text-gray-700">Sàn</TableHead>
                      {filters.includePrices && (
                        <>
                          <TableHead className="font-medium text-gray-700 text-right">Giá hiện tại</TableHead>
                          <TableHead className="font-medium text-gray-700 text-right">Khối lượng</TableHead>
                        </>
                      )}
                      <TableHead className="font-medium text-gray-700">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((symbol) => (
                      <TableRow key={symbol.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <Link
                            to={`/co-phieu/${symbol.symbol}`}
                            className="font-bold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {symbol.symbol}
                          </Link>
                        </TableCell>
                        {/* <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {SymbolsService.getDisplayName(symbol)}
                            </div>
                            {symbol.en_organ_name && symbol.organ_name && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {symbol.en_organ_name}
                              </div>
                            )}
                          </div>
                        </TableCell> */}
                        <TableCell>
                          <Badge variant="secondary">
                            {SymbolsService.getTypeDisplayName(symbol.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={symbol.board === 'HSX' ? 'default' :
                                   symbol.board === 'HNX' ? 'secondary' : 'outline'}
                          >
                            {symbol.board}
                          </Badge>
                        </TableCell>
                        {filters.includePrices && (
                          <>
                            <TableCell>
                              {renderPrice(symbol)}
                            </TableCell>
                            <TableCell>
                              {renderVolume(symbol)}
                            </TableCell>
                          </>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/co-phieu/${symbol.symbol}`}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              <TrendingUp className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/co-phieu/${symbol.symbol}`}
                              className="text-sm text-gray-600 hover:text-gray-800"
                            >
                              <Building2 className="h-4 w-4" />
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data.meta && data.meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Hiển thị {((data.meta.page - 1) * data.meta.limit) + 1} - {Math.min(data.meta.page * data.meta.limit, data.meta.total)}
                    trong tổng số {SymbolsService.formatNumber(data.meta.total)} kết quả
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange((data.meta?.page || 1) - 1)}
                      disabled={!data.meta?.hasPreviousPage}
                    >
                      Trang trước
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, data.meta?.totalPages || 1) }, (_, i) => {
                        const currentPage = data.meta?.page || 1;
                        const totalPages = data.meta?.totalPages || 1;

                        // Calculate the starting page number for the pagination
                        let startPage = Math.max(1, currentPage - 2);
                        let endPage = Math.min(totalPages, startPage + 4);

                        // Adjust start page if we're near the end
                        if (endPage - startPage < 4) {
                          startPage = Math.max(1, endPage - 4);
                        }

                        const pageNum = startPage + i;

                        // Only render if pageNum is within valid range
                        if (pageNum > totalPages) return null;

                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange((data.meta?.page || 1) + 1)}
                      disabled={!data.meta?.hasNextPage}
                    >
                      Trang sau
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}