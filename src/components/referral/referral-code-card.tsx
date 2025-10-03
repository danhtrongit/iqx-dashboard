import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Copy, Gift, Users, Wallet, Share2, Edit2 } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface ReferralCodeCardProps {
  referralCode?: any;
  referralLink: string;
  isLoading: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
  onUpdateCode: (code: string) => Promise<void>;
  onCopyCode: () => void;
  onCopyLink: () => void;
  isCopyingLink: boolean;
}

export function ReferralCodeCard({
  referralCode,
  referralLink,
  isLoading,
  isGenerating,
  onGenerate,
  onUpdateCode,
  onCopyCode,
  onCopyLink,
  isCopyingLink,
}: ReferralCodeCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [editError, setEditError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleOpenEditDialog = () => {
    setNewCode(referralCode?.code || "");
    setEditError("");
    setIsEditDialogOpen(true);
  };

  const handleUpdateCode = async () => {
    if (!newCode.trim()) {
      setEditError("Vui lòng nhập mã giới thiệu");
      return;
    }

    const codeUpper = newCode.toUpperCase().trim();
    if (!/^[A-Z0-9]{6,20}$/.test(codeUpper)) {
      setEditError("Mã phải từ 6-20 ký tự, chỉ bao gồm chữ cái in hoa và số");
      return;
    }

    try {
      setIsUpdating(true);
      await onUpdateCode(codeUpper);
      setIsEditDialogOpen(false);
      setEditError("");
    } catch (error: any) {
      setEditError(error.message || "Không thể cập nhật mã");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || isGenerating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mã giới thiệu của bạn</CardTitle>
          <CardDescription>
            Chia sẻ mã hoặc link giới thiệu để nhận hoa hồng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!referralCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mã giới thiệu của bạn</CardTitle>
          <CardDescription>
            Chia sẻ mã hoặc link giới thiệu để nhận hoa hồng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Gift className="size-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">
              Chưa có mã giới thiệu
            </p>
            <Button onClick={onGenerate}>
              Tạo mã giới thiệu
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Mã giới thiệu của bạn</CardTitle>
            <CardDescription className="mt-1">
              Chia sẻ mã hoặc link giới thiệu để nhận hoa hồng
            </CardDescription>
          </div>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenEditDialog}
              >
                <Edit2 className="size-4 mr-2" />
                Chỉnh sửa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Chỉnh sửa mã giới thiệu</DialogTitle>
                <DialogDescription>
                  Mã giới thiệu phải từ 6-20 ký tự, chỉ bao gồm chữ cái in hoa và số. 
                  Bạn có thể thay đổi mã bất kỳ lúc nào vì hệ thống dựa trên ID người dùng.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Input
                  value={newCode}
                  onChange={(e) => {
                    setNewCode(e.target.value.toUpperCase());
                    setEditError("");
                  }}
                  placeholder="VD: MYCODE123"
                  disabled={isUpdating}
                  className="font-mono text-lg"
                  maxLength={20}
                />
                {editError && (
                  <p className="text-sm text-destructive">{editError}</p>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isUpdating}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleUpdateCode}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Đang lưu..." : "Lưu"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Grid Layout - Mã và Link */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Referral Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mã giới thiệu</label>
            <div className="flex gap-2">
              <Input
                value={referralCode.code}
                readOnly
                className="font-mono text-lg font-bold"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={onCopyCode}
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </div>

          {/* Referral Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Link giới thiệu</label>
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={onCopyLink}
                disabled={isCopyingLink}
              >
                <Share2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex gap-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng giới thiệu</p>
              <p className="text-lg font-bold">{referralCode.totalReferrals}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <Wallet className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng hoa hồng</p>
              <p className="text-lg font-bold">
                {formatCurrency(referralCode.totalCommission)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

