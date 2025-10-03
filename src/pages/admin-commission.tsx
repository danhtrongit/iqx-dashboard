import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
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
  useCommissionSettings,
  useActiveCommissionSetting,
  useCreateCommissionSetting,
  useUpdateCommissionSetting,
  useDeleteCommissionSetting,
  useToggleActiveSetting,
  usePayoutExamples,
  useGenerateReferralForAll,
} from "@/hooks/use-commission-admin";
import { Settings, Plus, Edit2, Calculator, Users, AlertTriangle, Trash2, Power } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import type { CommissionSetting } from "@/types/commission";
import { CommissionCalculator } from "@/components/admin/commission-calculator";

export default function AdminCommissionPage() {
  const { data: settings, isLoading: isLoadingSettings } = useCommissionSettings();
  const { data: activeSetting, isLoading: isLoadingActive } = useActiveCommissionSetting();
  const createMutation = useCreateCommissionSetting();
  const updateMutation = useUpdateCommissionSetting();
  const deleteMutation = useDeleteCommissionSetting();
  const toggleActiveMutation = useToggleActiveSetting();
  const generateReferralMutation = useGenerateReferralForAll();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<CommissionSetting | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    commissionTotalPct: 0.15,
    tiersPct: [0.1, 0.035, 0.015],
    isActive: true,
  });

  const handleOpenEditDialog = (setting: CommissionSetting) => {
    setEditingSetting(setting);
    setFormData({
      name: setting.name,
      description: setting.description || "",
      commissionTotalPct: setting.commissionTotalPct,
      tiersPct: setting.tiersPct,
      isActive: setting.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingSetting(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      commissionTotalPct: 0.15,
      tiersPct: [0.1, 0.035, 0.015],
      isActive: true,
    });
  };

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUpdate = async () => {
    if (!editingSetting) return;
    try {
      await updateMutation.mutateAsync({
        id: editingSetting.id,
        data: formData,
      });
      handleCloseEditDialog();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleAddTier = () => {
    setFormData({
      ...formData,
      tiersPct: [...formData.tiersPct, 0],
    });
  };

  const handleRemoveTier = (index: number) => {
    setFormData({
      ...formData,
      tiersPct: formData.tiersPct.filter((_, i) => i !== index),
    });
  };

  const handleTierChange = (index: number, value: string) => {
    const newTiers = [...formData.tiersPct];
    newTiers[index] = parseFloat(value) || 0;
    setFormData({ ...formData, tiersPct: newTiers });
  };

  const handleGenerateReferralCodes = async () => {
    if (confirm("Bạn có chắc muốn tạo mã giới thiệu cho tất cả user chưa có mã?")) {
      await generateReferralMutation.mutateAsync();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa cấu hình "${name}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleToggleActive = async (id: string) => {
    await toggleActiveMutation.mutateAsync(id);
  };

  return (
    <div className="container mx-auto p-4 space-y-3 max-w-7xl">
      {/* Header - Compact */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Settings className="size-5" />
            Cài đặt hoa hồng
          </h1>
          <p className="text-xs text-muted-foreground">
            Quản lý cấu hình hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateReferralCodes}
            variant="outline"
            size="sm"
            disabled={generateReferralMutation.isPending}
          >
            <Users className="size-3.5 mr-1" />
            <span className="hidden sm:inline">Tạo mã user</span>
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-3.5 mr-1" />
                Tạo mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tạo cấu hình hoa hồng mới</DialogTitle>
                <DialogDescription>
                  Thiết lập tỷ lệ hoa hồng cho từng cấp giới thiệu
                </DialogDescription>
              </DialogHeader>
              <CommissionForm
                formData={formData}
                setFormData={setFormData}
                onAddTier={handleAddTier}
                onRemoveTier={handleRemoveTier}
                onTierChange={handleTierChange}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                  disabled={createMutation.isPending}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Đang tạo..." : "Tạo"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Grid Layout - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column - Active Setting */}
        <div className="lg:col-span-1 space-y-3">
          {/* Active Setting - Compact */}
          {isLoadingActive ? (
            <Card>
              <CardContent className="py-3">
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ) : activeSetting ? (
            <Card className="border-green-500/50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Power className="size-4 text-green-500" />
                    <CardTitle className="text-sm">Đang áp dụng</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={() => handleOpenEditDialog(activeSetting)}
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="font-semibold">{activeSetting.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Tổng: {(activeSetting.commissionTotalPct * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {activeSetting.tiersPct.map((pct, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      F{i + 1}: {(pct * 100).toFixed(1)}%
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert className="py-3">
              <AlertTriangle className="size-4" />
              <AlertDescription className="text-xs">
                Chưa có cấu hình active
              </AlertDescription>
            </Alert>
          )}

          {/* All Settings - Compact List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Cấu hình ({settings?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {isLoadingSettings ? (
                <div className="space-y-1 px-3 pb-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : settings && settings.length > 0 ? (
                <div className="divide-y max-h-96 overflow-y-auto">
                  {settings.map((setting) => (
                    <div
                      key={setting.id}
                      className="px-3 py-2 hover:bg-muted/30 transition-colors text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-medium truncate">{setting.name}</span>
                            {setting.isActive && (
                              <Badge variant="default" className="text-[10px] h-4 px-1">
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(setting.commissionTotalPct * 100).toFixed(1)}% •{" "}
                            {setting.tiersPct.length} cấp
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => handleToggleActive(setting.id)}
                            disabled={toggleActiveMutation.isPending}
                          >
                            <Power
                              className={`size-3.5 ${
                                setting.isActive ? "text-green-500" : "text-gray-400"
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => handleOpenEditDialog(setting)}
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => handleDelete(setting.id, setting.name)}
                            disabled={deleteMutation.isPending || setting.isActive}
                          >
                            <Trash2
                              className={`size-3.5 ${
                                setting.isActive ? "text-gray-400" : "text-red-500"
                              }`}
                            />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground px-3">
                  <Settings className="size-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs">Chưa có cấu hình</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Calculator */}
        <div className="lg:col-span-2">
          <CommissionCalculator />
        </div>
      </div>


      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa cấu hình hoa hồng</DialogTitle>
            <DialogDescription>
              Cập nhật tỷ lệ hoa hồng cho từng cấp giới thiệu
            </DialogDescription>
          </DialogHeader>
          <CommissionForm
            formData={formData}
            setFormData={setFormData}
            onAddTier={handleAddTier}
            onRemoveTier={handleRemoveTier}
            onTierChange={handleTierChange}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseEditDialog}
              disabled={updateMutation.isPending}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Commission Form Component
function CommissionForm({
  formData,
  setFormData,
  onAddTier,
  onRemoveTier,
  onTierChange,
}: {
  formData: any;
  setFormData: (data: any) => void;
  onAddTier: () => void;
  onRemoveTier: (index: number) => void;
  onTierChange: (index: number, value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="name" className="text-sm">Tên cấu hình *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Cấu hình mặc định"
            className="mt-1.5"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="totalPct" className="text-sm">Tổng % *</Label>
          <Input
            id="totalPct"
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={formData.commissionTotalPct}
            onChange={(e) =>
              setFormData({
                ...formData,
                commissionTotalPct: parseFloat(e.target.value) || 0,
              })
            }
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">
            0-1 (0.15 = 15%)
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-sm">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Mô tả ngắn..."
          className="mt-1.5 h-20"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm">Tỷ lệ các cấp *</Label>
          <Button type="button" variant="outline" size="sm" onClick={onAddTier}>
            <Plus className="size-3 mr-1" />
            Thêm
          </Button>
        </div>
        <div className="space-y-1.5">
          {formData.tiersPct.map((pct: number, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm font-medium w-10">F{index + 1}</span>
              <Input
                type="number"
                step="0.001"
                min="0"
                max="1"
                value={pct}
                onChange={(e) => onTierChange(index, e.target.value)}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-16">
                {(pct * 100).toFixed(1)}%
              </span>
              {formData.tiersPct.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveTier(index)}
                  className="size-8"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="size-4"
        />
        <Label htmlFor="isActive" className="text-sm">Kích hoạt ngay</Label>
      </div>
    </div>
  );
}

