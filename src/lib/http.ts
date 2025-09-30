// src/lib/http.ts
import axios from "axios";

const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://proxy.iqx.vn/proxy/ai/api/v2";

export const http = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 10000,
});

export function createHttp(options?: { baseURL?: string; timeout?: number; headers?: Record<string, string> }) {
  return axios.create({
    baseURL: options?.baseURL ?? DEFAULT_BASE_URL,
    timeout: options?.timeout ?? 10000,
    headers: options?.headers,
  });
}
