"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { EntityTable } from "../../lib/types";

interface EntityRow {
  id: string;
  [key: string]: unknown;
}

interface AssociationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  entityTable: EntityTable;
  displayColumn: string;    // 表示するカラム名（"name" or "title"）
  subColumn?: string;       // サブ表示カラム（"field", "type" など）
  excludeIds?: string[];    // 除外するID（すでに関連付け済み）
  onSelect: (entity: EntityRow) => void;
}

// 種別ラベル変換
const subColumnLabel = (col: string, val: unknown): string => {
  if (col === "type") {
    return val === "individual" ? "個人" : val === "corporate" ? "法人" : String(val);
  }
  return String(val ?? "");
};

export default function AssociationSelector({
  isOpen,
  onClose,
  title,
  entityTable,
  displayColumn,
  subColumn,
  excludeIds = [],
  onSelect,
}: AssociationSelectorProps) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<EntityRow[]>([]);
  const [loading, setLoading] = useState(false);

  // キーワード変更時に検索
  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(async () => {
      setLoading(true);
      let query = supabase.from(entityTable).select("*").order("created_at", { ascending: false });
      if (keyword) {
        query = query.ilike(displayColumn, `%${keyword}%`);
      }
      const { data } = await query.limit(30);
      const filtered = (data ?? []).filter(
        (row: EntityRow) => !excludeIds.includes(row.id)
      );
      setResults(filtered as EntityRow[]);
      setLoading(false);
    }, 200);
    return () => clearTimeout(timeout);
  }, [keyword, isOpen, entityTable, displayColumn, excludeIds]);

  // Escape で閉じる
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.45)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="selector-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-[var(--shadow-4)] flex flex-col max-h-[80vh]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB]">
          <h2 id="selector-title" className="text-xl font-bold text-[#1A1A1C]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="p-1 rounded-md focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* 検索 */}
        <div className="px-6 py-3 border-b border-[#EBEBEB]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#949494]" aria-hidden="true" />
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="キーワードで検索"
              autoFocus
              className="w-full rounded-md border border-[#CCCCCC] bg-[#F5F5F5] pl-9 pr-4 py-2 text-base text-[#1A1A1C] placeholder:text-[#949494] focus:outline-none focus:border-[#0017C1] focus:ring-2 focus:ring-[#0017C1]/20 focus:bg-white"
            />
          </div>
        </div>

        {/* 結果リスト */}
        <ul className="overflow-y-auto flex-1 divide-y divide-[#EBEBEB]" role="listbox" aria-label="選択候補">
          {loading && (
            <li className="px-6 py-4 text-sm text-[#949494] text-center">検索中...</li>
          )}
          {!loading && results.length === 0 && (
            <li className="px-6 py-4 text-sm text-[#949494] text-center">
              {keyword ? "該当する項目が見つかりませんでした" : "候補がありません"}
            </li>
          )}
          {!loading && results.map((entity) => (
            <li key={entity.id} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => { onSelect(entity); onClose(); }}
                className="w-full text-left px-6 py-3 hover:bg-[#F5F5F5] transition-colors duration-100 focus-visible:outline-none focus-visible:bg-[#E6E8FB]"
              >
                <p className="text-base font-medium text-[#1A1A1C]">
                  {String(entity[displayColumn] ?? "")}
                </p>
                {subColumn && entity[subColumn] != null && (
                  <p className="text-sm text-[#595959]">
                    {subColumnLabel(subColumn, entity[subColumn])}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
