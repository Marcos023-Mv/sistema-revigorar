import { apiClient, withFallback } from './apiClient.js'
import { SYSTEM_USERS, INTEGRATIONS } from '../data/mockData.js'
import { formatDateTime } from './dateUtils.js'

const INITIAL_INSTITUTION = {
  name: 'Clínica Vida & Saúde',
  cnpj: '00.000.000/0001-00',
  email: 'contato@revigorar.com',
  phone: '(11) 4000-0802',
  address: 'Rua Exemplo, 123 — Centro',
}

/** GET /settings/institution */
export function getInstitution() {
  return withFallback(() => apiClient.get('/settings/institution'), INITIAL_INSTITUTION)
}

/** PUT /settings/institution — body: campos da instituição */
export function updateInstitution(data) {
  return withFallback(() => apiClient.put('/settings/institution', data), data)
}

/** GET /users — Array<{ id, name, email, role, status }> */
export function listUsers() {
  return withFallback(
    () => apiClient.get('/users'),
    SYSTEM_USERS.map((u, i) => ({ id: i, ...u }))
  )
}

/** POST /users — body: { name, email, role } */
export function createUser(data) {
  return withFallback(() => apiClient.post('/users', data), { id: Date.now(), status: 'Ativo', ...data })
}

/** PUT /users/:id — body: campos a atualizar (ex: { role }) */
export function updateUser(id, data) {
  return withFallback(() => apiClient.put(`/users/${id}`, data), { id, ...data })
}

/** DELETE /users/:id */
export function deleteUser(id) {
  return withFallback(() => apiClient.delete(`/users/${id}`), null)
}

/** GET /settings/integrations — Array<{ name, description, enabled }> */
export function listIntegrations() {
  return withFallback(() => apiClient.get('/settings/integrations'), INTEGRATIONS)
}

/** PATCH /settings/integrations/:name — body: { enabled } */
export function toggleIntegration(name, enabled) {
  return withFallback(() => apiClient.patch(`/settings/integrations/${encodeURIComponent(name)}`, { enabled }), { name, enabled })
}

/**
 * PUT /settings/security
 * Body: { currentPassword, newPassword, twoFactor, loginAlerts }
 */
export function updateSecurity(data) {
  return withFallback(() => apiClient.put('/settings/security', data), data)
}

/** GET /settings/backup — { when, status, frequency } */
export function getBackupInfo() {
  return withFallback(
    async () => {
      const data = await apiClient.get('/settings/backup')
      return { ...data, when: data.when ? formatDateTime(data.when) : 'Nenhum backup realizado ainda' }
    },
    { when: 'Hoje às 03:00', status: 'Concluído com sucesso', frequency: 'Diário' }
  )
}

/** POST /settings/backup/run */
export function runBackup() {
  return withFallback(
    async () => {
      const data = await apiClient.post('/settings/backup/run', {})
      return { ...data, when: formatDateTime(data.when) }
    },
    { when: 'Agora mesmo', status: 'Concluído com sucesso' }
  )
}

/** PUT /settings/backup/frequency — body: { frequency } */
export function updateBackupFrequency(frequency) {
  return withFallback(() => apiClient.put('/settings/backup/frequency', { frequency }), { frequency })
}
