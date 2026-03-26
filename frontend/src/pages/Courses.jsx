import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import PlatformBadge from "../components/common/PlatformBadge.jsx";
import { getBarColor, getMatch } from "../data/courseiq1.js";
import { fetchCoursesCatalog } from "../services/courseService.js";
import { enrollCourse, unenrollCourse } from "../services/courseService.js";
import { useUiStore } from "../store/ui.js";

function getCourseAccent(course) {
  const category = String(course?.category || "").toLowerCase();
  if (category.includes("ai") || category.includes("ml")) return "var(--bg-ml)";
  if (category.includes("data")) return "var(--bg-py)";
  if (category.includes("cloud") || category.includes("aws")) return "var(--bg-aws)";
  if (category.includes("web") || category.includes("frontend")) return "var(--bg-web)";
  if (category.includes("design") || category.includes("ux")) return "var(--bg-ux)";
  return "var(--bg-api)";
}

function getCourseEmoji(course) {
  const category = String(course?.category || "").toLowerCase();
  if (category.includes("ai") || category.includes("ml")) return "AI";
  if (category.includes("data")) return "DS";
  if (category.includes("cloud") || category.includes("aws")) return "CL";
  if (category.includes("web") || category.includes("frontend")) return "WEB";
  if (category.includes("design") || category.includes("ux")) return "UX";
  return "CS";
}

function getCatalogScore(course) {
  const ratingScore = Math.round((Number(course?.rating || 0) / 5) * 100);
  const popularityScore = Math.min(100, Math.round(Number(course?.enrollments || 0)));
  return Math.round(ratingScore * 0.65 + popularityScore * 0.35);
}

