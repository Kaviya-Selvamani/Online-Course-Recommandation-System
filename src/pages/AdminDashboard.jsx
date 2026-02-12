import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { mockCourses } from '../data/mockCourses';
import { mockUsers } from '../data/mockUsers';
import StatCard from '../components/StatCard';
import SkeletonCard from '../components/SkeletonCard';

function buildCategoryData(courses) {
  const map = new Map();
  courses.forEach(c => {
    const entry = map.get(c.category) || { category: c.category, count: 0 };
    entry.count += 1;
    map.set(c.category, entry);
  });
  return Array.from(map.values());
}

export default function AdminDashboard() {
  const [courses, setCourses] = useState(mockCourses);
  const [loadingTable, setLoadingTable] = useState(false);

  const totalUsers = mockUsers.length;
  const totalCourses = courses.length;
  const activeUsers = Math.max(8, Math.round(totalUsers * 1.8));
  const avgCourseRating = useMemo(() => {
    if (!courses.length) return 0;
    const sum = courses.reduce((acc, c) => acc + (c.rating || 0), 0);
    return Number((sum / courses.length).toFixed(1));
  }, [courses]);

  const categoryData = useMemo(() => buildCategoryData(courses), [courses]);

  const handleDelete = id => {
    setLoadingTable(true);
    setTimeout(() => {
      setCourses(prev => prev.filter(c => c.id !== id));
      setLoadingTable(false);
    }, 300);
  };

  const handleDownload = type => {
    // UI only – no real download
    // eslint-disable-next-line no-alert
    alert(`${type} report download is simulated in this UI.`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid gap-3 md:grid-cols-4"
      >
        <StatCard
          label="Total users"
          value={totalUsers}
          sub="Registered in the system"
        />
        <StatCard
          label="Total courses"
          value={totalCourses}
          sub="Available recommendations"
        />
        <StatCard
          label="Active users"
          value={activeUsers}
          sub="Last 30 days (mock)"
        />
        <StatCard
          label="Avg. course rating"
          value={avgCourseRating}
          sub="Across all courses"
        />
      </motion.section>

      <section className="grid gap-6 lg:grid-cols-[1.7fr,1.3fr] items-start">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Course management
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Edit or remove courses from the recommendation pool.
              </p>
            </div>
          </div>
          <div className="max-h-[320px] overflow-auto text-xs">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="bg-slate-50 dark:bg-slate-950/60 sticky top-0 z-10">
                <tr>
                  <th className="text-left font-medium text-slate-500 dark:text-slate-400 px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                    Course
                  </th>
                  <th className="text-left font-medium text-slate-500 dark:text-slate-400 px-3 py-2 border-b border-slate-200 dark:border-slate-800">
                    Category
                  </th>
                  <th className="text-left font-medium text-slate-500 dark:text-slate-400 px-3 py-2 border-b border-slate-200 dark:border-slate-800">
                    Difficulty
                  </th>
                  <th className="text-left font-medium text-slate-500 dark:text-slate-400 px-3 py-2 border-b border-slate-200 dark:border-slate-800">
                    Rating
                  </th>
                  <th className="text-right font-medium text-slate-500 dark:text-slate-400 px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingTable ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-4">
                      <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <SkeletonCard key={i} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : (
                  courses.map(course => (
                    <tr
                      key={course.id}
                      className="border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <td className="px-4 py-2 align-top">
                        <div className="font-medium text-slate-900 dark:text-slate-50">
                          {course.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {course.platform}
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top text-slate-700 dark:text-slate-200">
                        {course.category}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 text-[11px] font-medium">
                          {course.difficulty}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top text-slate-700 dark:text-slate-200">
                        {course.rating.toFixed(1)}
                      </td>
                      <td className="px-4 py-2 align-top text-right space-x-1.5">
                        <button
                          type="button"
                          className="inline-flex items-center px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(course.id)}
                          className="inline-flex items-center px-2 py-1 rounded-md border border-red-200 dark:border-red-800 text-[11px] text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/40"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 h-[240px]"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Popular categories
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Most recommended
              </span>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ left: -20 }}>
                  <XAxis
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }}
                    contentStyle={{
                      fontSize: 11,
                      borderRadius: 8,
                      borderColor: '#e2e8f0',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#22c55e"
                    radius={[6, 6, 0, 0]}
                    barSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.12 }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3"
          >
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Reports
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Export insights for stakeholders. These buttons are UI-only in
              this demo.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDownload('Top courses')}
                className="inline-flex items-center px-3 py-1.5 rounded-md bg-sky-600 text-white font-medium hover:bg-sky-700 transition-colors"
              >
                Download Top Courses Report
              </button>
              <button
                type="button"
                onClick={() => handleDownload('User engagement')}
                className="inline-flex items-center px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Download User Engagement Report
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

