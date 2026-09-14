import { useEffect, useState } from 'react'
import { Plus, Check, RotateCcw, Trash2, X } from 'lucide-react'
import Avatar from '../../components/Avatar/Avatar.jsx'
import { listPatients } from '../../services/patientsService.js'
import { listAllPrescriptions, createPrescription, updatePrescription, deletePrescription } from '../../services/prescriptionsService.js'
import './PrescriptionsBoard.css'

function initialsOf(name) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

export default function PrescriptionsBoard() {
  const [items, setItems] = useState([])
  const [patients, setPatients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ patientId: '', patient: '', type: 'Enfermagem', description: '' })

  useEffect(() => {
    let active = true
    listAllPrescriptions().then((data) => { if (active) setItems(data) })
    listPatients().then((data) => {
      if (active) {
        setPatients(data)
        setForm((f) => ({ ...f, patientId: f.patientId || data[0]?.id || '', patient: f.patient || data[0]?.name || '' }))
      }
    })
    return () => { active = false }
  }, [])

  const active = items.filter((i) => i.status === 'Ativa')
  const done = items.filter((i) => i.status === 'Concluída')

  const setStatus = async (id, status) => {
    await updatePrescription(id, { status })
    setItems((list) => list.map((i) => (i.id === id ? { ...i, status } : i)))
  }

  const removeItem = async (id) => {
    await deletePrescription(id)
    setItems((list) => list.filter((i) => i.id !== id))
  }

  const addPrescription = async (e) => {
    e.preventDefault()
    if (!form.description.trim()) return
    const created = await createPrescription(form)
    setItems((list) => [...list, created])
    setForm({ patientId: patients[0]?.id || '', patient: patients[0]?.name || '', type: 'Enfermagem', description: '' })
    setShowForm(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Prescrições</h1>
          <p>Prescrições e condutas em andamento em todos os pacientes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={15} /> Nova prescrição
        </button>
      </div>

      {showForm && (
        <form className="panel board-form" onSubmit={addPrescription}>
          <div className="form-field">
            <label>Paciente</label>
            <select
              value={form.patientId}
              onChange={(e) => {
                const p = patients.find((x) => String(x.id) === e.target.value)
                setForm((f) => ({ ...f, patientId: e.target.value, patient: p?.name || '' }))
              }}
            >
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Tipo</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option>Enfermagem</option>
              <option>Medicamento</option>
              <option>Nutrição</option>
              <option>Estomia</option>
            </select>
          </div>
          <div className="form-field board-form__description">
            <label>Descrição</label>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Ex: Troca de cobertura com hidrogel"
              required
            />
          </div>
          <div className="board-form__actions">
            <button type="button" className="btn-icon" aria-label="Fechar" onClick={() => setShowForm(false)}>
              <X size={14} />
            </button>
            <button type="submit" className="btn btn-primary">Adicionar</button>
          </div>
        </form>
      )}

      <div className="board">
        <div className="board-column">
          <div className="board-column__head">
            <h3>Ativas</h3>
            <span>{active.length}</span>
          </div>
          {active.map((item) => (
            <div className="board-card" key={item.id}>
              <div className="board-card__head">
                <Avatar initials={initialsOf(item.patient)} size={28} />
                <strong>{item.patient}</strong>
              </div>
              <span className="board-card__type">{item.type}</span>
              <p>{item.description}</p>
              <div className="board-card__actions">
                <button className="btn btn-secondary" onClick={() => setStatus(item.id, 'Concluída')}>
                  <Check size={13} /> Concluir
                </button>
                <button className="btn-icon" aria-label="Remover" onClick={() => removeItem(item.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          {active.length === 0 && <p className="board-empty">Nenhuma prescrição ativa.</p>}
        </div>

        <div className="board-column">
          <div className="board-column__head">
            <h3>Concluídas</h3>
            <span>{done.length}</span>
          </div>
          {done.map((item) => (
            <div className="board-card board-card--done" key={item.id}>
              <div className="board-card__head">
                <Avatar initials={initialsOf(item.patient)} size={28} />
                <strong>{item.patient}</strong>
              </div>
              <span className="board-card__type">{item.type}</span>
              <p>{item.description}</p>
              <div className="board-card__actions">
                <button className="btn btn-secondary" onClick={() => setStatus(item.id, 'Ativa')}>
                  <RotateCcw size={13} /> Reabrir
                </button>
                <button className="btn-icon" aria-label="Remover" onClick={() => removeItem(item.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          {done.length === 0 && <p className="board-empty">Nenhuma prescrição concluída.</p>}
        </div>
      </div>
    </div>
  )
}
