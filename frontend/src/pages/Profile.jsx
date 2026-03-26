import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function Profile() {
  const session = getSession();
  const user = useMemo(() => session?.user || {}, [session]);
  const navigate = useNavigate();
  const enrolledCourses = useUiStore((state) => state.enrolledCourses);
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

  const enrolledList = useMemo(() => {
    const map = new Map();
    [...recommendations, ...catalogCourses].forEach((course) => {
      const key = String(course?._id || course?.id || "");
      if (key) map.set(key, course);
    });

    return (enrolledCourses || []).map((id) => {
      const key = String(id);
      return {
        id: key,
        course: map.get(key) || null,
      };
    });
  }, [catalogCourses, enrolledCourses, recommendations]);

  const name = user.name || "Learner";
  const email = user.email || "student@courseiq.ai";
  const avatarUrl = user.avatarUrl || "";
  const skillLevel =
    user.learningPreferences?.preferredDifficultyLevel || user.skillLevel || user.skill || "Intermediate";
  const careerTarget = user.careerTarget || user.goal || user.careerGoal || "Machine Learning Engineer";
  const interests = user.interests || ["Machine Learning", "Python", "Data Science"];
  const preferredPlatforms =
    user.learningPreferences?.preferredPlatforms || user.preferredPlatforms || [];
  const learningFormat = user.learningPreferences?.learningFormat || user.learningFormat || [];
  const skills = { ...DEFAULT_SKILLS, ...(user.skills || {}) };

  return (
    <div className="page anim">
      <div className="profile-header glass-card">
        <div
          className="profile-av"
          style={
            avatarUrl
              ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center", color: "transparent" }
              : undefined
          }
        >
          {name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div className="profile-name">{name}</div>
          <div className="profile-sub">
            {skillLevel} · {careerTarget} · {email}
          </div>
          <div className="profile-tags">
            {interests.map((interest) => (
              <span key={interest} className="tg">{interest}</span>
            ))}
          </div>
        </div>
        <button className="btn bg" onClick={() => navigate("/settings")}>Edit Profile</button>
      </div>

      <div className="g2">
        <div className="card analytics-card glass-card">
          <div className="analytics-title">Learning DNA</div>
          {[
            ["Strongest skill domain", insights.topSkillDomain],
            ["Weakest skill domain", insights.weakestSkillDomain],
            ["Preferred difficulty level", skillLevel],
            ["Average match score", `${insights.averageMatchScore || 0}%`],
          ].map(([label, value]) => (
            <div className="dna-row" key={label}>
              <span className="dna-k">{label}</span>
              <span className="dna-v">{value}</span>
            </div>
          ))}
        </div>

        <div className="card analytics-card glass-card">
          <div className="analytics-title">Academic Overview</div>
          {[
            ["Enrolled courses", String(enrolledCourses.length)],
            ["Completed courses", String(insights.completedCourses.length)],
            ["Credits used", String(insights.creditsUsed)],
            ["Learning streak", `${insights.streak} days`],
          ].map(([label, value]) => (
            <div className="dna-row" key={label}>
              <span className="dna-k">{label}</span>
              <span className="dna-v">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="g2" style={{ marginTop: 14 }}>
        <div className="card analytics-card glass-card">
          <div className="analytics-title">Recommendation Personalization</div>
          {[
            ["Career target", careerTarget],
            [
              "Preferred platforms",
              preferredPlatforms.length ? preferredPlatforms.join(", ") : "Not selected",
            ],
            [
              "Learning format",
              learningFormat.length ? learningFormat.join(", ") : "Not selected",
            ],
          ].map(([label, value]) => (
            <div className="dna-row" key={label}>
              <span className="dna-k">{label}</span>
              <span className="dna-v">{value}</span>
            </div>
          ))}
        </div>

        <div className="card analytics-card glass-card">
          <div className="analytics-title">Skill Self Assessment</div>
          <div className="profile-skill-bars">
            {[
              ["python", "Python"],
              ["machineLearning", "Machine Learning"],
              ["statistics", "Statistics"],
              ["algorithms", "Algorithms"],
              ["dataScience", "Data Science"],
            ].map(([key, label]) => (
              <div key={key} className="profile-skill-row">
                <div className="profile-skill-top">
                  <span>{label}</span>
                  <strong>{skills[key]}%</strong>
                </div>
                <div className="profile-skill-track">
                  <div className="profile-skill-fill" style={{ width: `${skills[key]}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card analytics-card glass-card" style={{ marginTop: 14 }}>
        <div className="analytics-title">Completed Courses</div>
        <table>
          <thead>
            <tr>
              <th>Course name</th>
              <th>Category</th>
              <th>Level</th>
              <th>Grade</th>
              <th>Credits</th>
            </tr>
          </thead>
          <tbody>
            {insights.completedCourses.map((course) => (
              <tr key={course.name}>
                <td style={{ fontWeight: 600, color: "var(--t)" }}>{course.name}</td>
                <td><span className="tg">{course.category}</span></td>
                <td>{course.level}</td>
                <td style={{ color: "var(--ac)", fontWeight: 700 }}>{course.grade}</td>
                <td>{course.credits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card analytics-card glass-card" style={{ marginTop: 14 }}>
        <div className="analytics-title">Enrolled Courses</div>
        {enrolledList.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 8 }}>No enrolled courses yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Course name</th>
                <th>Platform</th>
                <th>Level</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {enrolledList.map(({ id, course }) => (
                <tr key={id}>
                  <td style={{ fontWeight: 600, color: "var(--t)" }}>
                    {course?.title || `Course ${id}`}
                  </td>
                  <td>{course?.platform || "—"}</td>
                  <td>{course?.difficulty || course?.level || "—"}</td>
                  <td>
                    {course?.category ? <span className="tg">{course.category}</span> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
