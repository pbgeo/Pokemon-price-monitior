import { FxRates, KreamItem, ResultItem } from "./types";

// 목표가(원) 이하인 상품만 남기고 가격 오름차순 정렬
export function filterUnderTarget(
  items: KreamItem[],
  targetPriceKrw: number
): KreamItem[] {
  return items
    .filter((i) => i.priceKrw > 0 && i.priceKrw <= targetPriceKrw)
    .sort((a, b) => a.priceKrw - b.priceKrw);
}

// 판매가를 VND / CNY 로 환산하고 출처 검색어를 태깅
export function toResult(
  item: KreamItem,
  fx: FxRates,
  keyword: string
): ResultItem {
  return {
    ...item,
    keyword,
    priceVnd: Math.round(item.priceKrw * fx.vnd),
    priceCny: Math.round(item.priceKrw * fx.cny * 100) / 100,
  };
}
