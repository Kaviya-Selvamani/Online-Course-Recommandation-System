import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import CourseIQMatchModal from "../course/CourseIQMatchModal.jsx";
import { getSession, getTheme, logout, setTheme as persistTheme, refreshEnrolledCourses } from "../../services/authService.js";
import { FiZap, FiBook, FiTarget, FiUser, FiMap, FiBell, FiSettings, FiBarChart2, FiPlus, FiHeart, FiLogOut, FiSearch, FiSun, FiMoon } from "react-icons/fi";

import { useUiStore } from "../../store/ui.js";

const ADMIN_NAV = [
  { to: "/admin", icon: <FiBarChart2 />, label: "Dashboard" },
  { to: "/admin/course-mgmt", icon: <FiBook />, label: "Course Management" },
  { to: "/admin/add-course", icon: <FiPlus />, label: "Add Course" },
  { to: "/admin/sys-health", icon: <FiHeart />, label: "System Health" },
];

export default function CourseIQLayout({ requireRole }) {
  const location = useLocation();
  const navigate = useNavigate();

  const session = getSession();
  const [theme, setTheme] = useState(getTheme());
  const [modal, setModal] = useState(null);

  const activeRole = session?.role || null;
  const user = session?.user || null;

  useEffect(() => {
    if (session) {
      refreshEnrolledCourses();
    }
  }, [session]);

  const { notifs, hasNewRecs } = useUiStore();
  const unreadCount = notifs.filter((n) => n.unread).length;

  const nav = activeRole === "admin"
    ? ADMIN_NAV
    : [
        { to: "/dashboard", icon: <FiZap />, label: "Dashboard" },
        { to: "/courses", icon: <FiBook />, label: "Courses" },
        { to: "/recommendations", icon: <FiTarget />, label: "Recommendations", badge: hasNewRecs ? 8 : null },
        { to: "/roadmap", icon: <FiMap />, label: "Roadmap" },
        { to: "/insights", icon: <FiBarChart2 />, label: "Insights" },
      ];
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireRole && activeRole !== requireRole) {
    return <Navigate to={activeRole === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    persistTheme(next);
  };

  const firstName = user?.name?.split?.(" ")?.[0] || "User";
  const userInitial = user?.name?.[0] || "U";

  return (
    <>
      {modal && <CourseIQMatchModal course={modal} onClose={() => setModal(null)} />}

      <div className="shell">
        <aside className="sidebar">
          <div className="sb-logo">
            <div className="logo-gem">CQ</div>
            <div className="logo-name">
              Course<em>IQ</em>
            </div>
          </div>
          <div className="role-badge">{activeRole === "admin" ? "Admin Panel" : "Student Portal"}</div>

          <nav className="sb-nav">
            {nav.map((item, i) => {
              if (!item) return <div className="nav-group" key={`group-${i}`}>Learning</div>;
              const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
              return (
                <Motion.div
                  key={item.to}
                  className={"ni " + (active ? "active" : "")}
                  whileHover={{ x: 4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  onClick={() => navigate(item.to)}
                >
                  <span className="ni-icon">{item.icon}</span>
                  {item.label}
                  {item.badge ? <span className="ni-badge">{item.badge}</span> : null}
                </Motion.div>
              );
            })}
          </nav>

          <div className="sb-foot">
            <div
              className="sb-user"
              style={{ cursor: activeRole === "student" ? "pointer" : "default" }}
              onClick={() => {
                if (activeRole === "student") navigate("/profile");
              }}
            >
              <div className="sb-av">{userInitial}</div>
              <div>
                <div className="sb-uname">{user?.name || "User"}</div>
                <div className="sb-urole">
                  {activeRole === "admin" ? `ID: ${user?.adminId || "—"}` : "Student"}
                </div>
              </div>
            </div>
            <div className={"ni " + (location.pathname === "/settings" ? "active" : "")} style={{ marginTop: 12 }} onClick={() => navigate("/settings")}>
              <span className="ni-icon"><FiSettings /></span>Settings
            </div>
            <div className="ni" style={{ marginTop: 4 }} onClick={onLogout}>
              <span className="ni-icon"><FiLogOut /></span>Logout
            </div>
          </div>
        </aside>

        <div className="main-area">
          <header className="topbar">
            <div className="greeting">Hi, {firstName}</div>
            <div className="search-wrap" style={{ visibility: "hidden" }}>
              <span style={{ color: "var(--t3)", fontSize: 14 }}><FiSearch /></span>
              <input placeholder="Search courses, skills..." />
            </div>
            <div className="tb-right">
              <button className="ib" onClick={toggleTheme} title="Toggle theme">
                {theme === "dark" ? <FiSun /> : <FiMoon />}
              </button>
              {activeRole === "student" ? (
                <button className="ib" onClick={() => navigate("/notifications")} title="Notifications">
                  <FiBell />{unreadCount > 0 && <span className="dot" />}
                </button>
              ) : null}
              <button
                className="av"
                onClick={() => {
                  if (activeRole === "student") navigate("/profile");
                }}
                title="Profile"
                type="button"
                style={{ cursor: activeRole === "student" ? "pointer" : "default" }}
              >
                {userInitial}
              </button>
            </div>
          </header>

          <Outlet context={{ openExplain: setModal }} />
        </div>
      </div>
    </>
  );
}
