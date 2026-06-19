# Kream 가격 차액 검색기

검색어와 목표가(원)를 입력하면, **Kream 검색 결과 중 목표가 이하인 상품**만 추려
각 상품의 판매가를 **베트남 동(VND)·중국 위안(CNY)** 으로 환산해 보여주는 웹앱.
링크 하나로 모바일·PC 모두 사용 가능 (반응형).

> 예) 검색어 `리자몽 카드` + 목표가 `1,000,000` → 100만원 이하 상품만 가격순으로 나열,
> 각 상품에 KRW / VND / CNY 가격과 Kream 상품 링크 표시.

## 동작 방식

```
검색어 + 목표가 입력
   └─ POST /api/search
        ├─ lib/kream.ts : ScrapingBee로 Kream 검색 페이지를 JS 렌더링 → 상품 파싱
        ├─ lib/fx.ts    : open.er-api.com 에서 KRW→VND, KRW→CNY 환율 조회(1h 캐시)
        └─ lib/calc.ts  : 목표가 이하 필터 + 가격순 정렬 + VND/CNY 환산
   └─ 결과 카드로 표시
```

- **Kream은 공개 API가 없고** 봇 차단 + Nuxt SSR 구조라, 검색 데이터를 가져오려면 헤드리스 렌더링이 필요합니다. 이 프로젝트는 렌더링을 **ScrapingBee**(외부 스크래핑 API)에 위임합니다. 호출당 과금이라 비정기·저빈도 사용에 적합하고, 안 쓰면 비용이 들지 않습니다.
- 목표가 비교는 **원화 기준**입니다. VND·CNY는 결과 표시용 환산값입니다.

## 사전 준비: ScrapingBee API 키

1. https://www.scrapingbee.com 가입 → 대시보드에서 API Key 발급 (무료 플랜에 크레딧 제공)
2. 발급받은 키를 환경변수 `SCRAPINGBEE_API_KEY` 로 설정

## 로컬 실행

```bash
cp .env.example .env.local
# .env.local 에 SCRAPINGBEE_API_KEY 입력

npm install
npm run dev
# http://localhost:3000
```

## Vercel 배포

1. GitHub에 push
2. https://vercel.com → Import Project
3. Environment Variables 에 `SCRAPINGBEE_API_KEY` 추가
4. Deploy → 발급된 URL을 모바일/PC에서 접속

## 환율

- 엔드포인트: `https://open.er-api.com/v6/latest/KRW` (API 키 불필요, 무료)
- 응답의 `rates.VND`, `rates.CNY` 사용. 하루 1회 갱신.
- 결과 화면 상단에 적용 환율과 기준 시각을 표시합니다.

## 유지보수 메모

- **셀렉터 의존**: Kream 검색 결과 DOM(`a.product_card`, `/products/{id}`, `…원` 텍스트)을 파싱합니다. Kream UI가 바뀌면 `src/lib/kream.ts` 의 `parseProducts` 셀렉터만 수정하면 됩니다.
- **약관/빈도**: 자동 수집은 과도하면 차단·약관 문제가 될 수 있습니다. 비정기·저빈도 개인 용도를 전제로 합니다.
- **검증 완료**: 파서는 실제 Kream 검색 결과 50건(제목·가격·링크 추출 누락 0건)과 단위 픽스처로 검증했습니다. 단, Vercel 환경에서의 ScrapingBee 호출/타임아웃은 키 설정 후 1회 점검 권장.

## 구조

```
src/
├── app/
│   ├── api/search/route.ts   # POST: keyword + targetPriceKrw → 결과 JSON
│   ├── components/
│   │   ├── SearchForm.tsx     # 검색어·목표가 입력
│   │   └── ResultCard.tsx     # 상품별 KRW/VND/CNY + 링크 카드
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
└── lib/
    ├── kream.ts              # ScrapingBee 렌더링 + 상품 파싱
    ├── fx.ts                 # 환율 조회
    ├── calc.ts               # 목표가 필터 + 환산
    └── types.ts
```
