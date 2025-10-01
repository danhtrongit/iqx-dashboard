// lib/xgboost/hooks.ts
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchXGBSheet } from "./service";
import { XGBSheetData, XGBPrediction } from "./types";

export interface UseXGBParams {
    spreadsheetId?: string;
    range?: string;
    apiKey?: string;
}

const DEFAULTS = {
    spreadsheetId: "1ekb2bYAQJZbtmqMUzsagb4uWBdtkAzTq3kuIMHQ22RI",
    range: "XGBoost",
    apiKey: "AIzaSyB9PPBCGbWFv1TxH_8s_AsiqiChLs9MqXU",
};

export function useXGBoost(params?: UseXGBParams) {
    const cfg = { ...DEFAULTS, ...(params || {}) };

    const query = useQuery<XGBSheetData, Error>({
        queryKey: ["xgboost-sheet", cfg.spreadsheetId, cfg.range],
        queryFn: ({ signal }) =>
            fetchXGBSheet({
                spreadsheetId: cfg.spreadsheetId,
                range: cfg.range,
                apiKey: cfg.apiKey,
                signal,
            }),
        staleTime: 60_000, // 1 phút
        refetchOnWindowFocus: false,
    });

    const { topList, byTicker } = useMemo(() => {
        const topList: XGBPrediction[] = [];
        const byTicker = new Map<string, XGBPrediction>();
        if (query.data?.predictions?.length) {
            for (const p of query.data.predictions) {
                topList.push(p);
                byTicker.set(p.ticker, p);
            }
        }
        return { topList, byTicker };
    }, [query.data]);

    return {
        ...query,
        topList,
        byTicker,
    };
}
