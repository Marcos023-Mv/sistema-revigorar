import { useEffect, useState } from 'react'
import { Plus, Check, X, Trash2 } from 'lucide-react'
import Badge from '../../components/Badge/Badge.jsx'
import { listPatients } from '../../services/patientsService.js'
import { getSchedule, createAppointment, updateAppointmentStatus, deleteAppointment } from '../../services/agendaService.js'
import './Agenda.css'

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export default function Agenda() {
  const [activeDay, setActiveDay] = useState('Seg')
  const [schedule, setSchedule] = useState({ Seg: [], Ter: [], Qua: [], Qui: [], Sex: [], Sáb: [], Dom: [] })
  const [patients, setPatients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', time: '', type: 'Ferida' })

  useEffect(() => {
    let active = true
    getSchedule().then((data) => { if (active) setSchedule(data) })
    listPatients().then((data) => {
      if (active) {
        setPatients(data)
        setForm((f) => ({ ...f, name: f.name || data[0]?.name || '' }))
      }
    })
    return () => { active = false }
  }, [])

  const dayItems = schedule[activeDay] || []

  const updateStatus = async (appointmentId, status) => {
    await updateAppointmentStatus(appointmentId, status)
    setSchedule((s) => ({
      ...s,
      [activeDay]: s[activeDay].map((item) => (item.id === appointmentId ? { ...item, status } : item)),
    }))
  }

  const removeItem = async (appointmentId) => {
    await deleteAppointment(appointmentId)
    setSchedule((s) => ({
      ...s,
      [activeDay]: s[activeDay].filter((item) => item.id !== appointmentId),
    }))
  }

  const addAppointment = async (e) => {
    e.preventDefault()
    if (!form.time) return
    const created = await createAppointment(activeDay, { name: form.name, time: form.time, type: form.type })
    setSchedule((s) => ({
      ...s,
      [activeDay]: [...s[activeDay], created],
    }))
    setForm({ name: patients[0]?.name || '', time: '', type: 'Ferida' })
    setShowForm(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Agenda</h1>
          <p>Atendimentos agendados ao longo da semana</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={15} /> Novo agendamento
        </button>
      </div>

      <div className="agenda-days">
        {DAYS.map((day) => (
          <button
            key={day}
            className={`agenda-days__item ${activeDay === day ? 'is-active' : ''}`}
            onClick={() => setActiveDay(day)}
          >
            {day}
            <span>{schedule[day].length}</span>
          </button>
        ))}
      </div>

      {showForm && (
        <form className="panel agenda-form" onSubmit={addAppointment}>
          <div className="form-field">
            <label>Paciente</label>
            <select value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}>
              {patients.map((p) => <option key={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Horário</label>
            <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} required />
          </div>
          <div className="form-field">
            <label>Tipo</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option>Ferida</option>
              <option>Estomia</option>
            </select>
          </div>
          <div className="agenda-form__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Adicionar a {activeDay}</button>
          </div>
        </form>
      )}

      <div className="panel">
        <h3 className="panel-title">{activeDay === 'Sáb' || activeDay === 'Dom' ? `Fim de semana — ${activeDay}` : `Atendimentos de ${activeDay}`}</h3>

        {dayItems.length === 0 ? (
          <p className="agenda-empty">Nenhum atendimento agendado para este dia.</p>
        ) : (
          <ul className="agenda-list">
            {dayItems.map((item) => (
              <li key={item.id}>
                <span className="agenda-list__time">{item.time}</span>
                <div className="agenda-list__body">
                  <strong>{item.name}</strong>
                  <span>{item.type}</span>
                </div>
                <Badge tone={item.status === 'Confirmado' ? 'success' : item.status === 'Cancelado' ? 'danger' : 'warning'}>{item.status}</Badge>
                <div className="agenda-list__actions">
                  {item.status !== 'Confirmado' && (
                    <button className="btn-icon" aria-label="Confirmar" onClick={() => updateStatus(item.id, 'Confirmado')}>
                      <Check size={14} />
                    </button>
                  )}
                  {item.status !== 'Cancelado' && (
                    <button className="btn-icon" aria-label="Cancelar" onClick={() => updateStatus(item.id, 'Cancelado')}>
                      <X size={14} />
                    </button>
                  )}
                  <button className="btn-icon" aria-label="Remover" onClick={() => removeItem(item.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
