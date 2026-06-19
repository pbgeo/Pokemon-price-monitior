"use client";

import { useEffect, useState } from "react";
import SearchForm from "./components/SearchForm";
import ResultCard from "./components/ResultCard";
import { FxRates, SearchResponse } from "@/lib/types";

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

  async function handleSearch(keyword: string, targetPriceKrw: number) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, targetPriceKrw }),
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
            목표가 이하의 Kream 상품을 베트남 동·중국 위안 가격과 함께 보여줍니다.
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
            Kream 검색 중… (헤드리스 렌더링으로 10~20초 걸릴 수 있어요)
          </div>
        )}

        {data && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              전체 <span className="font-semibold text-gray-900">{data.totalFound}건</span> 중 목표가{" "}
              <span className="font-semibold text-gray-900">
                {data.targetPriceKrw.toLocaleString()}원
              </span>{" "}
              이하 <span className="font-semibold text-gray-900">{data.items.length}건</span>
            </p>

            {data.items.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400">
                목표가 이하인 상품이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {data.items.map((item) => (
                  <ResultCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
