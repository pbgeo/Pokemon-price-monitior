import { NextRequest, NextResponse } from "next/server";
import { SearchRequest, SearchResponse } from "@/lib/types";
import { searchKream } from "@/lib/kream";
import { getFxRates } from "@/lib/fx";
import { filterUnderTarget, toResult } from "@/lib/calc";

// 헤드리스 렌더링은 시간이 걸릴 수 있어 타임아웃을 넉넉히
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: SearchRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const { keyword, targetPriceKrw } = body;
  if (!keyword?.trim()) {
    return NextResponse.json({ error: "검색어를 입력하세요." }, { status: 400 });
  }
  if (!targetPriceKrw || targetPriceKrw <= 0) {
    return NextResponse.json({ error: "목표가를 입력하세요." }, { status: 400 });
  }

  try {
    const [all, fx] = await Promise.all([searchKream(keyword), getFxRates()]);
    const items = filterUnderTarget(all, targetPriceKrw).map((i) => toResult(i, fx));

    const response: SearchResponse = {
      items,
      fx,
      totalFound: all.length,
      keyword,
      targetPriceKrw,
    };
    return NextResponse.json(response);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "알 수 없는 오류" },
      { status: 500 }
    );
  }
}
