"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Spinner } from "../../components/LoadingSpinner";
import { createEntity, updateEntity } from "../../../lib/services/entityService";
import { useToast } from "../../contexts/ToastContext";
import type { Institution } from "../../../lib/types";

interface InstitutionFormProps {
  /** 編集時に渡す既存データ */
  defaultValues?: Partial<Institution>;
  institutionId?: string;
}

interface FormValues {
  name: string;
  location: string;
  founded_year: string;
  description: string;
}

interface FormErrors {
  name?: string;
}

export default function InstitutionForm({
  defaultValues,
  institutionId,
}: InstitutionFormProps) {
  const isEdit = !!institutionId;
  const router = useRouter();
  const { showToast } = useToast();

  const [values, setValues] = useState<FormValues>({
    name: defaultValues?.name ?? "",
    location: defaultValues?.location ?? "",
    founded_year: defaultValues?.founded_year?.toString() ?? "",
    description: defaultValues?.description ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // onBlur バリデーション
  const validateField = (field: keyof FormValues, value: string): string | undefined => {
    if (field === "name" && !value.trim()) return "名称は必須です";
    return undefined;
  };

  const handleBlur = (field: keyof FormValues) => {
    const err = validateField(field, values[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (
    field: keyof FormValues,
    value: string
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // 既存エラーをリセット
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const nameErr = validateField("name", values.name);
    if (nameErr) {
      setErrors({ name: nameErr });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        location: values.location.trim() || null,
        founded_year: values.founded_year ? parseInt(values.founded_year, 10) : null,
        description: values.description.trim() || null,
      };

      if (isEdit) {
        await updateEntity("institutions", institutionId, payload);
        showToast("success", "研究機関を更新しました");
        router.push(`/institutions/${institutionId}`);
      } else {
        await createEntity("institutions", payload);
        showToast("success", "研究機関を登録しました");
        router.push("/institutions");
      }
    } catch {
      showToast("error", "保存に失敗しました。もう一度お試しください。");
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
      hasError
        ? "border-[#E60012] ring-2 ring-[#E60012]/20"
        : "border-[#CCCCCC]",
    ].join(" ");

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* 名称（必須） */}
      <div className="mb-4">
        <label htmlFor="name" className="block text-base font-bold text-[#1A1A1C] mb-1">
          名称
          <span aria-hidden="true" className="text-[#E60012] ml-1">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={values.name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          placeholder="例：〇〇大学"
          disabled={submitting}
          className={inputClass(errors.name)}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="mt-1 text-sm text-[#E60012]">
            {errors.name}
          </p>
        )}
      </div>

      {/* 所在地・設立年 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="location" className="block text-base font-bold text-[#1A1A1C] mb-1">
            所在地
          </label>
          <input
            id="location"
            type="text"
            value={values.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="例：東京都千代田区"
            disabled={submitting}
            className={inputClass()}
          />
        </div>
        <div>
          <label htmlFor="founded_year" className="block text-base font-bold text-[#1A1A1C] mb-1">
            設立年
          </label>
          <input
            id="founded_year"
            type="number"
            value={values.founded_year}
            onChange={(e) => handleChange("founded_year", e.target.value)}
            placeholder="例：1950"
            min={1800}
            max={new Date().getFullYear()}
            disabled={submitting}
            className={inputClass()}
          />
        </div>
      </div>

      {/* 概要 */}
      <div className="mb-6">
        <label htmlFor="description" className="block text-base font-bold text-[#1A1A1C] mb-1">
          概要
        </label>
        <textarea
          id="description"
          rows={4}
          value={values.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="研究機関の概要を入力してください"
          disabled={submitting}
          className={inputClass()}
        />
      </div>

      {/* アクションボタン */}
      <div className="flex justify-end gap-3">
        <Link
          href={isEdit ? `/institutions/${institutionId}` : "/institutions"}
          className="inline-flex items-center justify-center h-12 px-6 text-base font-bold rounded-md border-2 border-[#0017C1] text-[#0017C1] bg-white hover:bg-[#E6E8FB] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
        >
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 h-12 px-6 text-base font-bold rounded-md bg-[#0017C1] text-white hover:bg-[#0014A8] active:bg-[#00108C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:text-[#1A1A1C] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
        >
          {submitting && <Spinner size={16} />}
          {isEdit ? "更新する" : "登録する"}
        </button>
      </div>
    </form>
  );
}
