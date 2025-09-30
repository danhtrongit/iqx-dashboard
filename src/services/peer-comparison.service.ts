import { createHttp } from "@/lib/http";
import { peerComparison } from "@/lib/schemas";

const http = createHttp({
  baseURL: "https://proxy.iqx.vn/api",
});

export async function getPeerComparison(symbol: string) {
  const { data } = await http.get<peerComparison.PeerComparisonData>(
    `/peer-comparison/${symbol}`
  );
  return peerComparison.PeerComparisonDataSchema.parse(data);
}