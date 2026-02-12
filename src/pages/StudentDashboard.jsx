import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { mockCourses } from '../data/mockCourses';
import { useApp } from '../context/AppContext';
import CourseCard from '../components/CourseCard';
import SkeletonCard from '../components/SkeletonCard';
import StatCard from '../components/StatCard';

const INTERESTS = ['AI', 'Web Dev', 'Data Science', 'Cybersecurity'];
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

function filterCourses(courses, interests, level, dismissedIds) {
  const byInterest =
    interests.length === 0
      ? courses
      : courses.filter(c => interests.includes(c.category));

  const byLevel = byInterest.filter(c => {
    if (level === 'Beginner') return c.difficulty === 'Beginner';
    if (level === 'Intermediate') return c.difficulty === 'Intermediate';
    return c.difficulty === 'Advanced';
  });

  const notDismissed = byLevel.filter(c => !dismissedIds.has(c.id));
  return notDismissed.slice(0, 6);
}

export default function StudentDashboard() {
  const { user } = useApp();
  const [selectedInterests, setSelectedInterests] = useState(
    user?.interests?.length ? user.interests : ['AI', 'Web Dev']
  );
  const [skillLevel, setSkillLevel] = useState(user?.skillLevel || 'Beginner');
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [visibleCourses, setVisibleCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setVisibleCourses(
        filterCourses(mockCourses, selectedInterests, skillLevel, dismissedIds)
      );
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedInterests, skillLevel, dismissedIds]);

  const stats = useMemo(() => {
    if (!visibleCourses.length) {
      return { viewed: 0, categories: 0, avgRating: 0 };
    }
    const viewed = visibleCourses.length;
    const categories = new Set(visibleCourses.map(c => c.category)).size;
    const avgRating =
      visibleCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / viewed;
    return { viewed, categories, avgRating: Number(avgRating.toFixed(1)) };
  }, [visibleCourses]);

  const trendingCourses = useMemo(
    () =>
      [...mockCourses]
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 3),
    []
  );

  const newCourses = useMemo(
    () =>
      [...mockCourses]
        .sort(
          (a, b) =>
            new Date(b.addedAt || '1970-01-01') -
            new Date(a.addedAt || '1970-01-01')
        )
        .slice(0, 3),
    []
  );

  const feedbackCourses = useMemo(
    () =>
      [...mockCourses]
        .sort((a, b) => (b.feedbackScore || 0) - (a.feedbackScore || 0))
        .slice(0, 3),
    []
  );

  const toggleInterest = interest => {
    setDismissedIds(new Set());
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNotInterested = id => {
    setDismissedIds(prev => new Set(prev).add(id));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <section className="grid gap-4 md:grid-cols-[2fr,1.2fr] items-start">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 px-5 py-4"
        >
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
            Student Dashboard
          </p>
          <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-50">
            Welcome, {user?.name || 'Learner'}
          </h2>
          <p className="mt-2 text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-lg">
            Based on your selected interests and skill level, we&apos;ve curated
            a set of courses predicted to maximize your learning impact.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-slate-500 dark:text-slate-400">
                Interests
              </dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {(selectedInterests.length ? selectedInterests : ['All']).map(
                  tag => (
                    <span
                      key={tag}
                      className="inline-flex px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  )
                )}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">
                Skill level
              </dt>
              <dd className="mt-1">
                <span className="inline-flex px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 text-[11px] font-medium">
                  {skillLevel}
                </span>
              </dd>
            </div>
          </dl>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="grid grid-cols-3 gap-3"
        >
          <StatCard
            label="Courses viewed"
            value={stats.viewed}
            sub="In current recommendation set"
          />
          <StatCard
            label="Categories explored"
            value={stats.categories}
            sub="Based on active filters"
          />
          <StatCard
            label="Avg. rating"
            value={stats.avgRating || '—'}
            sub={stats.viewed ? 'From recommended courses' : 'No data yet'}
          />
        </motion.div>
      </section>

      <section className="grid md:grid-cols-[1.3fr,2.3fr] gap-6 items-start">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Filters
            </h3>
            <div className="mb-3">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Interests
              </p>
              <div className="flex flex-wrap gap-1.5">
                {INTERESTS.map(interest => {
                  const active = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                        active
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Skill level
              </p>
              <div className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px]">
                {SKILL_LEVELS.map(level => {
                  const active = level === skillLevel;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSkillLevel(level)}
                      className={`px-3 py-1 rounded-full font-medium transition-colors ${
                        active
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Recommended courses
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Dynamically updated based on your filters.
            </p>
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : visibleCourses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 px-4 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
              No recommendations match your current filters. Try broadening
              interests or skill level.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onNotInterested={handleNotInterested}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Explore more recommendations
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Trending, newly added and highly-rated courses from other students.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-3 space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-50 text-xs">
              Personalized picks
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              Best matches for your current profile.
            </p>
            <div className="space-y-2">
              {visibleCourses.slice(0, 3).map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onNotInterested={handleNotInterested}
                />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-3 space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-50 text-xs">
              Trending &amp; popular
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              Courses many learners are currently exploring.
            </p>
            <div className="space-y-2">
              {trendingCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onNotInterested={undefined}
                />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-3 space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-50 text-xs">
              New &amp; top-rated
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              Newly added courses with strong student feedback.
            </p>
            <div className="space-y-2">
              {newCourses.slice(0, 2).map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onNotInterested={undefined}
                />
              ))}
              {feedbackCourses.slice(0, 1).map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onNotInterested={undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

