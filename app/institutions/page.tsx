import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { Suspense } from "react";
import { listEntities } from "../../lib/services/entityService";
import type { Institution } from "../../lib/types";
import SearchFilterBar from "../components/SearchFilterBar";
import Pagination from "../components/Pagination";
import DeleteButton from "./_components/DeleteButton";

const PAGE_SIZE = 10;

interface PageProps {
  searchParams: Promise<{ keyword?: string; page?: string }>;
}

export const metadata = {
  title: "研究機関一覧 | 研究管理システム",
};

async function InstitutionTable({
  keyword,
  page,
}: {
  keyword: string;
  page: number;
}) {
  const result = await listEntities<Institution>("institutions", {
    page,
    pageSize: PAGE_SIZE,
    keyword: keyword || undefined,
  });

  if (result.total === 0) {
    return (
      <div className="text-center py-16 text-[#595959]">
        {keyword ? (
          <p>「{keyword}」に一致する研究機関が見つかりませんでした。</p>
        ) : (
          <p>研究機関が登録されていません。新規登録から追加してください。</p>
        )}
      </div>
    );
  }

  return (
    <>
      {/* テーブル */}
      <div className="w-full overflow-x-auto rounded-lg border border-[#EBEBEB] shadow-[var(--shadow-1)]">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-[#EBEBEB]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#595959] uppercase tracking-wider border-b border-[#CCCCCC]">名称</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#595959] uppercase tracking-wider border-b border-[#CCCCCC]">所在地</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#595959] uppercase tracking-wider border-b border-[#CCCCCC]">設立年</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#595959] uppercase tracking-wider border-b border-[#CCCCCC]">登録日</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#595959] uppercase tracking-wider border-b border-[#CCCCCC]">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBEBEB] bg-white">
            {result.data.map((institution) => (
              <tr key={institution.id} className="hover:bg-[#F5F5F5] transition-colors duration-100">
                <td className="px-4 py-3 font-medium text-[#1A1A1C]">{institution.name}</td>
                <td className="px-4 py-3 text-[#595959]">{institution.location ?? "—"}</td>
                <td className="px-4 py-3 text-[#595959]">{institution.founded_year ?? "—"}</td>
                <td className="px-4 py-3 text-[#595959]">
                  {new Date(institution.created_at).toLocaleDateString("ja-JP")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/institutions/${institution.id}`}
                      className="inline-flex items-center justify-center h-7 px-3 text-sm font-bold rounded-md border-2 border-[#0017C1] text-[#0017C1] bg-white hover:bg-[#E6E8FB] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
                    >
                      詳細
                    </Link>
                    <DeleteButton id={institution.id} name={institution.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      <Pagination page={page} pageSize={PAGE_SIZE} total={result.total} />
    </>
  );
}

export default async function InstitutionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const keyword = params.keyword ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  return (
    <div>
      {/* ページヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#1A1A1C] flex items-center gap-2">
          <Building2 size={28} aria-hidden="true" />
          研究機関
        </h1>
        <Link
          href="/institutions/new"
          className="inline-flex items-center justify-center gap-2 h-12 px-6 text-base font-bold rounded-md bg-[#0017C1] text-white hover:bg-[#0014A8] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:text-[#1A1A1C] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
        >
          <Plus size={18} aria-hidden="true" />
          新規登録
        </Link>
      </div>

      {/* 検索バー */}
      <Suspense>
        <SearchFilterBar placeholder="名称で検索" />
      </Suspense>

      {/* テーブル */}
      <Suspense
        fallback={
          <div className="text-center py-16 text-[#595959]">読み込み中...</div>
        }
      >
        <InstitutionTable keyword={keyword} page={page} />
      </Suspense>
    </div>
  );
}
