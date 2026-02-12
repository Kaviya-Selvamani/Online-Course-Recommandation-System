import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'courses', label: 'Courses' },
  { id: 'profile', label: 'Profile' },
  { id: 'reports', label: 'Reports' },
];

function getPath(id, role) {
  const isAdmin = role === 'Admin';
  if (id === 'dashboard') {
    return isAdmin ? '/admin-dashboard' : '/student-dashboard';
  }
  if (id === 'courses') return '/courses';
  if (id === 'profile') return '/profile';
  if (id === 'reports') return isAdmin ? '/admin-dashboard#reports' : '/student-dashboard';
  return '/';
}

export default function Sidebar({ open, onToggle, onLogout, role }) {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: open ? 240 : 72 }}
      transition={{ duration: 0.2 }}
      className="hidden md:flex flex-col bg-slate-900 text-slate-100 border-r border-slate-800"
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-semibold">
            OC
          </div>
          {open && (
            <span className="font-semibold tracking-tight text-sm">
              Online Course Recs
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label="Toggle sidebar"
        >
          {open ? '⟨' : '⟩'}
        </button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 text-sm">
        {navItems.map(item => {
          const targetPath = getPath(item.id, role);
          const isActive =
            item.id === 'dashboard'
              ? location.pathname.includes('dashboard')
              : location.pathname.startsWith(targetPath);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(targetPath)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors ${
                isActive ? 'bg-slate-800/80' : ''
              }`}
            >
              <span className="text-xs opacity-70">
                {item.id === 'dashboard'
                  ? '🏠'
                  : item.id === 'courses'
                  ? '📚'
                  : item.id === 'profile'
                  ? '👤'
                  : '📊'}
              </span>
              {open && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
      <div className="px-3 pb-4 space-y-2 text-xs border-t border-slate-800 pt-3">
        <div className="flex items-center gap-2 text-slate-300">
          <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold">
            {user?.name?.[0] || '?'}
          </div>
          {open && (
            <div>
              <div className="font-medium truncate">{user?.name || 'Guest User'}</div>
              <div className="text-[11px] uppercase tracking-wide text-emerald-400">
                {role}
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-red-300 hover:text-red-100 hover:bg-red-500/10 transition-colors"
        >
          <span>⎋</span>
          {open && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}

