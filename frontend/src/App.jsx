import { Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx'
import Login from './pages/Login/Login.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Patients from './pages/Patients/Patients.jsx'
import PatientProfile from './pages/PatientProfile/PatientProfile.jsx'
import WoundAssessment from './pages/WoundAssessment/WoundAssessment.jsx'
import PhotoRegistry from './pages/PhotoRegistry/PhotoRegistry.jsx'
import Evolution from './pages/Evolution/Evolution.jsx'
import Prescriptions from './pages/Prescriptions/Prescriptions.jsx'
import RemoteMonitoring from './pages/RemoteMonitoring/RemoteMonitoring.jsx'
import Reports from './pages/Reports/Reports.jsx'
import Settings from './pages/Settings/Settings.jsx'
import Agenda from './pages/Agenda/Agenda.jsx'
import Assessments from './pages/Assessments/Assessments.jsx'
import EvolutionsFeed from './pages/EvolutionsFeed/EvolutionsFeed.jsx'
import PrescriptionsBoard from './pages/PrescriptionsBoard/PrescriptionsBoard.jsx'
import Stock from './pages/Stock/Stock.jsx'
import PhotosList from './pages/PhotosList/PhotosList.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pacientes" element={<Patients />} />
          <Route path="/pacientes/:id" element={<PatientProfile />} />
          <Route path="/pacientes/:id/avaliacao" element={<WoundAssessment />} />
          <Route path="/pacientes/:id/fotos" element={<PhotoRegistry />} />
          <Route path="/pacientes/:id/evolucao" element={<Evolution />} />
          <Route path="/pacientes/:id/prescricoes" element={<Prescriptions />} />
          <Route path="/pacientes/:id/monitoramento" element={<RemoteMonitoring />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/avaliacoes" element={<Assessments />} />
          <Route path="/evolucoes" element={<EvolutionsFeed />} />
          <Route path="/prescricoes" element={<PrescriptionsBoard />} />
          <Route path="/estoque" element={<Stock />} />
          <Route path="/fotos" element={<PhotosList />} />
          <Route path="/relatorios" element={<Reports />} />
          <Route path="/indicadores" element={<Reports />} />
          <Route path="/configuracoes" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  )
}
