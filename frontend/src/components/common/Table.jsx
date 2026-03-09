import '../styles/components.css'

export default function Table({ columns, data }) {
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((c) => <th key={c.accessor || c.header}>{c.header}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={row.id || idx}>
            {columns.map((c) => <td key={c.accessor || c.header}>{row[c.accessor]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
