import * as cheerio from "cheerio";
import { KreamItem } from "./types";

const searchUrl = (keyword: string) =>
  `https://kream.co.kr/search?keyword=${encodeURIComponent(keyword)}`;

export async function searchKream(keyword: string): Promise<KreamItem[]> {
  const html = await fetchRenderedHtml(searchUrl(keyword));
  return parseProducts(html);
}

// ScraperAPI 로 JS 렌더링된 HTML 을 받아온다.
// Kream 은 공개 API 가 없고 봇 차단 + Nuxt SSR 이라 헤드리스 렌더링이 필요.
// ScraperAPI 무료 플랜: 매월 5,000 크레딧 갱신 (render=true 는 요청당 크레딧 더 사용).
async function fetchRenderedHtml(targetUrl: string): Promise<string> {
  const apiKey = process.env.SCRAPERAPI_API_KEY;
  if (!apiKey) {
    throw new Error("SCRAPERAPI_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const url = new URL("https://api.scraperapi.com/");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("url", targetUrl);
  url.searchParams.set("render", "true"); // JS 렌더링
  url.searchParams.set("country_code", "kr"); // 한국 프록시 (차단 시 이 줄 제거 가능)

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`스크래핑 API 오류 ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.text();
}

// 검색 결과 HTML 에서 상품 카드를 파싱.
// 셀렉터: a.product_card[href="/products/{id}"], 가격은 "...원" 텍스트.
function parseProducts(html: string): KreamItem[] {
  const $ = cheerio.load(html);
  const items: KreamItem[] = [];
  const seen = new Set<string>();

  $('a.product_card[href*="/products/"]').each((_, el) => {
    const a = $(el);
    const href = a.attr("href") || "";
    const idMatch = href.match(/\/products\/(\d+)/);
    if (!idMatch) return;
    const id = idMatch[1];
    if (seen.has(id)) return;

    // 카드 내 모든 <p> 텍스트 수집
    const texts = a
      .find("p")
      .map((_, p) => $(p).text().trim())
      .get()
      .filter(Boolean);

    // 가격: "823,000원" 형태에서 숫자만 추출
    const priceText = texts.find((t) => /[\d,]+\s*원/.test(t));
    if (!priceText) return;
    const priceMatch = priceText.match(/([\d,]+)\s*원/);
    if (!priceMatch) return;
    const priceKrw = parseInt(priceMatch[1].replace(/,/g, ""), 10);
    if (!priceKrw) return;

    const brand = texts[0] || "";
    // 제목: 첫 줄(브랜드)이 아니고 가격/숫자가 아닌 첫 텍스트
    const title =
      texts.find(
        (t, i) => i > 0 && t !== priceText && !/[\d,]+\s*원/.test(t)
      ) || "";

    const thumbnail = a.find("img").attr("src") || undefined;

    seen.add(id);
    items.push({
      id,
      title,
      brand,
      priceKrw,
      link: `https://kream.co.kr/products/${id}`,
      thumbnail,
    });
  });

  return items;
}
