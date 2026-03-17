import Link from "next/link";
import { ChevronLeft, Pencil, FlaskConical, Tag, Calendar, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { getEntity } from "../../../lib/services/entityService";
import type { ResearchTheme } from "../../../lib/types";
import DeleteButton from "../_components/DeleteButton";
import AssociationSection from "../../components/AssociationSection";

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  try {
    const theme = await getEntity<ResearchTheme>("research_themes", id);
    return { title: `${theme.title} | 研究管理システム` };
  } catch {
    return { title: "研究テーマ詳細 | 研究管理システム" };
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ThemeDetailPage({ params }: PageProps) {
  const { id } = await params;

  let theme: ResearchTheme;
  try {
    theme = await getEntity<ResearchTheme>("research_themes", id);
  } catch {
    notFound();
  }

  return (
    <div>
      <Link
        href="/themes"
        className="inline-flex items-center gap-1 text-[#0017C1] text-sm hover:underline mb-4 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C] rounded"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        一覧へ戻る
      </Link>

      {/* ページヘッダー */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-[#1A1A1C] flex items-center gap-2">
          <FlaskConical size={28} aria-hidden="true" />
          {theme.title}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/themes/${id}/edit`}
            className="inline-flex items-center justify-center gap-1 h-9 px-4 text-sm font-bold rounded-md border-2 border-[#0017C1] text-[#0017C1] bg-white hover:bg-[#E6E8FB] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
          >
            <Pencil size={14} aria-hidden="true" />
            編集
          </Link>
          <DeleteButton id={theme.id} title={theme.title} redirectTo="/themes" size="sm" />
        </div>
      </div>

      {/* 詳細情報カード */}
      <div className="bg-white rounded-lg border border-[#EBEBEB] shadow-[var(--shadow-1)] p-6 mb-6">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <Tag size={18} className="text-[#595959] mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <dt className="text-sm text-[#595959]">分野</dt>
              <dd>
                <span className="inline-block mt-1 px-2 py-0.5 text-sm font-bold rounded-sm bg-[#E6E8FB] text-[#0017C1]">
                  {theme.field}
                </span>
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar size={18} className="text-[#595959] mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <dt className="text-sm text-[#595959]">開始年</dt>
              <dd className="text-base text-[#1A1A1C]">
                {theme.start_year ? `${theme.start_year}年` : "未登録"}
              </dd>
            </div>
          </div>
          {theme.description && (
            <div className="md:col-span-2 flex items-start gap-2">
              <FileText size={18} className="text-[#595959] mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <dt className="text-sm text-[#595959]">説明</dt>
                <dd className="text-base text-[#1A1A1C] whitespace-pre-wrap">{theme.description}</dd>
              </div>
            </div>
          )}
        </dl>
      </div>

      {/* 関連する研究機関 */}
      <AssociationSection
        sectionId="institutions-heading"
        title="関連する研究機関"
        parentId={theme.id}
        parentIdColumn="theme_id"
        relatedIdColumn="institution_id"
        associationTable="institution_themes"
        entityTable="institutions"
        displayColumn="name"
        detailPath="/institutions"
        selectorTitle="研究機関を追加"
      />

      {/* 関連する投資家 */}
      <AssociationSection
        sectionId="investors-heading"
        title="関連する投資家"
        parentId={theme.id}
        parentIdColumn="theme_id"
        relatedIdColumn="investor_id"
        associationTable="theme_investors"
        entityTable="investors"
        displayColumn="name"
        badgeColumn="type"
        detailPath="/investors"
        selectorTitle="投資家を追加"
      />
    </div>
  );
}
