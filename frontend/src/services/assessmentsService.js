import { apiClient, withFallback } from './apiClient.js'
import { PATIENTS } from '../data/mockData.js'
import { formatDate } from './dateUtils.js'

const LOCATIONS = [
  'Membro inferior direito', 'Região sacral', 'Membro superior esquerdo',
  'Calcâneo direito', 'Região abdominal', 'Membro inferior esquerdo', 'Região torácica',
]

function calcAge(birthDate) {
  if (!birthDate) return '—'
  const b = new Date(birthDate)
  if (Number.isNaN(b.getTime())) return '—'
  return Math.floor((Date.now() - b.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

const CARE_TYPE_TO_UI = { ferida: 'Ferida', estomia: 'Estomia' }
const STATUS_TO_UI = { active: 'Ativo', inactive: 'Inativo' }
const ASSESSMENT_STATUS_TO_UI = { active: 'Ativo', completed: 'Concluída' }

/**
 * GET /assessments
 * Lista de avaliações de todos os pacientes (tela "Avaliações" no menu lateral).
 * O backend devolve um paciente + a localização/última avaliação da ferida
 * mais recente cadastrada para ele (campos em snake_case) — adaptamos aqui
 * para o formato usado nos cartões.
 */
export function listAssessments() {
  return withFallback(
    async () => (await apiClient.get('/assessments')).map((a) => ({
      id: a.id,
      name: a.name,
      age: calcAge(a.birth_date),
      type: CARE_TYPE_TO_UI[a.care_type] || 'Ferida',
      status: STATUS_TO_UI[a.status] || a.status,
      lastEval: formatDate(a.last_eval),
      location: a.location || 'Sem ferida cadastrada',
      assessmentStatus: ASSESSMENT_STATUS_TO_UI[a.assessment_status] || 'Ativo',
    })),
    PATIENTS.map((p, i) => ({
      ...p,
      location: LOCATIONS[i % LOCATIONS.length],
      assessmentStatus: i % 3 === 0 ? 'Concluída' : 'Ativo',
    }))
  )
}

/**
 * GET /patients/:patientId/wound-assessment
 * Resposta do backend: objeto com uma chave por seção do formulário
 * ('Dados gerais', 'Avaliação da ferida', 'Características', 'Escalas
 * clínicas', 'Condutas'), cada uma com os campos salvos naquela seção.
 */
export function getWoundAssessment(patientId) {
  return withFallback(() => apiClient.get(`/patients/${patientId}/wound-assessment`), null)
}

/**
 * PUT /patients/:patientId/wound-assessment/:section
 * Body: os campos daquela seção do formulário (livre — o backend guarda
 * como jsonb, sem esquema fixo, já que o formulário usa FormData genérico).
 */
export function saveWoundAssessmentSection(patientId, section, data) {
  return withFallback(
    () => apiClient.put(`/patients/${patientId}/wound-assessment/${encodeURIComponent(section)}`, data),
    data
  )
}
