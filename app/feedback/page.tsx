"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Star } from "lucide-react";
import { listFeedbacks } from "../../lib/services/feedbackService";
import type { Feedback, FeedbackCategory } from "../../lib/types";

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

export default function FeedbackListPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(false);
      try {
        const result = await listFeedbacks({ page: 1, pageSize: 50, sortBy: "created_at", sortOrder: "desc" });
        setFeedbacks(result.data);
        setTotal(result.total);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={28} aria-hidden="true" />
        <h1 className="text-3xl font-bold text-[#1A1A1C]">フィードバック一覧</h1>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[#EBEBEB] rounded-lg animate-pulse" aria-hidden="true" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-[#FDECEA] border-l-4 border-l-[#E60012] text-[#B80012] px-4 py-3 rounded-lg">
          データの取得に失敗しました。ページを再読み込みしてください。
        </div>
      )}

      {!loading && !error && feedbacks.length === 0 && (
        <div className="text-center py-16 text-[#595959]">
          <MessageSquare size={48} className="mx-auto mb-3 text-[#CCCCCC]" aria-hidden="true" />
          <p>まだフィードバックはありません</p>
          <p className="text-sm mt-1">画面右下のボタンからフィードバックを送ることができます</p>
        </div>
      )}

      {!loading && !error && feedbacks.length > 0 && (
        <>
          <p className="text-sm text-[#595959] mb-4">全 {total} 件</p>
          <div className="space-y-3">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="bg-white rounded-lg border border-[#EBEBEB] shadow-[var(--shadow-1)] p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-sm ${categoryBadgeClass[fb.category]}`}>
                      {categoryLabel[fb.category]}
                    </span>
                    {fb.score !== null && (
                      <span className="inline-flex items-center gap-0.5 text-sm text-[#FF9900]">
                        <Star size={14} className="fill-[#FF9900]" aria-hidden="true" />
                        <span>{fb.score}</span>
                      </span>
                    )}
                  </div>
                  <time className="text-xs text-[#949494] shrink-0">
                    {new Date(fb.created_at).toLocaleDateString("ja-JP", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </time>
                </div>
                <p className="text-base font-bold text-[#1A1A1C] mb-1">{fb.title}</p>
                <p className="text-sm text-[#595959] line-clamp-2">{fb.content}</p>
                <p className="text-xs text-[#949494] mt-2 font-mono">{fb.source_page}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
