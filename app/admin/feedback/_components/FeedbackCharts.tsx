"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { FeedbackSummary } from "../../../../lib/types";

interface FeedbackChartsProps {
  summary: FeedbackSummary;
}

// カテゴリ表示名
const categoryLabel: Record<string, string> = {
  improvement: "改善要望",
  bug: "不具合報告",
  other: "その他",
};

// カテゴリバーカラー
const categoryColor: Record<string, string> = {
  improvement: "#0017C1",
  bug: "#E60012",
  other: "#595959",
};

export default function FeedbackCharts({ summary }: FeedbackChartsProps) {
  // カテゴリ別データ
  const categoryData = Object.entries(summary.byCategory).map(([key, count]) => ({
    name: categoryLabel[key] ?? key,
    count,
    color: categoryColor[key] ?? "#595959",
  }));

  // 画面別データ（上位10件）
  const pageData = Object.entries(summary.byPage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([page, count]) => ({ name: page, count }));

  if (summary.total === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* カテゴリ別件数（縦棒） */}
      <div className="bg-white rounded-lg border border-[#EBEBEB] shadow-[var(--shadow-1)] p-4">
        <h3 className="text-base font-bold text-[#1A1A1C] mb-4">カテゴリ別件数</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={categoryData} aria-label="カテゴリ別フィードバック件数の棒グラフ">
            <CartesianGrid strokeDasharray="3 3" stroke="#EBEBEB" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#595959" }} />
            <YAxis tick={{ fontSize: 12, fill: "#595959" }} allowDecimals={false} />
            <Tooltip
              formatter={(value) => [`${value}件`, "件数"]}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {categoryData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 画面別件数（横棒） */}
      <div className="bg-white rounded-lg border border-[#EBEBEB] shadow-[var(--shadow-1)] p-4">
        <h3 className="text-base font-bold text-[#1A1A1C] mb-4">画面別件数（上位10件）</h3>
        {pageData.length === 0 ? (
          <p className="text-sm text-[#949494] text-center py-8">データがありません</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pageData} layout="vertical" aria-label="画面別フィードバック件数の横棒グラフ">
              <CartesianGrid strokeDasharray="3 3" stroke="#EBEBEB" />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#595959" }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#595959" }} width={100} />
              <Tooltip
                formatter={(value) => [`${value}件`, "件数"]}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="count" fill="#0017C1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
