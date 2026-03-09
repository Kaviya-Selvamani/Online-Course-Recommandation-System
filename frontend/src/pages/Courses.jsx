import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import PlatformBadge from "../components/common/PlatformBadge.jsx";
import { COURSES, calcScore, getBarColor, getMatch } from "../data/courseiq1.js";
import { enrollCourse } from "../services/courseService.js";
import { useUiStore } from "../store/ui.js";

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
  const enrolledCourses = useUiStore((state) => state.enrolledCourses);

  useEffect(() => {
    if (initialCourseId) {
      const id = Number(initialCourseId);
      if (!Number.isNaN(id)) navigate(`/course/${id}`);
    }
  }, [initialCourseId, navigate]);

  const categories = useMemo(() => ["all", ...new Set(COURSES.map((course) => course.category))], []);
  const platforms = useMemo(() => ["all", ...new Set(COURSES.map((course) => course.platform))], []);

  const filteredCourses = useMemo(
    () =>
      COURSES.filter((course) => {
        const matchesSearch =
          course.title.toLowerCase().includes(search.toLowerCase()) ||
          course.category.toLowerCase().includes(search.toLowerCase()) ||
          course.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

        const matchesDifficulty = diffF === "all" || course.difficulty.toLowerCase() === diffF;
        const matchesCategory = catF === "all" || course.category === catF;
        const matchesPrice = priceF === "all" || (priceF === "free" ? course.isFree : !course.isFree);
        const matchesPlatform = platF === "all" || course.platform === platF;

        return matchesSearch && matchesDifficulty && matchesCategory && matchesPrice && matchesPlatform;
      }),
    [search, diffF, catF, priceF, platF]
  );

  return (
    <div className="page anim">
      <div className="ph">
        <div className="pt">Courses</div>
        <div className="ps">A production-style catalog with platform, duration, pricing, and transparent fit indicators.</div>
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

      <div className="catalog-count">{filteredCourses.length} courses available</div>

      <div className="g3">
        {filteredCourses.map((course) => {
          const score = calcScore(course.scores);
          const meta = getMatch(score);
          const isEnrolled = enrolledCourses.some((id) => String(id) === String(course.id));

          return (
            <div className="card catalog-card lift" key={course.id} onClick={() => navigate(`/course/${course.id}`)}>
              <div className="catalog-card-banner" style={{ background: course.bg }}>
                <div className="catalog-card-emoji">{course.emoji}</div>
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
                  {course.tags.map((tag) => (
                    <span key={tag} className="tg">{tag}</span>
                  ))}
                </div>

                <div className="course-card-actions" onClick={(event) => event.stopPropagation()}>
                  <button
                    className="btn"
                    style={isEnrolled ? { background: "var(--ac2)", color: "#fff", border: "1px solid var(--ac)" } : { background: "var(--ac)", color: "#fff", border: "1px solid var(--ac)" }}
                    disabled={isEnrolled}
                    onClick={async () => {
                      try {
                        await enrollCourse(course.id);
                      } catch {
                        alert("Failed to enroll.");
                      }
                    }}
                  >
                    {isEnrolled ? "Enrolled" : "Enroll"}
                  </button>
                  <button className="btn bg" onClick={() => openExplain(course)}>Explain</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 ? <div className="empty-state">No courses match your filters.</div> : null}
    </div>
  );
}
