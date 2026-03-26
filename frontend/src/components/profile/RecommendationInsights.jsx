import SectionCard from "../common/SectionCard.jsx";
import Tag from "../common/Tag.jsx";

export default function RecommendationInsights({ reasons, nextCourse, skillGaps }) {
  const why = reasons?.length
    ? reasons
    : ["Matches your interests", "Fits your target role", "Builds in-demand skills"];

  return (
    <SectionCard title="Recommendation Insights" subtitle="Why your next courses are showing up.">
      <div className="space-y-4 text-sm text-slate-200">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">Why recommended</div>
          <ul className="mt-2 space-y-1 text-slate-300">
            {why.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">Next best course</div>
          {nextCourse ? (
            <div className="mt-2 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
              <div className="font-semibold text-slate-100">{nextCourse.title}</div>
              <div className="text-xs text-slate-400">
                {nextCourse.provider} · {nextCourse.platform} · {nextCourse.difficulty}
              </div>
            </div>
          ) : (
            <div className="mt-2 text-slate-400">No recommendation yet.</div>
          )}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">Skill gap focus</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(skillGaps?.length ? skillGaps : ["Projects", "Cloud", "SQL"]).map((gap) => (
              <Tag key={gap}>{gap}</Tag>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
