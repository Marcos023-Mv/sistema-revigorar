import { useEffect, useState } from 'react'
import { Download, ChevronRight } from 'lucide-react'
import LineChart from '../../components/LineChart/LineChart.jsx'
import DonutChart from '../../components/DonutChart/DonutChart.jsx'
import { useToast } from '../../components/Toast/ToastContext.jsx'
import { listReports, getWeekdays, getDistribution } from '../../services/reportsService.js'
import { listPatients } from '../../services/patientsService.js'
import './Reports.css'

export default function Reports() {
  const [reports, setReports] = useState({})
  const [weekdays, setWeekdays] = useState([])
  const [distribution, setDistribution] = useState([])
  const [patientCount, setPatientCount] = useState('—')
  const [active, setActive] = useState('')
  const showToast = useToast()

  useEffect(() => {
    let active2 = true
    listReports().then((data) => {
      if (!active2) return
      setReports(data)
      const keys = Object.keys(data)
      setActive(keys[1] || keys[0] || '')
    })
    getWeekdays().then((data) => { if (active2) setWeekdays(data) })
    getDistribution().then((data) => { if (active2) setDistribution(data) })
    listPatients().then((data) => { if (active2) setPatientCount(data.length) })
    return () => { active2 = false }
  }, [])

  const reportLinks = Object.keys(reports)
  const report = reports[active] || { series: [], label: '' }

  const exportReport = () => {
    const rows = [['Dia', 'Valor'], ...weekdays.map((day, i) => [day, report.series[i]])]
    const csv = rows.map((r) => r.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${active.toLowerCase().replace(/\s+/g, '-')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast(`Relatório "${active}" exportado.`)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Relatórios e indicadores</h1>
          <p>Acompanhe os resultados e gere relatórios personalizados</p>
        </div>
        <button className="btn btn-primary" onClick={exportReport}>
          <Download size={15} /> Exportar relatório
        </button>
      </div>

      <div className="reports-grid">
        <div className="panel">
          <h3 className="panel-title">Relatório geral</h3>
          <ul className="reports-links">
            {reportLinks.map((link) => (
              <li
                key={link}
                className={active === link ? 'is-active' : ''}
                onClick={() => setActive(link)}
              >
                {link} <ChevronRight size={14} />
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h3 className="panel-title">{active}</h3>
          <span className="reports-subtle">{report.label} · últimos 7 dias</span>
          <LineChart values={report.series} labels={weekdays} />
        </div>

        <div className="panel">
          <h3 className="panel-title">Tipos de atendimento</h3>
          <DonutChart data={distribution} total={patientCount} />
        </div>
      </div>
    </div>
  )
}
