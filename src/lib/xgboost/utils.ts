// lib/xgboost/utils.ts

// Chuyển "31/12/2025" -> "2025-12-31"
export function ddmmyyyyToISO(ddmmyyyy: string): string | null {
    if (!ddmmyyyy || !/^\d{2}\/\d{2}\/\d{4}$/.test(ddmmyyyy.trim())) return null;
    const [d, m, y] = ddmmyyyy.split("/").map(Number);
    if (!d || !m || !y) return null;
    const iso = new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);
    return iso;
}

// Parse số kiểu "0,9996" hoặc "-347,985" -> number
export function parseLocaleNumber(s?: string | null): number | null {
    if (!s) return null;
    const t = s.replace(/\./g, "").replace(",", ".");
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
}

// Lấy mũi tên lên/xuống từ ký tự "↑" | "↓" | fallback
export function parseDirection(s?: string | null) {
    const ch = (s || "").trim();
    if (ch === "↑") return "up";
    if (ch === "↓") return "down";
    // fallback: nếu không có ký hiệu, infer từ shap > 0
    return undefined as unknown as "up" | "down";
}
