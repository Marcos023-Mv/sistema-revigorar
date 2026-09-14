import { apiClient, withFallback } from './apiClient.js'
import { listPatients } from './patientsService.js'

const DAY_KEYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

const INITIAL_SCHEDULE = {
  Seg: [
    { id: 1, name: 'Maria Santos', time: '09:00', type: 'Ferida', status: 'Confirmado' },
    { id: 2, name: 'João Almeida', time: '10:30', status: 'Confirmado', type: 'Estomia' },
  ],
  Ter: [{ id: 3, name: 'Carla Souza', time: '14:00', type: 'Ferida', status: 'Pendente' }],
  Qua: [],
  Qui: [{ id: 4, name: 'Antônio Lima', time: '11:00', type: 'Estomia', status: 'Confirmado' }],
  Sex: [{ id: 5, name: 'Beatriz Rocha', time: '08:30', type: 'Ferida', status: 'Pendente' }],
  Sáb: [],
  Dom: [],
}

const STATUS_TO_UI = {
  scheduled: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Não compareceu',
}
const STATUS_TO_API = {
  Pendente: 'scheduled',
  Confirmado: 'confirmed',
  Concluído: 'completed',
  Cancelado: 'cancelled',
  'Não compareceu': 'no_show',
}

// Segunda-feira da semana atual, para montar o intervalo de busca e para
// converter "dia da semana" (Seg, Ter...) em data real.
function mondayOfCurrentWeek() {
  const now = new Date()
  const day = now.getDay() // 0=domingo
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() + diffToMonday)
  return monday
}

function dateForDay(dayKey) {
  const monday = mondayOfCurrentWeek()
  const offset = DAY_KEYS.indexOf(dayKey)
  const d = new Date(monday)
  d.setDate(monday.getDate() + offset)
  return d
}

function typeFromProcedure(procedureType) {
  return procedureType === 'stomia' ? 'Estomia' : 'Ferida'
}
function procedureFromType(type) {
  return type === 'Estomia' ? 'stomia' : 'dressing_change'
}

function fromApiAppointment(appt) {
  const d = new Date(appt.scheduled_at)
  const dayKey = DAY_KEYS[(d.getDay() + 6) % 7] // getDay(): 0=dom → índice 6
  return {
    id: appt.id,
    dayKey,
    name: appt.patient?.name || '—',
    time: d.toTimeString().slice(0, 5),
    type: typeFromProcedure(appt.procedure_type),
    status: STATUS_TO_UI[appt.status] || appt.status,
  }
}

/**
 * GET /api/appointments?from=&to=
 * Busca os agendamentos da semana atual (segunda a domingo) e agrupa por dia,
 * já que o backend guarda `scheduled_at` (timestamp) em vez de um "dia da
 * semana" fixo como no protótipo.
 */
export function getSchedule() {
  return withFallback(
    async () => {
      const monday = mondayOfCurrentWeek()
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 7)
      const list = await apiClient.get(`/appointments?from=${monday.toISOString()}&to=${sunday.toISOString()}`)
      const grouped = { Seg: [], Ter: [], Qua: [], Qui: [], Sex: [], Sáb: [], Dom: [] }
      list.map(fromApiAppointment).forEach((item) => grouped[item.dayKey].push(item))
      return grouped
    },
    INITIAL_SCHEDULE
  )
}

/**
 * POST /api/appointments
 * Body do backend: { patient_id, scheduled_at, procedure_type, ... }
 * Aqui resolvemos o `patient_id` a partir do nome escolhido no formulário
 * (a tela de Agenda ainda trabalha com nome, não id, no seletor de paciente).
 */
export async function createAppointment(day, data) {
  return withFallback(
    async () => {
      const patients = await listPatients()
      const patient = patients.find((p) => p.name === data.name)
      const [hours, minutes] = data.time.split(':').map(Number)
      const scheduledAt = dateForDay(day)
      scheduledAt.setHours(hours, minutes, 0, 0)

      const created = await apiClient.post('/appointments', {
        patient_id: patient?.id,
        scheduled_at: scheduledAt.toISOString(),
        procedure_type: procedureFromType(data.type),
      })
      return fromApiAppointment(created)
    },
    { id: Date.now(), status: 'Pendente', ...data }
  )
}

/**
 * PUT /api/appointments/:id
 * Body: { status }
 */
export function updateAppointmentStatus(appointmentId, status) {
  return withFallback(
    () => apiClient.put(`/appointments/${appointmentId}`, { status: STATUS_TO_API[status] || status }),
    { id: appointmentId, status }
  )
}

/**
 * DELETE /api/appointments/:id
 */
export function deleteAppointment(appointmentId) {
  return withFallback(() => apiClient.delete(`/appointments/${appointmentId}`), null)
}
