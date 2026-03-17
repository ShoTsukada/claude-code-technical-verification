import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Suspense } from "react";
import { listEntities } from "../../lib/services/entityService";
import type { Investor } from "../../lib/types";
import SearchFilterBar from "../components/SearchFilterBar";
import Pagination from "../components/Pagination";
import DeleteButton from "./_components/DeleteButton";

const PAGE_SIZE = 10;

export const metadata = {
  title: "投資家一覧 | 研究管理システム",
};

// 種別ラベルの変換
const typeLabel: Record<string, string> = {
  individual: "個人",
  corporate: "法人",
};

// 種別バッジのスタイル
const typeBadgeClass: Record<string, string> = {
  individual: "bg-[#E8F7EE] text-[#006E28]",
  corporate: "bg-[#E6E8FB] text-[#0017C1]",
};

interface PageProps {
  searchParams: Promise<{ keyword?: string; type?: string; page?: string }>;
}

async function InvestorTable({
  keyword,
  investorType,
  page,
}: {
  keyword: string;
  investorType: string;
  page: number;
}) {
  const result = await listEntities<Investor>("investors", {
    page,
    pageSize: PAGE_SIZE,
    keyword: keyword || undefined,
    investorType: (investorType as "individual" | "corporate") || undefined,
  });

  if (result.total === 0) {
    return (
      <div className="text-center py-16 text-[#595959]">
        {keyword || investorType ? (
          <p>条件に一致する投資家が見つかりませんでした。</p>
        ) : (
          <p>投資家が登録されていません。新規登録から追加してください。</p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-lg border border-[#EBEBEB] shadow-[var(--shadow-1)]">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-[#EBEBEB]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#595959] uppercase tracking-wider border-b border-[#CCCCCC]">氏名／組織名</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#595959] uppercase tracking-wider border-b border-[#CCCCCC]">種別</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#595959] uppercase tracking-wider border-b border-[#CCCCCC]">連絡先</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#595959] uppercase tracking-wider border-b border-[#CCCCCC]">登録日</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#595959] uppercase tracking-wider border-b border-[#CCCCCC]">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBEBEB] bg-white">
            {result.data.map((investor) => (
              <tr key={investor.id} className="hover:bg-[#F5F5F5] transition-colors duration-100">
                <td className="px-4 py-3 font-medium text-[#1A1A1C]">{investor.name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-sm ${typeBadgeClass[investor.type] ?? ""}`}>
                    {typeLabel[investor.type] ?? investor.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#595959]">{investor.contact ?? "—"}</td>
                <td className="px-4 py-3 text-[#595959]">
                  {new Date(investor.created_at).toLocaleDateString("ja-JP")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/investors/${investor.id}`}
                      className="inline-flex items-center justify-center h-7 px-3 text-sm font-bold rounded-md border-2 border-[#0017C1] text-[#0017C1] bg-white hover:bg-[#E6E8FB] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
                    >
                      詳細
                    </Link>
                    <DeleteButton id={investor.id} name={investor.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageSize={PAGE_SIZE} total={result.total} />
    </>
  );
}

export default async function InvestorsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const keyword = params.keyword ?? "";
  const investorType = params.type ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#1A1A1C] flex items-center gap-2">
          <Users size={28} aria-hidden="true" />
          投資家
        </h1>
        <Link
          href="/investors/new"
          className="inline-flex items-center justify-center gap-2 h-12 px-6 text-base font-bold rounded-md bg-[#0017C1] text-white hover:bg-[#0014A8] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:text-[#1A1A1C] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
        >
          <Plus size={18} aria-hidden="true" />
          新規登録
        </Link>
      </div>

      <Suspense>
        <SearchFilterBar
          placeholder="氏名・組織名で検索"
          filterKey="type"
          filterOptions={[
            { value: "individual", label: "個人" },
            { value: "corporate", label: "法人" },
          ]}
          filterLabel="種別で絞り込み"
        />
      </Suspense>

      <Suspense fallback={<div className="text-center py-16 text-[#595959]">読み込み中...</div>}>
        <InvestorTable keyword={keyword} investorType={investorType} page={page} />
      </Suspense>
    </div>
  );
}
