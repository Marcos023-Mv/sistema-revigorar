import './Badge.css'

const TONE_MAP = {
  Ativo: 'success',
  Concluída: 'success',
  Concluído: 'success',
  Confirmado: 'success',
  Pendente: 'warning',
  Inativo: 'danger',
  Cancelado: 'danger',
}

export default function Badge({ children, tone }) {
  const resolvedTone = tone || TONE_MAP[children] || 'neutral'
  return <span className={`badge badge--${resolvedTone}`}>{children}</span>
}
