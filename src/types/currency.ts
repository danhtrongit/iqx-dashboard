export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  group?: string;
}

export interface ExchangeRateData {
  base: string;
  target: string;
  mid: number;
  unit: number;
  timestamp: string;
}

export interface ExchangeRateResponse {
  status_code: number;
  data: ExchangeRateData;
}

// Danh sách các loại tiền tệ phổ biến (hỗ trợ bởi Hexarate API)
export const CURRENCIES: Currency[] = [
  // Chính
  { code: "USD", name: "Đô la Mỹ", symbol: "$", flag: "🇺🇸", group: "Chính" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", group: "Chính" },
  { code: "GBP", name: "Bảng Anh", symbol: "£", flag: "🇬🇧", group: "Chính" },
  { code: "JPY", name: "Yên Nhật", symbol: "¥", flag: "🇯🇵", group: "Chính" },
  { code: "CHF", name: "Franc Thụy Sỹ", symbol: "CHF", flag: "🇨🇭", group: "Chính" },
  { code: "CAD", name: "Đô la Canada", symbol: "C$", flag: "🇨🇦", group: "Chính" },
  { code: "AUD", name: "Đô la Úc", symbol: "A$", flag: "🇦🇺", group: "Chính" },
  { code: "NZD", name: "Đô la New Zealand", symbol: "NZ$", flag: "🇳🇿", group: "Chính" },
  
  // Châu Á
  { code: "VND", name: "Đồng Việt Nam", symbol: "₫", flag: "🇻🇳", group: "Châu Á" },
  { code: "THB", name: "Baht Thái", symbol: "฿", flag: "🇹🇭", group: "Châu Á" },
  { code: "CNY", name: "Nhân dân tệ", symbol: "¥", flag: "🇨🇳", group: "Châu Á" },
  { code: "KRW", name: "Won Hàn Quốc", symbol: "₩", flag: "🇰🇷", group: "Châu Á" },
  { code: "SGD", name: "Đô la Singapore", symbol: "S$", flag: "🇸🇬", group: "Châu Á" },
  { code: "HKD", name: "Đô la Hồng Kông", symbol: "HK$", flag: "🇭🇰", group: "Châu Á" },
  { code: "TWD", name: "Đô la Đài Loan", symbol: "NT$", flag: "🇹🇼", group: "Châu Á" },
  { code: "INR", name: "Rupee Ấn Độ", symbol: "₹", flag: "🇮🇳", group: "Châu Á" },
  { code: "IDR", name: "Rupiah Indonesia", symbol: "Rp", flag: "🇮🇩", group: "Châu Á" },
  { code: "MYR", name: "Ringgit Malaysia", symbol: "RM", flag: "🇲🇾", group: "Châu Á" },
  { code: "PHP", name: "Peso Philippines", symbol: "₱", flag: "🇵🇭", group: "Châu Á" },
  
  // Khác
  { code: "BRL", name: "Real Brazil", symbol: "R$", flag: "🇧🇷", group: "Khác" },
  { code: "MXN", name: "Peso Mexico", symbol: "Mex$", flag: "🇲🇽", group: "Khác" },
  { code: "ZAR", name: "Rand Nam Phi", symbol: "R", flag: "🇿🇦", group: "Khác" },
  { code: "TRY", name: "Lira Thổ Nhĩ Kỳ", symbol: "₺", flag: "🇹🇷", group: "Khác" },
  { code: "RUB", name: "Rúp Nga", symbol: "₽", flag: "🇷🇺", group: "Khác" },
  { code: "PLN", name: "Zloty Ba Lan", symbol: "zł", flag: "🇵🇱", group: "Khác" },
  { code: "SEK", name: "Krona Thụy Điển", symbol: "kr", flag: "🇸🇪", group: "Khác" },
  { code: "NOK", name: "Krone Na Uy", symbol: "kr", flag: "🇳🇴", group: "Khác" },
  { code: "DKK", name: "Krone Đan Mạch", symbol: "kr", flag: "🇩🇰", group: "Khác" },
  
  // Crypto
  { code: "BTC", name: "Bitcoin", symbol: "₿", flag: "₿", group: "Crypto" },
  { code: "ETH", name: "Ethereum", symbol: "Ξ", flag: "Ξ", group: "Crypto" },
  { code: "USDT", name: "Tether", symbol: "USDT", flag: "₮", group: "Crypto" },
  { code: "BNB", name: "Binance Coin", symbol: "BNB", flag: "BNB", group: "Crypto" },
  { code: "XRP", name: "Ripple", symbol: "XRP", flag: "XRP", group: "Crypto" },
  { code: "ADA", name: "Cardano", symbol: "ADA", flag: "ADA", group: "Crypto" },
  { code: "DOGE", name: "Dogecoin", symbol: "DOGE", flag: "DOGE", group: "Crypto" },
  { code: "LTC", name: "Litecoin", symbol: "Ł", flag: "Ł", group: "Crypto" },
];

// Group currencies by category
export const CURRENCY_GROUPS = {
  main: CURRENCIES.filter(c => c.group === "Chính"),
  asia: CURRENCIES.filter(c => c.group === "Châu Á"),
  crypto: CURRENCIES.filter(c => c.group === "Crypto"),
  others: CURRENCIES.filter(c => c.group === "Khác"),
};

// Helper function to get currency by code
export const getCurrencyByCode = (code: string): Currency | undefined => {
  return CURRENCIES.find(c => c.code === code);
};

