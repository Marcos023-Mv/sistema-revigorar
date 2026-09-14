import './LineChart.css'

export default function LineChart({ values = [], labels, height = 160 }) {
  const width = 560
  const padding = 12

  if (values.length === 0) {
    return (
      <div className="linechart">
        <div className="linechart__empty" style={{ height }}>Sem dados para exibir.</div>
      </div>
    )
  }

  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const denominator = values.length - 1 || 1

  const points = values.map((v, i) => {
    const x = padding + (i / denominator) * (width - padding * 2)
    const y = height - padding - ((v - min) / range) * (height - padding * 2)
    return [x, y]
  })

  const linePath = points.map((p) => p.join(',')).join(' ')
  const areaPath = `${padding},${height - padding} ${linePath} ${width - padding},${height - padding}`

  return (
    <div className="linechart">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="linechart__svg">
        <polygon points={areaPath} className="linechart__area" />
        <polyline points={linePath} className="linechart__line" />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5" className="linechart__dot" />
        ))}
      </svg>
      {labels && (
        <div className="linechart__labels">
          {labels.map((l) => <span key={l}>{l}</span>)}
        </div>
      )}
    </div>
  )
}
