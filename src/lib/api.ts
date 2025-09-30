// Utility function to get the correct API base URL
export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_BASE_API || "http://localhost:3000/api";
};

// Get watchlist API base URL
export const getWatchlistApiBaseUrl = (): string => {
  return `${getApiBaseUrl()}/watchlist`;
};

// Create a fetch wrapper that automatically uses the correct base URL
export const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  return fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
};

export default { getApiBaseUrl, getWatchlistApiBaseUrl, apiRequest };