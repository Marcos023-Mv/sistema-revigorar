import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Pencil, ChevronRight, FileText, Download, Plus, Check, X } from 'lucide-react'
import Avatar from '../../components/Avatar/Avatar.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import Tabs from '../../components/Tabs/Tabs.jsx'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.jsx'
import { useToast } from '../../components/Toast/ToastContext.jsx'
import { getPatient, updatePatient } from '../../services/patientsService.js'
import { getPatientRecords } from '../../services/evolutionsService.js'
import { listDocuments, addDocument as addDocumentApi } from '../../services/documentsService.js'
import { listPatientPrescriptions } from '../../services/prescriptionsService.js'
import './PatientProfile.css'

const TABS = ['Resumo', 'Histórico', 'Avaliações', 'Evoluções', 'Prescrições', 'Documentos']

const RECENT_EVALS = [
  { date: '12/09/2025', title: 'Avaliação de ferida', status: 'Ativo' },
  { date: '05/09/2025', title: 'Evolução fotográfica', status: 'Concluída' },
  { date: '28/08/2025', title: 'Avaliação de estomia', status: 'Concluída' },
]

const ASSESSMENTS = [
  { date: '12/09/2025', location: 'Membro inferior direito', type: 'Ferida', status: 'Ativo' },
  { date: '28/08/2025', location: 'Região sacral', type: 'Estomia', status: 'Concluída' },
  { date: '15/08/2025', location: 'Membro inferior direito', type: 'Ferida', status: 'Concluída' },
]

const EVOLUTIONS = [
  { date: '12/09/2025 10:24', title: 'Evolução fotográfica', description: 'Ferida em processo de cicatrização, sem sinais de infecção.' },
  { date: '05/09/2025 14:30', title: 'Prescrição de enfermagem', description: 'Troca de cobertura com hidrogel.' },
  { date: '28/08/2025 09:10', title: 'Avaliação clínica', description: 'Ferida com 3,2 cm de comprimento, 2,8 cm de largura.' },
]

