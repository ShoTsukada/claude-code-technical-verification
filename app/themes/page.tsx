import Link from "next/link";
import { Plus, FlaskConical } from "lucide-react";
import { Suspense } from "react";
import { listEntities } from "../../lib/services/entityService";
import { supabase } from "../../lib/supabase";
import type { ResearchTheme } from "../../lib/types";
import SearchFilterBar from "../components/SearchFilterBar";
import Pagination from "../components/Pagination";
import DeleteButton from "./_components/DeleteButton";

const PAGE_SIZE = 10;

export const metadata = {
  title: "研究テーマ一覧 | 研究管理システム",
};

// 登録済みの分野一覧を取得（フィルタの選択肢として使用）
async function getDistinctFields(): Promise<string[]> {
  const { data } = await supabase
    .from("research_themes")
    .select("field")
    .order("field");
  if (!data) return [];
  const unique = [...new Set(data.map((r) => r.field as string))];
  return unique;
}

interface PageProps {
  searchParams: Promise<{ keyword?: string; field?: string; page?: string }>;
}

async function ThemeTable({
  keyword,
  field,
  page,
}: {
  keyword: string;
  field: string;
  page: number;
}) {
  const result = await listEntities<ResearchTheme>("research_themes", {
    page,
    pageSize: PAGE_SIZE,
    keyword: keyword || undefined,
    field: field || undefined,
  });

  if (result.total === 0) {
    return (
      <div className="text-center py-16 text-[#595959]">
        {keyword || field ? (
          <p>条件に一致する研究テーマが見つかりませんでした。</p>
        ) : (
          <p>研究テーマが登録されていません。新規登録から追加してください。</p>
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
              <th className="px-4 py-3 text-left text-xs font-bold text-[#595959] uppercase tracking-wider border-b border-[#CCCCCC]">タイトル</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#595959] uppercase tracking-wider border-b border-[#CCCCCC]">分野</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#595959] uppercase tracking-wider border-b border-[#CCCCCC]">開始年</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#595959] uppercase tracking-wider border-b border-[#CCCCCC]">登録日</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-[#595959] uppercase tracking-wider border-b border-[#CCCCCC]">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBEBEB] bg-white">
            {result.data.map((theme) => (
              <tr key={theme.id} className="hover:bg-[#F5F5F5] transition-colors duration-100">
                <td className="px-4 py-3 font-medium text-[#1A1A1C]">{theme.title}</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-sm bg-[#E6E8FB] text-[#0017C1]">
                    {theme.field}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#595959]">{theme.start_year ?? "—"}</td>
                <td className="px-4 py-3 text-[#595959]">
                  {new Date(theme.created_at).toLocaleDateString("ja-JP")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/themes/${theme.id}`}
                      className="inline-flex items-center justify-center h-7 px-3 text-sm font-bold rounded-md border-2 border-[#0017C1] text-[#0017C1] bg-white hover:bg-[#E6E8FB] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
                    >
                      詳細
                    </Link>
                    <DeleteButton id={theme.id} title={theme.title} />
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

export default async function ThemesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const keyword = params.keyword ?? "";
  const field = params.field ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const fields = await getDistinctFields();
  const fieldOptions = fields.map((f) => ({ value: f, label: f }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#1A1A1C] flex items-center gap-2">
          <FlaskConical size={28} aria-hidden="true" />
          研究テーマ
        </h1>
        <Link
          href="/themes/new"
          className="inline-flex items-center justify-center gap-2 h-12 px-6 text-base font-bold rounded-md bg-[#0017C1] text-white hover:bg-[#0014A8] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:text-[#1A1A1C] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
        >
          <Plus size={18} aria-hidden="true" />
          新規登録
        </Link>
      </div>

      <Suspense>
        <SearchFilterBar
          placeholder="タイトルで検索"
          filterKey="field"
          filterOptions={fieldOptions}
          filterLabel="分野で絞り込み"
        />
      </Suspense>

      <Suspense fallback={<div className="text-center py-16 text-[#595959]">読み込み中...</div>}>
        <ThemeTable keyword={keyword} field={field} page={page} />
      </Suspense>
    </div>
  );
}
