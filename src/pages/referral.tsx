import {
  useMyReferralCode,
  useUpdateReferralCode,
  useGenerateReferralCode,
  useReferralStats,
  useCommissions,
  useTotalCommission,
  useCopyReferralLink,
} from "@/hooks/use-referral";
import { ReferralService } from "@/services/referral.service";
import { useEffect } from "react";
import { DownlineTree } from "@/components/referral/downline-tree";
import { ReferralStatsCards } from "@/components/referral/referral-stats-cards";
import { ReferralCodeCard } from "@/components/referral/referral-code-card";
import { CommissionHistoryTable } from "@/components/referral/commission-history-table";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, ArrowRight } from "lucide-react";

export default function ReferralPage() {
  const navigate = useNavigate();
  const { data: referralCode, isLoading: isLoadingCode } = useMyReferralCode();
  const { data: stats, isLoading: isLoadingStats } = useReferralStats();
  const { data: commissions, isLoading: isLoadingCommissions } = useCommissions();
  const { data: totalCommission, isLoading: isLoadingTotal } = useTotalCommission();
  const updateCodeMutation = useUpdateReferralCode();
  const copyLinkMutation = useCopyReferralLink();
  const generateCodeMutation = useGenerateReferralCode();

  // Auto-generate code for users without one (only once)
  useEffect(() => {
    if (!isLoadingCode && !referralCode && !generateCodeMutation.isSuccess) {
      generateCodeMutation.mutate();
    }
  }, [isLoadingCode, referralCode]);

  const handleCopyCode = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      toast.success("Đã sao chép mã giới thiệu!");
    }
  };

  const handleCopyLink = () => {
    if (referralCode?.code) {
      copyLinkMutation.mutate(referralCode.code);
    }
  };

  const handleUpdateCode = async (code: string) => {
    await updateCodeMutation.mutateAsync(code);
  };

  const referralLink = referralCode?.code
    ? ReferralService.generateReferralLink(referralCode.code)
    : "";

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Chương trình giới thiệu</h1>
        <p className="text-muted-foreground mt-2">
          Giới thiệu bạn bè và nhận hoa hồng hấp dẫn
        </p>
      </div>

      {/* Policy Info Card */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Info className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold">Chính sách Cộng tác viên IQX</p>
                <p className="text-sm text-muted-foreground">
                  Tìm hiểu chi tiết về cấu trúc hoa hồng và quy định chương trình
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/partner-policy")}
              className="shrink-0"
            >
              Xem chi tiết
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <ReferralStatsCards
        totalCommission={totalCommission as any}
        stats={stats as any}
        isLoadingTotal={isLoadingTotal}
        isLoadingStats={isLoadingStats}
      />

      {/* Referral Code Card */}
      <ReferralCodeCard
        referralCode={referralCode as any}
        referralLink={referralLink}
        isLoading={isLoadingCode}
        isGenerating={generateCodeMutation.isPending}
        onGenerate={() => generateCodeMutation.mutate()}
        onUpdateCode={handleUpdateCode}
        onCopyCode={handleCopyCode}
        onCopyLink={handleCopyLink}
        isCopyingLink={copyLinkMutation.isPending}
      />

      {/* Commission History Table */}
      <CommissionHistoryTable
        commissions={commissions as any}
        isLoading={isLoadingCommissions}
      />

      {/* Downline Tree */}
      <DownlineTree />
    </div>
  );
}
