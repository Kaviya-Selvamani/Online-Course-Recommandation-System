export default function AdminDashboard() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const enr = [45, 62, 38, 80, 70, 90, 55];
  const maxE = Math.max(...enr);

  return (
    <div className="page anim">
      <div className="ph">
        <div className="pt">Admin Dashboard</div>
        <div className="ps">Platform intelligence overview · Feb 23, 2026</div>
      </div>

      <div className="am-grid">
        {[
          ["1,284", "Total Users", "↑ +48 this week"],
          ["48", "Total Courses", "4 pending review"],
          ["81%", "Avg Relevance Score", "↑ +3% this month"],
          ["↑ 23%", "Enrollment Trend", "vs last month"],
        ].map(([v, l, d]) => (
          <div className="am" key={l}>
            <div className="am-val">{v}</div>
            <div className="am-lbl">{l}</div>
            <div className="am-d">{d}</div>
          </div>
        ))}
      </div>

      <div className="g2">
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--t3)", marginBottom: 14 }}>
            Daily Enrollments
          </div>
          <div className="bar-chart">
            {days.map((d, i) => (
              <div className="bar-col" key={d + i}>
                <div className="bar-fill" style={{ height: (enr[i] / maxE) * 76 + "px" }} />
                <div className="bar-lbl">{d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--t3)", marginBottom: 14 }}>
            Skill Distribution
          </div>
          {[
            ["Beginner", 42, "#4ab8f5"],
            ["Intermediate", 38, "#18c98a"],
            ["Advanced", 20, "#f0a030"],
          ].map(([l, p, c]) => (
            <div className="skill-row" key={l}>
              <div className="skill-top">
                <span className="skill-lbl">{l}</span>
                <span className="skill-pct">{p}%</span>
              </div>
              <div className="skill-track">
                <div className="skill-fill" style={{ width: p + "%", background: c }} />
              </div>
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--t3)", marginBottom: 10 }}>
              Category Popularity
            </div>
            {[
              ["AI/ML", 68],
              ["Web Dev", 52],
              ["Data", 45],
              ["Design", 22],
            ].map(([l, p]) => (
              <div className="skill-row" key={l}>
                <div className="skill-top">
                  <span className="skill-lbl">{l}</span>
                  <span className="skill-pct">{p}%</span>
                </div>
                <div className="skill-track">
                  <div className="skill-fill" style={{ width: p + "%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Level</th>
              <th>Career Goal</th>
              <th>Joined</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Jordan Patel", "j.patel@uni.edu", "Beginner", "Frontend Dev", "Feb 22"],
              ["Mei Lin", "mei.lin@edu.org", "Advanced", "ML Engineer", "Feb 22"],
              ["Carlos Ruiz", "c.ruiz@college.edu", "Intermediate", "Data Analyst", "Feb 21"],
              ["Aisha Nkomo", "a.nkomo@uni.edu", "Beginner", "UX Designer", "Feb 21"],
              ["Ravi Gupta", "r.gupta@tech.edu", "Intermediate", "Backend Dev", "Feb 20"],
            ].map(([n, e, l, g, d]) => (
              <tr key={e}>
                <td style={{ fontWeight: 600, color: "var(--t)" }}>{n}</td>
                <td>{e}</td>
                <td>
                  <span className={"bdg bdg-" + l.charAt(0).toLowerCase()}>{l}</span>
                </td>
                <td>{g}</td>
                <td>{d}</td>
                <td>
                  <span className="tg" style={{ fontSize: 10 }}>
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

