export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-4 space-y-3">
      <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="flex gap-2 pt-2">
        <div className="h-6 flex-1 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-6 flex-1 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

