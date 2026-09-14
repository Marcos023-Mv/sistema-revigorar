import { apiClient, withFallback } from './apiClient.js'
import { PATIENT_DOCUMENTS } from '../data/mockData.js'
import { formatDate } from './dateUtils.js'

/** GET /patients/:patientId/documents — Array<{ name, date, size }> */
export function listDocuments(patientId) {
  return withFallback(
    async () => (await apiClient.get(`/patients/${patientId}/documents`)).map((d) => ({ ...d, date: formatDate(d.date) })),
    PATIENT_DOCUMENTS
  )
}

/**
 * POST /patients/:patientId/documents
 * Body: { name } — cria um registro apenas com o nome do documento (fluxo
 * atual da tela de Prontuário, sem anexar arquivo). O backend também aceita
 * multipart/form-data com um arquivo real no campo "document", caso a tela
 * evolua para permitir upload.
 */
export function addDocument(patientId, data) {
  return withFallback(
    async () => {
      const created = await apiClient.post(`/patients/${patientId}/documents`, data)
      return { ...created, date: formatDate(created.date) }
    },
    { date: new Date().toLocaleDateString('pt-BR'), size: '—', ...data }
  )
}

/** GET /patients/:patientId/documents/:name/download — retorna a URL de download */
export function getDownloadUrl(patientId, documentName) {
  return `${import.meta.env.VITE_API_URL || ''}/patients/${patientId}/documents/${encodeURIComponent(documentName)}/download`
}
