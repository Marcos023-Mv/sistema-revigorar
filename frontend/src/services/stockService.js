import { apiClient, withFallback } from './apiClient.js'

const INITIAL_ITEMS = [
  { id: 1, name: 'Hidrogel 25g', category: 'Cobertura', quantity: 42 },
  { id: 2, name: 'Gaze estéril', category: 'Insumo básico', quantity: 180 },
  { id: 3, name: 'Espuma de poliuretano', category: 'Cobertura', quantity: 8 },
  { id: 4, name: 'Bolsa de estomia', category: 'Estomaterapia', quantity: 65 },
  { id: 5, name: 'Alginato de cálcio', category: 'Cobertura', quantity: 5 },
  { id: 6, name: 'Filme transparente', category: 'Cobertura', quantity: 54 },
]

function fromApi(item) {
  return { id: item.id, name: item.name, category: item.category || '—', quantity: Number(item.quantity) }
}

/**
 * GET /api/stock
 */
export function listStock() {
  return withFallback(
    async () => (await apiClient.get('/stock')).map(fromApi),
    INITIAL_ITEMS
  )
}

/**
 * POST /api/stock
 * O backend exige `unit` (unidade de medida); como o protótipo não pede
 * isso no formulário, mandamos "un" como padrão.
 */
export function createStockItem(data) {
  return withFallback(
    async () => fromApi(await apiClient.post('/stock', {
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      unit: data.unit || 'un',
      min_quantity: data.min_quantity ?? 10,
    })),
    { id: Date.now(), ...data }
  )
}

/**
 * POST /api/stock/movement
 * O backend não tem um PATCH de quantidade direto — quantidade só muda
 * através de um lançamento de movimentação (entrada/saída), o que também
 * mantém o histórico (StockMovement). `delta` é a variação (+1 ou -1 nos
 * botões da tela de Estoque).
 */
export function updateStockQuantity(id, delta) {
  const direction = delta >= 0 ? 'in' : 'out'
  return withFallback(
    () => apiClient.post('/stock/movement', {
      item_id: id,
      direction,
      quantity: Math.abs(delta),
      reason: 'Ajuste manual pela tela de Estoque',
    }),
    { id, delta }
  )
}

/**
 * O backend não tem DELETE para itens de estoque (para preservar o
 * histórico de movimentações) — desativamos o item via PUT is_active=false,
 * que é o campo que o backend já usa para "excluir" itens da listagem.
 */
export function deleteStockItem(id) {
  return withFallback(() => apiClient.put(`/stock/${id}`, { is_active: false }), null)
}
