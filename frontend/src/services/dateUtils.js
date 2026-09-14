// Helpers de formatação de data/hora usados pelos services ao converter as
// respostas do backend (sempre em ISO 8601 / UTC) para o formato exibido nas
// telas (dd/mm/aaaa, hh:mm), no mesmo padrão já usado em patientsService.js
// e agendaService.js.

export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR')
}

export function formatTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toTimeString().slice(0, 5)
}

export function formatDateTime(value) {
  if (!value) return '—'
  return `${formatDate(value)} ${formatTime(value)}`
}
