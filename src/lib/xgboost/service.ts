// lib/xgboost/service.ts
import { XGBFetchOptions } from "./types";
import { parseXGB } from "./parser";

export async function fetchXGBSheet(opts: XGBFetchOptions) {
    const { spreadsheetId, range, apiKey, signal } = opts;
    const url = new URL(
        `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`
    );
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), { signal, cache: "no-store" });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Sheets API error ${res.status}: ${text}`);
    }
    const json = await res.json();
    const values: string[][] = json?.values || [];
    return parseXGB(values);
}
