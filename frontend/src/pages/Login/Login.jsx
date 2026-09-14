import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Leaf } from 'lucide-react'
import { useToast } from '../../components/Toast/ToastContext.jsx'
import { login, register, isAuthenticated } from '../../services/authService.js'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })

  // Já autenticado: não faz sentido ficar preso na tela de login.
  if (isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (mode === 'register') {
      if (!form.fullName.trim()) {
        showToast('Informe seu nome completo.')
        return
      }
      if (form.password !== form.confirmPassword) {
        showToast('As senhas não coincidem.')
        return
      }
      if (form.password.length < 6) {
        showToast('A senha precisa ter pelo menos 6 caracteres.')
        return
      }
    }

    setSubmitting(true)
    try {
      if (mode === 'register') {
        await register({ fullName: form.fullName, email: form.email, password: form.password })
      } else {
        await login(form.email, form.password)
      }
      navigate('/', { replace: true })
    } catch (err) {
      showToast(err.message || (mode === 'register'
        ? 'Não foi possível criar sua conta.'
        : 'Não foi possível entrar. Verifique suas credenciais.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    if (!form.email.trim()) {
      showToast('Digite seu e-mail acima para receber o link de redefinição.')
      return
    }
    showToast(`Link de redefinição enviado para ${form.email}.`)
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setForm({ fullName: '', email: form.email, password: '', confirmPassword: '' })
  }

  return (
    <div className="login">
      <div className="login__side">
        <h1>
          Tecnologia e cuidado em cada etapa do tratamento de estomias e feridas.
        </h1>
        <ul className="login__benefits">
          <li>Mais organização</li>
          <li>Maior segurança</li>
          <li>Melhor cuidado</li>
        </ul>
        <div className="login__side-brand">
          <Leaf size={18} strokeWidth={2.4} />
          REVIGORAR
        </div>
      </div>

      <div className="login__panel">
        <form className="login__card" onSubmit={handleSubmit}>
          <div className="login__logo">
            <span className="login__logo-icon"><Leaf size={22} strokeWidth={2.4} /></span>
            <strong>REVIGORAR</strong>
            <small>CUIDADO QUE EVOLUI</small>
          </div>

          <div className="login__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              className={mode === 'login' ? 'is-active' : ''}
              aria-selected={mode === 'login'}
              onClick={() => switchMode('login')}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              className={mode === 'register' ? 'is-active' : ''}
              aria-selected={mode === 'register'}
              onClick={() => switchMode('register')}
            >
              Criar conta
            </button>
          </div>

          {mode === 'register' && (
            <div className="form-field">
              <label htmlFor="login-name">Nome completo</label>
              <input
                id="login-name"
                type="text"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                required
              />
            </div>
          )}

          <div className="form-field">
            <label htmlFor="login-email">E-mail{mode === 'login' ? ' ou usuário' : ''}</label>
            <input
              id="login-email"
              type={mode === 'register' ? 'email' : 'text'}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Senha</label>
            <div className="login__password">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Mostrar senha">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-field">
              <label htmlFor="login-confirm-password">Confirmar senha</label>
              <input
                id="login-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                required
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="login__row">
              <label className="login__remember">
                <input type="checkbox" checked={remember} onChange={() => setRemember((v) => !v)} />
                Lembrar de mim
              </label>
              <a href="#" onClick={handleForgotPassword}>Esqueceu sua senha?</a>
            </div>
          )}

          <button type="submit" className="btn btn-primary login__submit" disabled={submitting}>
            {submitting
              ? (mode === 'register' ? 'Criando conta...' : 'Entrando...')
              : (mode === 'register' ? 'Criar conta' : 'Entrar')}
          </button>

          <p className="login__footer">
            {mode === 'login' ? (
              <>Ainda não tem uma conta? <a href="#" onClick={(e) => { e.preventDefault(); switchMode('register') }}>Cadastre-se</a></>
            ) : (
              <>Já tem uma conta? <a href="#" onClick={(e) => { e.preventDefault(); switchMode('login') }}>Entrar</a></>
            )}
          </p>
        </form>
      </div>
    </div>
  )
}
