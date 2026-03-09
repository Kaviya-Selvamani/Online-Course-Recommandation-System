import '../styles/components.css'

export default function ProgressBar({ value = 0 }) {
  return (
    <div className="progress">
      <div className="bar" style={{ width: `${value}%` }} />
    </div>
  )
}