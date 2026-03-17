"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterBarProps {
  placeholder?: string;
  filterKey?: string;
  filterOptions?: FilterOption[];
  filterLabel?: string;
}

export default function SearchFilterBar({
  placeholder = "キーワードで検索",
  filterKey,
  filterOptions,
  filterLabel = "絞り込み",
}: SearchFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // キーワード変更時にURLを更新（300ms デバウンス）
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (keyword) {
        params.set("keyword", keyword);
      } else {
        params.delete("keyword");
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keyword, pathname, router, searchParams]);

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(filterKey!, value);
    } else {
      params.delete(filterKey!);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {/* キーワード検索 */}
      <div className="relative flex-1">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#949494]"
          aria-hidden="true"
        />
        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full rounded-md border border-[#CCCCCC] bg-[#F5F5F5] pl-9 pr-4 py-2 text-base text-[#1A1A1C] placeholder:text-[#949494] hover:border-[#767676] focus:outline-none focus:border-[#0017C1] focus:ring-2 focus:ring-[#0017C1]/20 focus:bg-white"
        />
      </div>

      {/* フィルターセレクト */}
      {filterKey && filterOptions && (
        <select
          value={searchParams.get(filterKey) ?? ""}
          onChange={(e) => handleFilterChange(e.target.value)}
          aria-label={filterLabel}
          className="rounded-md border border-[#CCCCCC] bg-[#F5F5F5] px-4 py-2 text-base text-[#1A1A1C] hover:border-[#767676] focus:outline-none focus:border-[#0017C1] focus:ring-2 focus:ring-[#0017C1]/20 focus:bg-white"
        >
          <option value="">すべて</option>
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
