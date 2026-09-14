import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Image as ImageIcon, Download } from 'lucide-react'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.jsx'
import Tabs from '../../components/Tabs/Tabs.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import { PATIENTS } from '../../data/mockData.js'
import { useToast } from '../../components/Toast/ToastContext.jsx'
import { getPatientRecords, getEvolutionTimeline } from '../../services/evolutionsService.js'
import { getPatientPhotos } from '../../services/photosService.js'
import './Evolution.css'

const TABS = ['Linha do tempo', 'Registros', 'Fotos']

const DEFAULT_TIMELINE = [
  {
    date: '12/09/2025 10:24',
    title: 'Evolução fotográfica',
    description: 'Ferida em processo de cicatrização. Sem sinais de infecção.',
    details: 'Comprimento 3,9 cm, largura 2,6 cm, profundidade 0,4 cm. Tecido de granulação predominante. Registrado por Ana Silva.',
    hasPhoto: true,
  },
  {
    date: '05/09/2025 14:30',
    title: 'Prescrição de enfermagem',
    description: 'Troca de cobertura com hidrogel.',
    details: 'Cobertura trocada a cada 48h. Sem sinais de reação alérgica ou desconforto relatado pelo paciente.',
  },
  {
    date: '28/08/2025 09:10',
    title: 'Avaliação clínica',
    description: 'Ferida com 3,2 cm de comprimento, 2,8 cm de largura.',
    details: 'Bordas regulares, pele perilesional íntegra. Reavaliação agendada para 7 dias.',
  },
]

export default function Evolution() {
  const { id } = useParams()
  const [tab, setTab] = useState('Linha do tempo')
  const [expanded, setExpanded] = useState(() => new Set())
  const [timeline, setTimeline] = useState(DEFAULT_TIMELINE)
  const [records, setRecords] = useState([])
  const [photos, setPhotos] = useState([])
  const patient = PATIENTS.find((p) => String(p.id) === id) || PATIENTS[0]
  const showToast = useToast()

  useEffect(() => {
    let active2 = true
    getEvolutionTimeline(id).then((data) => { if (active2 && data) setTimeline(data) })
    getPatientRecords(id).then((data) => { if (active2) setRecords(data) })
    getPatientPhotos(id).then((data) => {
      if (active2) setPhotos(data.map((date, i) => ({ date, label: `Registro ${i + 1}` })))
    })
    return () => { active2 = false }
  }, [id])

  const toggleDetails = (date) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })
  }

  const downloadPhoto = (date) => {
    showToast(`Baixando foto de ${date}...`)
  }

  return (
    <div className="page">
      <Breadcrumb
        items={[
          { label: 'Pacientes', to: '/pacientes' },
          { label: patient.name, to: `/pacientes/${patient.id}` },
          { label: 'Evolução do paciente' },
        ]}
      />

      <div className="panel">
        <div className="evolution-head">
          <h3 className="panel-title">Evolução do paciente</h3>
        </div>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'Linha do tempo' && (
          <ul className="evolution-timeline">
            {timeline.map((item) => (
              <li key={item.date}>
                <span className="evolution-timeline__dot" />
                <div className="evolution-timeline__body">
                  <div className="evolution-timeline__row">
                    <div>
                      <span className="evolution-timeline__date">{item.date}</span>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>
                    {item.hasPhoto && (
                      <div className="evolution-timeline__photo"><ImageIcon size={22} /></div>
                    )}
                  </div>
                  <button className="btn btn-secondary evolution-timeline__cta" onClick={() => toggleDetails(item.date)}>
                    {expanded.has(item.date) ? 'Ocultar detalhes' : 'Ver detalhes'}
                  </button>
                  {expanded.has(item.date) && (
                    <p className="evolution-timeline__details">{item.details}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {tab === 'Registros' && (
          <div className="table-scroll">
            <table className="evolution-table">
              <thead>
                <tr><th>Data</th><th>Tipo</th><th>Profissional</th><th>Descrição</th></tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.date + r.type}>
                    <td>{r.date}</td>
                    <td><Badge tone="info">{r.type}</Badge></td>
                    <td>{r.professional}</td>
                    <td>{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'Fotos' && (
          <div className="evolution-photos">
            {photos.map((p) => (
              <div className="evolution-photo-card" key={p.date}>
                <div className="evolution-photo-card__preview"><ImageIcon size={26} /></div>
                <div className="evolution-photo-card__footer">
                  <div>
                    <strong>{p.date}</strong>
                    <span>{p.label}</span>
                  </div>
                  <button className="btn-icon" aria-label="Baixar foto" onClick={() => downloadPhoto(p.date)}><Download size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
