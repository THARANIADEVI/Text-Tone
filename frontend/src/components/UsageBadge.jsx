export default function UsageBadge({ usage }) {
  if (!usage || !usage.limit) return null;

  const pct = Math.min(100, Math.round((usage.used / usage.limit) * 100));
  const atLimit = usage.used >= usage.limit;

  return (
    <div className="text-xs text-gray-500">
      <div className="flex justify-between mb-1">
        <span>Today's usage</span>
        <span className={atLimit ? "text-red-600 font-medium" : ""}>
          {usage.used} / {usage.limit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${atLimit ? "bg-red-500" : "bg-indigo-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
