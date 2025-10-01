// lib/xgboost/parser.ts
import { XGBSheetData, XGBPrediction, FeatureRow } from "./types";
import { ddmmyyyyToISO, parseDirection, parseLocaleNumber } from "./utils";

/**
 * Google Sheets trả:
 * {
 *  range: "XGBOOST!A1:Z1000",
 *  values: [ [date, ticker, p_win, "", ticker, date, p_win, feature, feature_value, shap_value_logit, direction], ...]
 * }
 *
 * Bên trái (A-C) thường là Top tickers summary,
 * Bên phải (E-K) là các dòng feature cho từng ticker (ticker, date, p_win lặp lại).
 */
export function parseXGB(values: string[][]): XGBSheetData {
    const header = values?.[0] || [];
    // Kỳ vọng cột bên phải:
    // [4]: ticker, [5]: date, [6]: p_win, [7]: feature, [8]: feature_value, [9]: shap_value_logit, [10]: direction
    const R_TICKER = 4;
    const R_DATE = 5;
    const R_PWIN = 6;
    const R_FEAT = 7;
    const R_FVAL = 8;
    const R_SHAP = 9;
    const R_DIR = 10;

    // Gom theo key (ticker|dateISO)
    const map = new Map<string, XGBPrediction>();

    for (let i = 1; i < values.length; i++) {
        const row = values[i] || [];
        const ticker = (row[R_TICKER] || "").trim();
        const dateStr = (row[R_DATE] || "").trim();
        const pWinStr = (row[R_PWIN] || "").trim();
        const feature = (row[R_FEAT] || "").trim();
        const fValStr = (row[R_FVAL] || "").trim();
        const shapStr = (row[R_SHAP] || "").trim();
        const dirStr = (row[R_DIR] || "").trim();

        // Chỉ nhận những dòng có ticker + date ở khối phải
        if (!ticker || !dateStr) continue;

        const dateISO = ddmmyyyyToISO(dateStr) || dateStr;
        const pWin = parseLocaleNumber(pWinStr) ?? 0;

        const key = `${ticker}|${dateISO}`;
        if (!map.has(key)) {
            map.set(key, {
                dateISO,
                dateLabel: dateStr,
                ticker,
                pWin,
                features: [],
            });
        }

        // Đẩy feature nếu có
        if (feature) {
            const f: FeatureRow = {
                feature,
                featureValue: parseLocaleNumber(fValStr),
                shapValueLogit: parseLocaleNumber(shapStr),
                direction: (parseDirection(dirStr) as any) || ((parseLocaleNumber(shapStr) ?? 0) >= 0 ? "up" : "down"),
            };
            map.get(key)!.features.push(f);
        }
    }

    // Sau cùng: sort features theo |shap| giảm dần để hiển thị
    const predictions = Array.from(map.values()).map((p) => {
        const feats = [...p.features].sort((a, b) => Math.abs(b.shapValueLogit ?? 0) - Math.abs(a.shapValueLogit ?? 0));
        return { ...p, features: feats };
    });

    // Có thể sort tickers theo pWin giảm dần
    predictions.sort((a, b) => (b.pWin ?? 0) - (a.pWin ?? 0));

    return {
        updatedAt: new Date().toISOString(),
        predictions,
    };
}
