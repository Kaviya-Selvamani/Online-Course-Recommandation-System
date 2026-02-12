import { motion } from 'framer-motion';

function RatingStars({ rating }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5 text-amber-400 text-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < full ? '★' : '☆'}</span>
      ))}
      <span className="ml-1 text-[11px] text-slate-500 dark:text-slate-400">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function CourseCard({ course, onNotInterested }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 18px 40px rgba(15,23,42,0.20)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col gap-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            {course.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {course.platform} • {course.category}
          </p>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
          {course.difficulty}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs mt-1">
        <RatingStars rating={course.rating} />
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {course.confidence}% match
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        {course.reason}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          className="inline-flex-1 text-xs font-medium px-3 py-1.5 rounded-md border border-emerald-500/60 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
        >
          View details
        </button>
        <button
          type="button"
          onClick={() => onNotInterested?.(course.id)}
          className="inline-flex-1 text-xs font-medium px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Not Interested
        </button>
      </div>
    </motion.div>
  );
}

