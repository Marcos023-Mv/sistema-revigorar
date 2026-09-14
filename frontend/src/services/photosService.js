import { apiClient, withFallback, getToken } from './apiClient.js'
import { PATIENTS } from '../data/mockData.js'
import { formatDate } from './dateUtils.js'

const INITIAL_THUMBS = ['12/09/2025', '05/09/2025', '28/08/2025', '20/08/2025']

/**
 * GET /patients/:patientId/photos
 * O backend devolve Array<{ id, date, url }> — a tela de registro
 * fotográfico (PhotoRegistry) hoje só exibe a data de cada foto (ainda usa
 * um ícone de placeholder no lugar da imagem real), então simplificamos
 * para a lista de datas formatadas que a tela espera.
 */
export function getPatientPhotos(patientId) {
  return withFallback(
    async () => (await apiClient.get(`/patients/${patientId}/photos`)).map((p) => formatDate(p.date)),
    INITIAL_THUMBS
  )
}

/**
 * POST /patients/:patientId/photos
 * Body: FormData com o arquivo de imagem (multipart/form-data, campo "photo").
 */
export function uploadPatientPhoto(patientId, file) {
  return withFallback(
    async () => {
      const formData = new FormData()
      formData.append('photo', file)
      const token = getToken()
      const res = await fetch(`${import.meta.env.VITE_API_URL}/patients/${patientId}/photos`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      })
      if (!res.ok) throw new Error('Falha no upload da foto')
      const json = await res.json()
      return { date: formatDate(json.data?.date) }
    },
    { date: new Date().toLocaleDateString('pt-BR') }
  )
}

/**
 * GET /photos
 * Última foto de cada paciente (tela "Fotos" no menu lateral).
 */
export function listPatientsWithPhotos() {
  return withFallback(
    async () => (await apiClient.get('/photos')).map((p) => ({
      id: p.id, name: p.name, lastEval: p.last_photo_date ? formatDate(p.last_photo_date) : 'Nenhuma foto ainda',
    })),
    PATIENTS
  )
}
