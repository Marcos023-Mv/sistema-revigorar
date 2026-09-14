import './DonutChart.css'

export default function DonutChart({ data = [], total, centerLabel = 'Total' }) {
  let cursor = 0
  const stops = data.length > 0
    ? data.map((d) => {
        const start = cursor
        cursor += d.value
        return `${d.color} ${start}% ${cursor}%`
      })
    : ['var(--color-border) 0% 100%']

  return (
    <div className="donut">
      <div className="donut__ring" style={{ background: `conic-gradient(${stops.join(', ')})` }}>
        <div className="donut__center">
          <strong>{total}</strong>
          <span>{centerLabel}</span>
        </div>
      </div>
      <ul className="donut__legend">
        {data.map((d) => (
          <li key={d.label}>
            <span className="donut__dot" style={{ background: d.color }} />
            {d.label} <strong>{d.value}%</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
