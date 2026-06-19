// Kream 검색에서 추출한 상품 1건
export interface KreamItem {
  id: string;
  title: string;
  brand: string;
  priceKrw: number; // 표시 판매가 (원)
  link: string; // https://kream.co.kr/products/{id}
  thumbnail?: string;
}

// 결과 1건: Kream 상품 + 환산 가격
export interface ResultItem extends KreamItem {
  priceVnd: number; // 베트남 동
  priceCny: number; // 중국 위안
}

export interface FxRates {
  vnd: number; // 1 KRW -> VND
  cny: number; // 1 KRW -> CNY
  updatedAt: string; // 환율 기준 시각 (UTC 문자열)
}

export interface SearchRequest {
  keyword: string;
  targetPriceKrw: number; // 목표가 (원). 이 값 이하인 상품만 결과로 반환
}

export interface SearchResponse {
  items: ResultItem[]; // 목표가 이하, 가격 오름차순
  fx: FxRates;
  totalFound: number; // 필터 전 전체 검색 건수
  keyword: string;
  targetPriceKrw: number;
  error?: string;
}