export default function PatientProfile() {
  const { id } = useParams()
  const [tab, setTab] = useState('Resumo')
  const [patient, setPatient] = useState(null)
  const [records, setRecords] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const showToast = useToast()

  const [editing, setEditing] = useState(false)
  const [personal, setPersonal] = useState({
    phone: '(11) 98765-4321',
    responsible: 'João Silva (Filho)',
  })
  const [draft, setDraft] = useState(personal)
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    let active = true
    getPatient(id).then((data) => { if (active) setPatient(data) })
    getPatientRecords(id).then((data) => { if (active) setRecords(data) })
    listDocuments(id).then((data) => { if (active) setDocuments(data) })
    listPatientPrescriptions(id).then((data) => { if (active) setPrescriptions(data) })
    return () => { active = false }
  }, [id])

  const startEditing = () => {
    setDraft(personal)
    setEditing(true)
  }

  const saveEditing = async () => {
    await updatePatient(id, draft)
    setPersonal(draft)
    setEditing(false)
    showToast('Dados pessoais atualizados.')
  }

  const cancelEditing = () => {
    setEditing(false)
  }

  const addDocument = async () => {
    const name = window.prompt('Nome do novo documento (ex: Laudo - setembro.pdf):', 'Novo documento.pdf')
    if (!name) return
    const created = await addDocumentApi(id, { name })
    setDocuments((list) => [created, ...list])
    showToast('Documento adicionado.')
  }

  const downloadDocument = (name) => {
    showToast(`Baixando ${name}...`)
  }

  if (!patient) return <div className="page"><p>Carregando paciente...</p></div>

  return (
    <div className="page">
      <Breadcrumb items={[{ label: 'Pacientes', to: '/pacientes' }, { label: patient.name }]} />

      <div className="profile-header panel">
        <Avatar initials={patient.name.split(' ').slice(0, 2).map((n) => n[0]).join('')} size={64} />
        <div className="profile-header__info">
          <h1>{patient.name}</h1>
          <span>{patient.age} anos, Feminino · CPF 000.000.000-00</span>
        </div>
        <Badge>{patient.status}</Badge>
        <button className="btn btn-secondary" onClick={startEditing}>
          <Pencil size={14} /> Editar
        </button>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'Resumo' && (
        <div className="profile-grid">
          <div className="panel">
            <div className="profile-panel-head">
              <h3 className="panel-title">Dados pessoais</h3>
              {editing && (
                <div className="profile-edit-actions">
                  <button className="btn-icon" aria-label="Salvar" onClick={saveEditing}><Check size={14} /></button>
                  <button className="btn-icon" aria-label="Cancelar" onClick={cancelEditing}><X size={14} /></button>
                </div>
              )}
            </div>
            <dl className="profile-facts">
              <div><dt>Nome</dt><dd>{patient.name}</dd></div>
              <div><dt>Idade</dt><dd>{patient.age} anos</dd></div>
              <div><dt>Gênero</dt><dd>Feminino</dd></div>
              <div><dt>CPF</dt><dd>000.000.000-00</dd></div>
              <div>
                <dt>Telefone</dt>
                <dd>
                  {editing ? (
                    <input
                      className="profile-facts__input"
                      value={draft.phone}
                      onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                    />
                  ) : personal.phone}
                </dd>
              </div>
              <div><dt>Tipo de cuidado</dt><dd>{patient.type}</dd></div>
              <div>
                <dt>Responsável</dt>
                <dd>
                  {editing ? (
                    <input
                      className="profile-facts__input"
                      value={draft.responsible}
                      onChange={(e) => setDraft((d) => ({ ...d, responsible: e.target.value }))}
                    />
                  ) : personal.responsible}
                </dd>
              </div>
            </dl>
          </div>

          <div className="panel">
            <div className="profile-panel-head">
              <h3 className="panel-title">Últimas avaliações</h3>
              <Link to={`/pacientes/${patient.id}/avaliacao`}>Ver todas</Link>
            </div>
            <ul className="profile-timeline">
              {RECENT_EVALS.map((item) => (
                <li key={item.date}>
                  <div>
                    <strong>{item.date}</strong>
                    <span>{item.title}</span>
                  </div>
                  <Badge>{item.status}</Badge>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel profile-links">
            <h3 className="panel-title">Acessos rápidos</h3>
            <Link to={`/pacientes/${patient.id}/avaliacao`}>Avaliação da ferida <ChevronRight size={14} /></Link>
            <Link to={`/pacientes/${patient.id}/evolucao`}>Evolução do paciente <ChevronRight size={14} /></Link>
            <Link to={`/pacientes/${patient.id}/fotos`}>Registro fotográfico <ChevronRight size={14} /></Link>
            <Link to={`/pacientes/${patient.id}/prescricoes`}>Prescrições e condutas <ChevronRight size={14} /></Link>
            <Link to={`/pacientes/${patient.id}/monitoramento`}>Acompanhamento remoto <ChevronRight size={14} /></Link>
          </div>
        </div>
      )}

      {tab === 'Histórico' && (
        <div className="panel">
          <h3 className="panel-title">Histórico completo</h3>
          <ul className="profile-history">
            {records.map((r) => (
              <li key={r.date + r.type}>
                <span className="profile-history__dot" />
                <div>
                  <div className="profile-history__head">
                    <strong>{r.type}</strong>
                    <span>{r.date}</span>
                  </div>
                  <p>{r.description}</p>
                  <span className="profile-history__by">Registrado por {r.professional}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'Avaliações' && (
        <div className="panel">
          <div className="profile-panel-head">
            <h3 className="panel-title">Avaliações</h3>
            <Link to={`/pacientes/${patient.id}/avaliacao`}>Nova avaliação</Link>
          </div>
          <div className="table-scroll">
            <table className="profile-table">
              <thead>
                <tr><th>Data</th><th>Localização</th><th>Tipo</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {ASSESSMENTS.map((a) => (
                  <tr key={a.date}>
                    <td>{a.date}</td>
                    <td>{a.location}</td>
                    <td>{a.type}</td>
                    <td><Badge>{a.status}</Badge></td>
                    <td>
                      <Link className="btn-icon" to={`/pacientes/${patient.id}/avaliacao`} aria-label="Ver avaliação">
                        <ChevronRight size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Evoluções' && (
        <div className="panel">
          <div className="profile-panel-head">
            <h3 className="panel-title">Evoluções</h3>
            <Link to={`/pacientes/${patient.id}/evolucao`}>Ver linha do tempo completa</Link>
          </div>
          <ul className="profile-history">
            {EVOLUTIONS.map((e) => (
              <li key={e.date}>
                <span className="profile-history__dot" />
                <div>
                  <div className="profile-history__head">
                    <strong>{e.title}</strong>
                    <span>{e.date}</span>
                  </div>
                  <p>{e.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'Prescrições' && (
        <div className="panel">
          <div className="profile-panel-head">
            <h3 className="panel-title">Prescrições</h3>
            <Link to={`/pacientes/${patient.id}/prescricoes`}>Ver todas / nova prescrição</Link>
          </div>
          <div className="table-scroll">
            <table className="profile-table">
              <thead>
                <tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Status</th></tr>
              </thead>
              <tbody>
                {prescriptions.map((p) => (
                  <tr key={p.id || p.date + p.description}>
                    <td>{p.date}</td>
                    <td>{p.type}</td>
                    <td>{p.description}</td>
                    <td><Badge>{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Documentos' && (
        <div className="panel">
          <div className="profile-panel-head">
            <h3 className="panel-title">Documentos</h3>
            <button className="btn btn-secondary" onClick={addDocument}>
              <Plus size={14} /> Adicionar documento
            </button>
          </div>
          <ul className="profile-documents">
            {documents.map((doc) => (
              <li key={doc.name}>
                <div className="profile-documents__icon"><FileText size={16} /></div>
                <div className="profile-documents__body">
                  <strong>{doc.name}</strong>
                  <span>{doc.date} · {doc.size}</span>
                </div>
                <button className="btn-icon" aria-label="Baixar documento" onClick={() => downloadDocument(doc.name)}>
                  <Download size={15} />
                </button>
              </li>
            ))}

            {documents.length === 0 && <p className="profile-documents__empty">Nenhum documento cadastrado.</p>}
          </ul>
        </div>
      )}
    </div>
  )
}
