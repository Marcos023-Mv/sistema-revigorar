/**
 * Cliente HTTP central do sistema.
 *
 * Conectado ao backend REVIGORAR (github.com/paivagpg77/revigorar-projj):
 * 1. Rode o backend localmente (pasta `backend/` do repositório):
 *      npm install && npm run db:sync && npm run dev
 *    Por padrão ele sobe em http://localhost:3000 com as rotas em /api/*.
 * 2. Neste projeto, o arquivo `.env` já aponta VITE_API_URL para
 *    http://localhost:3000/api — ajuste se seu backend estiver em outro
 *    endereço (ex.: depois de fazer deploy).
 * 3. O backend responde sempre como { status: 'ok', data, meta? }; a
 *    função `request` abaixo já desembrulha `data` automaticamente.
 *
 * Enquanto VITE_API_URL não estiver definida (ou se uma chamada falhar —
 * ex.: backend fora do ar), cada serviço devolve os dados mockados de
 * `src/data/mockData.js`, então o front-end continua funcionando para
 * telas/demonstração mesmo sem back-end no ar.
 *
 * IMPORTANTE: nem todas as telas têm endpoint correspondente no backend
 * ainda (ver README_INTEGRACAO.md na raiz do projeto para o mapeamento
 * completo tela a tela).
 */

const BASE_URL = import.meta.env.VITE_API_URL || ''
const TOKEN_KEY = 'revigorar_token'

export function isApiConfigured() {
  return Boolean(BASE_URL)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken()

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      const data = await res.json()
      message = data.message || data.error || message
    } catch {
      // resposta sem corpo JSON, mantém statusText
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return null
  const text = await res.text()
  const json = text ? JSON.parse(text) : null

  // O backend REVIGORAR (Express + TypeORM) responde sempre no formato
  // { status: 'ok', data, meta? }. Desembrulhamos aqui para que todo
  // serviço em src/services/*.js continue recebendo direto o array/objeto
  // que já esperava (sem precisar mudar cada arquivo individualmente).
  if (json && typeof json === 'object' && 'data' in json && 'status' in json) {
    return json.data
  }
  return json
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

/**
 * Executa `fn` (uma chamada real de API) somente se VITE_API_URL estiver
 * configurada. Caso contrário — ou se a chamada falhar (backend fora do ar,
 * endpoint ainda não implementado, etc.) — devolve `fallback` (dado
 * mockado), avisando no console em vez de quebrar a tela.
 */
export async function withFallback(fn, fallback) {
  if (!isApiConfigured()) return fallback
  try {
    return await fn()
  } catch (err) {
    console.warn(`[API] Falha na chamada, usando dado mockado: ${err.message}`)
    return fallback
  }
}

export { ApiError }
