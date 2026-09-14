import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, RefreshCw, ShieldCheck, LogOut, X } from 'lucide-react'
import Avatar from '../../components/Avatar/Avatar.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import Switch from '../../components/Switch/Switch.jsx'
import { useToast } from '../../components/Toast/ToastContext.jsx'
import { logout } from '../../services/authService.js'
import { useTheme } from '../../context/ThemeContext.jsx'
import {
  getInstitution, updateInstitution,
  listUsers, createUser, updateUser, deleteUser,
  listIntegrations, toggleIntegration as toggleIntegrationApi,
  updateSecurity,
  getBackupInfo, runBackup as runBackupApi, updateBackupFrequency,
} from '../../services/settingsService.js'
import './Settings.css'

const SUBNAV = ['Informações da instituição', 'Usuários', 'Integrações', 'Aparência', 'Segurança', 'Backup']

function initialsOf(name) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

export default function Settings() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [section, setSection] = useState('Informações da instituição')
  const [integrations, setIntegrations] = useState([])
  const [twoFactor, setTwoFactor] = useState(false)
  const [loginAlerts, setLoginAlerts] = useState(true)
  const [institution, setInstitution] = useState({ name: '', cnpj: '', email: '', phone: '', address: '' })
  const [users, setUsers] = useState([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'Enfermeira' })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [backupInfo, setBackupInfo] = useState({ when: '—', status: '—', frequency: 'Diário' })
  const [backingUp, setBackingUp] = useState(false)
  const showToast = useToast()

  useEffect(() => {
    let active = true
    getInstitution().then((data) => { if (active) setInstitution(data) })
    listUsers().then((data) => { if (active) setUsers(data) })
    listIntegrations().then((data) => { if (active) setIntegrations(data) })
    getBackupInfo().then((data) => { if (active) setBackupInfo(data) })
    return () => { active = false }
  }, [])

  const toggleIntegration = async (name) => {
    const current = integrations.find((i) => i.name === name)
    await toggleIntegrationApi(name, !current.enabled)
    setIntegrations((list) => list.map((i) => (i.name === name ? { ...i, enabled: !i.enabled } : i)))
  }

  const saveInstitution = async (e) => {
    e.preventDefault()
    await updateInstitution(institution)
    showToast('Informações da instituição atualizadas.')
  }

  const addUser = async (e) => {
    e.preventDefault()
    if (!userForm.name.trim() || !userForm.email.trim()) return
    const created = await createUser(userForm)
    setUsers((list) => [...list, created])
    setUserForm({ name: '', email: '', role: 'Enfermeira' })
    setShowUserForm(false)
    showToast('Usuário adicionado.')
  }

  const editUser = async (user) => {
    const role = window.prompt('Novo perfil para ' + user.name + ':', user.role)
    if (!role || role === user.role) return
    await updateUser(user.id, { role })
    setUsers((list) => list.map((u) => (u.id === user.id ? { ...u, role } : u)))
    showToast('Usuário atualizado.')
  }

  const removeUser = async (user) => {
    if (window.confirm(`Remover ${user.name} do sistema?`)) {
      await deleteUser(user.id)
      setUsers((list) => list.filter((u) => u.id !== user.id))
      showToast('Usuário removido.')
    }
  }

  const saveSecurity = async (e) => {
    e.preventDefault()
    if (passwords.next || passwords.confirm || passwords.current) {
      if (passwords.next !== passwords.confirm) {
        showToast('As senhas não coincidem.')
        return
      }
      if (!passwords.current) {
        showToast('Informe a senha atual.')
        return
      }
    }
    await updateSecurity({
      currentPassword: passwords.current,
      newPassword: passwords.next,
      twoFactor,
      loginAlerts,
    })
    setPasswords({ current: '', next: '', confirm: '' })
    showToast('Configurações de segurança salvas.')
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const runBackup = async () => {
    setBackingUp(true)
    const result = await runBackupApi()
    setBackupInfo((info) => ({ ...info, ...result }))
    setBackingUp(false)
    showToast('Backup realizado com sucesso.')
  }

  const changeBackupFrequency = async (frequency) => {
    setBackupInfo((info) => ({ ...info, frequency }))
    await updateBackupFrequency(frequency)
    showToast('Frequência de backup atualizada.')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Configurações</h1>
          <p>Gerencie as informações e preferências do sistema</p>
        </div>
      </div>

      <div className="settings-layout">
        <nav className="settings-subnav panel">
          {SUBNAV.map((item) => (
            <button
              key={item}
              className={section === item ? 'is-active' : ''}
              onClick={() => setSection(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="panel settings-form">
          {section === 'Informações da instituição' ? (
            <form onSubmit={saveInstitution}>
              <h3 className="panel-title">Informações da instituição</h3>

              <div className="form-field">
                <label>Nome da instituição</label>
                <input
                  value={institution.name}
                  onChange={(e) => setInstitution((i) => ({ ...i, name: e.target.value }))}
                />
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label>CNPJ</label>
                  <input
                    value={institution.cnpj}
                    onChange={(e) => setInstitution((i) => ({ ...i, cnpj: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label>E-mail</label>
                  <input
                    value={institution.email}
                    onChange={(e) => setInstitution((i) => ({ ...i, email: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label>Telefone</label>
                  <input
                    value={institution.phone}
                    onChange={(e) => setInstitution((i) => ({ ...i, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Endereço</label>
                <input
                  value={institution.address}
                  onChange={(e) => setInstitution((i) => ({ ...i, address: e.target.value }))}
                />
              </div>

              <div className="settings-form__actions">
                <button type="submit" className="btn btn-primary">Salvar alterações</button>
              </div>
            </form>
          ) : section === 'Usuários' ? (
            <>
              <div className="settings-panel-head">
                <h3 className="panel-title">Usuários</h3>
                <button className="btn btn-primary" onClick={() => setShowUserForm((v) => !v)}>
                  <Plus size={15} /> Novo usuário
                </button>
              </div>

              {showUserForm && (
                <form className="settings-user-form" onSubmit={addUser}>
                  <div className="form-field">
                    <label>Nome</label>
                    <input value={userForm.name} onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-field">
                    <label>E-mail</label>
                    <input type="email" value={userForm.email} onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))} required />
                  </div>
                  <div className="form-field">
                    <label>Perfil</label>
                    <select value={userForm.role} onChange={(e) => setUserForm((f) => ({ ...f, role: e.target.value }))}>
                      <option>Enfermeira</option>
                      <option>Estomaterapeuta</option>
                      <option>Administrador</option>
                      <option>Suporte</option>
                    </select>
                  </div>
                  <div className="settings-user-form__actions">
                    <button type="button" className="btn-icon" aria-label="Fechar" onClick={() => setShowUserForm(false)}>
                      <X size={14} />
                    </button>
                    <button type="submit" className="btn btn-primary">Adicionar</button>
                  </div>
                </form>
              )}

              <div className="table-scroll">
                <table className="settings-table">
                  <thead>
                    <tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th>Ações</th></tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="settings-user">
                            <Avatar initials={initialsOf(u.name)} size={30} />
                            {u.name}
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td><Badge>{u.status}</Badge></td>
                        <td>
                          <div className="settings-table__actions">
                            <button className="btn-icon" aria-label="Editar usuário" onClick={() => editUser(u)}><Pencil size={14} /></button>
                            <button className="btn-icon" aria-label="Remover usuário" onClick={() => removeUser(u)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : section === 'Integrações' ? (
            <>
              <h3 className="panel-title">Integrações</h3>
              <ul className="settings-integrations">
                {integrations.map((i) => (
                  <li key={i.name}>
                    <div>
                      <strong>{i.name}</strong>
                      <p>{i.description}</p>
                    </div>
                    <Switch checked={i.enabled} onChange={() => toggleIntegration(i.name)} />
                  </li>
                ))}
              </ul>
            </>
          ) : section === 'Aparência' ? (
            <>
              <h3 className="panel-title">Aparência</h3>
              <ul className="settings-integrations">
                <li>
                  <div>
                    <strong>Modo escuro</strong>
                    <p>Troca o tema do sistema para cores escuras, mais confortável em ambientes com pouca luz.</p>
                  </div>
                  <Switch checked={theme === 'dark'} onChange={toggleTheme} />
                </li>
              </ul>
            </>
          ) : section === 'Segurança' ? (
            <form onSubmit={saveSecurity}>
              <h3 className="panel-title">Segurança</h3>

              <div className="form-grid">
                <div className="form-field">
                  <label>Senha atual</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.current}
                    onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label>Nova senha</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.next}
                    onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label>Confirmar nova senha</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                  />
                </div>
              </div>

              <ul className="settings-integrations">
                <li>
                  <div>
                    <strong>Autenticação de dois fatores</strong>
                    <p>Exige um código adicional a cada novo acesso.</p>
                  </div>
                  <Switch checked={twoFactor} onChange={() => setTwoFactor((v) => !v)} />
                </li>
                <li>
                  <div>
                    <strong>Alertas de novo login</strong>
                    <p>Envia um e-mail sempre que sua conta for acessada em um novo dispositivo.</p>
                  </div>
                  <Switch checked={loginAlerts} onChange={() => setLoginAlerts((v) => !v)} />
                </li>
              </ul>

              <div className="settings-form__actions">
                <button type="submit" className="btn btn-primary"><ShieldCheck size={15} /> Salvar segurança</button>
              </div>

              <div className="settings-logout">
                <div>
                  <strong>Sair da conta</strong>
                  <p>Encerra sua sessão neste dispositivo. Você precisará entrar novamente para acessar o sistema.</p>
                </div>
                <button type="button" className="btn btn-danger" onClick={handleLogout}>
                  <LogOut size={15} /> Sair da conta
                </button>
              </div>
            </form>
          ) : (
            <>
              <h3 className="panel-title">Backup</h3>
              <div className="settings-backup">
                <div className="settings-backup__icon">
                  <RefreshCw size={20} className={backingUp ? 'settings-backup__spin' : ''} />
                </div>
                <div className="settings-backup__info">
                  <strong>Último backup realizado</strong>
                  <span>{backupInfo.when} · {backupInfo.status}</span>
                </div>
                <button className="btn btn-secondary" onClick={runBackup} disabled={backingUp}>
                  {backingUp ? 'Fazendo backup...' : 'Fazer backup agora'}
                </button>
              </div>

              <div className="form-field settings-backup__frequency">
                <label>Frequência de backup automático</label>
                <select value={backupInfo.frequency} onChange={(e) => changeBackupFrequency(e.target.value)}>
                  <option>Diário</option>
                  <option>Semanal</option>
                  <option>Mensal</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
