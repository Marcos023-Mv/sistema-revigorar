import { apiClient, withFallback } from './apiClient.js'
import { formatTime, formatDate } from './dateUtils.js'

const INITIAL_MESSAGES = [
  { id: 1, from: 'patient', time: '08:12', text: 'Bom dia, a ferida está com um pouco de vermelhidão hoje.' },
  { id: 2, from: 'nurse', name: 'Ana Ribeiro', time: '08:20', text: 'Bom dia! Pode enviar uma foto para eu avaliar?' },
  { id: 3, from: 'patient', time: '08:25', text: 'Claro, enviando agora.', photo: true },
]

/**
 * GET /patients/:patientId/monitoring/messages
 */
export function getMessages(patientId) {
  return withFallback(
    async () => (await apiClient.get(`/patients/${patientId}/monitoring/messages`)).map((m) => ({ ...m, time: formatTime(m.time) })),
    INITIAL_MESSAGES
  )
}

/**
 * POST /patients/:patientId/monitoring/messages
 * Body: { text }
 */
export function sendMessage(patientId, text) {
  return withFallback(
    async () => {
      const created = await apiClient.post(`/patients/${patientId}/monitoring/messages`, { text })
      return { ...created, time: formatTime(created.time) }
    },
    { id: Date.now(), from: 'nurse', time: new Date().toTimeString().slice(0, 5), text }
  )
}

/**
 * POST /patients/:patientId/monitoring/request-photo
 */
export function requestPhoto(patientId) {
  return withFallback(
    async () => {
      const created = await apiClient.post(`/patients/${patientId}/monitoring/request-photo`)
      return { ...created, time: formatTime(created.time) }
    },
    { id: Date.now(), from: 'nurse', time: new Date().toTimeString().slice(0, 5), text: 'solicitou uma nova foto da ferida ao paciente' }
  )
}

/**
 * GET /patients/:patientId/monitoring/status
 * Resposta do backend: { active, nextContact } — nextContact vem do
 * próximo agendamento real do paciente (ou null se não houver nenhum).
 */
export function getMonitoringStatus(patientId) {
  return withFallback(
    async () => {
      const data = await apiClient.get(`/patients/${patientId}/monitoring/status`)
      return { active: data.active, nextContact: data.nextContact ? formatDate(data.nextContact) : 'Nenhum agendamento futuro' }
    },
    { active: true, nextContact: '15/09/2025' }
  )
}
