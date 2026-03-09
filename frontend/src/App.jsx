import { useState } from "react";
import "./courseIQ/courseIQ.css";
import Landing from "./courseIQ/pages/Landing.jsx";
import Login from "./courseIQ/pages/Login.jsx";
import Dashboard from "./courseIQ/pages/Dashboard.jsx";
import Recommendations from "./courseIQ/pages/Recommendations.jsx";
import Analytics from "./courseIQ/pages/Analytics.jsx";
import Profile from "./courseIQ/pages/Profile.jsx";
import Admin from "./courseIQ/pages/Admin.jsx";
import Sidebar from "./courseIQ/components/Sidebar.jsx";
import TopBar from "./courseIQ/components/TopBar.jsx";
import MatchModal from "./courseIQ/components/MatchModal.jsx";

export default function App() {
  const [view, setView] = useState("landing"); // landing | login | app
  const [page, setPage] = useState("dashboard");
  const [theme, setTheme] = useState("dark");
  const [modal, setModal] = useState(null);

  return (
    <div data-theme={theme}>
      {modal && <MatchModal course={modal} onClose={() => setModal(null)} />}

      {view === "landing" && (
        <Landing onGetStarted={() => setView("login")} />
      )}

      {view === "login" && (
        <Login
          onComplete={() => {
            setView("app");
          }}
        />
      )}

      {view === "app" && (
        <div className="app-shell">
          <Sidebar page={page} setPage={setPage} />
          <div className="main-area">
            <TopBar theme={theme} setTheme={setTheme} />
            {page === "dashboard" && <Dashboard onExplain={setModal} />}
            {page === "recommendations" && (
              <Recommendations onExplain={setModal} />
            )}
            {page === "analytics" && <Analytics />}
            {page === "profile" && <Profile />}
            {page === "admin" && <Admin />}
          </div>
        </div>
      )}
    </div>
  );
}

