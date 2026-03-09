export default function SysHealth() {
  const metrics = [
    { icon: "🖥️", l: "Server Uptime", v: "99.8%", s: "ok" },
    { icon: "⚡", l: "API Response", v: "142ms", s: "ok" },
    { icon: "💾", l: "DB Load", v: "68%", s: "warn" },
    { icon: "👥", l: "Active Users", v: "347", s: "ok" },
  ];

  const logs = [
    { c: "#18c98a", msg: "Recommendation engine recalculated for 284 users", t: "2 min ago" },
    { c: "#f0a030", msg: "Database CPU spiked to 68% — monitoring", t: "8 min ago" },
    { c: "#18c98a", msg: "Course catalog sync completed successfully", t: "15 min ago" },
    { c: "#18c98a", msg: "New user batch processed (48 users)", t: "1 hour ago" },
    { c: "#f05a4a", msg: "Failed login attempt detected from 192.168.x.x", t: "2 hours ago" },
    { c: "#18c98a", msg: "Nightly backup completed — 2.4GB stored", t: "6 hours ago" },
  ];

  return (
    <div className="page anim">
      <div className="ph">
        <div className="pt">System Health</div>
        <div className="ps">Real-time platform monitoring and diagnostics</div>
      </div>

      <div className="health-grid">
        {metrics.map((m) => (
          <div className={"hc " + m.s} key={m.l}>
            <div className="hc-icon">{m.icon}</div>
            <div className="hc-val">{m.v}</div>
            <div className="hc-lbl">{m.l}</div>
          </div>
        ))}
      </div>

      <div className="g2">
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--fd)", fontSize: 13.5, fontWeight: 700, color: "var(--t)", marginBottom: 14 }}>
            Service Status
          </div>
          {[
            ["Recommendation Engine", "Online", "#18c98a"],
            ["Course Catalog API", "Online", "#18c98a"],
            ["Authentication", "Online", "#18c98a"],
            ["Database Cluster", "Degraded", "#f0a030"],
            ["File Storage", "Online", "#18c98a"],
            ["Email Service", "Online", "#18c98a"],
          ].map(([service, status, color]) => (
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
          {[
            ["CPU Usage", 52, "#18c98a"],
            ["Memory", 71, "#f0a030"],
            ["Storage", 38, "#4ab8f5"],
            ["Bandwidth", 29, "#18c98a"],
          ].map(([label, pct, color]) => (
            <div className="skill-row" key={label}>
              <div className="skill-top">
                <span className="skill-lbl">{label}</span>
                <span className="skill-pct">{pct}%</span>
              </div>
              <div className="skill-track">
                <div className="skill-fill" style={{ width: pct + "%", background: color }} />
              </div>
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            {[
              ["Requests/min", "2,847"],
              ["Cache Hit Rate", "94.2%"],
              ["Error Rate", "0.02%"],
              ["Queue Depth", "12 jobs"],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "7px 0",
                  borderBottom: "1px solid var(--bd)",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--t2)" }}>{k}</span>
                <span style={{ fontWeight: 600, color: "var(--t)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontFamily: "var(--fd)", fontSize: 13.5, fontWeight: 700, color: "var(--t)", marginBottom: 14 }}>
          System Logs
        </div>
        {logs.map((l, i) => (
          <div className="log-item" key={i}>
            <div className="log-dot" style={{ background: l.c }} />
            <div>
              <div className="log-msg">{l.msg}</div>
              <div className="log-time">{l.t}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

