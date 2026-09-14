import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, RefreshCw, Bell, ChevronDown, Menu, User, Settings, LogOut } from 'lucide-react'
import Avatar from '../Avatar/Avatar.jsx'
import { CURRENT_USER } from '../../data/mockData.js'
import { useToast } from '../Toast/ToastContext.jsx'
import { logout, getCurrentUser } from '../../services/authService.js'
import './Topbar.css'

const NOTIFICATIONS = [
  { text: 'Nova avaliação registrada para Maria Santos.', time: '10 min atrás' },
  { text: 'Prescrição de João Almeida concluída.', time: '1h atrás' },
  { text: 'Estoque de espuma de poliuretano está baixo.', time: '3h atrás' },
]

export default function Topbar({ onOpenMobileMenu }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [query, setQuery] = useState('')
  const [user, setUser] = useState(CURRENT_USER)
  const navigate = useNavigate()
  const showToast = useToast()

  useEffect(() => {
    let active = true
    getCurrentUser().then((data) => { if (active) setUser(data) })
    return () => { active = false }
  }, [])

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      showToast('Dados sincronizados com sucesso.')
    }, 900)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/pacientes?q=${encodeURIComponent(query.trim())}`)
    setQuery('')
  }

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <header className="topbar">
      <button className="topbar__menu-btn" onClick={onOpenMobileMenu} aria-label="Abrir menu">
        <Menu size={20} />
      </button>

      <form className="topbar__search" onSubmit={handleSearch}>
        <Search size={16} />
        <input
          type="text"
          placeholder="Buscar paciente, ferida, documento..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <div className="topbar__actions">
        <button className="btn-icon" aria-label="Sincronizar" onClick={handleSync}>
          <RefreshCw size={16} className={syncing ? 'topbar__spin' : ''} />
        </button>

        <div className="topbar__notif">
          <button
            className="btn-icon topbar__bell"
            aria-label="Notificações"
            onClick={() => { setNotifOpen((v) => !v); setMenuOpen(false) }}
          >
            <Bell size={16} />
            <span className="topbar__dot" />
          </button>

          {notifOpen && (
            <div className="topbar__dropdown topbar__dropdown--wide">
              <strong className="topbar__dropdown-title">Notificações</strong>
              {NOTIFICATIONS.map((n) => (
                <div className="topbar__notif-item" key={n.text}>
                  <p>{n.text}</p>
                  <span>{n.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="topbar__user">
          <button
            className="topbar__user-trigger"
            onClick={() => { setMenuOpen((v) => !v); setNotifOpen(false) }}
          >
            <Avatar initials={user.initials} size={34} />
            <div className="topbar__user-text">
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>
            <ChevronDown size={14} />
          </button>

          {menuOpen && (
            <div className="topbar__dropdown">
              <Link to="/configuracoes" onClick={() => setMenuOpen(false)}>
                <User size={14} /> Meu perfil
              </Link>
              <Link to="/configuracoes" onClick={() => setMenuOpen(false)}>
                <Settings size={14} /> Configurações
              </Link>
              <button onClick={handleLogout}>
                <LogOut size={14} /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
