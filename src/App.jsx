import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Courses from './pages/Courses';
import Profile from './pages/Profile';
import MainLayout from './layouts/MainLayout';
import { useApp } from './context/AppContext';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const { user } = useApp();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={<Navigate to={user ? (user.role === 'Admin' ? '/admin-dashboard' : '/student-dashboard') : '/login'} replace />}
        />
        <Route
          path="/login"
          element={
            <AnimatedPage>
              <Login />
            </AnimatedPage>
          }
        />
        <Route
          path="/signup"
          element={
            <AnimatedPage>
              <Signup />
            </AnimatedPage>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <MainLayout>
              <AnimatedPage>
                <StudentDashboard />
              </AnimatedPage>
            </MainLayout>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <MainLayout>
              <AnimatedPage>
                <AdminDashboard />
              </AnimatedPage>
            </MainLayout>
          }
        />
        <Route
          path="/courses"
          element={
            <MainLayout>
              <AnimatedPage>
                <Courses />
              </AnimatedPage>
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout>
              <AnimatedPage>
                <Profile />
              </AnimatedPage>
            </MainLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return <AppRoutes />;
}

