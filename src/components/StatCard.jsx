export default function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 flex flex-col gap-1">
      <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="text-lg font-semibold text-slate-900 dark:text-slate-50">
        {value}
      </div>
      {sub && (
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          {sub}
        </div>
      )}
    </div>
  );
}

