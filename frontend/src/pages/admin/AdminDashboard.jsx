import { useEffect, useMemo, useState } from "react";
import { fetchAdminOverview } from "../../services/adminService.js";

function formatNumber(value) {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString?.() || value;
}

function formatUptime(seconds) {
  if (!seconds) return "—";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchAdminOverview()
      .then((data) => {
        if (!cancelled) {
          setOverview(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.error || "Failed to load admin overview.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totals = overview?.totals || {};
  const insights = overview?.courseInsights || {};
  const optimization = overview?.recommendationOptimization || {};
  const userActivity = overview?.userActivity || {};
  const feedback = overview?.feedbackAnalysis || {};
  const rankings = overview?.courseRankings || {};
  const alerts = overview?.alerts || [];
  const health = overview?.systemHealth || {};
  const logs = overview?.logs || [];

  const metrics = useMemo(() => {
    return [
      [formatNumber(totals.users), "Total Users", "All accounts"],
      [formatNumber(userActivity.activeUsersToday), "Active Users Today", "Logged in last 24h"],
      [formatNumber(userActivity.inactiveUsers), "Inactive > 7 days", "Needs re-engagement"],
      [formatNumber(totals.courses), "Total Courses", "Live catalog"],
      [formatNumber(totals.enrollments), "Total Enrollments", "All-time"],
      [formatNumber(alerts.length), "Active Alerts", "Auto generated"],
    ];
  }, [totals, userActivity, alerts]);

  const weightEntries = Object.entries(optimization.weights || {});

  return (
    <div className="page anim">
      <div className="ph">
        <div className="pt">Intelligent Monitoring Dashboard</div>
        <div className="ps">Auto insights and system intelligence · Live signals</div>
      </div>

      <div className="am-grid">
        {metrics.map(([v, l, d]) => (
          <div className="am" key={l}>
            <div className="am-val">{loading ? "—" : v}</div>
            <div className="am-lbl">{l}</div>
            <div className="am-d">{d}</div>
          </div>
        ))}
      </div>

      {error ? <div className="card" style={{ padding: 16 }}>{error}</div> : null}

      <div className="admin-layout">
        <div className="admin-main">
          <div className="card admin-card">
            <div className="admin-card-title">Auto Course Insights</div>
            {loading ? (
              <div className="activity-empty">Loading insights...</div>
            ) : (
              <div className="grid" style={{ gap: 16 }}>
                <div>
                  <div className="admin-subtitle">Most Popular Courses</div>
                  {(insights.popularCourses || []).map((course) => (
                    <div className="activity-item" key={course.id}>
                      <span className="status-dot ok" />
                      <div className="activity-body">
                        <div className="activity-label">{course.title}</div>
                        <div className="activity-detail">{course.enrollments} enrollments</div>
                      </div>
                      <div className="activity-time">⭐ {course.rating?.toFixed?.(1) || "—"}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="admin-subtitle">Low Performing Courses</div>
                  {(insights.lowPerformingCourses || []).length ? (
                    insights.lowPerformingCourses.map((course) => (
                      <div className="activity-item" key={course.id}>
                        <span className="status-dot warn" />
                        <div className="activity-body">
                          <div className="activity-label">{course.title}</div>
                          <div className="activity-detail">
                            Rating {course.rating || "—"} · Completion {(course.completionRate * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="activity-empty">No low-performing courses detected.</div>
                  )}
                </div>
                <div>
                  <div className="admin-subtitle">Trending Categories</div>
                  {(insights.trendingCategories || []).map((item) => (
                    <div className="skill-row" key={item.category}>
                      <div className="skill-top">
                        <span className="skill-lbl">{item.category}</span>
                        <span className="skill-pct">{item.enrollments}</span>
                      </div>
                      <div className="skill-track">
                        <div className="skill-fill" style={{ width: `${Math.min(100, item.enrollments * 6)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card admin-card">
            <div className="admin-card-title">Auto Recommendation Optimization</div>
            {loading ? (
              <div className="activity-empty">Optimizing weights...</div>
            ) : (
              <>
                <div className="admin-subtitle">Adaptive Weighting</div>
                {weightEntries.length ? (
                  weightEntries.map(([key, value]) => (
                    <div className="skill-row" key={key}>
                      <div className="skill-top">
                        <span className="skill-lbl">{key}</span>
                        <span className="skill-pct">{Math.round(value * 100)}%</span>
                      </div>
                      <div className="skill-track">
                        <div className="skill-fill" style={{ width: `${Math.round(value * 100)}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="activity-empty">No optimization data yet.</div>
                )}
                <div className="admin-subtitle" style={{ marginTop: 12 }}>Why the weights changed</div>
                <ul style={{ margin: 0, paddingLeft: 18, color: "var(--t2)" }}>
                  {(optimization.rationale || []).map((note, idx) => (
                    <li key={idx} style={{ marginBottom: 6 }}>{note}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="card admin-card">
            <div className="admin-card-title">Auto User Activity Monitoring</div>
            <div className="am-grid" style={{ marginTop: 10 }}>
              {[
                [formatNumber(userActivity.activeUsersToday), "Active Users Today"],
                [formatNumber(userActivity.inactiveUsers), "Inactive > 7 days"],
                [formatNumber(userActivity.highPerformers), "High-performing Learners"],
                [formatNumber(userActivity.failedLoginUsers), "Failed Login Watch"],
              ].map(([v, l]) => (
                <div className="am" key={l}>
                  <div className="am-val">{loading ? "—" : v}</div>
                  <div className="am-lbl">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card admin-card">
            <div className="admin-card-title">Auto Alerts</div>
            {loading ? (
              <div className="activity-empty">Loading alerts...</div>
            ) : alerts.length ? (
              alerts.map((alert) => (
                <div className="activity-item" key={alert.id}>
                  <span className={`status-dot ${alert.level === "critical" ? "warn" : "warn"}`} />
                  <div className="activity-body">
                    <div className="activity-label">{alert.message}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="activity-empty">No alerts right now.</div>
            )}
          </div>

          <div className="card admin-card">
            <div className="admin-card-title">Auto Course Ranking</div>
            {loading ? (
              <div className="activity-empty">Ranking courses...</div>
            ) : (
              <>
                <div className="admin-subtitle">Top 5 Courses</div>
                {(rankings.topCourses || []).map((course) => (
                  <div className="activity-item" key={course.id}>
                    <span className="status-dot ok" />
                    <div className="activity-body">
                      <div className="activity-label">{course.title}</div>
                      <div className="activity-detail">Score {course.score}</div>
                    </div>
                  </div>
                ))}
                <div className="admin-subtitle" style={{ marginTop: 12 }}>Fastest Growing</div>
                {rankings.fastestGrowing ? (
                  <div className="activity-item">
                    <span className="status-dot ok" />
                    <div className="activity-body">
                      <div className="activity-label">{rankings.fastestGrowing.title}</div>
                      <div className="activity-detail">+{rankings.fastestGrowing.recentEnrollments} enrollments</div>
                    </div>
                  </div>
                ) : (
                  <div className="activity-empty">No growth data yet.</div>
                )}
                <div className="admin-subtitle" style={{ marginTop: 12 }}>Most Completed</div>
                {rankings.mostCompleted ? (
                  <div className="activity-item">
                    <span className="status-dot ok" />
                    <div className="activity-body">
                      <div className="activity-label">{rankings.mostCompleted.title}</div>
                      <div className="activity-detail">{Math.round(rankings.mostCompleted.completionRate * 100)}% completion</div>
                    </div>
                  </div>
                ) : (
                  <div className="activity-empty">No completion data yet.</div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="admin-side">
          <div className="card admin-card">
            <div className="admin-card-title">System Health</div>
            <div className="status-list">
              <div className="status-item">
                <div>
                  <div className="status-label">Uptime</div>
                  <div className="status-hint">{formatUptime(health.uptimeSeconds)}</div>
                </div>
                <span className="status-pill healthy">OK</span>
              </div>
              <div className="status-item">
                <div>
                  <div className="status-label">API Response</div>
                  <div className="status-hint">Avg {health.avgResponseMs || 0}ms · p95 {health.p95ResponseMs || 0}ms</div>
                </div>
                <span className={`status-pill ${health.avgResponseMs > 800 ? "warning" : "healthy"}`}>
                  {health.avgResponseMs > 800 ? "degraded" : "healthy"}
                </span>
              </div>
              <div className="status-item">
                <div>
                  <div className="status-label">DB Load</div>
                  <div className="status-hint">{health.dbLoad?.score || 0}%</div>
                </div>
                <span className={`status-pill ${health.dbLoad?.status || "healthy"}`}>
                  {health.dbLoad?.status || "healthy"}
                </span>
              </div>
              <div className="status-item">
                <div>
                  <div className="status-label">Error Rate</div>
                  <div className="status-hint">{health.errorRate || 0}%</div>
                </div>
                <span className={`status-pill ${health.errorRate > 2 ? "warning" : "healthy"}`}>
                  {health.errorRate > 2 ? "warning" : "healthy"}
                </span>
              </div>
            </div>
          </div>

          <div className="card admin-card">
            <div className="admin-card-title">Auto Feedback Analysis</div>
            {loading ? (
              <div className="activity-empty">Analyzing feedback...</div>
            ) : (
              <>
                <div className="admin-subtitle">Courses under 3 stars</div>
                {(feedback.lowRatedCourses || []).length ? (
                  feedback.lowRatedCourses.map((course) => (
                    <div className="activity-item" key={course.id}>
                      <span className="status-dot warn" />
                      <div className="activity-body">
                        <div className="activity-label">{course.title}</div>
                        <div className="activity-detail">Rating {course.rating}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="activity-empty">No low-rated courses.</div>
                )}
                <div className="admin-subtitle" style={{ marginTop: 12 }}>Declining Ratings</div>
                {(feedback.decliningCourses || []).length ? (
                  feedback.decliningCourses.map((course) => (
                    <div className="activity-item" key={course.id}>
                      <span className="status-dot warn" />
                      <div className="activity-body">
                        <div className="activity-label">{course.title}</div>
                        <div className="activity-detail">Current rating {course.rating}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="activity-empty">No declining ratings detected.</div>
                )}
                <div className="admin-subtitle" style={{ marginTop: 12 }}>Keyword Flags</div>
                {(feedback.keywordFlags || []).length ? (
                  feedback.keywordFlags.map((course) => (
                    <div className="activity-item" key={course.id}>
                      <span className="status-dot warn" />
                      <div className="activity-body">
                        <div className="activity-label">{course.title}</div>
                        <div className="activity-detail">Flags: {course.feedbackFlags.join(", ")}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="activity-empty">No negative keywords flagged.</div>
                )}
              </>
            )}
          </div>

          <div className="card admin-card">
            <div className="admin-card-title">System Logs</div>
            {loading ? (
              <div className="activity-empty">Loading logs...</div>
            ) : logs.length ? (
              logs.map((log) => (
                <div className="activity-item" key={log.id}>
                  <span className={`status-dot ${log.level === "error" ? "warn" : log.level === "warning" ? "warn" : "ok"}`} />
                  <div className="activity-body">
                    <div className="activity-label">{log.message}</div>
                    <div className="activity-detail">{new Date(log.time).toLocaleString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="activity-empty">No logs yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
