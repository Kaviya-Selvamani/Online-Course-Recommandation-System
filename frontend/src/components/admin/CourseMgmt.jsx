import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { COURSES } from "../../data/courseiq1.js";

export default function CourseMgmt() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return COURSES.filter((c) => {
      const matchesSearch =
        !query ||
        c.title.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query);
      const matchesCategory = category === "all" || c.category === category;
      const matchesLevel = level === "all" || c.difficulty.toLowerCase() === level;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [search, category, level]);

  const categories = useMemo(
    () => ["all", ...new Set(COURSES.map((c) => c.category))],
    []
  );

  const handleDelete = (course) => {
    if (!window.confirm(`Delete "${course.title}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(course.id);
    setTimeout(() => {
      setDeletingId(null);
    }, 700);
  };

  const getSeatStatus = (seats) => {
    if (seats === 0) return { label: "Full", bg: "rgba(231,76,60,.12)", color: "#e74c3c" };
    if (seats < 20) return { label: "Low", bg: "rgba(240,160,48,.12)", color: "#f0a030" };
    return { label: "Available", bg: "rgba(24,201,138,.12)", color: "#18c98a" };
  };

  return (
    <div className="page anim">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="pt">Course Management</div>
          <div className="ps">Manage all courses on the platform</div>
        </div>
        <button className="btn bp" onClick={() => navigate("/admin/add-course")}>+ Add New Course</button>
      </div>

      <div className="cm-toolbar">
        <div className="cm-search">
          <span style={{ color: "var(--t3)", fontSize: 14 }}>🔍</span>
          <input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="fi" style={{ width: "auto", padding: "7px 13px" }} value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All Categories" : c}
            </option>
          ))}
        </select>
        <select className="fi" style={{ width: "auto", padding: "7px 13px" }} value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
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
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 16, color: "var(--t2)" }}>
                  No courses match your search. Try a different keyword or filter.
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const status = getSeatStatus(c.seats);
                return (
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
                      <span className="tg" style={{ fontSize: 10, background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn bg bsm">Edit</button>
                        <button className="btn bd-btn bsm" disabled={deletingId === c.id} onClick={() => handleDelete(c)}>
                          {deletingId === c.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
