"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Spinner } from "../../components/LoadingSpinner";
import { createEntity, updateEntity } from "../../../lib/services/entityService";
import { useToast } from "../../contexts/ToastContext";
import type { ResearchTheme } from "../../../lib/types";

interface ThemeFormProps {
  defaultValues?: Partial<ResearchTheme>;
  themeId?: string;
}

interface FormValues {
  title: string;
  field: string;
  description: string;
  start_year: string;
}

interface FormErrors {
  title?: string;
  field?: string;
}

export default function ThemeForm({ defaultValues, themeId }: ThemeFormProps) {
  const isEdit = !!themeId;
  const router = useRouter();
  const { showToast } = useToast();

  const [values, setValues] = useState<FormValues>({
    title: defaultValues?.title ?? "",
    field: defaultValues?.field ?? "",
    description: defaultValues?.description ?? "",
    start_year: defaultValues?.start_year?.toString() ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validateField = (name: keyof FormValues, value: string): string | undefined => {
    if (name === "title" && !value.trim()) return "タイトルは必須です";
    if (name === "field" && !value.trim()) return "分野は必須です";
    return undefined;
  };

  const handleBlur = (name: keyof FormValues) => {
    const err = validateField(name, values[name]);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleChange = (name: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const titleErr = validateField("title", values.title);
    const fieldErr = validateField("field", values.field);
    if (titleErr || fieldErr) {
      setErrors({ title: titleErr, field: fieldErr });
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
        title: values.title.trim(),
        field: values.field.trim(),
        description: values.description.trim() || null,
        start_year: values.start_year ? parseInt(values.start_year, 10) : null,
      };

      if (isEdit) {
        await updateEntity("research_themes", themeId, payload);
        showToast("success", "研究テーマを更新しました");
        router.push(`/themes/${themeId}`);
      } else {
        await createEntity("research_themes", payload);
        showToast("success", "研究テーマを登録しました");
        router.push("/themes");
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
      hasError ? "border-[#E60012] ring-2 ring-[#E60012]/20" : "border-[#CCCCCC]",
    ].join(" ");

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* タイトル（必須） */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-base font-bold text-[#1A1A1C] mb-1">
          タイトル
          <span aria-hidden="true" className="text-[#E60012] ml-1">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={values.title}
          onChange={(e) => handleChange("title", e.target.value)}
          onBlur={() => handleBlur("title")}
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
          placeholder="例：次世代AI研究"
          disabled={submitting}
          className={inputClass(errors.title)}
        />
        {errors.title && (
          <p id="title-error" role="alert" className="mt-1 text-sm text-[#E60012]">
            {errors.title}
          </p>
        )}
      </div>

      {/* 分野（必須）・開始年 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="field" className="block text-base font-bold text-[#1A1A1C] mb-1">
            分野
            <span aria-hidden="true" className="text-[#E60012] ml-1">*</span>
          </label>
          <input
            id="field"
            type="text"
            value={values.field}
            onChange={(e) => handleChange("field", e.target.value)}
            onBlur={() => handleBlur("field")}
            aria-required="true"
            aria-invalid={!!errors.field}
            aria-describedby={errors.field ? "field-error" : undefined}
            placeholder="例：情報工学"
            disabled={submitting}
            className={inputClass(errors.field)}
          />
          {errors.field && (
            <p id="field-error" role="alert" className="mt-1 text-sm text-[#E60012]">
              {errors.field}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="start_year" className="block text-base font-bold text-[#1A1A1C] mb-1">
            開始年
          </label>
          <input
            id="start_year"
            type="number"
            value={values.start_year}
            onChange={(e) => handleChange("start_year", e.target.value)}
            placeholder="例：2020"
            min={1800}
            max={new Date().getFullYear() + 5}
            disabled={submitting}
            className={inputClass()}
          />
        </div>
      </div>

      {/* 説明 */}
      <div className="mb-6">
        <label htmlFor="description" className="block text-base font-bold text-[#1A1A1C] mb-1">
          説明
        </label>
        <textarea
          id="description"
          rows={4}
          value={values.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="研究テーマの説明を入力してください"
          disabled={submitting}
          className={inputClass()}
        />
      </div>

      {/* アクションボタン */}
      <div className="flex justify-end gap-3">
        <Link
          href={isEdit ? `/themes/${themeId}` : "/themes"}
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
