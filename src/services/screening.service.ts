// src/services/screening.service.ts
import { createHttp } from "@/lib/http";
import { screening } from "@/lib/schemas";

const ProxyIqApi = createHttp({
  baseURL: "https://proxy.iqx.vn/proxy/iq/api",
});

export async function postScreeningPaging(
  body: screening.ScreeningRequest
) {
  const { data } = await ProxyIqApi.post<screening.ScreeningEnvelope>(
    "/iq-insight-service/v1/screening/paging",
    body
  );
  return screening.ScreeningEnvelopeSchema.parse(data).data;
}


