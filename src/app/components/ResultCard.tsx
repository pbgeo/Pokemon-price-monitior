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
        {item.brand && (
          <p className="truncate text-xs font-semibold text-gray-500">{item.brand}</p>
        )}
        <p className="line-clamp-2 text-sm font-medium text-gray-900">{item.title}</p>
        <p className="mt-1 text-base font-bold text-gray-900">{krw(item.priceKrw)}</p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600">
          <span>{vnd(item.priceVnd)}</span>
          <span>{cny(item.priceCny)}</span>
        </div>
      </div>
    </a>
  );
}
