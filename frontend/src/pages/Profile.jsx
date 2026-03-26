import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAward, FiBell, FiBookOpen, FiCheckCircle, FiClock, FiEdit3, FiTarget, FiTrendingUp } from "react-icons/fi";
import { getSession } from "../services/authService.js";
import { fetchCoursesCatalog } from "../services/courseService.js";
import { fetchRecommendations } from "../services/recommendationService.js";
import { buildLearningInsights } from "../services/learningInsights.js";
import { useUiStore } from "../store/ui.js";

const DEFAULT_SKILLS = {
  python: 0,
  machineLearning: 0,
  statistics: 0,
  algorithms: 0,
  dataScience: 0,
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function getLevelLabel(score) {
  if (score >= 70) return "Advanced";
  if (score >= 40) return "Intermediate";
  return "Beginner";
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800/80 text-slate-100">{icon}</div>
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

function SectionCard({ title, subtitle, children, action }) {
  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-slate-100">{title}</div>
          {subtitle ? <div className="text-sm text-slate-400">{subtitle}</div> : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="rounded-full border border-slate-700/60 bg-slate-800/50 px-3 py-1 text-xs font-semibold text-slate-200">
      {children}
    </span>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const session = getSession();
  const user = useMemo(() => session?.user || {}, [session]);
  const enrolledCourses = useUiStore((state) => state.enrolledCourses || []);
  const notifs = useUiStore((state) => state.notifs || []);

  const [recommendations, setRecommendations] = useState([]);
  const [catalogCourses, setCatalogCourses] = useState([]);

  useEffect(() => {
    let cancelled = false;

    fetchRecommendations()
      .then((data) => {
        if (!cancelled) setRecommendations(data.recommendations || []);
      })
      .catch(() => {
        if (!cancelled) setRecommendations([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchCoursesCatalog()
      .then((data) => {
        if (!cancelled) setCatalogCourses(data || []);
      })
      .catch(() => {
        if (!cancelled) setCatalogCourses([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const insights = useMemo(
    () => buildLearningInsights(user, recommendations, enrolledCourses),
    [user, recommendations, enrolledCourses]
  );

  const enrolledMap = useMemo(() => {
    const map = new Map();
    [...recommendations, ...catalogCourses].forEach((course) => {
      const key = String(course?._id || course?.id || "");
      if (key) map.set(key, course);
    });
    return map;
  }, [catalogCourses, recommendations]);

  const enrolledList = useMemo(
    () =>
      enrolledCourses.map((id) => ({
        id: String(id),
        course: enrolledMap.get(String(id)) || null,
      })),
    [enrolledCourses, enrolledMap]
  );

  const name = user.name || "Learner";
  const email = user.email || "student@courseiq.ai";
  const avatarUrl = user.avatarUrl || "";
  const joinedDate = formatDate(user.createdAt || user.joinedAt);
  const bio =
    user.bio ||
    'I am building a MERN stack project called "Online Course Recommendation System".';
  const skillLevel =
    user.learningPreferences?.preferredDifficultyLevel ||
    user.skillLevel ||
    user.skill ||
    "Intermediate";
  const careerTarget =
    user.careerTarget || user.goal || user.careerGoal || "Machine Learning Engineer";
  const interests = user.interests || ["Machine Learning", "Python", "Data Science"];
  const studyHours = Number(user.weeklyLearningHours || 4);
  const skills = { ...DEFAULT_SKILLS, ...(user.skills || {}) };

  const completedCount = user.completedCourses?.length || insights.completedCourses.length || 0;
  const enrolledCount = enrolledCourses.length;
  const inProgressCount = Math.max(enrolledCount - completedCount, 0);
  const progressPercent = enrolledCount
    ? Math.round((completedCount / enrolledCount) * 100)
    : 0;

  const weeklyActivity = insights.weeklyActivity || [];
  const weeklyTotal = weeklyActivity.reduce((sum, value) => sum + value, 0);
  const weeklyMax = Math.max(...weeklyActivity, 1);
  const consistencyScore = Math.round((weeklyTotal / (weeklyActivity.length * weeklyMax)) * 100);

  const nextBestCourse =
    insights.skillGap?.recommendedCourse || recommendations[0] || enrolledList[0]?.course || null;
  const missingSkills = insights.skillGap?.missingSkills || [];
  const recentViewed = recommendations.slice(0, 3);
  const recentCompleted = insights.completedCourses.slice(0, 3);

  const achievements = [
    enrolledCount >= 1 && "First Enrollment",
    enrolledCount >= 3 && "Learning Momentum",
    progressPercent >= 50 && "Halfway Hero",
    insights.streak >= 14 && "Consistency Champ",
  ].filter(Boolean);

  return (
    <div className="page anim">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 text-slate-100">
        <div className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-5">
            <div
              className="h-20 w-20 rounded-2xl border border-slate-700/60 bg-slate-800/60"
              style={
                avatarUrl
                  ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : undefined
              }
            >
              {!avatarUrl ? (
                <div className="flex h-full items-center justify-center text-2xl font-bold text-slate-200">
                  {name[0]}
                </div>
              ) : null}
            </div>
            <div className="flex-1">
              <div className="text-2xl font-semibold">{name}</div>
              <div className="mt-1 text-sm text-slate-400">{email}</div>
              <div className="mt-2 text-sm text-slate-300">{bio}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Tag>{skillLevel}</Tag>
                <Tag>{careerTarget}</Tag>
                <Tag>Joined {joinedDate}</Tag>
              </div>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700/70 bg-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500/70 hover:bg-slate-800"
              onClick={() => navigate("/settings")}
            >
              <FiEdit3 /> Edit Profile
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard icon={<FiBookOpen />} label="Enrolled" value={enrolledCount} />
          <StatCard icon={<FiCheckCircle />} label="Completed" value={completedCount} />
          <StatCard icon={<FiTrendingUp />} label="In Progress" value={inProgressCount} />
          <StatCard icon={<FiTarget />} label="Progress" value={`${progressPercent}%`} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard
            title="Learning Profile"
            subtitle="Your preferences and goals that power recommendations."
          >
            <div className="space-y-4 text-sm text-slate-200">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Skill Level</div>
                <div className="mt-1 font-semibold">{skillLevel}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Interests</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Tag key={interest}>{interest}</Tag>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Career Goal</div>
                <div className="mt-1 font-semibold">{careerTarget}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Preferred Study Hours</div>
                <div className="mt-1 font-semibold">{studyHours} hrs/week</div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Performance Analytics"
            subtitle="Understand your learning rhythm and consistency."
          >
            <div className="grid gap-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm">
                <span className="text-slate-400">Total study hours (month)</span>
                <span className="font-semibold text-slate-100">{Math.round(studyHours * 4)} hrs</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-3 text-sm">
                <span className="text-slate-400">Learning consistency</span>
                <span className="font-semibold text-slate-100">{consistencyScore}%</span>
              </div>
              <div>
                <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Weekly activity</div>
                <div className="flex items-end gap-2">
                  {weeklyActivity.map((value, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div
                        className="w-4 rounded-full bg-emerald-400/70"
                        style={{ height: `${Math.max(10, (value / weeklyMax) * 56)}px` }}
                      />
                      <span className="text-[10px] text-slate-400">{["M", "T", "W", "T", "F", "S", "S"][idx]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Recommendation Insights" subtitle="Why your next courses are showing up.">
            <div className="space-y-4 text-sm text-slate-200">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Why recommended</div>
                <ul className="mt-2 space-y-1 text-slate-300">
                  {(missingSkills.length ? missingSkills : ["Focus on high-demand skills", "Match your goals", "Boost practical projects"]).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Next best course</div>
                {nextBestCourse ? (
                  <div className="mt-2 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
                    <div className="font-semibold text-slate-100">{nextBestCourse.title}</div>
                    <div className="text-xs text-slate-400">
                      {nextBestCourse.provider} · {nextBestCourse.platform} · {nextBestCourse.difficulty}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-slate-400">No recommendation yet.</div>
                )}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Skill gap focus</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(missingSkills.length ? missingSkills : ["Projects", "Cloud", "SQL"]).map((gap) => (
                    <Tag key={gap}>{gap}</Tag>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Skill Progress Tracking" subtitle="Track improvement across domains.">
            <div className="space-y-4">
              {insights.skillGrowth.map((skill) => (
                <div key={skill.label}>
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span>{skill.label}</span>
                    <span className="text-xs text-slate-400">
                      {getLevelLabel(skill.progress - 20)} → {getLevelLabel(skill.progress)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-800/70">
                    <div
                      className="h-2 rounded-full bg-emerald-400/80"
                      style={{ width: `${skill.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Learning Progress" subtitle="Track your course journey at a glance.">
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-3">
                <span className="text-slate-400">Courses in progress</span>
                <span className="font-semibold text-slate-100">{inProgressCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-3">
                <span className="text-slate-400">Completion rate</span>
                <span className="font-semibold text-slate-100">{progressPercent}%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-3">
                <span className="text-slate-400">Study streak</span>
                <span className="font-semibold text-slate-100">{insights.streak} days</span>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard title="Activity History" subtitle="Recent learning touchpoints.">
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Recently viewed</div>
                <ul className="mt-2 space-y-2 text-slate-200">
                  {recentViewed.length ? (
                    recentViewed.map((course) => (
                      <li key={course._id || course.title} className="rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 py-2">
                        {course.title}
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">No recent views.</li>
                  )}
                </ul>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Recently completed</div>
                <ul className="mt-2 space-y-2 text-slate-200">
                  {recentCompleted.length ? (
                    recentCompleted.map((course) => (
                      <li key={course.name} className="rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 py-2">
                        {course.name}
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">No completions yet.</li>
                  )}
                </ul>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Achievements" subtitle="Milestones you have unlocked.">
            <div className="flex flex-wrap gap-3">
              {achievements.length ? (
                achievements.map((badge) => (
                  <div key={badge} className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200">
                    <FiAward /> {badge}
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-400">No badges yet.</div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Notifications Summary" subtitle="Latest updates waiting for you.">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/40 px-4 py-3">
                <span className="text-slate-400">Unread notifications</span>
                <span className="inline-flex items-center gap-2 font-semibold text-slate-100">
                  <FiBell /> {notifs.filter((n) => n.unread).length}
                </span>
              </div>
              <ul className="space-y-2">
                {(notifs.slice(0, 3).length ? notifs.slice(0, 3) : [{ id: "empty", title: "No new notifications" }]).map((n) => (
                  <li key={n.id} className="rounded-lg border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-slate-200">
                    {n.title}
                  </li>
                ))}
              </ul>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Enrolled Courses" subtitle="Your current course lineup.">
          {enrolledList.length === 0 ? (
            <div className="text-sm text-slate-400">No enrolled courses yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-200">
                <thead className="text-xs uppercase text-slate-400">
                  <tr>
                    <th className="py-2">Course name</th>
                    <th className="py-2">Platform</th>
                    <th className="py-2">Level</th>
                    <th className="py-2">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {enrolledList.map(({ id, course }) => (
                    <tr key={id}>
                      <td className="py-3 font-semibold">{course?.title || `Course ${id}`}</td>
                      <td className="py-3">{course?.platform || "—"}</td>
                      <td className="py-3">{course?.difficulty || course?.level || "—"}</td>
                      <td className="py-3">{course?.category || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
