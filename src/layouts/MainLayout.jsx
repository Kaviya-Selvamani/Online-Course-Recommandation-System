import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { user, setUser } = useApp();

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
        onLogout={handleLogout}
        role={user?.role || 'Student'}
      />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-6 md:px-8 bg-slate-50/80 dark:bg-slate-950/80">
          {children}
        </main>
      </div>
    </div>
  );
}

