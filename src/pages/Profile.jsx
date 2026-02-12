import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const { user } = useApp();

  if (!user) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
          You are not logged in. Please log in to view your profile.
        </div>
      </div>
    );
  }

  const interests = user.interests || ['AI', 'Web Dev'];
  const skillLevel = user.skillLevel || 'Beginner';

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 flex items-start gap-4"
      >
        <div className="h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-semibold">
          {user.name?.[0] || '?'}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {user.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {user.email}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100 font-medium">
              Role: {user.role}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-100 font-medium">
              Skill level: {skillLevel}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 grid gap-4 md:grid-cols-2"
      >
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
            Learning interests
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            These help us prioritize which courses to recommend on your
            dashboard.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {interests.map(interest => (
              <span
                key={interest}
                className="inline-flex px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-[11px] font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
            Preferences (mock)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            This section is frontend-only and demonstrates how a richer profile
            configuration might look.
          </p>
          <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
            <li>• Preferred course length: 4–8 weeks</li>
            <li>• Content style: Hands-on projects and lab work</li>
            <li>• Goal: Build a strong portfolio over the next 6 months</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}


