export default function SkillGapAlert({ gap }) {
  if (!gap) return null;

  return (
    <div className="skill-gap-alert">
      <div className="skill-gap-header">
        <div>
          <div className="skill-gap-title">Skill Gap Alert</div>
          <div className="skill-gap-sub">Goal: {gap.goal}</div>
        </div>
        <span className="skill-gap-chip">Next unlock</span>
      </div>

      <div className="skill-gap-list">
        {(gap.missingSkills || []).map((skill) => (
          <span className="skill-gap-tag" key={skill}>
            {skill}
          </span>
        ))}
      </div>

      {gap.recommendedCourse ? (
        <div className="skill-gap-reco">
          Recommended next course:
          <strong> {gap.recommendedCourse.title}</strong>
        </div>
      ) : null}
    </div>
  );
}
