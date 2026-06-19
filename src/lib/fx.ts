import { FxRates } from "./types";

// API 키 불필요 무료 환율 엔드포인트 (KRW 기준)
const FX_URL = "https://open.er-api.com/v6/latest/KRW";

export async function getFxRates(): Promise<FxRates> {
  const res = await fetch(FX_URL, { next: { revalidate: 3600 } }); // 1시간 캐시
  if (!res.ok) {
    throw new Error(`환율 API 오류 ${res.status}`);
  }
  const data = await res.json();
  const vnd = data?.rates?.VND;
  const cny = data?.rates?.CNY;
  if (typeof vnd !== "number" || typeof cny !== "number") {
    throw new Error("환율 데이터를 가져오지 못했습니다.");
  }
  return {
    vnd,
    cny,
    updatedAt: data?.time_last_update_utc ?? "",
  };
}
