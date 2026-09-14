import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar/Sidebar.jsx'
import Topbar from '../components/Topbar/Topbar.jsx'
import './AppLayout.css'

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="app-layout__main">
        <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <div className="app-layout__content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
