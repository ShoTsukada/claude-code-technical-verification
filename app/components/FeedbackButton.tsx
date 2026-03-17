"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X, Star } from "lucide-react";
import { submitFeedback } from "../../lib/services/feedbackService";
import { useToast } from "../contexts/ToastContext";
import { Spinner } from "./LoadingSpinner";
import type { FeedbackCategory } from "../../lib/types";

interface FormValues {
  category: FeedbackCategory | "";
  title: string;
  content: string;
  score: number | null;
}

interface FormErrors {
  category?: string;
  title?: string;
  content?: string;
}

const initialValues: FormValues = {
  category: "",
  title: "",
  content: "",
  score: null,
};

const categoryOptions: { value: FeedbackCategory; label: string }[] = [
  { value: "improvement", label: "改善要望" },
  { value: "bug", label: "不具合報告" },
  { value: "other", label: "その他" },
];

export default function FeedbackButton() {
  const pathname = usePathname();
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [pageTitle, setPageTitle] = useState("");

  // document.title はブラウザでのみ取得
  useEffect(() => {
    if (isOpen) {
      setPageTitle(document.title);
    }
  }, [isOpen]);

  // Escape で閉じる
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setValues(initialValues);
    setErrors({});
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!values.category) errs.category = "カテゴリを選択してください";
    if (!values.title.trim()) errs.title = "タイトルは必須です";
    if (!values.content.trim()) errs.content = "内容は必須です";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await submitFeedback({
        category: values.category as FeedbackCategory,
        title: values.title.trim(),
        content: values.content.trim(),
        score: values.score ?? undefined,
        source_url: pathname,
        source_page: pageTitle || pathname,
      });
      showToast("success", "フィードバックを送信しました。ありがとうございます！");
      handleClose();
    } catch {
      showToast("error", "送信に失敗しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError?: string) =>
    [
      "w-full rounded-md border bg-[#F5F5F5] px-4 py-3 text-base text-[#1A1A1C] leading-normal",
      "placeholder:text-[#949494] hover:border-[#767676]",
      "focus:outline-none focus:border-[#0017C1] focus:ring-2 focus:ring-[#0017C1]/20 focus:bg-white",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      hasError ? "border-[#E60012] ring-2 ring-[#E60012]/20" : "border-[#CCCCCC]",
    ].join(" ");

  return (
    <>
      {/* フローティングボタン */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="フィードバックを送る"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 h-12 px-5 text-base font-bold rounded-full bg-[#0017C1] text-white shadow-[var(--shadow-3)] hover:bg-[#0014A8] active:bg-[#00108C] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:text-[#1A1A1C] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
      >
        <MessageSquare size={18} aria-hidden="true" />
        フィードバック
      </button>

      {/* モーダル */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.45)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
        >
          <div className="w-full max-w-lg rounded-xl bg-white shadow-[var(--shadow-4)] flex flex-col max-h-[90vh]">
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB]">
              <h2 id="feedback-modal-title" className="text-xl font-bold text-[#1A1A1C]">
                フィードバックを送る
              </h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label="閉じる"
                className="p-1 rounded-md text-[#595959] hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* フォーム */}
            <form onSubmit={handleSubmit} noValidate className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {/* カテゴリ（必須） */}
              <fieldset>
                <legend className="block text-base font-bold text-[#1A1A1C] mb-2">
                  カテゴリ
                  <span aria-hidden="true" className="text-[#E60012] ml-1">*</span>
                </legend>
                <div className="flex flex-wrap gap-4" role="radiogroup" aria-required="true" aria-invalid={!!errors.category} aria-describedby={errors.category ? "cat-error" : undefined}>
                  {categoryOptions.map(({ value, label }) => (
                    <label key={value} className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={value}
                        checked={values.category === value}
                        onChange={() => {
                          setValues((prev) => ({ ...prev, category: value }));
                          if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                        }}
                        disabled={submitting}
                        className="w-4 h-4 accent-[#0017C1]"
                      />
                      <span className="text-base text-[#1A1A1C]">{label}</span>
                    </label>
                  ))}
                </div>
                {errors.category && (
                  <p id="cat-error" role="alert" className="mt-1 text-sm text-[#E60012]">{errors.category}</p>
                )}
              </fieldset>

              {/* タイトル（必須） */}
              <div>
                <label htmlFor="fb-title" className="block text-base font-bold text-[#1A1A1C] mb-1">
                  タイトル
                  <span aria-hidden="true" className="text-[#E60012] ml-1">*</span>
                </label>
                <input
                  id="fb-title"
                  type="text"
                  value={values.title}
                  onChange={(e) => {
                    setValues((prev) => ({ ...prev, title: e.target.value }));
                    if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                  aria-required="true"
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? "title-error" : undefined}
                  placeholder="フィードバックのタイトル"
                  disabled={submitting}
                  className={inputClass(errors.title)}
                />
                {errors.title && (
                  <p id="title-error" role="alert" className="mt-1 text-sm text-[#E60012]">{errors.title}</p>
                )}
              </div>

              {/* 内容（必須） */}
              <div>
                <label htmlFor="fb-content" className="block text-base font-bold text-[#1A1A1C] mb-1">
                  内容
                  <span aria-hidden="true" className="text-[#E60012] ml-1">*</span>
                </label>
                <textarea
                  id="fb-content"
                  rows={4}
                  value={values.content}
                  onChange={(e) => {
                    setValues((prev) => ({ ...prev, content: e.target.value }));
                    if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
                  }}
                  aria-required="true"
                  aria-invalid={!!errors.content}
                  aria-describedby={errors.content ? "content-error" : undefined}
                  placeholder="詳細を記入してください"
                  disabled={submitting}
                  className={inputClass(errors.content)}
                />
                {errors.content && (
                  <p id="content-error" role="alert" className="mt-1 text-sm text-[#E60012]">{errors.content}</p>
                )}
              </div>

              {/* 星評価（任意） */}
              <div>
                <p className="text-base font-bold text-[#1A1A1C] mb-2">評価（任意）</p>
                <div className="flex gap-1" role="group" aria-label="評価を1〜5で選択">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setValues((prev) => ({ ...prev, score: prev.score === n ? null : n }))}
                      disabled={submitting}
                      aria-label={`${n}点`}
                      aria-pressed={values.score === n}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0017C1] rounded"
                    >
                      <Star
                        size={28}
                        className={`transition-colors duration-100 ${
                          values.score !== null && n <= values.score
                            ? "text-[#FF9900] fill-[#FF9900]"
                            : "text-[#CCCCCC]"
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* 投稿元情報（読み取り専用） */}
              <p className="text-sm text-[#595959]">
                投稿元：<span className="font-mono">{pathname}</span>
              </p>
            </form>

            {/* フッター */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#EBEBEB]">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="inline-flex items-center justify-center h-12 px-6 text-base font-bold rounded-md border-2 border-[#0017C1] text-[#0017C1] bg-white hover:bg-[#E6E8FB] disabled:opacity-50 transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
              >
                キャンセル
              </button>
              <button
                type="submit"
                form=""
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 text-base font-bold rounded-md bg-[#0017C1] text-white hover:bg-[#0014A8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:text-[#1A1A1C] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
              >
                {submitting && <Spinner size={16} />}
                送信する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
