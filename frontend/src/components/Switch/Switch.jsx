import './Switch.css'

export default function Switch({ checked, onChange, label }) {
  return (
    <label className="switch">
      {label && <span className="switch__label">{label}</span>}
      <span className={`switch__track ${checked ? 'is-on' : ''}`} onClick={onChange}>
        <span className="switch__thumb" />
      </span>
    </label>
  )
}
