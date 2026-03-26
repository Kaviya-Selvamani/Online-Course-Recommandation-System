import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "../services/authService.js";
import { fetchCoursesCatalog } from "../services/courseService.js";
import { fetchRecommendations } from "../services/recommendationService.js";
import { buildLearningInsights } from "../services/learningInsights.js";
import { useUiStore } from "../store/ui.js";

import ProfileHeader from "../components/profile/ProfileHeader.jsx";
import LearningProfileCard from "../components/profile/LearningProfileCard.jsx";
import ProgressSummary from "../components/profile/ProgressSummary.jsx";
import PerformanceAnalytics from "../components/profile/PerformanceAnalytics.jsx";
import RecommendationInsights from "../components/profile/RecommendationInsights.jsx";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function Profile() {
  const navigate = useNavigate();
  const session = getSession();
  const user = useMemo(() => session?.user || {}, [session]);
  const enrolledCourses = useUiStore((state) => state.enrolledCourses || []);

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
  const whyRecommended = missingSkills.length
    ? missingSkills.map((skill) => `Builds ${skill} skills`) : [];

  return (
    <div className="page anim">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 text-slate-100">
        <ProfileHeader
          name={name}
          email={email}
          avatarUrl={avatarUrl}
          joinedDate={joinedDate}
          bio={bio}
          skillLevel={skillLevel}
          careerTarget={careerTarget}
          onEdit={() => navigate("/settings")}
        />

        <ProgressSummary
          enrolledCount={enrolledCount}
          completedCount={completedCount}
          inProgressCount={inProgressCount}
          progressPercent={progressPercent}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <LearningProfileCard
            skillLevel={skillLevel}
            interests={interests}
            careerGoal={careerTarget}
            studyHours={studyHours}
          />
          <PerformanceAnalytics
            weeklyActivity={weeklyActivity}
            studyHours={studyHours}
            consistencyScore={consistencyScore}
          />
          <RecommendationInsights
            reasons={whyRecommended}
            nextCourse={nextBestCourse}
            skillGaps={missingSkills}
          />
        </div>
      </div>
    </div>
  );
}
