import '../styles/theme.css'

export default function StatCard({ label, value, sublabel }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <p style={{ margin: 0, color: 'var(--muted)' }}>{label}</p>
      <h3 style={{ margin: '6px 0 4px' }}>{value}</h3>
      {sublabel && <small style={{ color: 'var(--muted)' }}>{sublabel}</small>}
    </div>
  )
}
