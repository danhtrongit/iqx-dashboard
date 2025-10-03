import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCommissionSettings } from "@/hooks/use-commission-admin";
import { useSubscriptionPackages } from "@/hooks/use-subscription";
import { formatCurrency } from "@/lib/utils";
import { Calculator, AlertCircle } from "lucide-react";
import type { CommissionSetting } from "@/types/commission";

export function CommissionCalculator() {
  const { data: settings } = useCommissionSettings();
  const { data: packages } = useSubscriptionPackages();

  const [selectedSetting, setSelectedSetting] = useState<CommissionSetting | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [sellerTier, setSellerTier] = useState<number>(1); // F1, F2, F3...
  const [quantity, setQuantity] = useState<number>(1);
  const [results, setResults] = useState<any[]>([]);

  // Auto-select active setting
  useEffect(() => {
    if (settings && !selectedSetting) {
      const active = settings.find((s) => s.isActive);
      if (active) {
        setSelectedSetting(active);
      }
    }
  }, [settings, selectedSetting]);

  const handleCalculate = () => {
    if (!selectedSetting || !selectedPackage) {
      return;
    }

    const pkg = packages?.find((p) => p.id === selectedPackage);
    if (!pkg) return;

    const price = Number(pkg.price);
    const totalRevenue = price * quantity;
    const calculatedResults: any[] = [];

    // Tính hoa hồng cho các cấp upline của người bán
    // Nếu người F3 bán → F2, F1, F0 nhận hoa hồng
    for (let i = 0; i < sellerTier && i < selectedSetting.tiersPct.length; i++) {
      const uplineTier = sellerTier - i - 1; // F2, F1, F0...
      const tierIndex = i; // Index trong mảng tiersPct
      const percentage = selectedSetting.tiersPct[tierIndex];
      const commissionPerSale = Math.floor(price * percentage);
      const totalCommission = commissionPerSale * quantity;

      calculatedResults.push({
        uplineTier: uplineTier === 0 ? "F0 (Root)" : `F${uplineTier}`,
        tierLabel: `Cấp ${i + 1} trên người bán`,
        percentage: percentage,
        commissionPerSale: commissionPerSale,
        quantity: quantity,
        totalCommission: totalCommission,
      });
    }

    setResults(calculatedResults);
  };

  const selectedPackageData = packages?.find((p) => p.id === selectedPackage);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="size-4" />
            <CardTitle className="text-sm">Máy tính hoa hồng</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Tính theo cấp người bán
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Form inputs - Compact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Chọn cấu hình */}
          <div className="space-y-1.5">
            <Label className="text-sm">Cấu hình</Label>
            <Select
              value={selectedSetting?.id || ""}
              onValueChange={(value) => {
                const setting = settings?.find((s) => s.id === value);
                setSelectedSetting(setting || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn cấu hình..." />
              </SelectTrigger>
              <SelectContent>
                {settings?.map((setting) => (
                  <SelectItem key={setting.id} value={setting.id}>
                    {setting.name} {setting.isActive && "(Đang dùng)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSetting && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {(selectedSetting.commissionTotalPct * 100).toFixed(1)}% • {selectedSetting.tiersPct.length} cấp
              </p>
            )}
          </div>

          {/* Chọn gói */}
          <div className="space-y-1.5">
            <Label className="text-sm">Gói</Label>
            <Select value={selectedPackage} onValueChange={setSelectedPackage}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn gói..." />
              </SelectTrigger>
              <SelectContent>
                {packages?.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.name} - {formatCurrency(Number(pkg.price))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPackageData && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {formatCurrency(Number(selectedPackageData.price))} / {selectedPackageData.durationDays}d
              </p>
            )}
          </div>

          {/* Cấp độ người bán */}
          <div className="space-y-1.5">
            <Label className="text-sm">Cấp người bán</Label>
            <Select
              value={sellerTier.toString()}
              onValueChange={(value) => setSellerTier(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tier) => (
                  <SelectItem key={tier} value={tier.toString()}>
                    F{tier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground mt-1">
              Người F{sellerTier} bán
            </p>
          </div>

          {/* Số lượng */}
          <div className="space-y-1.5">
            <Label className="text-sm">Số lượng</Label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              placeholder="1"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Số gói
            </p>
          </div>
        </div>

        {/* Calculate button */}
        <Button
          onClick={handleCalculate}
          disabled={!selectedSetting || !selectedPackage}
          size="sm"
        >
          <Calculator className="size-4 mr-2" />
          Tính toán
        </Button>

        {/* Results - Compact */}
        {results.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                <strong>F{sellerTier}</strong> bán <strong>{quantity}</strong> gói{" "}
                <strong>{selectedPackageData?.name}</strong>
              </span>
              <span className="font-semibold">
                {formatCurrency(Number(selectedPackageData?.price || 0) * quantity)}
              </span>
            </div>

            <div className="space-y-1.5">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-1.5 px-2.5 bg-muted/30 rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold w-14">{result.uplineTier}</span>
                    <span className="text-xs text-muted-foreground">
                      {(result.percentage * 100).toFixed(1)}% × {result.quantity}
                    </span>
                  </div>
                  <span className="font-bold text-green-600">
                    {formatCurrency(result.totalCommission)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2 px-2.5 bg-green-500/10 rounded border border-green-500/20">
                <span className="font-semibold text-sm">Tổng HH</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(
                    results.reduce((sum, r) => sum + r.totalCommission, 0)
                  )}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground bg-muted/50 p-2 rounded">
              💡 {formatCurrency(results.reduce((sum, r) => sum + r.totalCommission, 0))}{" "}
              / {formatCurrency(Number(selectedPackageData?.price || 0) * quantity)} ={" "}
              {((results.reduce((sum, r) => sum + r.totalCommission, 0) /
                (Number(selectedPackageData?.price || 0) * quantity)) * 100).toFixed(1)}%
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

