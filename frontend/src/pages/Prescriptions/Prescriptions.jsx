import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Pencil, FileText, Droplet, X } from 'lucide-react'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.jsx'
import Tabs from '../../components/Tabs/Tabs.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import { PATIENTS } from '../../data/mockData.js'
import { useToast } from '../../components/Toast/ToastContext.jsx'
import {
  listPatientPrescriptions,
  createPatientPrescription,
  updatePrescription,
  getDressingCatalog,
} from '../../services/prescriptionsService.js'
import './Prescriptions.css'

const TABS = ['Prescrições', 'Catálogo de coberturas', 'Histórico']

export default function Prescriptions() {
  const { id } = useParams()
  const [tab, setTab] = useState('Prescrições')
  const [rows, setRows] = useState([])
  const [catalog, setCatalog] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type: 'Enfermagem', description: '' })
  const patient = PATIENTS.find((p) => String(p.id) === id) || PATIENTS[0]
  const showToast = useToast()

  useEffect(() => {
    let active = true
    listPatientPrescriptions(id).then((data) => { if (active) setRows(data) })
    getDressingCatalog().then((data) => { if (active) setCatalog(data) })
    return () => { active = false }
  }, [id])

  const addPrescription = async (e) => {
    e.preventDefault()
    if (!form.description.trim()) return
    const created = await createPatientPrescription(id, form)
    setRows((list) => [created, ...list])
    setForm({ type: 'Enfermagem', description: '' })
    setShowForm(false)
    showToast('Prescrição adicionada.')
  }

  const editRow = async (row) => {
    const updated = window.prompt('Editar descrição da prescrição:', row.description)
    if (!updated || updated === row.description) return
    await updatePrescription(row.id, { description: updated })
    setRows((list) => list.map((r) => (r.id === row.id ? { ...r, description: updated } : r)))
    showToast('Prescrição atualizada.')
  }

  const viewDocument = (row) => {
    showToast(`Abrindo documento de "${row.description}"...`)
  }

  return (
    <div className="page">
      <Breadcrumb
        items={[
          { label: 'Pacientes', to: '/pacientes' },
          { label: patient.name, to: `/pacientes/${patient.id}` },
          { label: 'Prescrições e condutas' },
        ]}
      />

      <div className="page-header">
        <h1 className="prescriptions__title">Prescrições e condutas</h1>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={15} /> Nova prescrição
        </button>
      </div>

      {showForm && (
        <form className="panel prescriptions-form" onSubmit={addPrescription}>
          <div className="form-field">
            <label>Tipo</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option>Enfermagem</option>
              <option>Medicamento</option>
              <option>Nutrição</option>
              <option>Estomia</option>
            </select>
          </div>
          <div className="form-field prescriptions-form__description">
            <label>Descrição</label>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Ex: Troca de cobertura com hidrogel"
              required
            />
          </div>
          <div className="prescriptions-form__actions">
            <button type="button" className="btn-icon" aria-label="Fechar" onClick={() => setShowForm(false)}>
              <X size={14} />
            </button>
            <button type="submit" className="btn btn-primary">Adicionar</button>
          </div>
        </form>
      )}

      <div className="panel">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'Prescrições' ? (
          <div className="table-scroll">
            <table className="prescriptions__table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>{row.type}</td>
                    <td>{row.description}</td>
                    <td><Badge>{row.status}</Badge></td>
                    <td>
                      <div className="prescriptions__actions">
                        <button className="btn-icon" aria-label="Editar" onClick={() => editRow(row)}><Pencil size={14} /></button>
                        <button className="btn-icon" aria-label="Ver documento" onClick={() => viewDocument(row)}><FileText size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === 'Catálogo de coberturas' ? (
          <ul className="dressing-catalog">
            {catalog.map((d) => (
              <li key={d.name}>
                <div className="dressing-catalog__icon"><Droplet size={16} /></div>
                <div className="dressing-catalog__body">
                  <strong>{d.name}</strong>
                  <p>{d.indication}</p>
                  <span>{d.frequency}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="table-scroll">
            <table className="prescriptions__table">
              <thead>
                <tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Status</th></tr>
              </thead>
              <tbody>
                {rows.filter((r) => r.status === 'Concluída').map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>{row.type}</td>
                    <td>{row.description}</td>
                    <td><Badge>{row.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
