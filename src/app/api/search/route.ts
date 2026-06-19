import { NextRequest, NextResponse } from "next/server";
import {
  ConditionSummary,
  ResultItem,
  SearchRequest,
  SearchResponse,
} from "@/lib/types";
import { searchKream } from "@/lib/kream";
import { getFxRates } from "@/lib/fx";
import { filterUnderTarget, toResult } from "@/lib/calc";

// 헤드리스 렌더링 + 최대 3건 병렬이라 타임아웃을 넉넉히
export const maxDuration = 60;

// 환율만 조회 (검색창 위 환율 배너용, 페이지 진입 시 호출)
export async function GET() {
  try {
    const fx = await getFxRates();
    return NextResponse.json({ fx });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "환율 조회 실패" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let body: SearchRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  // 최대 3개, 유효한 조건만
  const conditions = (body.conditions || [])
    .filter((c) => c && c.keyword?.trim() && c.targetPriceKrw > 0)
    .slice(0, 3);

  if (!conditions.length) {
    return NextResponse.json(
      { error: "검색어와 목표가를 1개 이상 입력하세요." },
      { status: 400 }
    );
  }

  let fx;
  try {
    fx = await getFxRates();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "환율 조회 실패" },
      { status: 500 }
    );
  }

  // 모든 검색을 병렬로 실행하고 전부 끝날 때까지 대기
  const settled = await Promise.allSettled(
    conditions.map((c) => searchKream(c.keyword))
  );

  const summaries: ConditionSummary[] = [];
  const merged: ResultItem[] = [];

  settled.forEach((s, i) => {
    const c = conditions[i];
    if (s.status === "fulfilled") {
      const matched = filterUnderTarget(s.value, c.targetPriceKrw);
      summaries.push({
        keyword: c.keyword,
        targetPriceKrw: c.targetPriceKrw,
        totalFound: s.value.length,
        matched: matched.length,
      });
      for (const item of matched) merged.push(toResult(item, fx, c.keyword));
    } else {
      summaries.push({
        keyword: c.keyword,
        targetPriceKrw: c.targetPriceKrw,
        totalFound: 0,
        matched: 0,
        error: s.reason instanceof Error ? s.reason.message : "검색 실패",
      });
    }
  });

  // 상품 ID로 중복 제거(먼저 나온 것 유지) 후 가격 오름차순
  const seen = new Set<string>();
  const items = merged
    .filter((it) => {
      if (seen.has(it.id)) return false;
      seen.add(it.id);
      return true;
    })
    .sort((a, b) => a.priceKrw - b.priceKrw);

  const response: SearchResponse = { items, fx, conditions: summaries };
  return NextResponse.json(response);
}
