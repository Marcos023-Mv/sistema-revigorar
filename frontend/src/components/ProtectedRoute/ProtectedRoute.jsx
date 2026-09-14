import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated } from '../../services/authService.js'

// Toda vez que o sistema é aberto sem uma sessão válida, cai na tela de
// login em vez de entrar direto no Dashboard.
export default function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
