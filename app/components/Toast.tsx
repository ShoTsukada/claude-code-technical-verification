"use client";

import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToast, type ToastType } from "../contexts/ToastContext";

// 種別ごとのスタイルとアイコン
const variants: Record<
  ToastType,
  { container: string; icon: string; IconComponent: React.ElementType; label: string }
> = {
  success: {
    container: "border-l-4 border-l-[#00A73C] bg-[#E8F7EE] text-[#006E28]",
    icon: "text-[#00A73C]",
    IconComponent: CheckCircle,
    label: "成功",
  },
  error: {
    container: "border-l-4 border-l-[#E60012] bg-[#FDECEA] text-[#B80012]",
    icon: "text-[#E60012]",
    IconComponent: XCircle,
    label: "エラー",
  },
  warning: {
    container: "border-l-4 border-l-[#FF9900] bg-[#FFF5E0] text-[#7A4500]",
    icon: "text-[#FF9900]",
    IconComponent: AlertTriangle,
    label: "警告",
  },
  info: {
    container: "border-l-4 border-l-[#0017C1] bg-[#E6E8FB] text-[#0017C1]",
    icon: "text-[#0017C1]",
    IconComponent: Info,
    label: "情報",
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    // aria-live="polite" でスクリーンリーダーに通知
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none"
    >
      {toasts.map((toast) => {
        const { container, icon, IconComponent, label } = variants[toast.type];
        return (
          <div
            key={toast.id}
            role="alert"
            className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-[var(--shadow-3)] pointer-events-auto ${container}`}
          >
            <IconComponent
              size={20}
              className={`shrink-0 mt-0.5 ${icon}`}
              aria-hidden="true"
            />
            <span className="flex-1 text-sm font-medium">
              <span className="sr-only">{label}：</span>
              {toast.message}
            </span>
            <button
              type="button"
              aria-label="通知を閉じる"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-0.5 rounded focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
