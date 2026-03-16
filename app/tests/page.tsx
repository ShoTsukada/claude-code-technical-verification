"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// testsテーブルの型定義
type Test = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

// 編集中の行の状態型
type EditingState = {
  name: string;
  description: string;
};

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingState, setEditingState] = useState<EditingState>({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // データ取得
  const fetchTests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      setError("データの取得に失敗しました: " + error.message);
    } else {
      setTests(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTests();
  }, []);

  // 編集開始
  const startEdit = (test: Test) => {
    setEditingId(test.id);
    setEditingState({
      name: test.name,
      description: test.description ?? "",
    });
    setError(null);
  };

  // 編集キャンセル
  const cancelEdit = () => {
    setEditingId(null);
    setError(null);
  };

  // 保存
  const saveEdit = async (id: string) => {
    if (!editingState.name.trim()) {
      setError("名前は必須です");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("tests")
      .update({
        name: editingState.name.trim(),
        description: editingState.description.trim() || null,
      })
      .eq("id", id);

    if (error) {
      setError("保存に失敗しました: " + error.message);
    } else {
      setEditingId(null);
      await fetchTests();
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Tests テーブル管理</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <p className="text-gray-500">読み込み中...</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-4 py-3">名前</th>
                  <th className="px-4 py-3">説明</th>
                  <th className="px-4 py-3">作成日時</th>
                  <th className="px-4 py-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tests.map((test) =>
                  editingId === test.id ? (
                    // 編集行
                    <tr key={test.id} className="bg-blue-50">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editingState.name}
                          onChange={(e) =>
                            setEditingState((s) => ({ ...s, name: e.target.value }))
                          }
                          className="w-full rounded border border-blue-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editingState.description}
                          onChange={(e) =>
                            setEditingState((s) => ({ ...s, description: e.target.value }))
                          }
                          placeholder="（空欄でnull）"
                          className="w-full rounded border border-blue-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </td>
                      <td className="px-4 py-2 text-gray-400">
                        {new Date(test.created_at).toLocaleString("ja-JP")}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => saveEdit(test.id)}
                            disabled={saving}
                            className="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600 disabled:opacity-50"
                          >
                            {saving ? "保存中..." : "保存"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="rounded bg-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                          >
                            キャンセル
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // 通常行
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{test.name}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {test.description ?? <span className="italic text-gray-300">null</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(test.created_at).toLocaleString("ja-JP")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => startEdit(test)}
                          className="rounded bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
