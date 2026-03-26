import '../index.css'
import { useUiStore } from '../store/ui.js'
import { enrollCourse, unenrollCourse } from '../../services/courseService.js'

export default function CourseCard({ course, onView }) {
  const { openCourse, enrolledCourses } = useUiStore()
  const { title, category, difficulty, rating, match, matchPercentage, provider, platform, price, isFree } = course
  const currentCourseId = course._id || course.id
  const isEnrolled = (enrolledCourses || []).some((id) => String(id) === String(currentCourseId))
  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ margin: 0, flex: 1, fontSize: '0.95rem' }}>{title}</h4>
        {(matchPercentage !== undefined || match !== undefined) && (
          <span className="badge" style={{ marginLeft: "0.5rem", fontWeight: 700, background: (matchPercentage || match) >= 90 ? 'rgba(240, 90, 74, 0.1)' : 'rgba(74, 184, 245, 0.1)', color: (matchPercentage || match) >= 90 ? '#f05a4a' : 'var(--accent)' }}>
            {(matchPercentage || match) >= 90 ? '🔥 ' : ''}{matchPercentage || match}% Match
          </span>
        )}
      </div>
      <p style={{ margin: '0.25rem 0 1rem 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
        <strong>{provider}</strong> • {platform} <br />
        {category} • {difficulty} • {course.duration || 'Self-paced'}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div aria-label={`Rating ${rating} out of 5`} style={{ color: 'var(--accent)' }}>
            {'★'.repeat(Math.round(rating || 0))}{'☆'.repeat(5 - Math.round(rating || 0))}
          </div>
          <small style={{ color: 'var(--muted)' }}>{(rating || 0).toFixed(1)}</small>
          {course.enrollments ? <small style={{ color: 'var(--muted)' }}>({course.enrollments.toLocaleString()})</small> : null}
        </div>
        <div>
          {isFree ? (
            <span style={{ background: 'var(--ok)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>FREE</span>
          ) : (
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>${price}</span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <button
          className="btn btn-primary"
          style={
            isEnrolled
              ? { background: '#c0392b', color: '#fff', border: '1px solid #a93226' }
              : { background: 'var(--ac)', color: '#fff', border: '1px solid var(--ac)' }
          }
          onClick={async () => {
            try {
              if (isEnrolled) {
                await unenrollCourse(currentCourseId)
                return
              }
              await enrollCourse(currentCourseId)
            } catch (err) {
              console.error('Enroll failed', err)
            }
          }}
        >
          {isEnrolled ? 'Unenroll' : 'Enroll'}
        </button>
        <button className="btn" style={{ flex: 1 }} onClick={() => (onView ? onView(course) : openCourse(course))}>
          Details
        </button>
      </div>
      {course.courseUrl ? (
        <a href={course.courseUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ display: 'block', textDecoration: 'none', textAlign: 'center', marginTop: '0.5rem', width: '100%', boxSizing: 'border-box' }}>
          View External Link
        </a>
      ) : null}
    </div>
  )
}
