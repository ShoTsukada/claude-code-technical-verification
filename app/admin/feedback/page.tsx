"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { LayoutDashboard, RefreshCw, Star, ChevronDown } from "lucide-react";
import { getFeedbackSummary, listFeedbacks, updateFeedbackStatus } from "../../../lib/services/feedbackService";
import { useToast } from "../../contexts/ToastContext";
import { Spinner } from "../../components/LoadingSpinner";
import type { Feedback, FeedbackCategory, FeedbackStatus, FeedbackSummary } from "../../../lib/types";

// Recharts は SSR 非対応のため遅延ロード
const FeedbackCharts = dynamic(() => import("./_components/FeedbackCharts"), { ssr: false });

// ラベル定義
const categoryLabel: Record<FeedbackCategory, string> = {
  improvement: "改善要望",
  bug: "不具合報告",
  other: "その他",
};
const categoryBadgeClass: Record<FeedbackCategory, string> = {
  improvement: "bg-[#E6E8FB] text-[#0017C1]",
  bug: "bg-[#FDECEA] text-[#B80012]",
  other: "bg-[#EBEBEB] text-[#595959]",
};
const statusLabel: Record<FeedbackStatus, string> = {
  pending: "未対応",
  in_progress: "対応中",
  resolved: "対応済み",
  rejected: "却下",
};
const statusBadgeClass: Record<FeedbackStatus, string> = {
  pending: "bg-[#FFF5E0] text-[#7A4500]",
  in_progress: "bg-[#E6E8FB] text-[#0017C1]",
  resolved: "bg-[#E8F7EE] text-[#006E28]",
  rejected: "bg-[#EBEBEB] text-[#595959]",
};

