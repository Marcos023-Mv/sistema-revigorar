import { apiClient, withFallback } from './apiClient.js'
import { PATIENTS } from '../data/mockData.js'

// O backend guarda `birth_date` (não idade pronta) — a idade exibida na
// tabela é calculada aqui a partir dela.
function calcAge(birthDate) {
  if (!birthDate) return '—'
  const b = new Date(birthDate)
  if (Number.isNaN(b.getTime())) return '—'
  const diff = Date.now() - b.getTime()
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
}

const STATUS_TO_UI = { active: 'Ativo', inactive: 'Inativo' }
const STATUS_TO_API = { Ativo: 'active', Inativo: 'inactive' }

// `care_type` é um campo próprio do paciente no backend (ferida/estomia) —
// não depende mais de haver uma ferida já cadastrada.
const CARE_TYPE_TO_UI = { ferida: 'Ferida', estomia: 'Estomia' }
const CARE_TYPE_TO_API = { Ferida: 'ferida', Estomia: 'estomia' }

function fromApi(patient) {
  return {
    id: patient.id,
    name: patient.name,
    age: calcAge(patient.birth_date),
    birthDate: patient.birth_date,
    type: CARE_TYPE_TO_UI[patient.care_type] || 'Ferida',
    status: STATUS_TO_UI[patient.status] || patient.status,
    lastEval: '—', // o backend não expõe "última avaliação" no próprio paciente
    _raw: patient,
  }
}

/**
 * GET /api/patients
 * Resposta do backend: Array de pacientes (campos reais: name, birth_date, status, care_type...)
 */
export function listPatients() {
  return withFallback(
    async () => (await apiClient.get('/patients')).map(fromApi),
    PATIENTS
  )
}

/**
 * GET /api/patients/:id
 */
export function getPatient(id) {
  return withFallback(
    async () => fromApi(await apiClient.get(`/patients/${id}`)),
    PATIENTS.find((p) => String(p.id) === String(id)) || PATIENTS[0]
  )
}

/**
 * POST /api/patients
 * Body do backend: { name, birth_date, care_type, ... }
 * `data.birthDate` deve vir no formato YYYY-MM-DD (input type="date" do
 * formulário) — nada de aproximar a partir da idade.
 */
export function createPatient(data) {
  const payload = {
    name: data.name,
    birth_date: data.birthDate,
    care_type: CARE_TYPE_TO_API[data.type] || 'ferida',
  }
  return withFallback(
    async () => fromApi(await apiClient.post('/patients', payload)),
    { id: Date.now(), status: 'Ativo', lastEval: '—', ...data }
  )
}

/**
 * PUT /api/patients/:id
 */
export function updatePatient(id, data) {
  const payload = { ...data }
  if (payload.status && STATUS_TO_API[payload.status]) payload.status = STATUS_TO_API[payload.status]
  if (payload.type && CARE_TYPE_TO_API[payload.type]) {
    payload.care_type = CARE_TYPE_TO_API[payload.type]
    delete payload.type
  }
  if (payload.birthDate) {
    payload.birth_date = payload.birthDate
    delete payload.birthDate
  }
  return withFallback(
    async () => fromApi(await apiClient.put(`/patients/${id}`, payload)),
    { id, ...data }
  )
}

/**
 * DELETE /api/patients/:id
 */
export function deletePatient(id) {
  return withFallback(() => apiClient.delete(`/patients/${id}`), null)
}
