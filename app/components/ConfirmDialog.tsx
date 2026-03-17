"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "削除する",
  cancelLabel = "キャンセル",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // ダイアログが開いたとき、キャンセルボタンにフォーカス
  useEffect(() => {
    if (isOpen) {
      cancelRef.current?.focus();
    }
  }, [isOpen]);

  // Escape キーで閉じる
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.45)]"
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-[var(--shadow-4)] p-6">
        {/* アイコン + タイトル */}
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle
            size={24}
            className="shrink-0 text-[#E60012] mt-0.5"
            aria-hidden="true"
          />
          <h2
            id="confirm-dialog-title"
            className="text-xl font-bold text-[#1A1A1C]"
          >
            {title}
          </h2>
        </div>

        {/* メッセージ */}
        <p
          id="confirm-dialog-message"
          className="text-base text-[#595959] mb-6 ml-9"
        >
          {message}
        </p>

        {/* アクションボタン */}
        <div className="flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center h-12 px-6 text-base font-bold rounded-md border-2 border-[#0017C1] text-[#0017C1] bg-white hover:bg-[#E6E8FB] active:bg-[#C0C5F5] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center h-12 px-6 text-base font-bold rounded-md bg-[#E60012] text-white hover:bg-[#B80012] active:bg-[#8C000D] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:text-[#1A1A1C] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
