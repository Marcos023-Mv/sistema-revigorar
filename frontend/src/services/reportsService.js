import { apiClient, withFallback } from './apiClient.js'
import { WEEKDAYS, DISTRIBUTION } from '../data/mockData.js'

const REPORTS = {
  'Perfil dos pacientes': { series: [12, 18, 22, 26, 30, 34, 40], label: 'Novos pacientes cadastrados' },
  'Evolução das feridas': { series: [30, 34, 32, 38, 41, 39, 48], label: 'Avaliações de feridas registradas' },
  'Evolução das estomias': { series: [10, 12, 11, 14, 13, 15, 18], label: 'Avaliações de estomias registradas' },
  'Uso de coberturas': { series: [22, 25, 24, 28, 30, 27, 33], label: 'Coberturas aplicadas' },
  'Indicadores clínicos': { series: [6, 5, 7, 6, 8, 7, 9], label: 'Ocorrências clínicas relevantes' },
}

/**
 * GET /reports
 * Resposta esperada: { [nomeDoRelatorio]: { series: number[], label: string } }
 */
export function listReports() {
  return withFallback(() => apiClient.get('/reports'), REPORTS)
}

/**
 * GET /reports/weekdays  (rótulos do eixo X, últimos 7 dias)
 */
export function getWeekdays() {
  return withFallback(() => apiClient.get('/reports/weekdays'), WEEKDAYS)
}

/**
 * GET /reports/distribution
 * Resposta esperada: Array<{ label, value, color }>
 */
export function getDistribution() {
  return withFallback(() => apiClient.get('/reports/distribution'), DISTRIBUTION)
}
