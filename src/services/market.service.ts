// src/services/news.service.ts
import { createHttp } from "@/lib/http";
import { market } from "@/lib/schemas";

// https://proxy.iqx.vn/proxy/trading/api/chart/OHLCChart/gap-chart

const ProxyTradingApi = createHttp({
  baseURL: "https://proxy.iqx.vn/proxy/trading/api",
});

const ProxyIqApi = createHttp({
  baseURL: "https://proxy.iqx.vn/proxy/iq/api",
});


function computeEndOfTodayTimestampInVnSeconds(): number {
  const nowUtcMs = Date.now();
  const vnOffsetMs = 7 * 60 * 60 * 1000; // UTC+7
  const nowVnMs = nowUtcMs + vnOffsetMs;
  const vnDate = new Date(nowVnMs);
  // Build 23:59:59.999 for the VN local date (using UTC setters/getters on the shifted date)
  const endOfDayVnAsUtc = Date.UTC(
    vnDate.getUTCFullYear(),
    vnDate.getUTCMonth(),
    vnDate.getUTCDate(),
    23,
    59,
    59,
    999
  );
  const endOfDayUtcMs = endOfDayVnAsUtc - vnOffsetMs;
  return Math.floor(endOfDayUtcMs / 1000);
}

export async function getMarketOHLC(params?: {
  symbol?: string;
  timeFrame?: string;
  countBack?: number;
}) {
  const { data } = await ProxyTradingApi.post<market.MarketOHLCResponse>(
    "/chart/OHLCChart/gap-chart",
    {
      symbols: [params?.symbol ?? ""],
      timeFrame: params?.timeFrame ?? "ONE_DAY",
      to: computeEndOfTodayTimestampInVnSeconds(),
      countBack: params?.countBack ?? 100,
    }
  );
  return market.MarketOHLCResponseSchema.parse(data);
}

export async function getOHLCChartGap(params: {
  timeFrame: string;
  symbols: string[];
  from: number;
  to: number;
}) {
  const { data } = await ProxyTradingApi.post(
    "/chart/OHLCChart/gap",
    {
      timeFrame: params.timeFrame,
      symbols: params.symbols,
      from: params.from,
      to: params.to,
    }
  );
  return data;
}

export async function getIndexImpactChart(params: {
  group: string;
  timeFrame: string;
  exchange: string;
}) {
  const { data } = await ProxyTradingApi.post<market.IndexImpactResponse>(
    "/market-watch/v2/IndexImpactChart/getData",
    {
      group: params.group,
      timeFrame: params.timeFrame,
      exchange: params.exchange,
    }
  );
  return market.IndexImpactResponseSchema.parse(data);
}

export async function getTopProprietary(params: {
  timeFrame: string; // e.g., "ONE_DAY"
  exchange: string; // e.g., "ALL" | "HOSE" | "HNX" | "UPCOM"
}) {
  const { data } = await ProxyIqApi.get<{
    serverDateTime: string;
    status: number;
    code: number;
    msg: string;
    exception: unknown;
    successful: boolean;
    data: market.TopProprietaryResponse;
  }>("/iq-insight-service/v1/market-watch/top-proprietary", {
    params: {
      timeFrame: params.timeFrame,
      exchange: params.exchange,
    },
  });
  return market.TopProprietaryResponseSchema.parse(data.data);
}

export async function getForeignNetValueTop(params: {
  group: string; // e.g., "ALL" | "VN30" | sector groups
  timeFrame: string; // e.g., "ONE_WEEK"
  from: number; // unix seconds
  to: number; // unix seconds
}) {
  const { data } = await ProxyTradingApi.post<market.ForeignNetTopResponse>(
    "/market-watch/v3/ForeignNetValue/top",
    {
      group: params.group,
      timeFrame: params.timeFrame,
      from: params.from,
      to: params.to,
    }
  );
  return market.ForeignNetTopResponseSchema.parse(data);
}

