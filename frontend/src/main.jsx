import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./styles/courseiq1.css";

import CourseIQLayout from "./components/common/Layout.jsx";
import { getTheme } from "./services/authService.js";

document.documentElement.setAttribute("data-theme", getTheme());

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import Courses from "./pages/Courses.jsx";
import Insights from "./pages/Insights.jsx";
import CourseDetails from "./components/course/CourseDetails.jsx";
import Profile from "./pages/Profile.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import Settings from "./pages/Settings.jsx";
import Notifications from "./pages/Notifications.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import CourseMgmt from "./components/admin/CourseMgmt.jsx";
import AddCourse from "./components/admin/AddCourse.jsx";
import SysHealth from "./components/admin/SysHealth.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route element={<CourseIQLayout requireRole="student" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route element={<CourseIQLayout requireRole="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/course-mgmt" element={<CourseMgmt />} />
          <Route path="/admin/add-course" element={<AddCourse />} />
          <Route path="/admin/sys-health" element={<SysHealth />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
