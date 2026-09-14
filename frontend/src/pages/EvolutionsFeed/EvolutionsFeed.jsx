import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Image as ImageIcon, FileText, ClipboardCheck } from 'lucide-react'
import Avatar from '../../components/Avatar/Avatar.jsx'
import { getEvolutionFeed } from '../../services/evolutionsService.js'
import './EvolutionsFeed.css'

const TYPES = ['Todas', 'Fotográfica', 'Prescrição', 'Avaliação']

const TYPE_ICON = {
  'Fotográfica': ImageIcon,
  'Prescrição': FileText,
  'Avaliação': ClipboardCheck,
}

const PAGE_SIZE = 6

function initialsOf(name) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

export default function EvolutionsFeed() {
  const [feed, setFeed] = useState([])
  const [type, setType] = useState('Todas')
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    let active = true
    getEvolutionFeed().then((data) => { if (active) setFeed(data) })
    return () => { active = false }
  }, [])

  const filtered = feed.filter((item) => type === 'Todas' || item.type === type)
  const shown = filtered.slice(0, visible)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Evoluções</h1>
          <p>Feed de evolução de todos os pacientes, em ordem cronológica</p>
        </div>
      </div>

      <div className="evofeed-filters">
        {TYPES.map((t) => (
          <button
            key={t}
            className={type === t ? 'is-active' : ''}
            onClick={() => { setType(t); setVisible(PAGE_SIZE) }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="panel evofeed-list">
        {shown.map((item) => {
          const Icon = TYPE_ICON[item.type]
          return (
            <Link className="evofeed-item" to={`/pacientes/${item.patient.id}/evolucao`} key={item.id}>
              <Avatar initials={initialsOf(item.patient.name)} size={36} />
              <div className="evofeed-item__body">
                <div className="evofeed-item__head">
                  <strong>{item.patient.name}</strong>
                  <span>{item.date}</span>
                </div>
                <p>{item.text}</p>
              </div>
              <div className="evofeed-item__icon"><Icon size={16} /></div>
            </Link>
          )
        })}

        {shown.length === 0 && <p className="evofeed-empty">Nenhuma evolução encontrada para este filtro.</p>}
      </div>

      {visible < filtered.length && (
        <button className="btn btn-secondary evofeed-more" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
          Carregar mais
        </button>
      )}
    </div>
  )
}
