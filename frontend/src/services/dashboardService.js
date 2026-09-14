import { apiClient, withFallback } from './apiClient.js'
import { UPCOMING, WEEKLY_SERIES, WEEKDAYS, DISTRIBUTION } from '../data/mockData.js'

/**
 * GET /dashboard/stats
 * Resposta do backend: { activePatients, assessmentsToday, evolutionsToday, pendencies }
 */
export function getStats() {
  return withFallback(
    () => apiClient.get('/dashboard/stats'),
    { activePatients: 48, assessmentsToday: 12, evolutionsToday: 8, pendencies: 5 }
  )
}

const STATUS_TO_UI = { scheduled: 'Pendente', confirmed: 'Confirmado', completed: 'Concluído', cancelled: 'Cancelado', no_show: 'Não compareceu' }

/**
 * Não existe /dashboard/upcoming no backend — usamos os próprios
 * agendamentos (GET /api/appointments) dos próximos 7 dias, já que o dado é
 * o mesmo exibido na Agenda.
 */
export function getUpcoming() {
  return withFallback(
    async () => {
      const from = new Date()
      const to = new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000)
      const list = await apiClient.get(`/appointments?from=${from.toISOString()}&to=${to.toISOString()}`)
      return list.slice(0, 3).map((appt) => {
        const time = new Date(appt.scheduled_at).toTimeString().slice(0, 5)
        return {
          name: appt.patient?.name || '—',
          detail: `${appt.procedure_type === 'stomia' ? 'Estomia' : 'Ferida'} | ${time}`,
          status: STATUS_TO_UI[appt.status] || appt.status,
        }
      })
    },
    UPCOMING
  )
}

/**
 * GET /dashboard/weekly-series
 * Resposta do backend: { labels: string[], values: number[] } — contagem de
 * agendamentos por dia da semana atual (Seg a Dom).
 */
export function getWeeklySeries() {
  return withFallback(
    () => apiClient.get('/dashboard/weekly-series'),
    { labels: WEEKDAYS, values: WEEKLY_SERIES }
  )
}

/**
 * GET /dashboard/distribution
 * Resposta do backend: Array<{ label, value, color }> — pacientes agrupados
 * por care_type (ferida/estomia/outros).
 */
export function getDistribution() {
  return withFallback(() => apiClient.get('/dashboard/distribution'), DISTRIBUTION)
}
