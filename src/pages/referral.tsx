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

export default function ReferralPage() {
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
      toast.success("Đã sao chép link giới thiệu!");
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
