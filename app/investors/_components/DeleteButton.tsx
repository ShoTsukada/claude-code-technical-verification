"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "../../components/ConfirmDialog";
import { deleteEntity } from "../../../lib/services/entityService";
import { useToast } from "../../contexts/ToastContext";

interface DeleteButtonProps {
  id: string;
  name: string;
  redirectTo?: string;
  size?: "sm" | "xs";
}

export default function DeleteButton({ id, name, redirectTo, size = "xs" }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const sizeClass = size === "xs" ? "h-7 px-3 text-sm min-w-[72px]" : "h-9 px-4 text-sm min-w-[80px]";

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await deleteEntity("investors", id);
      showToast("success", `「${name}」を削除しました`);
      setOpen(false);
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch {
      showToast("error", "削除に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-1 font-bold rounded-md bg-[#E60012] text-white hover:bg-[#B80012] active:bg-[#8C000D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:text-[#1A1A1C] focus-visible:ring-2 focus-visible:ring-[#1A1A1C] ${sizeClass}`}
        aria-label={`「${name}」を削除`}
      >
        <Trash2 size={14} aria-hidden="true" />
        削除
      </button>

      <ConfirmDialog
        isOpen={open}
        title="投資家を削除しますか？"
        message={`「${name}」を削除します。関連する研究機関・研究テーマとの関連付けもすべて削除されます。この操作は元に戻せません。`}
        confirmLabel="削除する"
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
