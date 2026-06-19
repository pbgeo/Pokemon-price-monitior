# Kream 가격 차액 검색기

검색어와 목표가(원)를 입력하면, **Kream 검색 결과 중 목표가 이하인 상품**만 추려
각 상품의 판매가를 **베트남 동(VND)·중국 위안(CNY)** 으로 환산해 보여주는 웹앱.
여러 품목(최대 3개)을 한 번에 검색해 가격순으로 병합해 보여줍니다.
링크 하나로 모바일·PC 모두 사용 가능 (반응형).

> 예) `리자몽 카드`(목표가 100만) + `피카츄`(목표가 30만) → 각 조건 이하 상품만
> 합쳐서 가격순 정렬, 각 카드에 검색어 뱃지 · KRW/VND/CNY · Kream 링크 표시.

## 동작 방식

```
검색 조건(검색어+목표가) 1~3개 입력
   └─ POST /api/search  { conditions: [...] }
        ├─ lib/kream.ts : ScraperAPI로 Kream 검색 페이지를 JS 렌더링 → 상품 파싱 (조건별 병렬)
        ├─ lib/fx.ts    : open.er-api.com 에서 KRW→VND, KRW→CNY 환율 조회(1h 캐시)
        └─ lib/calc.ts  : 조건별 목표가 이하 필터 + VND/CNY 환산
   └─ 전 조건 병합 · 상품ID 중복제거 · 가격 오름차순으로 표시
```

- **Kream은 공개 API가 없고** 봇 차단 + Nuxt SSR 구조라, 검색 데이터를 가져오려면 헤드리스 렌더링이 필요합니다. 이 프로젝트는 렌더링을 **ScraperAPI**(외부 스크래핑 API)에 위임합니다.
- ScraperAPI는 **매월 5,000 크레딧이 무료로 갱신**돼서 비정기·저빈도 사용에 적합합니다. (JS 렌더링은 요청당 크레딧을 더 사용)
- 목표가 비교는 **원화 기준**(조건별로 따로). VND·CNY는 결과 표시용 환산값입니다.

## 사전 준비: ScraperAPI 키

1. https://www.scraperapi.com 가입 → 대시보드에서 API Key 발급 (매월 5,000 크레딧 무료)
2. 발급받은 키를 환경변수 `SCRAPERAPI_API_KEY` 로 설정

## 로컬 실행

```bash
cp .env.example .env.local
# .env.local 에 SCRAPERAPI_API_KEY 입력

npm install
npm run dev
# http://localhost:3000
```

## Vercel 배포

1. GitHub에 push
2. https://vercel.com → Import Project
3. Environment Variables 에 `SCRAPERAPI_API_KEY` 추가
4. Deploy → 발급된 URL을 모바일/PC에서 접속

## 환율

- 엔드포인트: `https://open.er-api.com/v6/latest/KRW` (API 키 불필요, 무료)
- 응답의 `rates.VND`, `rates.CNY` 사용. 하루 1회 갱신.
- 결과 화면 상단(검색창 위)에 적용 환율과 기준 시각을 항상 표시합니다.

## 유지보수 메모

- **셀렉터 의존**: Kream 검색 결과 DOM(`a.product_card`, `/products/{id}`, `…원` 텍스트)을 파싱합니다. Kream UI가 바뀌면 `src/lib/kream.ts` 의 `parseProducts` 셀렉터만 수정하면 됩니다.
- **스크래핑 제공자 교체**: `src/lib/kream.ts` 의 `fetchRenderedHtml` 한 함수만 바꾸면 다른 서비스(ScrapingBee 등)로 교체할 수 있습니다.
- **한국 프록시**: `country_code=kr` 를 사용합니다. 무료 플랜에서 지역 프록시가 막히면 해당 줄을 제거하세요.
- **약관/빈도**: 자동 수집은 과도하면 차단·약관 문제가 될 수 있습니다. 비정기·저빈도 개인 용도를 전제로 합니다.

## 구조

```
src/
├── app/
│   ├── api/search/route.ts   # GET(환율) / POST(조건 배열 → 병합 결과 JSON)
│   ├── components/
│   │   ├── SearchForm.tsx     # 검색어·목표가 다중 행(최대 3) 입력
│   │   └── ResultCard.tsx     # 상품별 검색어 뱃지 + KRW/VND/CNY + 링크
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
└── lib/
    ├── kream.ts              # ScraperAPI 렌더링 + 상품 파싱
    ├── fx.ts                 # 환율 조회
    ├── calc.ts               # 목표가 필터 + 환산 + 검색어 태깅
    └── types.ts
```
