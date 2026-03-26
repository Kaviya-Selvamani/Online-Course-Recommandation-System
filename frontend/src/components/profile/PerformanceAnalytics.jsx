import SectionCard from "../common/SectionCard.jsx";

const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export default function PerformanceAnalytics({ weeklyActivity, studyHours, consistencyScore }) {
  const activity = weeklyActivity?.length ? weeklyActivity : [2, 4, 3, 5, 2, 4, 1];
  const weeklyMax = Math.max(...activity, 1);
  const monthHours = Math.round((studyHours || 0) * 4);

  return (
    <SectionCard title="Performance Analytics" subtitle="Understand your learning rhythm and consistency.">
      <div className="grid gap-4">
        <div className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm">
          <span className="text-slate-400">Total study hours (month)</span>
          <span className="font-semibold text-slate-100">{monthHours} hrs</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm">
          <span className="text-slate-400">Learning consistency</span>
          <span className="font-semibold text-slate-100">{consistencyScore}%</span>
        </div>
        <div>
          <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Weekly activity</div>
          <div className="flex items-end gap-2">
            {activity.map((value, idx) => (
              <div key={`${value}-${idx}`} className="flex flex-col items-center gap-1">
                <div
                  className="w-4 rounded-full bg-emerald-400/70"
                  style={{ height: `${Math.max(10, (value / weeklyMax) * 56)}px` }}
                />
                <span className="text-[10px] text-slate-400">{WEEK_LABELS[idx]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
