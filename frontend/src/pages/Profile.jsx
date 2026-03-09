import { useEffect, useMemo, useState } from "react";
import { getSession } from "../services/authService.js";
import { fetchRecommendations } from "../services/recommendationService.js";
import { buildLearningInsights } from "../services/learningInsights.js";
import { useUiStore } from "../store/ui.js";

export default function Profile() {
  const session = getSession();
  const user = session?.user || {};
  const enrolledCourses = useUiStore((state) => state.enrolledCourses);
  const [recommendations, setRecommendations] = useState([]);

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

  const insights = useMemo(
    () => buildLearningInsights(user, recommendations, enrolledCourses),
    [user, recommendations, enrolledCourses]
  );

  const interests = user.interests || ["Machine Learning", "Python", "React"];
  const name = user.name || "Alex Kim";
  const email = user.email || "alex.kim@university.edu";
  const skill = user.skill || "Intermediate";

  return (
    <div className="page anim">
      <div className="profile-header">
        <div className="profile-av">{name[0]}</div>
        <div style={{ flex: 1 }}>
          <div className="profile-name">{name}</div>
          <div className="profile-sub">
            {skill} · {user.goal || "Machine Learning Engineer"} Track · {email}
          </div>
          <div className="profile-tags">
            {interests.map((interest) => (
              <span key={interest} className="tg">{interest}</span>
            ))}
          </div>
        </div>
        <button className="btn bg">Edit Profile</button>
      </div>

      <div className="g2">
        <div className="card analytics-card">
          <div className="analytics-title">Learning DNA</div>
          {[
            ["Strongest skill domain", insights.topSkillDomain],
            ["Weakest skill domain", insights.weakestSkillDomain],
            ["Preferred difficulty level", skill],
            ["Average match score", `${insights.averageMatchScore || 0}%`],
          ].map(([label, value]) => (
            <div className="dna-row" key={label}>
              <span className="dna-k">{label}</span>
              <span className="dna-v">{value}</span>
            </div>
          ))}
        </div>

        <div className="card analytics-card">
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

      <div className="card analytics-card">
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
    </div>
  );
}
