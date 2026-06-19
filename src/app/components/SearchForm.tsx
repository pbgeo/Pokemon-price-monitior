"use client";

import { useState } from "react";
import { SearchCondition } from "@/lib/types";

interface Props {
  onSubmit: (conditions: SearchCondition[]) => void;
  loading: boolean;
}

interface Row {
  keyword: string;
  target: string;
}

const MAX = 3;

export default function SearchForm({ onSubmit, loading }: Props) {
  const [rows, setRows] = useState<Row[]>([{ keyword: "", target: "" }]);

  function update(i: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((rs) => (rs.length < MAX ? [...rs, { keyword: "", target: "" }] : rs));
  }
  function removeRow(i: number) {
    setRows((rs) => rs.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const conditions: SearchCondition[] = rows
      .map((r) => ({
        keyword: r.keyword.trim(),
        targetPriceKrw: parseInt(r.target.replace(/[^\d]/g, ""), 10) || 0,
      }))
      .filter((c) => c.keyword && c.targetPriceKrw > 0);
    if (!conditions.length) return;
    onSubmit(conditions);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* 라벨 헤더 (한 번만) */}
      <div className="flex gap-2">
        <span className="flex-1 min-w-0 text-sm font-medium text-gray-700">검색어</span>
        <span className="w-28 sm:w-40 text-sm font-medium text-gray-700">목표가 (원)</span>
        <span className="w-8 shrink-0" />
      </div>

      {rows.map((row, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            value={row.keyword}
            onChange={(e) => update(i, { keyword: e.target.value })}
            placeholder="예: 리자몽 카드"
            className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-black focus:outline-none"
          />
          <input
            type="text"
            inputMode="numeric"
            value={row.target}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^\d]/g, "");
              update(i, { target: digits ? parseInt(digits, 10).toLocaleString() : "" });
            }}
            placeholder="1,000,000"
            className="w-28 sm:w-40 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-right focus:border-black focus:outline-none"
          />
          {rows.length > 1 ? (
            <button
              type="button"
              onClick={() => removeRow(i)}
              aria-label="삭제"
              className="flex h-9 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            >
              ×
            </button>
          ) : (
            <span className="w-8 shrink-0" />
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        disabled={rows.length >= MAX}
        className="text-sm font-medium text-gray-600 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        + 품목 추가 ({rows.length}/{MAX})
      </button>

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
