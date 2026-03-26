export default function SectionCard({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-slate-100">{title}</div>
          {subtitle ? <div className="text-sm text-slate-400">{subtitle}</div> : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
