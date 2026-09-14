import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, ClipboardCheck, Activity, AlertCircle, ChevronRight } from 'lucide-react'
import StatCard from '../../components/StatCard/StatCard.jsx'
import LineChart from '../../components/LineChart/LineChart.jsx'
import DonutChart from '../../components/DonutChart/DonutChart.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import { listPatients } from '../../services/patientsService.js'
import { getStats, getUpcoming, getWeeklySeries, getDistribution } from '../../services/dashboardService.js'
import './Dashboard.css'

function getStatusDistribution(upcoming) {
  if (!upcoming.length) return []
  const counts = upcoming.reduce((acc, u) => {
    acc[u.status] = (acc[u.status] || 0) + 1
    return acc
  }, {})
  const colors = ['var(--color-primary)', 'var(--color-primary-light)', 'var(--color-accent-soft)']
  return Object.entries(counts).map(([label, count], i) => ({
    label,
    value: Math.round((count / upcoming.length) * 100),
    color: colors[i % colors.length],
  }))
}

export default function Dashboard() {
  const [stats, setStats] = useState({ activePatients: '—', assessmentsToday: '—', evolutionsToday: '—', pendencies: '—' })
  const [upcoming, setUpcoming] = useState([])
  const [series, setSeries] = useState({ labels: [], values: [] })
  const [distribution, setDistribution] = useState([])
  const [patients, setPatients] = useState([])

  useEffect(() => {
    let active = true
    getStats().then((data) => { if (active) setStats(data) })
    getUpcoming().then((data) => { if (active) setUpcoming(data) })
    getWeeklySeries().then((data) => { if (active) setSeries(data) })
    getDistribution().then((data) => { if (active) setDistribution(data) })
    listPatients().then((data) => { if (active) setPatients(data) })
    return () => { active = false }
  }, [])

  const patientIdByName = (name) => {
    const match = patients.find((p) => p.name === name)
    return match ? match.id : ''
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral da sua rotina</p>
        </div>
      </div>

      <div className="dash-stats">
        <Link to="/pacientes" className="dash-stat-link">
          <StatCard icon={<Users size={20} />} label="Pacientes ativos" value={stats.activePatients} delta="+2 hoje" />
        </Link>
        <Link to="/avaliacoes" className="dash-stat-link">
          <StatCard icon={<ClipboardCheck size={20} />} label="Avaliações hoje" value={stats.assessmentsToday} delta="+3 hoje" />
        </Link>
        <Link to="/evolucoes" className="dash-stat-link">
          <StatCard icon={<Activity size={20} />} label="Evoluções hoje" value={stats.evolutionsToday} delta="+1 hoje" />
        </Link>
        <Link to="/agenda" className="dash-stat-link">
          <StatCard icon={<AlertCircle size={20} />} label="Pendências" value={stats.pendencies} delta="-2 hoje" deltaTone="danger" />
        </Link>
      </div>

      <div className="dash-grid">
        <div className="panel">
          <h3 className="panel-title">Evolução dos atendimentos</h3>
          <span className="dash-subtle">Últimos 7 dias</span>
          <LineChart values={series.values} labels={series.labels} />
        </div>

        <div className="panel">
          <h3 className="panel-title">Distribuição por tipo de atendimento</h3>
          <DonutChart data={distribution} total={stats.activePatients} />
        </div>
      </div>

      <div className="dash-grid dash-grid--bottom">
        <div className="panel">
          <h3 className="panel-title">Próximos atendimentos</h3>
          <div className="dash-upcoming">
            {upcoming.map((u) => (
              <Link className="dash-upcoming__item" to={patientIdByName(u.name) ? `/pacientes/${patientIdByName(u.name)}` : '/pacientes'} key={u.name}>
                <div>
                  <strong>{u.name}</strong>
                  <span>{u.detail}</span>
                </div>
                <Badge>{u.status}</Badge>
                <ChevronRight size={16} className="dash-upcoming__chevron" />
              </Link>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title">Status dos próximos atendimentos</h3>
          <DonutChart data={getStatusDistribution(upcoming)} total={upcoming.length} centerLabel="Agendados" />
        </div>
      </div>
    </div>
  )
}
