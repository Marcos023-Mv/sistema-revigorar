import { useEffect, useState } from 'react'
import { Plus, Minus, Trash2, Package, X } from 'lucide-react'
import Badge from '../../components/Badge/Badge.jsx'
import { listStock, createStockItem, updateStockQuantity, deleteStockItem } from '../../services/stockService.js'
import './Stock.css'

const LOW_STOCK_THRESHOLD = 10

export default function Stock() {
  const [items, setItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'Cobertura', quantity: 10 })

  useEffect(() => {
    let active = true
    listStock().then((data) => { if (active) setItems(data) })
    return () => { active = false }
  }, [])

  const changeQuantity = (id, delta) => {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)))
    updateStockQuantity(id, delta)
  }

  const removeItem = async (id) => {
    await deleteStockItem(id)
    setItems((list) => list.filter((i) => i.id !== id))
  }

  const addItem = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const created = await createStockItem({ name: form.name, category: form.category, quantity: Number(form.quantity) || 0 })
    setItems((list) => [...list, created])
    setForm({ name: '', category: 'Cobertura', quantity: 10 })
    setShowForm(false)
  }

  const lowStockCount = items.filter((i) => i.quantity < LOW_STOCK_THRESHOLD).length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Estoque</h1>
          <p>Controle de insumos e coberturas disponíveis {lowStockCount > 0 && `· ${lowStockCount} item(ns) com estoque baixo`}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={15} /> Novo item
        </button>
      </div>

      {showForm && (
        <form className="panel stock-form" onSubmit={addItem}>
          <div className="form-field stock-form__name">
            <label>Nome do item</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Curativo de carvão ativado"
              required
            />
          </div>
          <div className="form-field">
            <label>Categoria</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              <option>Cobertura</option>
              <option>Insumo básico</option>
              <option>Estomaterapia</option>
              <option>Medicamento</option>
            </select>
          </div>
          <div className="form-field">
            <label>Quantidade inicial</label>
            <input type="number" min="0" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
          </div>
          <div className="stock-form__actions">
            <button type="button" className="btn-icon" aria-label="Fechar" onClick={() => setShowForm(false)}>
              <X size={14} />
            </button>
            <button type="submit" className="btn btn-primary">Adicionar</button>
          </div>
        </form>
      )}

      <div className="stock-grid">
        {items.map((item) => {
          const low = item.quantity < LOW_STOCK_THRESHOLD
          return (
            <div className="stock-card" key={item.id}>
              <div className="stock-card__head">
                <div className="stock-card__icon"><Package size={16} /></div>
                <button className="btn-icon stock-card__remove" aria-label="Remover item" onClick={() => removeItem(item.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
              <strong>{item.name}</strong>
              <span className="stock-card__category">{item.category}</span>

              <div className="stock-card__quantity">
                <button className="btn-icon" aria-label="Diminuir" onClick={() => changeQuantity(item.id, -1)}>
                  <Minus size={13} />
                </button>
                <span>{item.quantity}</span>
                <button className="btn-icon" aria-label="Aumentar" onClick={() => changeQuantity(item.id, 1)}>
                  <Plus size={13} />
                </button>
              </div>

              <Badge tone={low ? 'danger' : 'success'}>{low ? 'Estoque baixo' : 'Em estoque'}</Badge>
            </div>
          )
        })}

        {items.length === 0 && <p className="stock-empty">Nenhum item cadastrado no estoque.</p>}
      </div>
    </div>
  )
}
