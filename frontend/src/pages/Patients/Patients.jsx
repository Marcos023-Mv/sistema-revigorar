import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Plus, Eye, Pencil, Trash2, X } from 'lucide-react'
import Avatar from '../../components/Avatar/Avatar.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import { useToast } from '../../components/Toast/ToastContext.jsx'
import { listPatients, createPatient, deletePatient } from '../../services/patientsService.js'
import './Patients.css'

const PAGE_SIZE = 5

function initialsOf(name) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

export default function Patients() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', birthDate: '', type: 'Ferida' })
  const showToast = useToast()

  useEffect(() => {
    let active = true
    listPatients().then((data) => { if (active) { setPatients(data); setLoading(false) } })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      searchParams.delete('q')
      setSearchParams(searchParams, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = !status || p.status === status
      const matchesType = !type || p.type === type
      return matchesQuery && matchesStatus && matchesType
    })
  }, [patients, query, status, type])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const addPatient = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.birthDate) return
    const created = await createPatient({ name: form.name, birthDate: form.birthDate, type: form.type })
    setPatients((list) => [created, ...list])
    showToast('Paciente cadastrado com sucesso.')
    setForm({ name: '', birthDate: '', type: 'Ferida' })
    setShowForm(false)
    setPage(1)
  }

  const removePatient = async (id, name) => {
    if (window.confirm(`Remover ${name} do sistema?`)) {
      await deletePatient(id)
      setPatients((list) => list.filter((p) => p.id !== id))
      showToast('Paciente removido.')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Pacientes</h1>
          <p>Gerencie todos os pacientes cadastrados no sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={16} /> Novo paciente
        </button>
      </div>

      {showForm && (
        <form className="panel patients-form" onSubmit={addPatient}>
          <div className="form-field">
            <label>Nome completo</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-field">
            <label>Data de nascimento</label>
            <input type="date" value={form.birthDate} onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))} required />
          </div>
          <div className="form-field">
            <label>Tipo de cuidado</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option>Ferida</option>
              <option>Estomia</option>
            </select>
          </div>
          <div className="patients-form__actions">
            <button type="button" className="btn-icon" aria-label="Fechar" onClick={() => setShowForm(false)}>
              <X size={14} />
            </button>
            <button type="submit" className="btn btn-primary">Cadastrar</button>
          </div>
        </form>
      )}

      <div className="panel">
        <div className="patients__toolbar">
          <div className="patients__search">
            <Search size={16} />
            <input
              placeholder="Buscar paciente..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
            <option value="">Todos os status</option>
            <option>Ativo</option>
            <option>Inativo</option>
          </select>
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1) }}>
            <option value="">Todos os tipos</option>
            <option>Ferida</option>
            <option>Estomia</option>
          </select>
        </div>

        <div className="table-scroll">
          <table className="patients__table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Idade</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Última avaliação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="patients__empty">Carregando pacientes...</td></tr>
              )}

              {!loading && paginated.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="patients__name">
                      <Avatar initials={initialsOf(p.name)} size={32} />
                      {p.name}
                    </div>
                  </td>
                  <td>{p.age}</td>
                  <td>{p.type}</td>
                  <td><Badge>{p.status}</Badge></td>
                  <td>{p.lastEval}</td>
                  <td>
                    <div className="patients__actions">
                      <Link className="btn-icon" to={`/pacientes/${p.id}`} aria-label="Ver paciente">
                        <Eye size={15} />
                      </Link>
                      <Link className="btn-icon" to={`/pacientes/${p.id}`} aria-label="Editar paciente">
                        <Pencil size={15} />
                      </Link>
                      <button className="btn-icon" aria-label="Remover paciente" onClick={() => removePatient(p.id, p.name)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && paginated.length === 0 && (
                <tr><td colSpan={6} className="patients__empty">Nenhum paciente encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="patients__footer">
          <span>Total: {filtered.length} pacientes</span>
          <div className="patients__pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={n === currentPage ? 'is-active' : ''}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
