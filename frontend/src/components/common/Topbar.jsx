import { FiBell, FiSearch, FiChevronDown, FiSun, FiMoon } from 'react-icons/fi'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '../styles/layout.css'

export default function Topbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [openProfile, setOpenProfile] = useState(false)
  const [openNotif, setOpenNotif] = useState(false)
  const [role] = useState(() => localStorage.getItem('role') || 'student')
  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  const pageTitle = (() => {
    if (location.pathname.startsWith('/dashboard')) return 'Dashboard'
    if (location.pathname.startsWith('/profile')) return 'Profile'
    if (location.pathname.startsWith('/recommendations')) return 'Recommendations'
    if (location.pathname.startsWith('/courses') || location.pathname.startsWith('/search')) return 'Courses'
    if (location.pathname.startsWith('/admin')) return 'Admin Dashboard'
    if (location.pathname.startsWith('/feedback')) return 'Feedback'
    return 'CourseReco'
  })()
  return (
    <div className="topbar">
      <h3 style={{ margin: 0 }}>{pageTitle}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
        <span className="badge">{role === 'admin' ? 'Admin' : 'Student'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiSearch />
          <input
            className="input"
            placeholder="Search courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: 260 }}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/courses?q=${encodeURIComponent(query)}`) }}
          />
          <button className="btn btn-primary" onClick={() => navigate(`/courses?q=${encodeURIComponent(query)}`)}>Search</button>
        </div>
        <button className="btn btn-ghost" onClick={() => setOpenNotif((v) => !v)} aria-label="Notifications">
          <FiBell />
        </button>
        {openNotif && (
          <div className="card" style={{ position: 'absolute', right: 110, top: 50, padding: 12, width: 260 }}>
            <p style={{ marginTop: 0 }}>Notifications</p>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              <li>New recommendation available</li>
              <li>Course rating updated</li>
            </ul>
          </div>
        )}
        <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setOpenProfile((v) => !v)}>
          <span>Profile</span>
          <FiChevronDown />
        </button>
        {openProfile && (
          <div className="card" style={{ position: 'absolute', right: 0, top: 50, padding: 10, width: 220 }}>
            <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => navigate('/profile')}>Profile</button>
            <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => navigate('/dashboard')}>Dashboard</button>
            {role === 'admin' && <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => navigate('/admin')}>Admin</button>}
            <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => navigate('/logout')}>Logout</button>
          </div>
        )}
      </div>
    </div>
  )
}
