import { NavLink } from 'react-router-dom'
import { FiHome, FiStar, FiBook, FiUser, FiMessageSquare, FiLogOut, FiSettings } from 'react-icons/fi'
import '../styles/layout.css'

export default function Sidebar() {
  const role = typeof window !== 'undefined' ? (localStorage.getItem('role') || 'student') : 'student'
  const base = [
    { to: '/dashboard', label: 'Student Dashboard', icon: <FiHome /> },
    { to: '/recommendations', label: 'Recommendations', icon: <FiStar /> },
    { to: '/courses', label: 'Courses', icon: <FiBook /> },
    { to: '/profile', label: 'Profile', icon: <FiUser /> },
    { to: '/feedback', label: 'Feedback', icon: <FiMessageSquare /> },
    { to: '/logout', label: 'Logout', icon: <FiLogOut /> },
  ]
  const items = role === 'admin' ? [...base.slice(0, 5), { to: '/admin', label: 'Admin Dashboard', icon: <FiSettings /> }, ...base.slice(5)] : base
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="badge badge-gold">Library</span>
        {role === 'admin' ? 'CourseReco Admin' : 'CourseReco'}
      </div>
      <nav className="nav">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? 'active' : undefined}>
            {item.icon} {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
