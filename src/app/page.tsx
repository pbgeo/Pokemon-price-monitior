"use client";

import { useEffect, useState } from "react";
import SearchForm from "./components/SearchForm";
import ResultCard from "./components/ResultCard";
import { FxRates, SearchCondition, SearchResponse } from "@/lib/types";

export default function Home() {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [fx, setFx] = useState<FxRates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 페이지 진입 시 환율 미리 로드 (검색창 위 배너)
  useEffect(() => {
    fetch("/api/search")
      .then((r) => r.json())
      .then((j) => {
        if (j.fx) setFx(j.fx);
      })
      .catch(() => {});
  }, []);

  async function handleSearch(conditions: SearchCondition[]) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conditions }),
      });
      const json = (await res.json()) as SearchResponse;
      if (json.error) {
        setError(json.error);
      } else {
        setData(json);
        setFx(json.fx);
      }
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Kream 가격 차액 검색기
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            여러 품목(최대 3개)을 한 번에 검색해, 목표가 이하 상품을
            베트남 동·중국 위안 가격과 함께 가격순으로 보여줍니다.
          </p>
        </div>

        {/* 환율 배너 — 항상 검색창 위, 하이라이트 */}
        {fx && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-semibold text-amber-900">적용 환율</span>
              <span className="text-sm text-amber-800">
                1원 = <span className="font-semibold">{fx.vnd.toFixed(2)}₫</span> ·{" "}
                <span className="font-semibold">{fx.cny.toFixed(5)}¥</span>
              </span>
              {fx.updatedAt && (
                <span className="text-xs text-amber-700">· 기준 {fx.updatedAt}</span>
              )}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <SearchForm onSubmit={handleSearch} loading={loading} />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="animate-pulse py-10 text-center text-sm text-gray-400">
            Kream 검색 중… (품목 수에 따라 10~20초 걸릴 수 있어요)
          </div>
        )}

        {data && (
          <div className="space-y-3">
            {/* 조건별 요약 */}
            <div className="flex flex-wrap gap-2">
              {data.conditions.map((c, i) => (
                <span
                  key={i}
                  className={
                    "rounded-full px-3 py-1 text-xs font-medium " +
                    (c.error
                      ? "bg-red-50 text-red-600"
                      : "bg-gray-100 text-gray-700")
                  }
                >
                  {c.keyword}{" "}
                  {c.error
                    ? "· 검색 실패"
                    : `· ${c.matched}건 (전체 ${c.totalFound})`}
                </span>
              ))}
            </div>

            <p className="text-sm text-gray-600">
              목표가 이하 총{" "}
              <span className="font-semibold text-gray-900">{data.items.length}건</span>{" "}
              · 가격순
            </p>

            {data.items.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400">
                목표가 이하인 상품이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {data.items.map((item) => (
                  <ResultCard
                    key={item.id}
                    item={item}
                    colorIndex={data.conditions.findIndex(
                      (c) => c.keyword === item.keyword
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
