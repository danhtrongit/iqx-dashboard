import { createHttp } from "@/lib/http";
import { tradingview } from "@/lib/schemas";

export type VNIndexTimeframe = "5" | "60" | "1D" | "1W" | "1M";

export interface VNIndexTechnicalData {
  "Recommend.All"?: number;
  "Recommend.MA"?: number;
  "Recommend.Other"?: number;
  RSI?: number;
  "RSI[1]"?: number;
  "Stoch.K"?: number;
  "Stoch.D"?: number;
  CCI20?: number;
  ADX?: number;
  "ADX+DI"?: number;
  "ADX-DI"?: number;
  AO?: number;
  Mom?: number;
  "MACD.macd"?: number;
  "MACD.signal"?: number;
  "Stoch.RSI.K"?: number;
  "W.R"?: number;
  BBPower?: number;
  UO?: number;
  EMA10?: number;
  SMA10?: number;
  EMA20?: number;
  SMA20?: number;
  EMA30?: number;
  SMA30?: number;
  EMA50?: number;
  SMA50?: number;
  EMA100?: number;
  SMA100?: number;
  EMA200?: number;
  SMA200?: number;
  "Ichimoku.BLine"?: number;
  VWMA?: number;
  HullMA9?: number;
  close?: number;
  [key: string]: number | undefined;
}

const TIMEFRAME_PARAMS: Record<VNIndexTimeframe, string> = {
  "5": "5",
  "60": "60",
  "1D": "",
  "1W": "1W",
  "1M": "1M",
};

const FIELDS = [
  "Recommend.Other",
  "Recommend.All",
  "Recommend.MA",
  "RSI",
  "RSI[1]",
  "Stoch.K",
  "Stoch.D",
  "Stoch.K[1]",
  "Stoch.D[1]",
  "CCI20",
  "CCI20[1]",
  "ADX",
  "ADX+DI",
  "ADX-DI",
  "ADX+DI[1]",
  "ADX-DI[1]",
  "AO",
  "AO[1]",
  "AO[2]",
  "Mom",
  "Mom[1]",
  "MACD.macd",
  "MACD.signal",
  "Rec.Stoch.RSI",
  "Stoch.RSI.K",
  "Rec.WR",
  "W.R",
  "Rec.BBPower",
  "BBPower",
  "Rec.UO",
  "UO",
  "EMA10",
  "close",
  "SMA10",
  "EMA20",
  "SMA20",
  "EMA30",
  "SMA30",
  "EMA50",
  "SMA50",
  "EMA100",
  "SMA100",
  "EMA200",
  "SMA200",
  "Rec.Ichimoku",
  "Ichimoku.BLine",
  "Rec.VWMA",
  "VWMA",
  "Rec.HullMA9",
  "HullMA9",
];

const tvHttp = createHttp({ baseURL: "https://scanner.tradingview.com" });

export async function fetchVNIndexTechnical(
  timeframe: VNIndexTimeframe
): Promise<VNIndexTechnicalData> {
  const tfParam = TIMEFRAME_PARAMS[timeframe];
  const fieldsWithTf = FIELDS.map((f) => (tfParam ? `${f}|${tfParam}` : f)).join(
    "%2C"
  );

  const url = `/symbol?symbol=HOSE%3AVNINDEX&fields=${fieldsWithTf}&no_404=true&label-product=popup-technicals`;

  const { data } = await tvHttp.get(url);
  // Permissive parse: accept unknowns but ensure shape is object
  const parsed = tradingview.TradingViewIndicatorsSchema.partial().passthrough().parse(data);
  return parsed as VNIndexTechnicalData;
}

export function getRecommendation(value: number | undefined): string {
  if (value === undefined || value === null) return "NEUTRAL";
  if (value >= 0.5) return "STRONG_BUY";
  if (value >= 0.1) return "BUY";
  if (value >= -0.1) return "NEUTRAL";
  if (value >= -0.5) return "SELL";
  return "STRONG_SELL";
}

export function getRecommendationText(rec: string): string {
  switch (rec) {
    case "STRONG_BUY":
      return "Mua mạnh";
    case "BUY":
      return "Mua";
    case "NEUTRAL":
      return "Trung lập";
    case "SELL":
      return "Bán";
    case "STRONG_SELL":
      return "Bán mạnh";
    default:
      return "Trung lập";
  }
}

export function getRecommendationCounts(data: VNIndexTechnicalData): {
  buy: number;
  neutral: number;
  sell: number;
} {
  const counts = { buy: 0, neutral: 0, sell: 0 };
  const oscillatorFields = [
    "RSI",
    "Stoch.K",
    "CCI20",
    "ADX",
    "AO",
    "Mom",
    "MACD.macd",
    "W.R",
    "BBPower",
    "UO",
  ];
  oscillatorFields.forEach((field) => {
    const value = data[field];
    if (value !== undefined) {
      const rec = getOscillatorSignal(field, value as number);
      if (rec === "BUY") counts.buy++;
      else if (rec === "SELL") counts.sell++;
      else counts.neutral++;
    }
  });
  return counts;
}

export function getMARecommendationCounts(data: VNIndexTechnicalData): {
  buy: number;
  neutral: number;
  sell: number;
} {
  const counts = { buy: 0, neutral: 0, sell: 0 };
  const closePrice = data.close || 0;
  const maFields = [
    "EMA10",
    "SMA10",
    "EMA20",
    "SMA20",
    "EMA30",
    "SMA30",
    "EMA50",
    "SMA50",
    "EMA100",
    "SMA100",
    "EMA200",
    "SMA200",
  ];
  maFields.forEach((field) => {
    const value = data[field];
    if (value !== undefined && closePrice > 0) {
      if (closePrice > (value as number)) counts.buy++;
      else if (closePrice < (value as number)) counts.sell++;
      else counts.neutral++;
    }
  });
  return counts;
}

function getOscillatorSignal(
  indicator: string,
  value: number
): "BUY" | "SELL" | "NEUTRAL" {
  switch (indicator) {
    case "RSI":
      if (value > 70) return "SELL";
      if (value < 30) return "BUY";
      return "NEUTRAL";
    case "Stoch.K":
      if (value > 80) return "SELL";
      if (value < 20) return "BUY";
      return "NEUTRAL";
    case "CCI20":
      if (value > 100) return "SELL";
      if (value < -100) return "BUY";
      return "NEUTRAL";
    case "ADX":
      if (value > 50) return "BUY";
      if (value < 20) return "NEUTRAL";
      return "NEUTRAL";
    case "AO":
    case "Mom":
    case "MACD.macd":
      if (value > 0) return "BUY";
      if (value < 0) return "SELL";
      return "NEUTRAL";
    case "W.R":
      if (value > -20) return "SELL";
      if (value < -80) return "BUY";
      return "NEUTRAL";
    case "BBPower":
      if (value > 0) return "BUY";
      if (value < 0) return "SELL";
      return "NEUTRAL";
    case "UO":
      if (value > 70) return "SELL";
      if (value < 30) return "BUY";
      return "NEUTRAL";
    default:
      return "NEUTRAL";
  }
}