export async function getAllocatedValue(params: {
  group: "ALL" | "HOSE" | "HNX" | "UPCOM";
  timeFrame: "ONE_DAY" | "ONE_WEEK" | "ONE_MONTH" | "YTD" | "ONE_YEAR";
}) {
  const { data } = await ProxyTradingApi.post<unknown>(
    "/market-watch/AllocatedValue/getAllocatedValue",
    {
      group: params.group,
      timeFrame: params.timeFrame,
    }
  );
  const normalized = Array.isArray(data) ? data : [data];
  return market.AllocatedValueResponseSchema.parse(normalized);
}

export async function getAllocatedICB(params: {
  group: "ALL" | "HOSE" | "HNX" | "UPCOM";
  timeFrame: "ONE_DAY" | "ONE_WEEK" | "ONE_MONTH" | "YTD" | "ONE_YEAR";
}) {
  const { data } = await ProxyTradingApi.post<unknown>(
    "/market-watch/AllocatedICB/getAllocated",
    {
      group: params.group,
      timeFrame: params.timeFrame,
    }
  );
  const normalized = Array.isArray(data) ? data : [data];
  return market.AllocatedICBResponseSchema.parse(normalized);
}

// Market Behavior - Google Sheets
const GOOGLE_SHEETS_BEHAVIOR_URL =
  "https://sheets.googleapis.com/v4/spreadsheets/1ekb2bYAQJZbtmqMUzsagb4uWBdtkAzTq3kuIMHQ22RI/values/HanhVi?key=AIzaSyB9PPBCGbWFv1TxH_8s_AsiqiChLs9MqXU";

function parseLocaleNumber(numStr: string): number {
  // Convert "0,43" → 0.43 and "1.234,56" → 1234.56
  const normalized = numStr.replace(/\./g, "").replace(/,/g, ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export async function getMarketBehavior() {
  const res = await fetch(GOOGLE_SHEETS_BEHAVIOR_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch Market Behavior: ${res.status}`);
  }
  const json = (await res.json()) as unknown;
  const raw = market.MarketBehaviorRawResponseSchema.parse(json);

  const [header, ...rows] = raw.values;
  // Expecting: ["date","strong_sell","sell","buy","strong_buy","VNINDEX"]
  const indices = {
    date: header.findIndex((h) => h.toLowerCase() === "date"),
    strong_sell: header.findIndex((h) => h.toLowerCase() === "strong_sell"),
    sell: header.findIndex((h) => h.toLowerCase() === "sell"),
    buy: header.findIndex((h) => h.toLowerCase() === "buy"),
    strong_buy: header.findIndex((h) => h.toLowerCase() === "strong_buy"),
    vnindex: header.findIndex((h) => h.toLowerCase() === "vnindex"),
  } as const;

  const mapped = rows
    .filter((r) => r.length >= 6)
    .map((r) => ({
      date: r[indices.date],
      strong_sell: parseLocaleNumber(r[indices.strong_sell] ?? "0"),
      sell: parseLocaleNumber(r[indices.sell] ?? "0"),
      buy: parseLocaleNumber(r[indices.buy] ?? "0"),
      strong_buy: parseLocaleNumber(r[indices.strong_buy] ?? "0"),
      vnindex: parseLocaleNumber(r[indices.vnindex] ?? "0"),
    }))
    .filter(
      (x) =>
        Number.isFinite(x.strong_sell) &&
        Number.isFinite(x.sell) &&
        Number.isFinite(x.buy) &&
        Number.isFinite(x.strong_buy) &&
        Number.isFinite(x.vnindex)
    );

  return market.MarketBehaviorResponseSchema.parse(mapped);
}

export async function getCompanyTechnicalAnalysis(params: {
  symbol: string;
  timeFrame: "ONE_HOUR" | "FOUR_HOUR" | "ONE_DAY" | "ONE_WEEK" | "ONE_MONTH";
}) {
  const { data } = await ProxyIqApi.get<market.TechnicalAnalysisResponse>(
    `/iq-insight-service/v1/company/${params.symbol}/technical/${params.timeFrame}`
  );
  return market.TechnicalAnalysisResponseSchema.parse(data);
}
