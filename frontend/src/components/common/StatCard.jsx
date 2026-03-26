export default function StatCard({ icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800/80 text-slate-100">
            {icon}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
            <div className="text-xl font-semibold text-slate-100">{value}</div>
          </div>
        </div>
        {sub ? <div className="text-xs text-slate-400">{sub}</div> : null}
      </div>
    </div>
  );
}
