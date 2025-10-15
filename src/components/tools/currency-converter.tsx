import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Loader2, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, CURRENCY_GROUPS, getCurrencyByCode } from "@/types/currency";
import { useCurrencyConvert } from "@/hooks/use-currency";
import type { Currency } from "@/types/currency";

export function CurrencyConverter() {
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("VND");
  const [amount, setAmount] = useState<string>("1");
  const [debouncedAmount, setDebouncedAmount] = useState<number>(1);
  const [searchFrom, setSearchFrom] = useState<string>("");
  const [searchTo, setSearchTo] = useState<string>("");

  const fromCurrencyData = getCurrencyByCode(fromCurrency);
  const toCurrencyData = getCurrencyByCode(toCurrency);

  // Filter currencies based on search
  const filterCurrencies = (currencies: Currency[], searchTerm: string) => {
    if (!searchTerm) return currencies;
    const term = searchTerm.toLowerCase();
    return currencies.filter(
      c => c.code.toLowerCase().includes(term) || 
           c.name.toLowerCase().includes(term) ||
           c.symbol.toLowerCase().includes(term)
    );
  };

  // Debounce amount
  useEffect(() => {
    const timer = setTimeout(() => {
      const num = parseFloat(amount);
      if (!isNaN(num) && num > 0) {
        setDebouncedAmount(num);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [amount]);

  // Fetch conversion
  const { data, isLoading, refetch } = useCurrencyConvert(
    debouncedAmount,
    fromCurrency,
    toCurrency
  );

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const convertedAmount = data?.convertedAmount 
    ? data.convertedAmount.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
    : "0";

  const rate = data?.rate || 0;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-6 space-y-6">
        {/* From */}
        <div className="space-y-2">
          <Label className="text-sm">Từ</Label>
          <div className="grid grid-cols-[1fr_140px] gap-3">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 text-base"
              placeholder="1.00"
            />
            <Select value={fromCurrency} onValueChange={(val) => {
              setFromCurrency(val);
              setSearchFrom("");
            }}>
              <SelectTrigger className="h-12">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span>{fromCurrencyData?.flag}</span>
                    <span className="font-medium">{fromCurrency}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[320px]">
                {/* Search Input */}
                <div className="sticky top-0 bg-background p-2 border-b z-10">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm tiền tệ..."
                      value={searchFrom}
                      onChange={(e) => setSearchFrom(e.target.value)}
                      className="h-8 pl-8 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                {Object.entries(CURRENCY_GROUPS).map(([groupKey, currencies]) => {
                  const filtered = filterCurrencies(currencies, searchFrom);
                  if (filtered.length === 0) return null;

                  return (
                    <div key={groupKey}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase sticky top-[41px] bg-background">
                        {groupKey === "main" && "Chính"}
                        {groupKey === "asia" && "Châu Á"}
                        {groupKey === "crypto" && "Crypto"}
                        {groupKey === "others" && "Khác"}
                      </div>
                      {filtered.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center gap-2">
                            <span>{currency.flag}</span>
                            <span className="font-medium">{currency.code}</span>
                            <span className="text-xs text-muted-foreground">- {currency.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwap}
            className="rounded-full"
          >
            <ArrowLeftRight className="size-4" />
          </Button>
        </div>

        {/* To */}
        <div className="space-y-2">
          <Label className="text-sm">Sang</Label>
          <div className="grid grid-cols-[1fr_140px] gap-3">
            <div className="relative">
              <Input
                type="text"
                value={isLoading ? "" : convertedAmount}
                readOnly
                className="h-12 text-base bg-muted/50 font-semibold"
                placeholder="0.00"
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-5 animate-spin text-muted-foreground" />
              )}
            </div>
            <Select value={toCurrency} onValueChange={(val) => {
              setToCurrency(val);
              setSearchTo("");
            }}>
              <SelectTrigger className="h-12">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span>{toCurrencyData?.flag}</span>
                    <span className="font-medium">{toCurrency}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[320px]">
                {/* Search Input */}
                <div className="sticky top-0 bg-background p-2 border-b z-10">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm tiền tệ..."
                      value={searchTo}
                      onChange={(e) => setSearchTo(e.target.value)}
                      className="h-8 pl-8 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                {Object.entries(CURRENCY_GROUPS).map(([groupKey, currencies]) => {
                  const filtered = filterCurrencies(currencies, searchTo);
                  if (filtered.length === 0) return null;

                  return (
                    <div key={groupKey}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase sticky top-[41px] bg-background">
                        {groupKey === "main" && "Chính"}
                        {groupKey === "asia" && "Châu Á"}
                        {groupKey === "crypto" && "Crypto"}
                        {groupKey === "others" && "Khác"}
                      </div>
                      {filtered.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center gap-2">
                            <span>{currency.flag}</span>
                            <span className="font-medium">{currency.code}</span>
                            <span className="text-xs text-muted-foreground">- {currency.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rate Info */}
        {data && (
          <div className="p-4 rounded-lg bg-muted/50 border space-y-2">
            <div className="text-sm">
              <span className="font-semibold">1 {fromCurrency}</span>
              <span className="text-muted-foreground"> = </span>
              <span className="font-semibold">
                {rate.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {toCurrency}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">1 {toCurrency}</span>
              <span> = </span>
              <span className="font-medium">
                {(1 / rate).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {fromCurrency}
              </span>
            </div>
            <div className="pt-2 border-t flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {new Date(data.timestamp).toLocaleString('vi-VN')}
              </p>
              <button
                onClick={() => refetch()}
                className="text-xs text-primary hover:underline"
              >
                Làm mới
              </button>
            </div>
          </div>
        )}

        {/* Quick amounts */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Số tiền nhanh</Label>
          <div className="flex flex-wrap gap-2">
            {["1", "10", "100", "1000", "10000"].map((value) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                onClick={() => setAmount(value)}
                className="text-xs"
              >
                {parseInt(value).toLocaleString()}
              </Button>
            ))}
          </div>
        </div>

        {/* Popular pairs */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Cặp tiền phổ biến</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { from: "USD", to: "VND", label: "🇺🇸→🇻🇳" },
              { from: "EUR", to: "VND", label: "🇪🇺→🇻🇳" },
              { from: "GBP", to: "VND", label: "🇬🇧→🇻🇳" },
              { from: "JPY", to: "VND", label: "🇯🇵→🇻🇳" },
              { from: "BTC", to: "USD", label: "₿→🇺🇸" },
              { from: "ETH", to: "USD", label: "Ξ→🇺🇸" },
            ].map((pair) => (
              <Button
                key={`${pair.from}-${pair.to}`}
                variant="outline"
                size="sm"
                onClick={() => {
                  setFromCurrency(pair.from);
                  setToCurrency(pair.to);
                  setAmount("1");
                }}
                className="text-xs font-medium"
              >
                {pair.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
