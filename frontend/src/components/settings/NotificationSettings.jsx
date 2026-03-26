import SectionCard from "../common/SectionCard.jsx";

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
      <div>
        <div className="font-semibold text-slate-100">{label}</div>
        <div className="text-xs text-slate-400">{description}</div>
      </div>
      <input
        type="checkbox"
        className="mt-1 h-5 w-5 accent-emerald-400"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

export default function NotificationSettings({ emailNotifications, recommendationAlerts, onEmailChange, onAlertChange, onSave, saving }) {
  return (
    <SectionCard title="Notification Settings" subtitle="Control how CourseIQ communicates updates.">
      <div className="grid gap-3">
        <ToggleRow
          label="Email notifications"
          description="Receive important course updates and enrollment reminders."
          checked={emailNotifications}
          onChange={onEmailChange}
        />
        <ToggleRow
          label="Recommendation alerts"
          description="Get notified when new high-match courses appear."
          checked={recommendationAlerts}
          onChange={onAlertChange}
        />
      </div>
      <div className="mt-5 flex justify-end">
        <button
          className="rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Notifications"}
        </button>
      </div>
    </SectionCard>
  );
}
