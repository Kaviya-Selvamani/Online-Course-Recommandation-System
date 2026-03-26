import { useEffect, useState } from "react";
import { fetchAdminOverview } from "../../services/adminService.js";

function formatUptime(seconds) {
  if (!seconds) return "—";
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}

export default function SysHealth() {
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
          setError(err.response?.data?.error || "Failed to load system health.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const health = overview?.systemHealth || {};
  const userActivity = overview?.userActivity || {};
  const logs = overview?.logs || [];

  const metrics = [
    { icon: "🖥️", l: "Server Uptime", v: formatUptime(health.uptimeSeconds), s: "ok" },
    { icon: "⚡", l: "API Response", v: `${health.avgResponseMs || 0}ms`, s: health.avgResponseMs > 800 ? "warn" : "ok" },
    { icon: "💾", l: "DB Load", v: `${health.dbLoad?.score || 0}%`, s: health.dbLoad?.status === "warning" ? "warn" : "ok" },
    { icon: "👥", l: "Active Users", v: `${userActivity.activeUsersToday || 0}`, s: "ok" },
  ];

  const serviceStatus = [
    ["Recommendation Engine", "Online", "#18c98a"],
    ["Course Catalog API", "Online", "#18c98a"],
    ["Authentication", "Online", "#18c98a"],
    ["Database Cluster", health.dbLoad?.status === "warning" ? "Degraded" : "Online", health.dbLoad?.status === "warning" ? "#f0a030" : "#18c98a"],
    ["Email Service", "Online", "#18c98a"],
  ];

  const resourceUsage = [
    ["Error Rate", health.errorRate || 0, health.errorRate > 2 ? "#f0a030" : "#18c98a"],
    ["Requests / min", Math.min(100, health.requestsPerMinute || 0), "#4ab8f5"],
    ["DB Load", health.dbLoad?.score || 0, health.dbLoad?.status === "warning" ? "#f0a030" : "#18c98a"],
    ["Latency p95", Math.min(100, Math.round((health.p95ResponseMs || 0) / 10)), "#18c98a"],
  ];

  return (
    <div className="page anim">
      <div className="ph">
        <div className="pt">System Health</div>
        <div className="ps">Real-time platform monitoring and diagnostics</div>
      </div>

      {error ? <div className="card" style={{ padding: 16 }}>{error}</div> : null}

      <div className="health-grid">
        {metrics.map((m) => (
          <div className={"hc " + m.s} key={m.l}>
            <div className="hc-icon">{m.icon}</div>
            <div className="hc-val">{loading ? "—" : m.v}</div>
            <div className="hc-lbl">{m.l}</div>
          </div>
        ))}
      </div>

      <div className="g2">
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--fd)", fontSize: 13.5, fontWeight: 700, color: "var(--t)", marginBottom: 14 }}>
            Service Status
          </div>
          {serviceStatus.map(([service, status, color]) => (
            <div
              key={service}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "9px 0",
                borderBottom: "1px solid var(--bd)",
              }}
            >
              <span style={{ fontSize: 13.5, color: "var(--t2)" }}>{service}</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color,
                  background: color + "22",
                  padding: "3px 9px",
                  borderRadius: 20,
                }}
              >
                {status}
              </span>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--fd)", fontSize: 13.5, fontWeight: 700, color: "var(--t)", marginBottom: 14 }}>
            Resource Usage
          </div>
          {resourceUsage.map(([label, pct, color]) => (
            <div className="skill-row" key={label}>
              <div className="skill-top">
                <span className="skill-lbl">{label}</span>
                <span className="skill-pct">{pct}%</span>
              </div>
              <div className="skill-track">
                <div className="skill-fill" style={{ width: Math.min(100, pct) + "%", background: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontFamily: "var(--fd)", fontSize: 13.5, fontWeight: 700, color: "var(--t)", marginBottom: 14 }}>
          System Logs
        </div>
        {loading ? (
          <div className="activity-empty">Loading logs...</div>
        ) : logs.length ? (
          logs.map((log) => (
            <div className="log-item" key={log.id}>
              <div className="log-dot" style={{ background: log.level === "error" ? "#f05a4a" : log.level === "warning" ? "#f0a030" : "#18c98a" }} />
              <div>
                <div className="log-msg">{log.message}</div>
                <div className="log-time">{new Date(log.time).toLocaleString()}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="activity-empty">No logs yet.</div>
        )}
      </div>
    </div>
  );
}
