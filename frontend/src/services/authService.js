import { apiClient, isApiConfigured, setToken, clearToken, getToken } from './apiClient.js'
import { CURRENT_USER } from '../data/mockData.js'

function toInitials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || '—'
}

// O backend não tem um campo "role" de exibição — usamos a especialização
// profissional cadastrada (ex.: "Enfermeira", "Estomaterapeuta").
function normalizeUser(user) {
  if (!user) return CURRENT_USER
  return {
    name: user.full_name || CURRENT_USER.name,
    role: user.specialization || 'Profissional de saúde',
    initials: toInitials(user.full_name),
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Resposta do backend: { user: { id, full_name, email, plan }, token }
 */
export async function login(email, password) {
  if (!isApiConfigured()) {
    // Sem back-end configurado: aceita qualquer credencial, como no protótipo.
    setToken('demo-token')
    return { user: CURRENT_USER }
  }

  const { user, token } = await apiClient.post('/auth/login', { email, password })
  if (token) setToken(token)
  return { user: normalizeUser(user) }
}

/**
 * POST /api/auth/register
 * Body: { full_name, email, password }
 * Resposta do backend: { user: { id, full_name, email, plan }, token }
 */
export async function register({ fullName, email, password }) {
  if (!isApiConfigured()) {
    setToken('demo-token')
    return { user: CURRENT_USER }
  }

  const { user, token } = await apiClient.post('/auth/register', { full_name: fullName, email, password })
  if (token) setToken(token)
  return { user: normalizeUser(user) }
}

export function logout() {
  clearToken()
}

export function isAuthenticated() {
  return Boolean(getToken())
}

/**
 * GET /api/auth/profile
 * Resposta do backend: usuário completo (full_name, email, specialization, ...)
 */
export async function getCurrentUser() {
  if (!isApiConfigured()) return CURRENT_USER
  try {
    const user = await apiClient.get('/auth/profile')
    return normalizeUser(user)
  } catch {
    return CURRENT_USER
  }
}
