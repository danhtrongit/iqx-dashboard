// Hướng tác động
export type FeatureDirection = "up" | "down";

// Một feature với giá trị thực tế và SHAP (logit)
export interface FeatureRow {
    feature: string;
    featureValue: number | null;
    shapValueLogit: number | null;
    direction: FeatureDirection;
}

// Dự đoán cho 1 mã - 1 ngày
export interface XGBPrediction {
    dateISO: string;     // 2025-09-30 (ISO)
    dateLabel: string;   // 30/09/2025 (như input)
    ticker: string;      // "FPT"
    pWin: number;        // 0.9996
    features: FeatureRow[];
}

// Gói dữ liệu đã parse
export interface XGBSheetData {
    updatedAt: string;        // new Date().toISOString()
    predictions: XGBPrediction[];
}

// Options cho service
export interface XGBFetchOptions {
    spreadsheetId: string; // "1ekb2bYAQJZbtmqMUzsagb4uWBdtkAzTq3kuIMHQ22RI"
    range: string;         // "XGBoost"
    apiKey: string;        // "AIzaSy..."
    signal?: AbortSignal;
}
