import { useState } from 'react'
import { useAnalysisReports } from '@/features/analysis-report/api/useAnalysisReports'
import type { analysisReport } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'

type AnalysisReportProps = {
  symbol: string
}

function getRecommendationColor(recommend: string) {
  switch (recommend) {
    case 'MUA':
      return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
    case 'BÁN':
      return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
    case 'GIỮ':
    case 'TRUNG LẬP':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
    case 'TÍCH LŨY':
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800'
  }
}

function formatTargetPrice(price?: number) {
  if (!price) return '-'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(price)
}

function getReportPdfUrl(fileName: string) {
  return `https://api2.simplize.vn/api/company/analysis-report/pdf/${fileName}`
}

const REPORT_SOURCES = [
  { value: 'all', label: 'Tất cả nguồn' },
  { value: 'SSI', label: 'SSI' },
  { value: 'VND', label: 'VNDirect' },
  { value: 'MBS', label: 'MB Securities' },
  { value: 'HSC', label: 'HSC' },
  { value: 'VCI', label: 'VCI' },
  { value: 'VCSC', label: 'VCSC' },
  { value: 'FPTS', label: 'FPT Securities' },
]

const REPORT_TYPES: { value: string; label: string }[] = [
  { value: 'all', label: 'Tất cả loại' },
  { value: '1', label: 'Báo cáo phân tích' },
  { value: '2', label: 'Báo cáo ngành' },
  { value: '3', label: 'Báo cáo thị trường' },
]

const RECOMMENDATIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tất cả khuyến nghị' },
  { value: 'MUA', label: 'Mua' },
  { value: 'BÁN', label: 'Bán' },
  { value: 'GIỮ', label: 'Giữ' },
  { value: 'TÍCH LŨY', label: 'Tích lũy' },
  { value: 'TRUNG LẬP', label: 'Trung lập' },
]

export default function AnalysisReport(props: AnalysisReportProps) {
  const { symbol } = props

  // Filters
  const [selectedSource, setSelectedSource] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedRecommend, setSelectedRecommend] = useState('all')

  // Pagination
  const [page, setPage] = useState(0)
  const [pageSize] = useState(20)

  const { data: reports, isLoading: loading, error } = useAnalysisReports({
    ticker: symbol,
    page,
    size: pageSize
  })

  const filteredReports = reports?.data?.filter(report => {
    if (selectedSource !== 'all' && report.source !== selectedSource) return false
    if (selectedType !== 'all' && report.reportType !== parseInt(selectedType)) return false
    if (selectedRecommend !== 'all' && report.recommend !== selectedRecommend) return false
    return true
  }).sort((a, b) => {
    // Sort by issue date, newest first
    return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
  }) || []


  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: vi })
    } catch {
      return dateString
    }
  }

  const handlePreviousPage = () => {
    if (page > 0) setPage(page - 1)
  }

  const handleNextPage = () => {
    const totalPages = reports?.total ? Math.ceil(reports.total / pageSize) : 1
    if (page < totalPages - 1) setPage(page + 1)
  }

  if (loading && !reports) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Đang tải báo cáo...</div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            {error instanceof Error ? error.message : 'Không thể tải báo cáo phân tích'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc báo cáo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn nguồn" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_SOURCES.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại báo cáo" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRecommend} onValueChange={setSelectedRecommend}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn khuyến nghị" />
              </SelectTrigger>
              <SelectContent>
                {RECOMMENDATIONS.map((rec) => (
                  <SelectItem key={rec.value} value={rec.value}>
                    {rec.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            Danh sách báo cáo ({filteredReports.length} báo cáo)
          </CardTitle>
          {reports && reports.total > pageSize && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePreviousPage}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page + 1} / {Math.ceil(reports.total / pageSize)}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleNextPage}
                disabled={page >= Math.ceil(reports.total / pageSize) - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Ngày</TableHead>
                  <TableHead className="min-w-[80px]">Nguồn</TableHead>
                  <TableHead className="min-w-[350px]">Tiêu đề</TableHead>
                  <TableHead className="text-center min-w-[100px]">Khuyến nghị</TableHead>
                  <TableHead className="text-right min-w-[120px]">Giá mục tiêu</TableHead>
                  <TableHead className="text-center min-w-[80px]">File PDF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-mono text-sm">
                        {formatDate(report.issueDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {report.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium line-clamp-2">{report.title}</div>
                          {report.issueDateTimeAgo && (
                            <div className="text-xs text-muted-foreground">
                              {report.issueDateTimeAgo}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {report.recommend && (
                          <Badge
                            variant="outline"
                            className={cn(
                              'font-semibold',
                              getRecommendationColor(report.recommend)
                            )}
                          >
                            {report.recommend}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatTargetPrice(report.targetPrice)}
                      </TableCell>
                      <TableCell className="text-center">
                        {(report.attachedLink || report.fileName) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                            onClick={() => {
                              if (report.attachedLink) {
                                window.open(report.attachedLink, '_blank')
                              } else if (report.fileName) {
                                window.open(getReportPdfUrl(report.fileName), '_blank')
                              }
                            }}
                            title="Xem file PDF"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="ml-1 text-xs">PDF</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="text-muted-foreground">
                        {loading ? 'Đang tải...' : 'Không có báo cáo nào'}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {reports && reports.total > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Tổng báo cáo</div>
                <div className="text-2xl font-semibold">{reports.total}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Báo cáo gần nhất</div>
                <div className="text-lg font-medium">
                  {reports.data[0] && formatDate(reports.data[0].issueDate)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Nguồn phổ biến</div>
                <div className="text-lg font-medium">
                  {(() => {
                    const sourceCounts = reports.data.reduce((acc, r) => {
                      acc[r.source] = (acc[r.source] || 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                    const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]
                    return topSource ? `${topSource[0]} (${topSource[1]})` : '-'
                  })()}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Khuyến nghị nhiều nhất</div>
                <div className="text-lg font-medium">
                  {(() => {
                    const recommendCounts = reports.data
                      .filter(r => r.recommend)
                      .reduce((acc, r) => {
                        acc[r.recommend!] = (acc[r.recommend!] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                    const topRecommend = Object.entries(recommendCounts).sort((a, b) => b[1] - a[1])[0]
                    return topRecommend ? `${topRecommend[0]} (${topRecommend[1]})` : '-'
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}