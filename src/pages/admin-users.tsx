import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useUserStats,
  useUsers,
  useUserDetail,
  useActivateUser,
  useDeactivateUser,
  useUpdateUserRole,
  useAssignSubscription,
  useUpdateSubscription,
  useCancelSubscription,
} from "@/hooks/use-user-management";
import { useSubscriptionPackages } from "@/hooks/use-subscription";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  ShieldAlert,
  Crown,
  Lock,
  Unlock,
  Edit2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import type { UserListParams, UserListItem } from "@/types/user-management";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function AdminUsersPage() {
  // Filter and pagination state
  const [params, setParams] = useState<UserListParams>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  // Dialog states
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<"admin" | "member" | "premium">("member");
  const [subscriptionData, setSubscriptionData] = useState({
    packageId: "",
    durationDays: 30,
    autoRenew: false,
  });

  // Fetch data
  const { data: stats, isLoading: isLoadingStats } = useUserStats();
  const { data: usersData, isLoading: isLoadingUsers } = useUsers(params);
  const { data: userDetail, isLoading: isLoadingDetail } = useUserDetail(
    selectedUserId || "",
    !!selectedUserId && isDetailDialogOpen
  );
  const { data: packages, isLoading: isLoadingPackages } = useSubscriptionPackages();

  // Mutations
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();
  const updateRoleMutation = useUpdateUserRole();
  const assignSubscriptionMutation = useAssignSubscription();

  // Handlers
  const handleSearch = (value: string) => {
    setParams({ ...params, search: value, page: 1 });
  };

  const handleFilterRole = (value: string) => {
    setParams({
      ...params,
      role: value === "all" ? undefined : (value as any),
      page: 1,
    });
  };

  const handleFilterStatus = (value: string) => {
    setParams({
      ...params,
      isActive: value === "all" ? undefined : value === "active",
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    setParams({ ...params, page: newPage });
  };

  const handleActivateUser = async (userId: string) => {
    if (confirm("Bạn có chắc muốn kích hoạt người dùng này?")) {
      await activateMutation.mutateAsync(userId);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (confirm("Bạn có chắc muốn khóa người dùng này?")) {
      await deactivateMutation.mutateAsync(userId);
    }
  };

  const handleOpenRoleDialog = (userId: string, currentRole: string) => {
    setSelectedUserId(userId);
    setNewRole(currentRole as any);
    setIsRoleDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUserId) return;
    await updateRoleMutation.mutateAsync({
      userId: selectedUserId,
      data: { role: newRole },
    });
    setIsRoleDialogOpen(false);
    setSelectedUserId(null);
  };

  const handleOpenDetail = (userId: string) => {
    setSelectedUserId(userId);
    setIsDetailDialogOpen(true);
  };

  const handleOpenSubscriptionDialog = (userId: string) => {
    setSelectedUserId(userId);
    setIsSubscriptionDialogOpen(true);
  };

  const handleAssignSubscription = async () => {
    if (!selectedUserId || !subscriptionData.packageId) return;
    await assignSubscriptionMutation.mutateAsync({
      userId: selectedUserId,
      data: subscriptionData,
    });
    setIsSubscriptionDialogOpen(false);
    setSelectedUserId(null);
    setSubscriptionData({ packageId: "", durationDays: 30, autoRenew: false });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="destructive" className="text-xs">
            <ShieldAlert className="size-3 mr-1" />
            Admin
          </Badge>
        );
      case "premium":
        return (
          <Badge variant="default" className="text-xs">
            <Crown className="size-3 mr-1" />
            Premium
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Member
          </Badge>
        );
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="outline" className="text-xs text-green-600 border-green-600">
        <UserCheck className="size-3 mr-1" />
        Hoạt động
      </Badge>
    ) : (
      <Badge variant="outline" className="text-xs text-red-600 border-red-600">
        <UserX className="size-3 mr-1" />
        Đã khóa
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="size-6" />
            Quản lý người dùng
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setParams({ ...params })}
        >
          <RefreshCw className="size-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {isLoadingStats ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : stats ? (
          <>
            <StatCard
              title="Tổng users"
              value={stats.totalUsers}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Đang hoạt động"
              value={stats.activeUsers}
              icon={UserCheck}
              color="green"
            />
            <StatCard
              title="Đã khóa"
              value={stats.inactiveUsers}
              icon={UserX}
              color="red"
            />
            <StatCard
              title="Premium"
              value={stats.premiumUsers}
              icon={Crown}
              color="yellow"
            />
            <StatCard
              title="Admin"
              value={stats.adminUsers}
              icon={ShieldAlert}
              color="purple"
            />
            <StatCard
              title="Mới tháng này"
              value={stats.newUsersThisMonth}
              icon={Users}
              color="indigo"
            />
          </>
        ) : null}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Label className="text-sm mb-2 block">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo email, tên..."
                  value={params.search || ""}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm mb-2 block">Vai trò</Label>
              <Select
                value={params.role || "all"}
                onValueChange={handleFilterRole}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-2 block">Trạng thái</Label>
              <Select
                value={
                  params.isActive === undefined
                    ? "all"
                    : params.isActive
                    ? "active"
                    : "inactive"
                }
                onValueChange={handleFilterStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Đã khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Danh sách người dùng
            {usersData?.pagination && (
              <span className="ml-2 text-sm text-muted-foreground font-normal">
                ({usersData.pagination.total} users)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingUsers ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : usersData && usersData.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Tên hiển thị</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Subscriptions</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData.data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="size-4 text-muted-foreground" />
                            <span className="font-medium">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.displayName}</div>
                            {user.fullName && user.fullName !== user.displayName && (
                              <div className="text-xs text-muted-foreground">
                                {user.fullName}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.userSubscriptions
                              .filter((s) => s.status === "active")
                              .map((sub) => (
                                <Badge
                                  key={sub.id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {sub.package.name}
                                </Badge>
                              ))}
                            {user.userSubscriptions.filter((s) => s.status === "active")
                              .length === 0 && (
                              <span className="text-xs text-muted-foreground">
                                Không có
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(user.createdAt), "dd/MM/yyyy", {
                              locale: vi,
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => handleOpenDetail(user.id)}
                            >
                              <Edit2 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => handleOpenRoleDialog(user.id, user.role)}
                            >
                              <Shield className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => handleOpenSubscriptionDialog(user.id)}
                            >
                              <Plus className="size-4" />
                            </Button>
                            {user.isActive ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => handleDeactivateUser(user.id)}
                                disabled={
                                  user.role === "admin" ||
                                  deactivateMutation.isPending
                                }
                              >
                                <Lock className="size-4 text-red-600" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => handleActivateUser(user.id)}
                                disabled={activateMutation.isPending}
                              >
                                <Unlock className="size-4 text-green-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {usersData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Trang {usersData.pagination.page} / {usersData.pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(params.page! - 1)}
                      disabled={params.page === 1}
                    >
                      <ChevronLeft className="size-4 mr-1" />
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(params.page! + 1)}
                      disabled={params.page === usersData.pagination.totalPages}
                    >
                      Sau
                      <ChevronRight className="size-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="size-12 mx-auto mb-4 opacity-20" />
              <p>Không tìm thấy người dùng</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết và subscriptions của người dùng
            </DialogDescription>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : userDetail ? (
            <div className="space-y-4">
              {/* User Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="size-4 text-muted-foreground" />
                        <span className="text-sm">{userDetail.email}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Số điện thoại
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="size-4 text-muted-foreground" />
                        <span className="text-sm">
                          {userDetail.phoneE164 || "Chưa có"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Vai trò</Label>
                      <div className="mt-1">{getRoleBadge(userDetail.role)}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Trạng thái
                      </Label>
                      <div className="mt-1">{getStatusBadge(userDetail.isActive)}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Ngày tạo
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(userDetail.createdAt), "dd/MM/yyyy HH:mm", {
                            locale: vi,
                          })}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Cập nhật lần cuối
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(userDetail.updatedAt), "dd/MM/yyyy HH:mm", {
                            locale: vi,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscriptions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    Subscriptions ({userDetail.userSubscriptions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userDetail.userSubscriptions.length > 0 ? (
                    <div className="space-y-2">
                      {userDetail.userSubscriptions.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3 border rounded-lg flex items-start justify-between"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{sub.package.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {format(new Date(sub.startsAt), "dd/MM/yyyy", {
                                locale: vi,
                              })}{" "}
                              -{" "}
                              {format(new Date(sub.expiresAt), "dd/MM/yyyy", {
                                locale: vi,
                              })}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Badge
                                variant={
                                  sub.status === "active" ? "default" : "secondary"
                                }
                                className="text-xs"
                              >
                                {sub.status}
                              </Badge>
                              {sub.autoRenew && (
                                <Badge variant="outline" className="text-xs">
                                  Tự động gia hạn
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: sub.currency,
                            }).format(Number(sub.price))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      Chưa có subscription nào
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật vai trò</DialogTitle>
            <DialogDescription>
              Thay đổi vai trò của người dùng trong hệ thống
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Chọn vai trò mới</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as any)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
              disabled={updateRoleMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Subscription Dialog */}
      <Dialog
        open={isSubscriptionDialogOpen}
        onOpenChange={setIsSubscriptionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gắn gói subscription</DialogTitle>
            <DialogDescription>
              Thêm gói subscription mới cho người dùng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Chọn gói subscription *</Label>
              {isLoadingPackages ? (
                <Skeleton className="h-10 w-full mt-2" />
              ) : packages && packages.length > 0 ? (
                <Select
                  value={subscriptionData.packageId}
                  onValueChange={(value) => {
                    const selectedPackage = packages.find((p) => p.id === value);
                    setSubscriptionData({
                      ...subscriptionData,
                      packageId: value,
                      durationDays: selectedPackage?.durationDays || 30,
                    });
                  }}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Chọn gói..." />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-medium">{pkg.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: pkg.currency,
                            }).format(Number(pkg.price))}{" "}
                            - {pkg.durationDays} ngày
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Alert className="mt-2">
                  <AlertDescription className="text-xs">
                    Không có gói subscription nào. Vui lòng tạo gói trước.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            {subscriptionData.packageId && packages && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  {(() => {
                    const selectedPkg = packages.find(
                      (p) => p.id === subscriptionData.packageId
                    );
                    return selectedPkg ? (
                      <div className="space-y-1">
                        <div className="font-medium">{selectedPkg.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {selectedPkg.description}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <span>
                            💰{" "}
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: selectedPkg.currency,
                            }).format(Number(selectedPkg.price))}
                          </span>
                          <span>📅 {selectedPkg.durationDays} ngày</span>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            )}
            <div>
              <Label>Số ngày sử dụng</Label>
              <Input
                type="number"
                placeholder="30"
                value={subscriptionData.durationDays}
                onChange={(e) =>
                  setSubscriptionData({
                    ...subscriptionData,
                    durationDays: parseInt(e.target.value) || 30,
                  })
                }
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Để trống để sử dụng thời hạn mặc định của gói
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoRenew"
                checked={subscriptionData.autoRenew}
                onChange={(e) =>
                  setSubscriptionData({
                    ...subscriptionData,
                    autoRenew: e.target.checked,
                  })
                }
                className="size-4"
              />
              <Label htmlFor="autoRenew" className="text-sm">
                Tự động gia hạn
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubscriptionDialogOpen(false);
                setSubscriptionData({
                  packageId: "",
                  durationDays: 30,
                  autoRenew: false,
                });
              }}
              disabled={assignSubscriptionMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAssignSubscription}
              disabled={
                assignSubscriptionMutation.isPending || !subscriptionData.packageId
              }
            >
              {assignSubscriptionMutation.isPending ? "Đang gắn..." : "Gắn gói"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Statistics Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    red: "text-red-600 bg-red-50",
    yellow: "text-yellow-600 bg-yellow-50",
    purple: "text-purple-600 bg-purple-50",
    indigo: "text-indigo-600 bg-indigo-50",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div
            className={`p-2 rounded-lg ${
              colorClasses[color as keyof typeof colorClasses]
            }`}
          >
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

