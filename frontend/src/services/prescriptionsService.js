import { apiClient, withFallback } from './apiClient.js'
import { DRESSING_CATALOG } from '../data/mockData.js'
import { formatDate } from './dateUtils.js'

const INITIAL_PATIENT_ROWS = [
  { id: 1, date: '12/09/2025', type: 'Enfermagem', description: 'Troca de cobertura com hidrogel', status: 'Ativa' },
  { id: 2, date: '10/09/2025', type: 'Medicamento', description: 'Analgésico (se necessário)', status: 'Concluída' },
  { id: 3, date: '05/09/2025', type: 'Enfermagem', description: 'Limpeza da ferida com SF 0,9%', status: 'Concluída' },
  { id: 4, date: '28/08/2025', type: 'Nutrição', description: 'Suplementação proteica', status: 'Concluída' },
]

const INITIAL_BOARD = [
  { id: 1, patient: 'Maria Santos', type: 'Enfermagem', description: 'Troca de cobertura com hidrogel', status: 'Ativa' },
  { id: 2, patient: 'João Almeida', type: 'Estomia', description: 'Troca de bolsa de estomia', status: 'Ativa' },
  { id: 3, patient: 'Carla Souza', type: 'Medicamento', description: 'Analgésico (se necessário)', status: 'Ativa' },
  { id: 4, patient: 'Antônio Lima', type: 'Nutrição', description: 'Suplementação proteica', status: 'Concluída' },
  { id: 5, patient: 'Beatriz Rocha', type: 'Enfermagem', description: 'Limpeza da ferida com SF 0,9%', status: 'Concluída' },
]

// O backend guarda status em inglês (active/completed) — convertido aqui
// para os rótulos em português usados nas telas.
const STATUS_TO_UI = { active: 'Ativa', completed: 'Concluída' }
const STATUS_TO_API = { Ativa: 'active', Concluída: 'completed' }

function fromApi(p) {
  return { id: p.id, date: formatDate(p.created_at || p.date), type: p.type, description: p.description, status: STATUS_TO_UI[p.status] || p.status }
}

/**
 * GET /patients/:patientId/prescriptions
 */
export function listPatientPrescriptions(patientId) {
  return withFallback(
    async () => (await apiClient.get(`/patients/${patientId}/prescriptions`)).map(fromApi),
    INITIAL_PATIENT_ROWS
  )
}

/**
 * POST /patients/:patientId/prescriptions
 * Body: { type, description }
 */
export function createPatientPrescription(patientId, data) {
  return withFallback(
    async () => fromApi(await apiClient.post(`/patients/${patientId}/prescriptions`, { type: data.type, description: data.description })),
    { id: Date.now(), date: new Date().toLocaleDateString('pt-BR'), status: 'Ativa', ...data }
  )
}

/**
 * PUT /prescriptions/:id
 * Body: campos a atualizar (ex: { description } ou { status })
 */
export function updatePrescription(id, data) {
  const payload = { ...data }
  if (payload.status && STATUS_TO_API[payload.status]) payload.status = STATUS_TO_API[payload.status]
  return withFallback(async () => fromApi(await apiClient.put(`/prescriptions/${id}`, payload)), { id, ...data })
}

/**
 * DELETE /prescriptions/:id
 */
export function deletePrescription(id) {
  return withFallback(() => apiClient.delete(`/prescriptions/${id}`), null)
}

/**
 * GET /prescriptions
 * Todas as prescrições, de todos os pacientes (tela "Prescrições" no menu,
 * exibida em formato quadro/Kanban). O backend já devolve o nome do
 * paciente (join) junto com o patient_id, para permitir editar/filtrar.
 */
export function listAllPrescriptions() {
  return withFallback(
    async () => (await apiClient.get('/prescriptions')).map((p) => ({
      id: p.id, patientId: p.patient_id, patient: p.patient,
      type: p.type, description: p.description, status: STATUS_TO_UI[p.status] || p.status,
    })),
    INITIAL_BOARD
  )
}

/**
 * POST /prescriptions
 * Body: { patient_id, type, description }
 */
export function createPrescription(data) {
  return withFallback(
    async () => {
      const created = await apiClient.post('/prescriptions', {
        patient_id: data.patientId, type: data.type, description: data.description,
      })
      return { id: created.id, patientId: created.patient_id, patient: data.patient, type: created.type, description: created.description, status: 'Ativa' }
    },
    { id: Date.now(), status: 'Ativa', ...data }
  )
}

/**
 * GET /dressing-catalog
 */
export function getDressingCatalog() {
  return withFallback(() => apiClient.get('/dressing-catalog'), DRESSING_CATALOG)
}
