import { useState } from "react";
import { COURSES } from "../../data/courseiq1.js";

export default function CourseMgmt() {
  const [search, setSearch] = useState("");
  const filtered = COURSES.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="page anim">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="pt">Course Management</div>
          <div className="ps">Manage all courses on the platform</div>
        </div>
        <button className="btn bp">+ Add New Course</button>
      </div>

      <div className="cm-toolbar">
        <div className="cm-search">
          <span style={{ color: "var(--t3)", fontSize: 14 }}>🔍</span>
          <input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="fi" style={{ width: "auto", padding: "7px 13px" }}>
          <option>All Categories</option>
          {[...new Set(COURSES.map((c) => c.category))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select className="fi" style={{ width: "auto", padding: "7px 13px" }}>
          <option>All Levels</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
        <div style={{ fontSize: 13, color: "var(--t3)", marginLeft: "auto" }}>{filtered.length} courses</div>
      </div>

      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Category</th>
              <th>Level</th>
              <th>Rating</th>
              <th>Enrolled</th>
              <th>Seats</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ fontSize: 20 }}>{c.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--t)", fontSize: 13 }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: "var(--t3)" }}>{c.instructor}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="tg" style={{ fontSize: 10 }}>
                    {c.category}
                  </span>
                </td>
                <td>
                  <span className={"bdg bdg-" + c.difficulty.charAt(0).toLowerCase()}>{c.difficulty}</span>
                </td>
                <td>⭐ {c.rating}</td>
                <td>{c.enrollments.toLocaleString()}</td>
                <td style={{ color: c.seats < 20 ? "var(--dng)" : "var(--t2)" }}>{c.seats}</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn bg bsm">Edit</button>
                    <button className="btn bd-btn bsm">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

