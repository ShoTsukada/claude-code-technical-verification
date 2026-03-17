"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { addAssociation, removeAssociation } from "../../lib/services/associationService";
import { useToast } from "../contexts/ToastContext";
import AssociationSelector from "./AssociationSelector";
import ConfirmDialog from "./ConfirmDialog";
import type { AssociationTable, EntityTable } from "../../lib/types";

// 種別ラベル変換
const formatBadge = (col: string, val: unknown): string => {
  if (col === "type") {
    return val === "individual" ? "個人" : val === "corporate" ? "法人" : String(val ?? "");
  }
  return String(val ?? "");
};

interface AssociationSectionProps {
  sectionId: string;
  title: string;
  parentId: string;
  parentIdColumn: string;      // "institution_id" | "theme_id" | "investor_id"
  relatedIdColumn: string;     // "theme_id" | "investor_id" | "institution_id"
  associationTable: AssociationTable;
  entityTable: EntityTable;
  displayColumn: string;       // "name" | "title"
  badgeColumn?: string;        // "field" | "type" など
  detailPath: string;          // "/themes" | "/investors" など
  selectorTitle: string;
}

interface AssociationRow {
  associationId: string;
  entityId: string;
  name: string;
  badge?: string;
}

export default function AssociationSection({
  sectionId,
  title,
  parentId,
  parentIdColumn,
  relatedIdColumn,
  associationTable,
  entityTable,
  displayColumn,
  badgeColumn,
  detailPath,
  selectorTitle,
}: AssociationSectionProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [associations, setAssociations] = useState<AssociationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<AssociationRow | null>(null);
  const [removing, setRemoving] = useState(false);

  // 関連付け一覧を取得
  const fetchAssociations = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(associationTable)
      .select(`id, ${relatedIdColumn}, ${entityTable}(*)`)
      .eq(parentIdColumn, parentId)
      .order("created_at", { ascending: false });

    if (error) {
      setLoading(false);
      return;
    }

    const rows: AssociationRow[] = (data as unknown as Record<string, unknown>[] ?? []).map((row) => {
      const entity = row[entityTable] as Record<string, unknown> | null ?? {};
      return {
        associationId: String(row.id),
        entityId: String(row[relatedIdColumn]),
        name: String(entity[displayColumn] ?? ""),
        badge: badgeColumn ? formatBadge(badgeColumn, entity[badgeColumn]) : undefined,
      };
    });
    setAssociations(rows);
    setLoading(false);
  }, [associationTable, entityTable, parentId, parentIdColumn, relatedIdColumn, displayColumn, badgeColumn]);

  useEffect(() => {
    fetchAssociations();
  }, [fetchAssociations]);

  // 関連付け追加
  const handleSelect = async (entity: { id: string }) => {
    try {
      await addAssociation(associationTable, {
        [parentIdColumn]: parentId,
        [relatedIdColumn]: entity.id,
      } as Parameters<typeof addAssociation>[1]);
      showToast("success", "関連付けを追加しました");
      await fetchAssociations();
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "すでに関連付けられています") {
        showToast("warning", "すでに関連付けられています");
      } else {
        showToast("error", "追加に失敗しました。もう一度お試しください。");
      }
    }
  };

  // 関連付け解除
  const handleRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await removeAssociation(associationTable, removeTarget.associationId);
      showToast("success", "関連付けを解除しました");
      setRemoveTarget(null);
      await fetchAssociations();
      router.refresh();
    } catch {
      showToast("error", "解除に失敗しました。もう一度お試しください。");
    } finally {
      setRemoving(false);
    }
  };

  const excludeIds = associations.map((a) => a.entityId);

  return (
    <section aria-labelledby={sectionId} className="mb-6">
      {/* セクションヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <h2 id={sectionId} className="text-2xl font-bold text-[#1A1A1C]">{title}</h2>
        <button
          type="button"
          onClick={() => setSelectorOpen(true)}
          className="inline-flex items-center justify-center gap-1 h-9 px-4 text-sm font-bold rounded-md border-2 border-[#0017C1] text-[#0017C1] bg-white hover:bg-[#E6E8FB] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
        >
          <Plus size={14} aria-hidden="true" />
          追加
        </button>
      </div>

      {/* 関連付け一覧 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[#EBEBEB] rounded-lg animate-pulse" aria-hidden="true" />
          ))}
        </div>
      ) : associations.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#EBEBEB] p-6 text-center text-[#949494] text-sm">
          関連付けられた{title.replace("関連する", "")}はありません
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {associations.map((assoc) => (
            <div
              key={assoc.associationId}
              className="bg-[#F5F5F5] rounded-lg border border-[#EBEBEB] p-4 flex items-start justify-between gap-2"
            >
              <div className="min-w-0">
                <Link
                  href={`${detailPath}/${assoc.entityId}`}
                  className="text-base font-medium text-[#0017C1] hover:underline truncate block focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C] rounded"
                >
                  {assoc.name}
                </Link>
                {assoc.badge && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded-sm bg-[#E6E8FB] text-[#0017C1]">
                    {assoc.badge}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setRemoveTarget(assoc)}
                aria-label={`「${assoc.name}」との関連付けを解除`}
                className="shrink-0 inline-flex items-center justify-center gap-1 h-7 px-2 text-xs font-bold rounded border border-[#E60012] text-[#E60012] bg-white hover:bg-[#FDECEA] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:text-[#1A1A1C] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
              >
                <X size={12} aria-hidden="true" />
                解除
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 追加セレクタ（条件レンダリングでアンマウント時にstate自動リセット） */}
      {selectorOpen && (
        <AssociationSelector
          isOpen={selectorOpen}
          onClose={() => setSelectorOpen(false)}
          title={selectorTitle}
          entityTable={entityTable}
          displayColumn={displayColumn}
          subColumn={badgeColumn}
          excludeIds={excludeIds}
          onSelect={handleSelect}
        />
      )}

      {/* 解除確認ダイアログ */}
      <ConfirmDialog
        isOpen={!!removeTarget}
        title="関連付けを解除しますか？"
        message={`「${removeTarget?.name ?? ""}」との関連付けを解除します。エンティティ本体は削除されません。`}
        confirmLabel={removing ? "解除中..." : "解除する"}
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </section>
  );
}
