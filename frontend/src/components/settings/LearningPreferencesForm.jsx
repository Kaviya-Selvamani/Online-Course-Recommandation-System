import SectionCard from "../common/SectionCard.jsx";
import Tag from "../common/Tag.jsx";

export default function LearningPreferencesForm({
  interests,
  skillLevel,
  careerGoal,
  studyHours,
  onInterestsChange,
  onSkillLevelChange,
  onCareerGoalChange,
  onStudyHoursChange,
  onSave,
  saving,
  skillOptions,
  careerOptions,
}) {
  const previewTags = interests
    ? interests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return (
    <SectionCard title="Learning Preferences" subtitle="Update the signals that power recommendations.">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-200">
          Interests (comma separated)
          <input
            className="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400/70 focus:outline-none"
            value={interests}
            onChange={(event) => onInterestsChange(event.target.value)}
            placeholder="AI, Web Dev, Data Science"
          />
        </label>
        <label className="text-sm text-slate-200">
          Skill Level
          <select
            className="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400/70 focus:outline-none"
            value={skillLevel}
            onChange={(event) => onSkillLevelChange(event.target.value)}
          >
            {skillOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-200">
          Career Goal
          <select
            className="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400/70 focus:outline-none"
            value={careerGoal}
            onChange={(event) => onCareerGoalChange(event.target.value)}
          >
            {careerOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-200">
          Study Hours / Week
          <input
            type="number"
            min="0"
            max="60"
            className="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400/70 focus:outline-none"
            value={studyHours}
            onChange={(event) => onStudyHoursChange(event.target.value)}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {previewTags.length ? previewTags.map((tag) => <Tag key={tag}>{tag}</Tag>) : null}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </SectionCard>
  );
}
