// ボタン内スピナー
export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="animate-spin text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// テーブル行スケルトン
export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-[#EBEBEB] rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

// カードスケルトン
export function SkeletonCard() {
  return (
    <div
      className="rounded-lg border border-[#EBEBEB] p-4 space-y-3 animate-pulse"
      aria-hidden="true"
    >
      <div className="h-4 bg-[#EBEBEB] rounded w-3/4" />
      <div className="h-3 bg-[#EBEBEB] rounded w-1/2" />
      <div className="h-3 bg-[#EBEBEB] rounded w-2/3" />
    </div>
  );
}
