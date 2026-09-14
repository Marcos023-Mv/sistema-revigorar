import './StatCard.css'

export default function StatCard({ icon, label, value, delta, deltaTone = 'success' }) {
  return (
    <div className="statcard">
      <div className="statcard__icon">{icon}</div>
      <div className="statcard__body">
        <span className="statcard__label">{label}</span>
        <strong className="statcard__value">{value}</strong>
      </div>
      {delta && <span className={`statcard__delta statcard__delta--${deltaTone}`}>{delta}</span>}
    </div>
  )
}
