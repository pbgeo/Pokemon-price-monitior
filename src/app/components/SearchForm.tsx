"use client";

import { useState } from "react";

interface Props {
  onSubmit: (keyword: string, targetPriceKrw: number) => void;
  loading: boolean;
}

export default function SearchForm({ onSubmit, loading }: Props) {
  const [keyword, setKeyword] = useState("");
  const [target, setTarget] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const price = parseInt(target.replace(/[^\d]/g, ""), 10);
    if (!keyword.trim() || !price) return;
    onSubmit(keyword.trim(), price);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">검색어</label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="예: 리자몽 카드"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-black focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">목표가 (원)</label>
        <input
          type="text"
          inputMode="numeric"
          value={target}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^\d]/g, "");
            setTarget(digits ? parseInt(digits, 10).toLocaleString() : "");
          }}
          placeholder="예: 1,000,000"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-black focus:outline-none"
        />
        <p className="text-xs text-gray-400 mt-1">이 금액 이하인 상품만 결과로 보여줍니다.</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "검색 중…" : "검색"}
      </button>
    </form>
  );
}
