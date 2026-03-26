import Tag from "../common/Tag.jsx";
import SectionCard from "../common/SectionCard.jsx";

export default function LearningProfileCard({ skillLevel, interests, preferredRole, studyHours }) {
  return (
    <SectionCard title="Learning Profile" subtitle="Your preferences that power recommendations.">
      <div className="space-y-4 text-sm text-slate-200">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">Skill Level</div>
          <div className="mt-1 font-semibold">{skillLevel}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">Interests</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(interests?.length ? interests : ["AI", "Web Development", "Data Science"]).map((interest) => (
              <Tag key={interest}>{interest}</Tag>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">Preferred Role</div>
          <div className="mt-1 font-semibold">{preferredRole}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">Preferred Study Hours</div>
          <div className="mt-1 font-semibold">{studyHours} hrs/week</div>
        </div>
      </div>
    </SectionCard>
  );
}
