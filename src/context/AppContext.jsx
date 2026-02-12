import { createContext, useContext, useMemo, useState } from 'react';

const AppContext = createContext();

const initialStats = {
  coursesViewed: 0,
  categoriesExplored: new Set(),
  ratingsSum: 0,
  ratingsCount: 0,
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(initialStats);

  const value = useMemo(
    () => ({
      user,
      setUser,
      stats,
      resetStats: () => setStats(initialStats),
      recordCourseView: course => {
        setStats(prev => {
          const categoriesExplored = new Set(prev.categoriesExplored);
          if (course.category) {
            categoriesExplored.add(course.category);
          }
          return {
            coursesViewed: prev.coursesViewed + 1,
            categoriesExplored,
            ratingsSum: prev.ratingsSum + (course.rating || 0),
            ratingsCount: prev.ratingsCount + (course.rating ? 1 : 0),
          };
        });
      },
    }),
    [user, stats]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}

