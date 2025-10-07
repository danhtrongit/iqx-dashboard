import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const fibonacciLevels = [
  { label: "0%", value: 0, color: "bg-red-500/20 border-red-500/30" },
  { label: "23.6%", value: 0.236, color: "bg-orange-500/20 border-orange-500/30" },
  { label: "38.2%", value: 0.382, color: "bg-yellow-500/20 border-yellow-500/30" },
  { label: "50%", value: 0.5, color: "bg-green-500/20 border-green-500/30" },
  { label: "61.8%", value: 0.618, color: "bg-emerald-500/20 border-emerald-500/30" },
  { label: "76.4%", value: 0.764, color: "bg-cyan-500/20 border-cyan-500/30" },
  { label: "100%", value: 1.0, color: "bg-blue-500/20 border-blue-500/30" },
  { label: "138.2%", value: 1.382, color: "bg-indigo-500/20 border-indigo-500/30" },
  { label: "161.8%", value: 1.618, color: "bg-purple-500/20 border-purple-500/30" },
  { label: "200%", value: 2.0, color: "bg-violet-500/20 border-violet-500/30" },
  { label: "261.8%", value: 2.618, color: "bg-fuchsia-500/20 border-fuchsia-500/30" },
];

interface FibResult {
  level: string;
  retracement: number;
  extension: number;
  color: string;
}

