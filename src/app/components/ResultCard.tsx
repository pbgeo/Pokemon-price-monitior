import { ResultItem } from "@/lib/types";

const krw = (n: number) => n.toLocaleString("ko-KR") + "원";
const vnd = (n: number) => "₫ " + n.toLocaleString("vi-VN");
const cny = (n: number) =>
  "¥ " + n.toLocaleString("zh-CN", { maximumFractionDigits: 2 });

export default function ResultCard({ item }: { item: ResultItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-colors hover:border-gray-400 sm:gap-4 sm:p-4"
    >
      {item.thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumbnail}
          alt={item.title}
          className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="shrink-0 rounded bg-gray-900 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {item.keyword}
          </span>
          {item.brand && (
            <p className="truncate text-xs font-semibold text-gray-500">{item.brand}</p>
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm font-medium text-gray-900">{item.title}</p>
        <p className="mt-1 text-base font-bold text-gray-900">{krw(item.priceKrw)}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-md bg-rose-50 px-2.5 py-1 text-sm font-semibold text-rose-700">
            {vnd(item.priceVnd)}
          </span>
          <span className="rounded-md bg-sky-50 px-2.5 py-1 text-sm font-semibold text-sky-700">
            {cny(item.priceCny)}
          </span>
        </div>
      </div>
    </a>
  );
}
