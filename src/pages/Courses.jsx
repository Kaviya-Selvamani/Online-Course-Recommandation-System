import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { mockCourses } from '../data/mockCourses';
import { useApp } from '../context/AppContext';
import CourseCard from '../components/CourseCard';

const CATEGORIES = ['AI', 'Web Dev', 'Data Science', 'Cybersecurity'];

export default function Courses() {
  const { user } = useApp();
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredCourses = useMemo(() => {
    if (activeCategory === 'All') return mockCourses;
    return mockCourses.filter(c => c.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-between gap-3"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {user?.role === 'Admin' ? 'All Courses (Admin view)' : 'Courses catalog'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Browse all available courses in the recommendation pool. Filters are
            client-side only and based on mock data.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="flex flex-wrap items-center justify-between gap-3 text-xs"
      >
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveCategory('All')}
            className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors ${
              activeCategory === 'All'
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-50 dark:text-slate-900 dark:border-slate-50'
                : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          Showing {filteredCourses.length} course
          {filteredCourses.length === 1 ? '' : 's'} in{' '}
          {activeCategory === 'All' ? 'all categories' : activeCategory}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.08 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredCourses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            onNotInterested={undefined}
          />
        ))}
      </motion.div>
    </div>
  );
}

