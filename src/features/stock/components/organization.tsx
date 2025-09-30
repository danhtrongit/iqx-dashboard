import { useState } from 'react'
import { useCompanyRelationships, useShareholderStructure, useCompanyShareholders } from '@/hooks/use-company'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Building2,
  Users,
  PieChart,
  TrendingUp,
  User,
  Building,
  ArrowRight,
  ExternalLink
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { CompanyAffiliate, CompanySubsidiary, CompanyShareholder } from '@/types/company'

interface OrganizationProps {
  ticker: string
}

export function Organization({ ticker }: OrganizationProps) {
  const [activeTab, setActiveTab] = useState('relationships')

  const {
    data: relationshipsData,
    isLoading: relationshipsLoading,
    error: relationshipsError
  } = useCompanyRelationships(ticker, { enabled: !!ticker })

  const {
    data: shareholderStructureData,
    isLoading: structureLoading,
    error: structureError
  } = useShareholderStructure(ticker, { enabled: !!ticker })

  const {
    data: shareholdersData,
    isLoading: shareholdersLoading,
    error: shareholdersError
  } = useCompanyShareholders(ticker, { enabled: !!ticker })


  if (!ticker) {
    return (
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertDescription>
          Vui lòng chọn một mã cổ phiếu để xem thông tin tổ chức.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Cơ cấu tổ chức {ticker}</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="relationships" className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Quan hệ công ty
          </TabsTrigger>
          <TabsTrigger value="structure" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Cơ cấu cổ đông
          </TabsTrigger>
          <TabsTrigger value="shareholders" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Danh sách cổ đông
          </TabsTrigger>
        </TabsList>

        <TabsContent value="relationships" className="space-y-4">
          <RelationshipsTab
            data={relationshipsData}
            isLoading={relationshipsLoading}
            error={relationshipsError}
          />
        </TabsContent>

        <TabsContent value="structure" className="space-y-4">
          <ShareholderStructureTab
            data={shareholderStructureData}
            isLoading={structureLoading}
            error={structureError}
          />
        </TabsContent>

        <TabsContent value="shareholders" className="space-y-4">
          <ShareholdersTab
            data={shareholdersData}
            isLoading={shareholdersLoading}
            error={shareholdersError}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface RelationshipsTabProps {
  data: unknown
  isLoading: boolean
  error: unknown
}

function RelationshipsTab({ data, isLoading, error }: RelationshipsTabProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Building2 className="h-4 w-4" />
        <AlertDescription>
          Không thể tải dữ liệu quan hệ công ty: {error instanceof Error ? error.message : 'Có lỗi xảy ra'}
        </AlertDescription>
      </Alert>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const affiliates = (data as any)?.data?.affiliates || []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subsidiaries = (data as any)?.data?.subsidiaries || []

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Công ty liên kết
          </CardTitle>
          <CardDescription>
            Các công ty mà {data?.ticker || 'công ty'} có quan hệ liên kết
          </CardDescription>
        </CardHeader>
        <CardContent>
          {affiliates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Không có công ty liên kết
            </p>
          ) : (
            <div className="space-y-3">
              {affiliates.map((affiliate: CompanyAffiliate, index: number) => (
                <CompanyRelationshipCard key={index} company={affiliate} type="affiliate" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Công ty con
          </CardTitle>
          <CardDescription>
            Các công ty con thuộc sở hữu của {data?.ticker || 'công ty'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subsidiaries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Không có công ty con
            </p>
          ) : (
            <div className="space-y-3">
              {subsidiaries.map((subsidiary: CompanySubsidiary, index: number) => (
                <CompanyRelationshipCard key={index} company={subsidiary} type="subsidiary" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface CompanyRelationshipCardProps {
  company: CompanyAffiliate | CompanySubsidiary
  type: 'affiliate' | 'subsidiary'
}

function CompanyRelationshipCard({ company }: CompanyRelationshipCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{company.rightOrganNameVi}</h4>
            <Badge variant="outline">
              {company.rightTicker}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {company.rightOrganNameEn}
          </p>
        </div>
        <Button variant="ghost" size="sm">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Tỷ lệ sở hữu:</span>
        <div className="flex items-center gap-2">
          <Badge variant={company.ownedPercentage > 50 ? "default" : "secondary"}>
            {formatPercentage(company.ownedPercentage)}
          </Badge>
          <span className="text-muted-foreground">
            ({formatNumber(company.ownedQuantity)} cổ phiếu)
          </span>
        </div>
      </div>
    </div>
  )
}

interface ShareholderStructureTabProps {
  data: unknown
  isLoading: boolean
  error: unknown
}

function ShareholderStructureTab({ data, isLoading, error }: ShareholderStructureTabProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <PieChart className="h-4 w-4" />
        <AlertDescription>
          Không thể tải dữ liệu cơ cấu cổ đông: {error instanceof Error ? error.message : 'Có lỗi xảy ra'}
        </AlertDescription>
      </Alert>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const structure = (data as any)?.data

  if (!structure) {
    return (
      <Alert>
        <PieChart className="h-4 w-4" />
        <AlertDescription>
          Không có dữ liệu cơ cấu cổ đông
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Cơ cấu cổ đông theo tỷ lệ
          </CardTitle>
          <CardDescription>
            Phân bổ cổ phiếu theo từng loại đối tượng sở hữu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Nhà nước:</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {formatPercentage(structure.statePercentage)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ({formatNumber(structure.stateVolume)} CP)
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Nước ngoài:</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {formatPercentage(structure.foreignPercentage)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ({formatNumber(structure.foreignerVolume)} CP)
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Khác:</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {formatPercentage(structure.otherPercentage)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ({formatNumber(structure.otherVolume)} CP)
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Ban lãnh đạo:</span>
              <Badge variant="default">
                {formatPercentage(structure.bodPercentage)}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Tổ chức:</span>
              <Badge variant="default">
                {formatPercentage(structure.institutionPercentage)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Thông tin tổng quan
          </CardTitle>
          <CardDescription>
            Số liệu tổng quan về cơ cấu sở hữu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tổng số cổ phiếu:</span>
              <span className="font-mono">
                {formatNumber(structure.totalShares)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Cổ phiếu lưu hành:</span>
              <span className="font-mono">
                {formatNumber(structure.foreignerVolume + structure.otherVolume + structure.stateVolume)}
              </span>
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="text-xs text-muted-foreground mb-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                Cập nhật: {new Date((data as any)?.serverDateTime || '').toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ShareholdersTabProps {
  data: unknown
  isLoading: boolean
  error: unknown
}

function ShareholdersTab({ data, isLoading, error }: ShareholdersTabProps) {
  const [sortBy, setSortBy] = useState<'percentage' | 'quantity'>('percentage')

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Users className="h-4 w-4" />
        <AlertDescription>
          Không thể tải danh sách cổ đông: {error instanceof Error ? error.message : 'Có lỗi xảy ra'}
        </AlertDescription>
      </Alert>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shareholders = (data as any)?.data || []
  const sortedShareholders = [...shareholders].sort((a: CompanyShareholder, b: CompanyShareholder) => {
    if (sortBy === 'percentage') return b.percentage - a.percentage
    return b.quantity - a.quantity
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Danh sách cổ đông lớn
            </CardTitle>
            <CardDescription>
              Thông tin chi tiết về các cổ đông sở hữu lượng cổ phiếu lớn
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'percentage' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('percentage')}
            >
              Sắp xếp theo %
            </Button>
            <Button
              variant={sortBy === 'quantity' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('quantity')}
            >
              Sắp xếp theo SL
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {shareholders.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Không có dữ liệu cổ đông
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên cổ đông</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Chức vụ</TableHead>
                <TableHead className="text-right">Số lượng CP</TableHead>
                <TableHead className="text-right">Tỷ lệ (%)</TableHead>
                <TableHead className="text-right">Cập nhật</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedShareholders.map((shareholder: CompanyShareholder, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{shareholder.ownerName}</div>
                      {shareholder.ownerNameEn && (
                        <div className="text-sm text-muted-foreground">
                          {shareholder.ownerNameEn}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={shareholder.ownerType === 'CORPORATE' ? 'default' : 'secondary'}>
                      <div className="flex items-center gap-1">
                        {shareholder.ownerType === 'CORPORATE' ? (
                          <Building className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        {shareholder.ownerType === 'CORPORATE' ? 'Tổ chức' : 'Cá nhân'}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {shareholder.positionName ? (
                      <Badge variant="outline">
                        {shareholder.positionName}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(shareholder.quantity)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">
                      {formatPercentage(shareholder.percentage)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {new Date(shareholder.updateDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

// Helper functions
const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`
const formatNumber = (value: number) => value.toLocaleString('vi-VN')

export default Organization