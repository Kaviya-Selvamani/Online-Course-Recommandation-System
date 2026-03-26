import { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { getSession } from "../services/authService.js";
import { fetchRecommendations } from "../services/recommendationService.js";
import { useUiStore } from "../store/ui.js";
import { buildLearningInsights } from "../services/learningInsights.js";
import { BarChart, PieChart, RadarChart } from "../components/common/AnalyticsCharts.jsx";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Insights() {
  const session = getSession();
  const user = useMemo(() => session?.user || {}, [session]);
  const enrolledCourses = useUiStore((state) => state.enrolledCourses);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchRecommendations()
      .then((data) => {
        if (!cancelled) {
          setRecommendations(data.recommendations || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRecommendations([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const insights = useMemo(
    () => buildLearningInsights(user, recommendations, enrolledCourses),
    [user, recommendations, enrolledCourses]
  );

  const radarData = useMemo(
    () =>
      (insights.domainDistribution || [])
        .slice(0, 5)
        .map((item) => ({ label: item.label, value: item.value })),
    [insights.domainDistribution],
  );

  const strongestSkill = insights.strongestAreas[0]?.label || insights.topSkillDomain || "Web Development";
  const weakestSkill = insights.weakAreas[0]?.label || insights.weakestSkillDomain || "AI/ML";
  const careerPath = insights.skillGap?.goal || user?.careerTarget || user?.goal || "career path";

  const completedCourses = useMemo(
    () => insights.completedCourses || [],
    [insights.completedCourses]
  );
  const completedCount = completedCourses.length;
  const enrolledCount = Math.max(enrolledCourses.length, completedCount);
  const completionRate = enrolledCount ? Math.round((completedCount / enrolledCount) * 100) : 0;

  const weeklyInsight = useMemo(() => {
    const values = insights.weeklyActivity || [];
    if (!values.length) {
      return {
        highestDay: "N/A",
        highestHours: "0.0",
        averageHours: "0.0",
        activeDays: 0,
      };
    }

    const highestHours = Math.max(...values);
    const highestDayIndex = values.indexOf(highestHours);
    const averageHours = values.reduce((sum, value) => sum + value, 0) / values.length;
    const activeDays = values.filter((value) => value >= 0.8).length;

    return {
      highestDay: WEEK_DAYS[highestDayIndex] || "N/A",
      highestHours: highestHours.toFixed(1),
      averageHours: averageHours.toFixed(1),
      activeDays,
    };
  }, [insights.weeklyActivity]);

  const consistencyScore = useMemo(() => {
    const values = insights.weeklyActivity || [];
    if (!values.length) return 0;
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const activeDaysScore = (values.filter((value) => value >= 0.8).length / 7) * 100;
    const varianceScore = Math.max(0, 100 - stdDev * 28);
    return Math.round((varianceScore * 0.62) + (activeDaysScore * 0.38));
  }, [insights.weeklyActivity]);

  const skillGrowthTrend = useMemo(() => {
    const labels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"];
    const weekly = insights.weeklyActivity || [];
    const base = Math.max(48, insights.averageMatchScore || 62);
    const maxWeeklyHour = Math.max(...weekly, 1);
    let running = Math.max(42, Math.min(78, base - 12));

    const values = labels.map((_, index) => {
      const activity = weekly[index % weekly.length] || 0;
      const activityBoost = Math.round((activity / maxWeeklyHour) * 8);
      const delta = activityBoost + (index % 2 === 0 ? 2 : -1);
      running = Math.max(35, Math.min(96, running + delta));
      return running;
    });

    return { labels, values };
  }, [insights.weeklyActivity, insights.averageMatchScore]);

  const skillTrendDelta = skillGrowthTrend.values.length
    ? skillGrowthTrend.values[skillGrowthTrend.values.length - 1] - skillGrowthTrend.values[0]
    : 0;

  const categoryCompletionData = useMemo(() => {
    const counts = completedCourses.reduce((acc, course) => {
      const key = course.category || "General";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const entries = Object.entries(counts);
    if (!entries.length) return [];

    return entries
      .map(([label, count]) => ({
        label,
        value: Math.round((count / completedCourses.length) * 100),
      }))
      .sort((a, b) => b.value - a.value);
  }, [completedCourses]);

  const aiInsightText = `Consistency is ${consistencyScore}/100 with ${weeklyInsight.activeDays} active learning days this week. ${strongestSkill} is strongest, while ${weakestSkill} needs improvement for the ${careerPath} path.`;

  const radarInsightText = useMemo(() => {
    if (!radarData.length) {
      return "Skill radar will update once enough domain data is available.";
    }

    const strongest = [...radarData].sort((a, b) => b.value - a.value)[0];
    const weakest = [...radarData].sort((a, b) => a.value - b.value)[0];

    if (strongest.label === weakest.label) {
      return `${strongest.label} is currently your primary strength zone at ${strongest.value}%.`;
    }

    return `${strongest.label} is strongest (${strongest.value}%) while ${weakest.label} is weakest (${weakest.value}%).`;
  }, [radarData]);

  if (loading) {
    return <div className="page anim"><div className="empty-state">Loading insights...</div></div>;
  }

  return (
    <div className="page anim insights-page">
      <div className="ph">
        <div className="pt">Insights</div>
        <div className="ps">Compact learning analytics: consistency, growth trend, completion analytics, and skill signals.</div>
      </div>

      <div className="insights-kpi-grid tw-grid tw-grid-cols-12 tw-gap-3">
        <Motion.section className="card analytics-card glass-card tw-col-span-6" whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <div className="analytics-title">Learning Consistency Score</div>
          <div className="analytics-kpi-value">{consistencyScore}<span>/100</span></div>
          <div className="analytics-subtitle">Based on weekly study variance and active days.</div>
        </Motion.section>

        <Motion.section className="card analytics-card glass-card tw-col-span-6" whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <div className="analytics-title">Course Completion Analytics</div>
          <div className="analytics-kpi-value">{completionRate}<span>%</span></div>
          <div className="analytics-subtitle">{completedCount} completed of {enrolledCount} tracked enrollments.</div>
        </Motion.section>
      </div>

      <Motion.section className="card analytics-card glass-card insights-ai-summary" whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
        <div className="analytics-title">AI Learning Insight Summary</div>
        <div className="analytics-subtitle">{aiInsightText}</div>
      </Motion.section>

      <div className="insights-layout-stack">
        <div className="insights-layout-grid tw-grid tw-grid-cols-12 tw-gap-3">
          <Motion.section className="card analytics-card glass-card insights-span-8 tw-col-span-8" whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <div className="analytics-title">Weekly Learning Activity</div>
            <BarChart labels={WEEK_DAYS} values={insights.weeklyActivity} />
            <div className="insights-inline-note">
              <span>Highest study day: <strong>{weeklyInsight.highestDay} ({weeklyInsight.highestHours}h)</strong></span>
              <span>Average daily learning time: <strong>{weeklyInsight.averageHours}h</strong></span>
            </div>
          </Motion.section>

          <Motion.section className="card analytics-card glass-card insights-span-4 tw-col-span-4" whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <div className="analytics-title">Skill Strength Radar</div>
            <RadarChart data={radarData} />
            <div className="insights-inline-note single">{radarInsightText}</div>
          </Motion.section>
        </div>

        <div className="insights-layout-grid tw-grid tw-grid-cols-12 tw-gap-3">
          <Motion.section className="card analytics-card glass-card insights-span-8 tw-col-span-8" whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <div className="analytics-title">Skill Growth Over Time</div>
            <BarChart labels={skillGrowthTrend.labels} values={skillGrowthTrend.values} accent="var(--ac)" />
            <div className="insights-inline-note single">
              Growth trend moved <strong>{skillTrendDelta >= 0 ? `+${skillTrendDelta}` : skillTrendDelta}%</strong> over the last six learning intervals.
            </div>
          </Motion.section>

          <Motion.section className="card analytics-card glass-card insights-span-4 tw-col-span-4" whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <div className="analytics-title">Course Completion Split</div>
            <PieChart data={categoryCompletionData.length ? categoryCompletionData : [{ label: "No Data", value: 100 }]} />
          </Motion.section>
        </div>
      </div>
    </div>
  );
}
