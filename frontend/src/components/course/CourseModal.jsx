import { useUiStore } from '../store/ui.js'
import { enrollCourse } from '../../services/courseService.js'
import '../index.css'

export default function CourseModal() {
  const { selectedCourse, closeCourse, enrolledCourses } = useUiStore()
  if (!selectedCourse) return null
  const c = selectedCourse
  const currentCourseId = c._id || c.id
  const isEnrolled = (enrolledCourses || []).some(id => String(id) === String(currentCourseId))
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ width: 'min(800px, 95vw)', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{c.title}</h3>
          <button className="btn" onClick={closeCourse}>Close</button>
        </div>
        <p style={{ margin: '0.25rem 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
          <strong>{c.provider}</strong> • {c.platform} <br />
          {c.category} • {c.difficulty} • {c.duration || 'Self-paced'} • {c.language || 'English'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div aria-label={`Rating ${c.rating} out of 5`} style={{ color: 'var(--accent)' }}>
              {'★'.repeat(Math.round(c.rating || 0))}{'☆'.repeat(5 - Math.round(c.rating || 0))}
            </div>
            <small style={{ color: 'var(--muted)' }}>{(c.rating || 0).toFixed(1)}</small>
            {c.enrollments ? <small style={{ color: 'var(--muted)' }}>({c.enrollments.toLocaleString()} students)</small> : null}
            {c.match !== undefined && <span className="badge">{c.match}% Match</span>}
          </div>
          <div>
            {c.isFree ? (
              <span style={{ background: 'var(--ok)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>FREE</span>
            ) : (
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>${c.price}</span>
            )}
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
          <p style={{ color: 'var(--muted)' }}>This course is a {c.match >= 80 ? 'strong' : 'solid'} match for your interests and skill level.</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {c.tags && c.tags.map(t => (
              <span key={t} className="tg" style={{ fontSize: 10 }}>{t}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {c.courseUrl ? (
              <a href={c.courseUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
                View Course Site
              </a>
            ) : null}
            <button
              className="btn btn-primary"
              disabled={isEnrolled}
              style={
                isEnrolled
                  ? { background: "var(--ac2)", color: "#fff", border: "1px solid var(--ac)", flex: 1 }
                  : { opacity: 1, flex: 1 }
              }
              onClick={async () => {
                try {
                  await enrollCourse(currentCourseId)
                } catch (err) {
                  alert(err.response?.data?.error || err.message || "Failed to enroll.")
                }
              }}
            >
              {isEnrolled ? "Enrolled" : "Enroll"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
