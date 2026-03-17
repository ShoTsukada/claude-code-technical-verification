"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
}

export default function Pagination({ page, pageSize, total }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  const navigate = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const btnBase =
    "inline-flex items-center justify-center h-9 px-4 text-sm font-bold rounded-md border-2 border-[#0017C1] text-[#0017C1] bg-white hover:bg-[#E6E8FB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]";

  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <button
        type="button"
        onClick={() => navigate(page - 1)}
        disabled={page <= 1}
        aria-label="前のページへ"
        className={btnBase}
      >
        <ChevronLeft size={16} aria-hidden="true" />
        前へ
      </button>
      <span className="text-sm text-[#595959]">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => navigate(page + 1)}
        disabled={page >= totalPages}
        aria-label="次のページへ"
        className={btnBase}
      >
        次へ
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