export function FibonacciCalculator() {
  const [high, setHigh] = useState<string>("");
  const [low, setLow] = useState<string>("");
  const [custom, setCustom] = useState<string>("");
  const [results, setResults] = useState<FibResult[]>([]);
  const [activeTab, setActiveTab] = useState<"uptrend" | "downtrend">("uptrend");

  const calculateUptrend = () => {
    const highVal = parseFloat(high);
    const lowVal = parseFloat(low);
    
    if (isNaN(highVal) || isNaN(lowVal)) return;

    const diff = highVal - lowVal;
    const calculated = fibonacciLevels.map(level => ({
      level: level.label,
      retracement: highVal - (diff * level.value),
      extension: highVal + (diff * level.value),
      color: level.color,
    }));

    setResults(calculated);
  };

  const calculateDowntrend = () => {
    const highVal = parseFloat(high);
    const lowVal = parseFloat(low);
    
    if (isNaN(highVal) || isNaN(lowVal)) return;

    const diff = highVal - lowVal;
    const calculated = fibonacciLevels.map(level => ({
      level: level.label,
      retracement: lowVal + (diff * level.value),
      extension: lowVal - (diff * level.value),
      color: level.color,
    }));

    setResults(calculated);
  };

  const customRetracementValue = () => {
    const highVal = parseFloat(high);
    const lowVal = parseFloat(low);
    const customVal = parseFloat(custom);
    
    if (isNaN(highVal) || isNaN(lowVal) || isNaN(customVal)) return null;

    const diff = highVal - lowVal;
    if (activeTab === "uptrend") {
      const retracementPercent = ((highVal - customVal) / diff) * 100;
      return retracementPercent.toFixed(2);
    } else {
      const retracementPercent = ((customVal - lowVal) / diff) * 100;
      return retracementPercent.toFixed(2);
    }
  };

  return (
    <Card className="max-w-6xl mx-auto">
      <CardContent className="p-8">
        <Tabs 
          defaultValue="uptrend" 
          className="w-full" 
          onValueChange={(v) => setActiveTab(v as "uptrend" | "downtrend")}
        >
          <TabsList className="grid w-full max-w-sm mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="uptrend" className="gap-2">
              <TrendingUp className="size-4" />
              Xu hướng tăng
            </TabsTrigger>
            <TabsTrigger value="downtrend" className="gap-2">
              <TrendingDown className="size-4" />
              Xu hướng giảm
            </TabsTrigger>
          </TabsList>

          {/* Uptrend Content */}
          <TabsContent value="uptrend" className="mt-0">
            <div className="grid lg:grid-cols-[320px_1fr] gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                <div className="space-y-4">
                  {/* Point A */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-sm font-bold text-amber-700 dark:text-amber-400">
                        A
                      </div>
                      <Label className="text-sm font-medium">Điểm thấp</Label>
                    </div>
                    <Input
                      type="number"
                      value={low}
                      onChange={(e) => setLow(e.target.value)}
                      placeholder="32000"
                      className="h-11 border-amber-200 focus:border-amber-500 dark:border-amber-900"
                    />
                  </div>

                  {/* Point B */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-400">
                        B
                      </div>
                      <Label className="text-sm font-medium">Điểm cao</Label>
                    </div>
                    <Input
                      type="number"
                      value={high}
                      onChange={(e) => setHigh(e.target.value)}
                      placeholder="45000"
                      className="h-11 border-blue-200 focus:border-blue-500 dark:border-blue-900"
                    />
                  </div>

                  {/* Point C */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center text-sm font-bold text-purple-700 dark:text-purple-400">
                        C
                      </div>
                      <Label className="text-sm font-medium">Giá tuỳ chỉnh (tùy chọn)</Label>
                    </div>
                    <Input
                      type="number"
                      value={custom}
                      onChange={(e) => setCustom(e.target.value)}
                      placeholder="38000"
                      className="h-11 border-purple-200 focus:border-purple-500 dark:border-purple-900"
                    />
                    {customRetracementValue() && (
                      <div className="text-xs bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 px-3 py-2 rounded border border-purple-200 dark:border-purple-900">
                        → {customRetracementValue()}% retracement
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={calculateUptrend} 
                  className="w-full h-11 bg-green-600 hover:bg-green-700"
                >
                  <TrendingUp className="size-4 mr-2" />
                  Tính toán
                </Button>

                {/* Visual Chart */}
                {results.length > 0 && (
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <div className="text-xs font-semibold text-muted-foreground mb-3 text-center">
                      SƠ ĐỒ XU HƯỚNG
                    </div>
                    <svg viewBox="0 0 200 140" className="w-full">
                      {/* Background grid */}
                      <defs>
                        <pattern id="grid-uptrend" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-10"/>
                        </pattern>
                      </defs>
                      <rect width="200" height="140" fill="url(#grid-uptrend)" />
                      
                      {/* Trend line */}
                      <path
                        d="M 20 110 L 70 70 L 120 35"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-green-500"
                        strokeLinecap="round"
                      />
                      
                      {/* Retracement line */}
                      <path
                        d="M 120 35 L 170 65"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                        className="text-purple-500"
                      />
                      
                      {/* Point A */}
                      <circle cx="70" cy="70" r="6" className="fill-amber-500" />
                      <text x="70" y="90" textAnchor="middle" className="text-xs font-bold fill-current">A</text>
                      <line x1="10" y1="70" x2="190" y2="70" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" className="opacity-20"/>
                      
                      {/* Point B */}
                      <circle cx="120" cy="35" r="6" className="fill-blue-500" />
                      <text x="120" y="25" textAnchor="middle" className="text-xs font-bold fill-current">B</text>
                      <line x1="10" y1="35" x2="190" y2="35" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" className="opacity-20"/>
                      
                      {/* Point C */}
                      <circle cx="170" cy="65" r="6" className="fill-purple-500" />
                      <text x="170" y="80" textAnchor="middle" className="text-xs font-bold fill-current">C</text>
                    </svg>
                  </div>
                )}
              </div>

              {/* Results Section - 2 Columns Side by Side */}
              {results.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Retracement Column */}
                  <div>
                    <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Hồi quy
                    </h3>
                    <div className="space-y-1.5">
                      {results.map((result, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center justify-between py-2.5 px-3 rounded-md border transition-all hover:scale-[1.01]",
                            result.color
                          )}
                        >
                          <span className="text-sm font-medium">{result.level}</span>
                          <span className="text-sm font-mono font-semibold">{result.retracement.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Extension Column */}
                  <div>
                    <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      Mở rộng
                    </h3>
                    <div className="space-y-1.5">
                      {results.map((result, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center justify-between py-2.5 px-3 rounded-md border transition-all hover:scale-[1.01]",
                            result.color
                          )}
                        >
                          <span className="text-sm font-medium">{result.level}</span>
                          <span className="text-sm font-mono font-semibold">{result.extension.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Downtrend Content */}
          <TabsContent value="downtrend" className="mt-0">
            <div className="grid lg:grid-cols-[320px_1fr] gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                <div className="space-y-4">
                  {/* Point A */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-sm font-bold text-amber-700 dark:text-amber-400">
                        A
                      </div>
                      <Label className="text-sm font-medium">Điểm cao</Label>
                    </div>
                    <Input
                      type="number"
                      value={high}
                      onChange={(e) => setHigh(e.target.value)}
                      placeholder="45000"
                      className="h-11 border-amber-200 focus:border-amber-500 dark:border-amber-900"
                    />
                  </div>

                  {/* Point B */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-400">
                        B
                      </div>
                      <Label className="text-sm font-medium">Điểm thấp</Label>
                    </div>
                    <Input
                      type="number"
                      value={low}
                      onChange={(e) => setLow(e.target.value)}
                      placeholder="32000"
                      className="h-11 border-blue-200 focus:border-blue-500 dark:border-blue-900"
                    />
                  </div>

                  {/* Point C */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center text-sm font-bold text-purple-700 dark:text-purple-400">
                        C
                      </div>
                      <Label className="text-sm font-medium">Giá tuỳ chỉnh (tùy chọn)</Label>
                    </div>
                    <Input
                      type="number"
                      value={custom}
                      onChange={(e) => setCustom(e.target.value)}
                      placeholder="38000"
                      className="h-11 border-purple-200 focus:border-purple-500 dark:border-purple-900"
                    />
                    {customRetracementValue() && (
                      <div className="text-xs bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 px-3 py-2 rounded border border-purple-200 dark:border-purple-900">
                        → {customRetracementValue()}% retracement
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={calculateDowntrend} 
                  className="w-full h-11 bg-red-600 hover:bg-red-700"
                >
                  <TrendingDown className="size-4 mr-2" />
                  Tính toán
                </Button>

                {/* Visual Chart */}
                {results.length > 0 && (
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <div className="text-xs font-semibold text-muted-foreground mb-3 text-center">
                      SƠ ĐỒ XU HƯỚNG
                    </div>
                    <svg viewBox="0 0 200 140" className="w-full">
                      {/* Background grid */}
                      <defs>
                        <pattern id="grid-downtrend" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-10"/>
                        </pattern>
                      </defs>
                      <rect width="200" height="140" fill="url(#grid-downtrend)" />
                      
                      {/* Trend line */}
                      <path
                        d="M 20 30 L 70 70 L 120 105"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-red-500"
                        strokeLinecap="round"
                      />
                      
                      {/* Retracement line */}
                      <path
                        d="M 120 105 L 170 75"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                        className="text-purple-500"
                      />
                      
                      {/* Point A */}
                      <circle cx="70" cy="70" r="6" className="fill-amber-500" />
                      <text x="70" y="60" textAnchor="middle" className="text-xs font-bold fill-current">A</text>
                      <line x1="10" y1="70" x2="190" y2="70" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" className="opacity-20"/>
                      
                      {/* Point B */}
                      <circle cx="120" cy="105" r="6" className="fill-blue-500" />
                      <text x="120" y="125" textAnchor="middle" className="text-xs font-bold fill-current">B</text>
                      <line x1="10" y1="105" x2="190" y2="105" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" className="opacity-20"/>
                      
                      {/* Point C */}
                      <circle cx="170" cy="75" r="6" className="fill-purple-500" />
                      <text x="170" y="65" textAnchor="middle" className="text-xs font-bold fill-current">C</text>
                    </svg>
                  </div>
                )}
              </div>

              {/* Results Section - 2 Columns Side by Side */}
              {results.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Retracement Column */}
                  <div>
                    <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Hồi quy
                    </h3>
                    <div className="space-y-1.5">
                      {results.map((result, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center justify-between py-2.5 px-3 rounded-md border transition-all hover:scale-[1.01]",
                            result.color
                          )}
                        >
                          <span className="text-sm font-medium">{result.level}</span>
                          <span className="text-sm font-mono font-semibold">{result.retracement.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Extension Column */}
                  <div>
                    <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      Mở rộng
                    </h3>
                    <div className="space-y-1.5">
                      {results.map((result, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center justify-between py-2.5 px-3 rounded-md border transition-all hover:scale-[1.01]",
                            result.color
                          )}
                        >
                          <span className="text-sm font-medium">{result.level}</span>
                          <span className="text-sm font-mono font-semibold">{result.extension.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
