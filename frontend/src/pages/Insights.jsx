import { useEffect, useMemo, useState } from "react";
import { getSession } from "../services/authService.js";
import { fetchRecommendations } from "../services/recommendationService.js";
import { useUiStore } from "../store/ui.js";
import { buildLearningInsights } from "../services/learningInsights.js";
import { BarChart, GrowthChart, PieChart } from "../components/common/AnalyticsCharts.jsx";

export default function Insights() {
  const session = getSession();
  const user = session?.user || {};
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

  if (loading) {
    return <div className="page anim"><div className="empty-state">Loading insights...</div></div>;
  }

  return (
    <div className="page anim">
      <div className="ph">
        <div className="pt">Insights</div>
        <div className="ps">A clearer view of where your learning momentum is strongest and where to focus next.</div>
      </div>

      <div className="insights-grid">
        <section className="card analytics-card">
          <div className="analytics-title">Weekly Learning Activity</div>
          <BarChart labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} values={insights.weeklyActivity} />
        </section>

        <section className="card analytics-card">
          <div className="analytics-title">Skill Distribution Chart</div>
          <PieChart data={insights.domainDistribution.slice(0, 5)} />
        </section>

        <section className="card analytics-card">
          <div className="analytics-title">Skill Growth</div>
          <GrowthChart items={insights.skillGrowth} />
        </section>

        <section className="card analytics-card">
          <div className="analytics-title">Strongest Skill Areas</div>
          <div className="insight-pill-list">
            {insights.strongestAreas.map((item) => (
              <div className="insight-pill" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="card analytics-card">
          <div className="analytics-title">Weak Skill Areas</div>
          <div className="insight-pill-list">
            {insights.weakAreas.map((item) => (
              <div className="insight-pill weak" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="card analytics-card">
          <div className="analytics-title">Recommended Focus Areas</div>
          <div className="focus-area-list">
            {insights.recommendedFocusAreas.map((item) => (
              <div className="focus-area-item" key={item}>
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