export default function Courses() {
  const navigate = useNavigate();
  const { openExplain } = useOutletContext();
  const [params] = useSearchParams();

  const initialCourseId = params.get("courseId");
  const [search, setSearch] = useState("");
  const [diffF, setDiffF] = useState("all");
  const [catF, setCatF] = useState("all");
  const [priceF, setPriceF] = useState("all");
  const [platF, setPlatF] = useState("all");
  const [view, setView] = useState("all");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const enrolledCourses = useUiStore((state) => state.enrolledCourses);

  useEffect(() => {
    if (initialCourseId) {
      navigate(`/course/${initialCourseId}`);
    }
  }, [initialCourseId, navigate]);

  useEffect(() => {
    let cancelled = false;

    fetchCoursesCatalog()
      .then((data) => {
        if (!cancelled) {
          setCourses(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCourses([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => ["all", ...new Set(courses.map((course) => course.category).filter(Boolean))], [courses]);
  const platforms = useMemo(() => ["all", ...new Set(courses.map((course) => course.platform).filter(Boolean))], [courses]);
  const knownIdSet = useMemo(() => new Set(courses.map((course) => String(course._id))), [courses]);

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => {
        const matchesSearch =
          course.title.toLowerCase().includes(search.toLowerCase()) ||
          course.category.toLowerCase().includes(search.toLowerCase()) ||
          (course.tags || []).some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

        const matchesDifficulty = diffF === "all" || course.difficulty.toLowerCase() === diffF;
        const matchesCategory = catF === "all" || course.category === catF;
        const matchesPrice = priceF === "all" || (priceF === "free" ? course.isFree : !course.isFree);
        const matchesPlatform = platF === "all" || course.platform === platF;

        return matchesSearch && matchesDifficulty && matchesCategory && matchesPrice && matchesPlatform;
      }),
    [courses, search, diffF, catF, priceF, platF]
  );

  const enrolledIdSet = useMemo(
    () => new Set((enrolledCourses || []).map((id) => String(id))),
    [enrolledCourses]
  );

  const hasUnknownEnrolled = useMemo(
    () => (enrolledCourses || []).some((id) => !knownIdSet.has(String(id))),
    [enrolledCourses, knownIdSet]
  );

  const visibleCourses = useMemo(() => {
    if (view !== "enrolled") return filteredCourses;
    return filteredCourses.filter((course) =>
      enrolledIdSet.has(String(course._id))
    );
  }, [filteredCourses, view, enrolledIdSet]);

  return (
    <div className="page anim">
      <div className="ph">
        <div className="pt">Courses</div>
        <div className="ps">A production-style catalog with platform, duration, pricing, and transparent fit indicators.</div>
      </div>

      <div className="ftabs" style={{ marginBottom: 12 }}>
        {[
          ["all", "All Courses"],
          ["enrolled", `My Courses (${enrolledCourses.length})`],
        ].map(([value, label]) => (
          <button key={value} className={`ft ${view === value ? "on" : ""}`} onClick={() => setView(value)}>
            {label}
          </button>
        ))}
      </div>

      <div className="catalog-toolbar">
        <div className="cm-search">
          <span style={{ color: "var(--t3)", fontSize: 14 }}>🔍</span>
          <input placeholder="Search courses, tags, platforms..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>

        <select className="fi" value={diffF} onChange={(event) => setDiffF(event.target.value)}>
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <select className="fi" value={catF} onChange={(event) => setCatF(event.target.value)}>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "all" ? "All Categories" : category}
            </option>
          ))}
        </select>

        <select className="fi" value={platF} onChange={(event) => setPlatF(event.target.value)}>
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform === "all" ? "All Platforms" : platform}
            </option>
          ))}
        </select>

        <select className="fi" value={priceF} onChange={(event) => setPriceF(event.target.value)}>
          <option value="all">All Prices</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div className="catalog-count">
        {view === "enrolled" ? `${visibleCourses.length} enrolled courses` : `${visibleCourses.length} courses available`}
      </div>

      {loading ? <div className="empty-state">Loading courses...</div> : null}

      <div className="g3">
        {visibleCourses.map((course) => {
          const score = getCatalogScore(course);
          const meta = getMatch(score);
          const isEnrolled = enrolledCourses.some((id) => String(id) === String(course._id));
          const externalCourseLink = course.courseUrl || "";

          return (
            <div className="card catalog-card lift" key={course._id} onClick={() => navigate(`/course/${course._id}`)}>
              <div className="catalog-card-banner" style={{ background: getCourseAccent(course) }}>
                <div className="catalog-card-emoji">{getCourseEmoji(course)}</div>
                <PlatformBadge platform={course.platform} />
              </div>

              <div className="catalog-card-body">
                <div className="ctitle">{course.title}</div>
                <div className="course-card-sub">{course.provider} · {course.duration}</div>

                <div className="course-card-metrics">
                  <span>⭐ {course.rating}</span>
                  <span>{course.isFree ? "Free" : `$${course.price}`}</span>
                  <span>{course.difficulty}</span>
                </div>

                <div className="catalog-fit-row">
                  <span className={`match-tag ${meta.label.toLowerCase().replace(/\s+/g, "-")}`}>{meta.label}</span>
                  <strong>{score}%</strong>
                </div>

                <div className="mbar">
                  <div className="mfill" style={{ width: `${score}%`, background: getBarColor(score) }} />
                </div>

                <div className="course-card-tags">
                  {(course.tags || []).map((tag) => (
                    <span key={tag} className="tg">{tag}</span>
                  ))}
                </div>

                <div className="course-card-actions" onClick={(event) => event.stopPropagation()}>
                  <a
                    className="btn bg"
                    href={externalCourseLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                    onClick={(event) => {
                      if (!externalCourseLink) {
                        event.preventDefault();
                        alert("Course link is unavailable for this item.");
                      }
                    }}
                  >
                    View
                  </a>
                  <button
                    className="btn"
                    style={
                      isEnrolled
                        ? { background: "#c0392b", color: "#fff", border: "1px solid #a93226" }
                        : { background: "var(--ac)", color: "#fff", border: "1px solid var(--ac)" }
                    }
                    onClick={async () => {
                      try {
                        if (isEnrolled) {
                          await unenrollCourse(course._id);
                          return;
                        }
                        await enrollCourse(course._id);
                      } catch (err) {
                        alert(err.response?.data?.error || err.message || "Failed to update enrollment.");
                      }
                    }}
                  >
                    {isEnrolled ? "Unenroll" : "Enroll"}
                  </button>
                  <button className="btn bg" onClick={() => openExplain(course)}>Explain</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && visibleCourses.length === 0 ? (
        <div className="empty-state">
          {view === "enrolled"
            ? enrolledCourses.length === 0
              ? "No enrolled courses yet. Enroll from Recommendations to build your list."
              : hasUnknownEnrolled
                ? "Your enrolled courses were added from recommendations and appear in the Roadmap."
                : "No enrolled courses match your filters."
            : "No courses match your filters."}
        </div>
      ) : null}
    </div>
  );
}
