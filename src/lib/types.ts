// Kream 검색에서 추출한 상품 1건
export interface KreamItem {
  id: string;
  title: string;
  brand: string;
  priceKrw: number; // 표시 판매가 (원)
  link: string; // https://kream.co.kr/products/{id}
  thumbnail?: string;
}

// 결과 1건: Kream 상품 + 환산 가격 + 출처 검색어
export interface ResultItem extends KreamItem {
  priceVnd: number; // 베트남 동
  priceCny: number; // 중국 위안
  keyword: string; // 어느 검색 조건에서 나온 상품인지
}

export interface FxRates {
  vnd: number; // 1 KRW -> VND
  cny: number; // 1 KRW -> CNY
  updatedAt: string; // 환율 기준 시각 (UTC 문자열)
}

// 검색 조건 1개 (검색어 + 목표가)
export interface SearchCondition {
  keyword: string;
  targetPriceKrw: number; // 목표가 (원). 조건별로 따로 적용
}

export interface SearchRequest {
  conditions: SearchCondition[]; // 최대 3개 동시검색
}

// 조건별 요약
export interface ConditionSummary {
  keyword: string;
  targetPriceKrw: number;
  totalFound: number; // 해당 검색어 전체 건수
  matched: number; // 목표가 이하 건수
  error?: string; // 해당 조건 검색 실패 시
}

export interface SearchResponse {
  items: ResultItem[]; // 전 조건 병합 · ID 중복제거 · 가격 오름차순
  fx: FxRates;
  conditions: ConditionSummary[];
  error?: string; // 전체 실패 시
}
