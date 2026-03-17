"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Spinner } from "../../components/LoadingSpinner";
import { createEntity, updateEntity } from "../../../lib/services/entityService";
import { useToast } from "../../contexts/ToastContext";
import type { Investor } from "../../../lib/types";

interface InvestorFormProps {
  defaultValues?: Partial<Investor>;
  investorId?: string;
}

interface FormValues {
  name: string;
  type: "individual" | "corporate" | "";
  contact: string;
  investment_field: string;
}

interface FormErrors {
  name?: string;
  type?: string;
}

export default function InvestorForm({ defaultValues, investorId }: InvestorFormProps) {
  const isEdit = !!investorId;
  const router = useRouter();
  const { showToast } = useToast();

  const [values, setValues] = useState<FormValues>({
    name: defaultValues?.name ?? "",
    type: defaultValues?.type ?? "",
    contact: defaultValues?.contact ?? "",
    investment_field: defaultValues?.investment_field ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validateField = (field: keyof FormValues, value: string): string | undefined => {
    if (field === "name" && !value.trim()) return "氏名／組織名は必須です";
    if (field === "type" && !value) return "種別を選択してください";
    return undefined;
  };

  const handleBlur = (field: keyof FormValues) => {
    const err = validateField(field, values[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const nameErr = validateField("name", values.name);
    const typeErr = validateField("type", values.type);
    if (nameErr || typeErr) {
      setErrors({ name: nameErr, type: typeErr });
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
        type: values.type as "individual" | "corporate",
        contact: values.contact.trim() || null,
        investment_field: values.investment_field.trim() || null,
      };

      if (isEdit) {
        await updateEntity("investors", investorId, payload);
        showToast("success", "投資家情報を更新しました");
        router.push(`/investors/${investorId}`);
      } else {
        await createEntity("investors", payload);
        showToast("success", "投資家を登録しました");
        router.push("/investors");
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
      {/* 氏名／組織名（必須） */}
      <div className="mb-4">
        <label htmlFor="name" className="block text-base font-bold text-[#1A1A1C] mb-1">
          氏名／組織名
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
          placeholder="例：山田 太郎 / 〇〇キャピタル"
          disabled={submitting}
          className={inputClass(errors.name)}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="mt-1 text-sm text-[#E60012]">{errors.name}</p>
        )}
      </div>

      {/* 種別（必須・ラジオボタン） */}
      <div className="mb-4">
        <fieldset>
          <legend className="block text-base font-bold text-[#1A1A1C] mb-2">
            種別
            <span aria-hidden="true" className="text-[#E60012] ml-1">*</span>
          </legend>
          <div
            className="flex gap-6"
            role="radiogroup"
            aria-required="true"
            aria-invalid={!!errors.type}
            aria-describedby={errors.type ? "type-error" : undefined}
          >
            {[
              { value: "individual", label: "個人" },
              { value: "corporate", label: "法人" },
            ].map(({ value, label }) => (
              <label key={value} className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value={value}
                  checked={values.type === value}
                  onChange={() => handleChange("type", value)}
                  onBlur={() => handleBlur("type")}
                  disabled={submitting}
                  className="w-4 h-4 accent-[#0017C1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0017C1]"
                />
                <span className="text-base text-[#1A1A1C]">{label}</span>
              </label>
            ))}
          </div>
          {errors.type && (
            <p id="type-error" role="alert" className="mt-1 text-sm text-[#E60012]">{errors.type}</p>
          )}
        </fieldset>
      </div>

      {/* 連絡先・投資分野 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="contact" className="block text-base font-bold text-[#1A1A1C] mb-1">
            連絡先
          </label>
          <input
            id="contact"
            type="text"
            value={values.contact}
            onChange={(e) => handleChange("contact", e.target.value)}
            placeholder="例：email@example.com"
            disabled={submitting}
            className={inputClass()}
          />
        </div>
        <div>
          <label htmlFor="investment_field" className="block text-base font-bold text-[#1A1A1C] mb-1">
            投資分野
          </label>
          <input
            id="investment_field"
            type="text"
            value={values.investment_field}
            onChange={(e) => handleChange("investment_field", e.target.value)}
            placeholder="例：AI・バイオテック"
            disabled={submitting}
            className={inputClass()}
          />
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex justify-end gap-3">
        <Link
          href={isEdit ? `/investors/${investorId}` : "/investors"}
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
