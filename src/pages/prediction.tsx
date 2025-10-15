import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import XGBoostDashboard from "@/components/xgboost";
import PriceActionDashboard from "@/components/price-action";
import { Brain, BarChart3 } from "lucide-react";
import Title from "@/components/title";

export default function PredictionPage() {
  const [activeTab, setActiveTab] = useState<"xgboost" | "price-action">("xgboost");

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Page Header */}
      <div className="space-y-2">
        <Title>Dự Báo & Phân Tích</Title>
        <p className="text-muted-foreground text-sm">
          Dự báo giá cổ phiếu với XGBoost và phân tích Price Action
        </p>
      </div>

      {/* Tabs Container */}
      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="xgboost" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                XGBoost
              </TabsTrigger>
              <TabsTrigger value="price-action" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Price Action
              </TabsTrigger>
            </TabsList>

            <TabsContent value="xgboost" className="mt-6">
              <XGBoostDashboard />
            </TabsContent>

            <TabsContent value="price-action" className="mt-6">
              <PriceActionDashboard />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

