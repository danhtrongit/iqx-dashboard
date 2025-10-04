import { z } from "zod";

// Request schema
export const GetTickerDetailRequestSchema = z.object({
  day: z.number().int().min(0).default(0),
  ticker: z.string().min(1).max(10),
});

export type GetTickerDetailRequest = z.infer<typeof GetTickerDetailRequestSchema>;

// Ticker data nested object (parsed from tickerData JSON string)
export const TickerDataSchema = z.object({
  ticker: z.string(),
  company: z.string().optional(),
  floor: z.string().optional(), // "HOSE", "HNX", "UPCOM"
  industry: z.string().optional(),
  slcp: z.number().optional(), // Số lượng cổ phiếu
  sohuungoai: z.number().optional(), // Sở hữu ngoại
  category: z.string().optional(),
  bctc: z.string().optional(), // Báo cáo tài chính
  rating: z.string().optional(),
  roe: z.number().optional(),
  roa: z.number().optional(),
  bienloinhuan: z.number().optional(),
  noVCSH: z.number().optional(), // Nợ/VCSH
  eps_pha_loang: z.number().optional(),
  gia_tri_so_sach: z.number().optional(),
  
  // Doanh thu và tăng trưởng
  dt_quygannhat: z.number().optional(),
  ct_dt_quygannhat: z.number().optional(),
  dt_quygannhi: z.number().optional(),
  ct_dt_quygannhi: z.number().optional(),
  
  // Lợi nhuận và tăng trưởng
  ln_quygannhat: z.number().optional(),
  ct_ln_quygannhat: z.number().optional(),
  ln_quygannhi: z.number().optional(),
  ct_ln_quygannhi: z.number().optional(),
  
  // Doanh thu theo năm
  dt_y2018: z.number().optional(),
  dt_y2019: z.number().optional(),
  dt_y2020: z.number().optional(),
  dt_y2021: z.number().optional(),
  dt_y2022: z.number().optional(),
  dt_y2023: z.number().optional(),
  dt_y2024: z.number().optional(),
  dt_y2025: z.number().optional(),
  
  // Tăng trưởng doanh thu theo năm
  ct_dt_y2018: z.number().optional(),
  ct_dt_y2019: z.number().optional(),
  ct_dt_y2020: z.number().optional(),
  ct_dt_y2021: z.number().optional(),
  ct_dt_y2022: z.number().optional(),
  ct_dt_y2023: z.number().optional(),
  ct_dt_y2024: z.number().optional(),
  ct_dt_y2025: z.number().optional(),
  
  // Lợi nhuận theo năm
  ln_y2018: z.number().optional(),
  ln_y2019: z.number().optional(),
  ln_y2020: z.number().optional(),
  ln_y2021: z.number().optional(),
  ln_y2022: z.number().optional(),
  ln_y2023: z.number().optional(),
  ln_y2024: z.number().optional(),
  ln_y2025: z.number().optional(),
  
  // Tăng trưởng lợi nhuận theo năm
  ct_ln_y2018: z.number().optional(),
  ct_ln_y2019: z.number().optional(),
  ct_ln_y2020: z.number().optional(),
  ct_ln_y2021: z.number().optional(),
  ct_ln_y2022: z.number().optional(),
  ct_ln_y2023: z.number().optional(),
  ct_ln_y2024: z.number().optional(),
  ct_ln_y2025: z.number().optional(),
  
  // Doanh thu theo quý
  dt_q1_2024: z.union([z.number(), z.string()]).optional(),
  dt_q2_2024: z.union([z.number(), z.string()]).optional(),
  dt_q3_2024: z.union([z.number(), z.string()]).optional(),
  dt_q4_2024: z.union([z.number(), z.string()]).optional(),
  dt_q1_2025: z.union([z.number(), z.string()]).optional(),
  dt_q2_2025: z.union([z.number(), z.string()]).optional(),
  
  // Lợi nhuận theo quý
  ln_q1_2024: z.union([z.number(), z.string()]).optional(),
  ln_q2_2024: z.union([z.number(), z.string()]).optional(),
  ln_q3_2024: z.union([z.number(), z.string()]).optional(),
  ln_q4_2024: z.union([z.number(), z.string()]).optional(),
  ln_q1_2025: z.union([z.number(), z.string()]).optional(),
  ln_q2_2025: z.union([z.number(), z.string()]).optional(),
  
  // Rating và điểm số
  ct_rs_rating_rank: z.number().optional(),
  rs_rating_rank: z.number().optional(),
  rs_rating: z.number().optional(),
  ct_fs_rating_rank: z.number().optional(),
  fs_rating_rank: z.number().optional(),
  fs_rating: z.number().optional(),
  
  // Hiện trạng
  h_ss_2: z.number().optional(),
  h_ss: z.number().optional(),
  h_sb: z.number().optional(),
  
  // Chỉ số định giá
  pb: z.number().optional(),
  pe: z.number().optional(),
  
  // Điểm và phân tích
  diem_tl: z.number().optional(),
  point: z.number().optional(),
  base: z.string().optional(),
  trend: z.string().optional(),
  
  // Khối lượng và giá
  volumePercent: z.number().optional(),
  volumeFlat: z.number().optional(),
  pricePercent: z.number().optional(),
  priceFlat: z.number().optional(),
  priceFloat: z.number().optional(),
  pricePercent60: z.number().optional(),
  pricePercent20: z.number().optional(),
  pricePercent5: z.number().optional(),
  
  // Giá tham chiếu và biên độ
  pc: z.number().optional(),
  pf: z.number().optional(),
  giaodichnn: z.number().optional(),
  
  // Thông tin khác
  note: z.string().optional(),
  vonhoa: z.number().optional(), // Vốn hóa
  rs: z.number().optional(),
  rsi: z.number().optional(),
  tbgtdd: z.number().optional(), // Trung bình giá trị dòng tiền
  tb_klgd: z.number().optional(), // Trung bình khối lượng giao dịch
  
  date: z.number().optional(),
  wait_score: z.number().optional(),
  break5: z.string().optional(),
  
  // Thông tin công ty
  website: z.string().optional(),
  info: z.string().optional(),
  slcp_weight: z.string().optional(),
  
  // Dynamic data (nested object with historical data)
  dynamic: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
}).passthrough(); // Allow additional fields

export type TickerData = z.infer<typeof TickerDataSchema>;

// Ten days data item (parsed from tendays JSON array string)
export const TenDaysItemSchema = z.object({
  priceFlat: z.number(),
  pricePercent: z.number(),
  date: z.number(), // YYYYMMDD format
  giaodichnn: z.number(), // Giao dịch nhà nước
});

export type TenDaysItem = z.infer<typeof TenDaysItemSchema>;

// Raw response from API
export const GetTickerDetailRawResponseSchema = z.object({
  tickerData: z.string(), // JSON string
  tendays: z.string(), // JSON array string
});

export type GetTickerDetailRawResponse = z.infer<typeof GetTickerDetailRawResponseSchema>;

// Parsed response
export const GetTickerDetailResponseSchema = z.object({
  tickerData: TickerDataSchema,
  tendays: z.array(TenDaysItemSchema),
});

export type GetTickerDetailResponse = z.infer<typeof GetTickerDetailResponseSchema>;

// Query keys for React Query
export const TICKER_DETAIL_QUERY_KEYS = {
  all: ['ticker-detail'] as const,
  detail: (ticker: string, day: number = 0) => [...TICKER_DETAIL_QUERY_KEYS.all, ticker, day] as const,
} as const;

