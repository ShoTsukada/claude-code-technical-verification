import Link from "next/link";
import { ChevronLeft, Pencil, Building2, MapPin, Calendar, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { getEntity } from "../../../lib/services/entityService";
import type { Institution } from "../../../lib/types";
import DeleteButton from "../_components/DeleteButton";
import AssociationSection from "../../components/AssociationSection";

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  try {
    const institution = await getEntity<Institution>("institutions", id);
    return { title: `${institution.name} | 研究管理システム` };
  } catch {
    return { title: "研究機関詳細 | 研究管理システム" };
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InstitutionDetailPage({ params }: PageProps) {
  const { id } = await params;

  let institution: Institution;
  try {
    institution = await getEntity<Institution>("institutions", id);
  } catch {
    notFound();
  }

  return (
    <div>
      {/* 戻るリンク */}
      <Link
        href="/institutions"
        className="inline-flex items-center gap-1 text-[#0017C1] text-sm hover:underline mb-4 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C] rounded"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        一覧へ戻る
      </Link>

      {/* ページヘッダー */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-[#1A1A1C] flex items-center gap-2">
          <Building2 size={28} aria-hidden="true" />
          {institution.name}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/institutions/${id}/edit`}
            className="inline-flex items-center justify-center gap-1 h-9 px-4 text-sm font-bold rounded-md border-2 border-[#0017C1] text-[#0017C1] bg-white hover:bg-[#E6E8FB] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
          >
            <Pencil size={14} aria-hidden="true" />
            編集
          </Link>
          <DeleteButton
            id={institution.id}
            name={institution.name}
            redirectTo="/institutions"
            size="sm"
          />
        </div>
      </div>

      {/* 詳細情報カード */}
      <div className="bg-white rounded-lg border border-[#EBEBEB] shadow-[var(--shadow-1)] p-6 mb-6">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <MapPin size={18} className="text-[#595959] mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <dt className="text-sm text-[#595959]">所在地</dt>
              <dd className="text-base text-[#1A1A1C]">{institution.location ?? "未登録"}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar size={18} className="text-[#595959] mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <dt className="text-sm text-[#595959]">設立年</dt>
              <dd className="text-base text-[#1A1A1C]">
                {institution.founded_year ? `${institution.founded_year}年` : "未登録"}
              </dd>
            </div>
          </div>
          {institution.description && (
            <div className="md:col-span-2 flex items-start gap-2">
              <FileText size={18} className="text-[#595959] mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <dt className="text-sm text-[#595959]">概要</dt>
                <dd className="text-base text-[#1A1A1C] whitespace-pre-wrap">{institution.description}</dd>
              </div>
            </div>
          )}
        </dl>
      </div>

      {/* 関連する研究テーマ */}
      <AssociationSection
        sectionId="themes-heading"
        title="関連する研究テーマ"
        parentId={institution.id}
        parentIdColumn="institution_id"
        relatedIdColumn="theme_id"
        associationTable="institution_themes"
        entityTable="research_themes"
        displayColumn="title"
        badgeColumn="field"
        detailPath="/themes"
        selectorTitle="研究テーマを追加"
      />

      {/* 関連する投資家 */}
      <AssociationSection
        sectionId="investors-heading"
        title="関連する投資家"
        parentId={institution.id}
        parentIdColumn="institution_id"
        relatedIdColumn="investor_id"
        associationTable="institution_investors"
        entityTable="investors"
        displayColumn="name"
        badgeColumn="type"
        detailPath="/investors"
        selectorTitle="投資家を追加"
      />
    </div>
  );
}
