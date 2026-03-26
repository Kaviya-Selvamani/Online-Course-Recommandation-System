import SectionCard from "../common/SectionCard.jsx";

export default function SystemControls({ onReset, onRecalculate, onClearHistory, working }) {
  return (
    <SectionCard title="System Controls" subtitle="Manage your recommendation engine and history.">
      <div className="grid gap-3">
        <button
          className="rounded-xl border border-slate-700/70 bg-slate-800/80 px-4 py-3 text-left text-sm text-slate-100 transition hover:border-slate-500/70 hover:bg-slate-800"
          onClick={onReset}
          disabled={working}
        >
          Reset recommendation profile
        </button>
        <button
          className="rounded-xl border border-slate-700/70 bg-slate-800/80 px-4 py-3 text-left text-sm text-slate-100 transition hover:border-slate-500/70 hover:bg-slate-800"
          onClick={onRecalculate}
          disabled={working}
        >
          Recalculate recommendations
        </button>
        <button
          className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-left text-sm text-rose-200 transition hover:border-rose-400/60"
          onClick={onClearHistory}
          disabled={working}
        >
          Clear learning history
        </button>
      </div>
    </SectionCard>
  );
}
