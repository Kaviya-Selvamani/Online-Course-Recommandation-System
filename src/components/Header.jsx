import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useApp();

  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50">
            Welcome back, {user?.name || 'Learner'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Role:{' '}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              {user?.role || 'Student'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="text-sm" aria-hidden="true">
              {theme === 'dark' ? '🌙' : '☀️'}
            </span>
            <span>{theme === 'dark' ? 'Dark' : 'Light'} mode</span>
          </button>
        </div>
      </div>
    </header>
  );
}

