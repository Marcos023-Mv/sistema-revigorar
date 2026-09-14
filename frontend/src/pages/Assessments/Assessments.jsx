import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, ChevronRight } from 'lucide-react'
import Avatar from '../../components/Avatar/Avatar.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import { listAssessments } from '../../services/assessmentsService.js'
import './Assessments.css'

const FILTERS = ['Todas', 'Ativas', 'Concluídas']

function initialsOf(name) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

export default function Assessments() {
  const [assessments, setAssessments] = useState([])
  const [filter, setFilter] = useState('Todas')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    listAssessments().then((data) => { if (active) setAssessments(data) })
    return () => { active = false }
  }, [])

  const filtered = assessments.filter((a) => {
    const matchesFilter =
      filter === 'Todas' ||
      (filter === 'Ativas' && a.assessmentStatus === 'Ativo') ||
      (filter === 'Concluídas' && a.assessmentStatus === 'Concluída')
    const matchesQuery = a.name.toLowerCase().includes(query.toLowerCase())
    return matchesFilter && matchesQuery
  })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Avaliações</h1>
          <p>Avaliações clínicas registradas para cada paciente</p>
        </div>
      </div>

      <div className="assessments-toolbar">
        <div className="assessments-search">
          <Search size={16} />
          <input placeholder="Buscar paciente..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="assessments-filters">
          {FILTERS.map((f) => (
            <button key={f} className={filter === f ? 'is-active' : ''} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="assessments-grid">
        {filtered.map((a) => (
          <div className="assessment-card" key={a.id}>
            <div className="assessment-card__head">
              <Avatar initials={initialsOf(a.name)} size={38} />
              <div>
                <strong>{a.name}</strong>
                <span>{a.age} anos</span>
              </div>
              <Badge tone={a.assessmentStatus === 'Concluída' ? 'success' : 'warning'}>{a.assessmentStatus}</Badge>
            </div>
            <div className="assessment-card__location">
              <MapPin size={13} /> {a.location}
            </div>
            <div className="assessment-card__footer">
              <span>{a.type} · última avaliação {a.lastEval}</span>
              <Link to={`/pacientes/${a.id}/avaliacao`}>
                Ver avaliação <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        ))}

        {filtered.length === 0 && <p className="assessments-empty">Nenhuma avaliação encontrada.</p>}
      </div>
    </div>
  )
}
