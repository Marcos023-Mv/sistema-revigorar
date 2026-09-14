import { NavLink } from 'react-router-dom'
import {
  Home, Users, Calendar, ClipboardCheck, Activity, FileText,
  Package, Image, BarChart2, TrendingUp, Settings, PanelLeftClose, PanelLeft,
  Leaf,
} from 'lucide-react'
import { useState } from 'react'
import './Sidebar.css'

const NAV = [
  { label: 'Início', to: '/', icon: Home, end: true },
  { label: 'Pacientes', to: '/pacientes', icon: Users },
  { label: 'Agenda', to: '/agenda', icon: Calendar },
  { label: 'Avaliações', to: '/avaliacoes', icon: ClipboardCheck },
  { label: 'Evoluções', to: '/evolucoes', icon: Activity },
  { label: 'Prescrições', to: '/prescricoes', icon: FileText },
  { label: 'Estoque', to: '/estoque', icon: Package },
  { label: 'Fotos', to: '/fotos', icon: Image },
  { label: 'Relatórios', to: '/relatorios', icon: BarChart2 },
  { label: 'Indicadores', to: '/indicadores', icon: TrendingUp },
  { label: 'Configurações', to: '/configuracoes', icon: Settings },
]

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {mobileOpen && <div className="sidebar__overlay" onClick={onCloseMobile} />}
      <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-open' : ''}`}>
        <div className="sidebar__brand">
          <span className="sidebar__brand-icon"><Leaf size={18} strokeWidth={2.4} /></span>
          {!collapsed && (
            <span className="sidebar__brand-text">
              REVIGORAR
              <small>Cuidado que evolui</small>
            </span>
          )}
        </div>

        <nav className="sidebar__nav">
          <ul>
            {NAV.map(({ label, to, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
                  onClick={onCloseMobile}
                  title={label}
                >
                  <Icon size={18} />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button className="sidebar__collapse" onClick={() => setCollapsed((c) => !c)}>
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          {!collapsed && <span>Recolher menu</span>}
        </button>
      </aside>
    </>
  )
}
