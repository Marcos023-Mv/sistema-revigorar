import { apiClient, withFallback } from './apiClient.js'
import { PATIENTS, PATIENT_RECORDS } from '../data/mockData.js'
import { formatDate, formatDateTime } from './dateUtils.js'

const TEMPLATES = [
  { type: 'Fotográfica', text: 'Novo registro fotográfico adicionado.' },
  { type: 'Prescrição', text: 'Troca de cobertura com hidrogel.' },
  { type: 'Avaliação', text: 'Avaliação clínica registrada, ferida em processo de cicatrização.' },
  { type: 'Prescrição', text: 'Limpeza da ferida com SF 0,9%.' },
  { type: 'Avaliação', text: 'Reavaliação de estomia sem intercorrências.' },
  { type: 'Fotográfica', text: 'Comparação de imagens realizada.' },
]

/**
 * GET /patients/:patientId/records
 * Histórico completo do paciente (usado no perfil e na aba "Registros"),
 * agregando avaliações de ferida, prescrições e fotos em ordem cronológica.
 */
export function getPatientRecords(patientId) {
  return withFallback(
    async () => (await apiClient.get(`/patients/${patientId}/records`)).map((r) => ({ ...r, date: formatDate(r.date) })),
    PATIENT_RECORDS
  )
}

/**
 * GET /patients/:patientId/evolution-timeline
 * Mesma agregação acima, formatada para a linha do tempo (data + hora,
 * título e detalhes).
 */
export function getEvolutionTimeline(patientId) {
  return withFallback(
    async () => (await apiClient.get(`/patients/${patientId}/evolution-timeline`)).map((t) => ({
      ...t, date: formatDateTime(t.date),
    })),
    null
  )
}

/**
 * GET /evolutions/feed
 * Feed cronológico entre pacientes (tela "Evoluções" no menu lateral),
 * agregando avaliações, prescrições e fotos de todos os pacientes do
 * profissional logado.
 */
export function getEvolutionFeed() {
  return withFallback(
    async () => (await apiClient.get('/evolutions/feed')).map((item) => ({ ...item, date: formatDate(item.date) })),
    Array.from({ length: 18 }, (_, i) => {
      const patient = PATIENTS[i % PATIENTS.length]
      const template = TEMPLATES[i % TEMPLATES.length]
      const day = 12 - Math.floor(i / 2)
      return {
        id: i,
        patient,
        type: template.type,
        text: template.text,
        date: `${String(Math.max(day, 1)).padStart(2, '0')}/09/2025`,
      }
    })
  )
}
