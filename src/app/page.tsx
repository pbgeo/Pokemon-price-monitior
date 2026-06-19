"use client";

import { useState } from "react";
import SearchForm from "./components/SearchForm";
import ResultCard from "./components/ResultCard";
import { SearchResponse } from "@/lib/types";

export default function Home() {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (json.error) setError(json.error);
      else setData(json);
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Kream 가격 차액 검색기
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            검색어와 목표가를 입력하면, Kream에서 목표가 이하인 상품을 찾아
            베트남 동·중국 위안 가격으로 함께 보여줍니다.
          </p>
        </div>

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
          <div className="space-y-4">
            <div className="flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                전체 {data.totalFound}건 중 목표가({data.targetPriceKrw.toLocaleString()}원)
                이하 <span className="font-semibold text-gray-900">{data.items.length}건</span>
              </p>
              {data.fx.updatedAt && (
                <p className="text-xs text-gray-400">
                  환율 기준 {data.fx.updatedAt} · 1원 = {data.fx.vnd.toFixed(2)}₫ /{" "}
                  {data.fx.cny.toFixed(5)}¥
                </p>
              )}
            </div>

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