export default function FeedbackDashboardPage() {
  const { showToast } = useToast();

  // 集計
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // 一覧
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(true);

  // フィルタ
  const [filterCategory, setFilterCategory] = useState<FeedbackCategory | "">("");
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | "">("");
  const [filterPage, setFilterPage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "score">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // 選択・編集
  const [selected, setSelected] = useState<Feedback | null>(null);
  const [editStatus, setEditStatus] = useState<FeedbackStatus>("pending");
  const [editComment, setEditComment] = useState("");
  const [saving, setSaving] = useState(false);

  // 集計取得
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const data = await getFeedbackSummary();
      setSummary(data);
    } catch {
      /* サイレントに失敗 */
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // 一覧取得
  const fetchList = useCallback(async () => {
    setListLoading(true);
    try {
      const result = await listFeedbacks({
        page: 1,
        pageSize: 50,
        category: filterCategory || undefined,
        status: filterStatus || undefined,
        source_page: filterPage || undefined,
        keyword: keyword || undefined,
        sortBy,
        sortOrder,
      });
      setFeedbacks(result.data);
      setTotal(result.total);
    } catch {
      /* サイレントに失敗 */
    } finally {
      setListLoading(false);
    }
  }, [filterCategory, filterStatus, filterPage, keyword, sortBy, sortOrder]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);
  useEffect(() => { fetchList(); }, [fetchList]);

  const handleRefresh = () => {
    fetchSummary();
    fetchList();
  };

  // フィードバック選択
  const handleSelect = (fb: Feedback) => {
    setSelected(fb);
    setEditStatus(fb.status);
    setEditComment(fb.admin_comment ?? "");
  };

  // ステータス保存
  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateFeedbackStatus(selected.id, editStatus, editComment);
      showToast("success", "ステータスを更新しました");
      setSelected((prev) => prev ? { ...prev, status: editStatus, admin_comment: editComment } : null);
      fetchList();
      fetchSummary();
    } catch {
      showToast("error", "更新に失敗しました。もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full rounded-md border border-[#CCCCCC] bg-[#F5F5F5] px-3 py-2 text-sm text-[#1A1A1C] hover:border-[#767676] focus:outline-none focus:border-[#0017C1] focus:ring-2 focus:ring-[#0017C1]/20 focus:bg-white";

  return (
    <div>
      {/* ページヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#1A1A1C] flex items-center gap-2">
          <LayoutDashboard size={28} aria-hidden="true" />
          フィードバック管理
        </h1>
        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 h-9 px-4 text-sm font-bold rounded-md border-2 border-[#0017C1] text-[#0017C1] bg-white hover:bg-[#E6E8FB] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
        >
          <RefreshCw size={14} aria-hidden="true" />
          更新
        </button>
      </div>

      {/* サマリーカード */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#EBEBEB] rounded-lg animate-pulse" aria-hidden="true" />
          ))}
        </div>
      ) : summary && summary.total === 0 ? (
        <div className="text-center py-12 text-[#595959] mb-6">
          <p className="text-lg font-bold">フィードバックはまだありません</p>
          <p className="text-sm mt-1">画面右下のボタンからフィードバックを投稿できます</p>
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-[#EBEBEB] shadow-[var(--shadow-2)] p-4 text-center">
              <p className="text-sm text-[#595959] mb-1">総件数</p>
              <p className="text-3xl font-bold text-[#1A1A1C]">{summary.total}</p>
              <p className="text-xs text-[#949494]">件</p>
            </div>
            <div className="bg-white rounded-lg border border-[#EBEBEB] shadow-[var(--shadow-2)] p-4 text-center">
              <p className="text-sm text-[#595959] mb-1">改善要望</p>
              <p className="text-3xl font-bold text-[#0017C1]">{summary.byCategory.improvement}</p>
              <p className="text-xs text-[#949494]">件</p>
            </div>
            <div className="bg-white rounded-lg border border-[#EBEBEB] shadow-[var(--shadow-2)] p-4 text-center">
              <p className="text-sm text-[#595959] mb-1">不具合報告</p>
              <p className="text-3xl font-bold text-[#E60012]">{summary.byCategory.bug}</p>
              <p className="text-xs text-[#949494]">件</p>
            </div>
            <div className="bg-white rounded-lg border border-[#EBEBEB] shadow-[var(--shadow-2)] p-4 text-center">
              <p className="text-sm text-[#595959] mb-1">平均スコア</p>
              <div className="flex items-center justify-center gap-1">
                <Star size={20} className="text-[#FF9900] fill-[#FF9900]" aria-hidden="true" />
                <p className="text-3xl font-bold text-[#1A1A1C]">
                  {summary.averageScore ?? "—"}
                </p>
              </div>
            </div>
          </div>

          {/* グラフ（SSR無効で遅延ロード） */}
          <FeedbackCharts summary={summary} />
        </>
      ) : null}

      {/* フィードバック一覧セクション */}
      <div className={`grid gap-6 ${selected ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* 左：フィルタ＋一覧 */}
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1C] mb-3">フィードバック一覧</h2>

          {/* フィルタ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as FeedbackCategory | "")} aria-label="カテゴリで絞り込み" className={inputClass}>
              <option value="">カテゴリ: すべて</option>
              {(Object.entries(categoryLabel) as [FeedbackCategory, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FeedbackStatus | "")} aria-label="ステータスで絞り込み" className={inputClass}>
              <option value="">ステータス: すべて</option>
              {(Object.entries(statusLabel) as [FeedbackStatus, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <input type="text" value={filterPage} onChange={(e) => setFilterPage(e.target.value)} placeholder="画面名で絞り込み" aria-label="画面名で絞り込み" className={inputClass} />
            <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="キーワード検索" aria-label="キーワード検索" className={inputClass} />
          </div>

          {/* ソート */}
          <div className="flex items-center gap-2 mb-3">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "created_at" | "score")} aria-label="ソート項目" className={`${inputClass} w-auto`}>
              <option value="created_at">投稿日時順</option>
              <option value="score">スコア順</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder((o) => o === "asc" ? "desc" : "asc")}
              aria-label={sortOrder === "desc" ? "昇順に切り替え" : "降順に切り替え"}
              className="inline-flex items-center gap-1 h-9 px-3 text-sm border border-[#CCCCCC] rounded-md bg-[#F5F5F5] hover:border-[#767676] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0017C1]"
            >
              <ChevronDown size={14} className={`transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`} aria-hidden="true" />
              {sortOrder === "desc" ? "降順" : "昇順"}
            </button>
            <span className="text-sm text-[#595959] ml-auto">{total} 件</span>
          </div>

          {/* テーブル */}
          {listLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-[#EBEBEB] rounded-lg animate-pulse" aria-hidden="true" />)}
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12 text-[#949494] text-sm">条件に一致するフィードバックがありません</div>
          ) : (
            <div className="space-y-2">
              {feedbacks.map((fb) => (
                <button
                  key={fb.id}
                  type="button"
                  onClick={() => handleSelect(fb)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0017C1] ${
                    selected?.id === fb.id
                      ? "border-[#0017C1] bg-[#E6E8FB]"
                      : "border-[#EBEBEB] bg-white hover:bg-[#F5F5F5]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-sm ${categoryBadgeClass[fb.category]}`}>
                      {categoryLabel[fb.category]}
                    </span>
                    <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-sm ${statusBadgeClass[fb.status]}`}>
                      {statusLabel[fb.status]}
                    </span>
                    {fb.score !== null && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-[#FF9900]">
                        <Star size={12} className="fill-[#FF9900]" aria-hidden="true" />
                        {fb.score}
                      </span>
                    )}
                    <time className="text-xs text-[#949494] ml-auto">
                      {new Date(fb.created_at).toLocaleDateString("ja-JP")}
                    </time>
                  </div>
                  <p className="text-sm font-medium text-[#1A1A1C] truncate">{fb.title}</p>
                  <p className="text-xs text-[#949494] font-mono truncate">{fb.source_page}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 右：詳細・ステータス管理 */}
        {selected && (
          <div className="bg-white rounded-lg border border-[#EBEBEB] shadow-[var(--shadow-2)] p-5 self-start sticky top-6">
            <div className="flex items-start justify-between gap-2 mb-4">
              <h3 className="text-xl font-bold text-[#1A1A1C]">{selected.title}</h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="詳細を閉じる"
                className="shrink-0 text-[#595959] hover:text-[#1A1A1C] p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0017C1]"
              >
                ✕
              </button>
            </div>

            {/* 投稿情報 */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-sm ${categoryBadgeClass[selected.category]}`}>
                {categoryLabel[selected.category]}
              </span>
              {selected.score !== null && (
                <span className="inline-flex items-center gap-0.5 text-sm text-[#FF9900]">
                  <Star size={14} className="fill-[#FF9900]" aria-hidden="true" />
                  {selected.score}点
                </span>
              )}
            </div>
            <p className="text-base text-[#1A1A1C] whitespace-pre-wrap mb-3">{selected.content}</p>
            <p className="text-xs text-[#949494] font-mono mb-1">画面：{selected.source_page}</p>
            <time className="text-xs text-[#949494]">
              投稿日：{new Date(selected.created_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
            </time>

            <hr className="my-4 border-[#EBEBEB]" />

            {/* ステータス変更 */}
            <div className="space-y-3">
              <div>
                <label htmlFor="edit-status" className="block text-sm font-bold text-[#1A1A1C] mb-1">ステータス</label>
                <select
                  id="edit-status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as FeedbackStatus)}
                  className={inputClass}
                >
                  {(Object.entries(statusLabel) as [FeedbackStatus, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit-comment" className="block text-sm font-bold text-[#1A1A1C] mb-1">対応コメント</label>
                <textarea
                  id="edit-comment"
                  rows={3}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder="対応内容や補足を入力"
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 h-10 text-sm font-bold rounded-md bg-[#0017C1] text-white hover:bg-[#0014A8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:text-[#1A1A1C] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
              >
                {saving && <Spinner size={14} />}
                保存する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
