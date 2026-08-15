import { Routes, Route, Navigate } from 'react-router'
import Home from './pages/Home'
import Inscription from './pages/Inscription'
import RendezVous from './pages/RendezVous'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/inscription" element={<Inscription />} />
      <Route path="/rendezvous" element={<RendezVous />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
      <Route path="/admin/admins" element={<AdminDashboard />} />
      <Route path="/admin/rendezvous" element={<AdminDashboard />} />
      <Route path="/admin/whatsapp" element={<AdminDashboard />} />
      <Route path="/admin/parametres" element={<AdminDashboard />} />
      <Route path="/admin/formations" element={<AdminDashboard />} />
      <Route path="/admin/centres" element={<AdminDashboard />} />
      <Route path="/admin/tuteurs" element={<AdminDashboard />} />
      <Route path="/admin/apprenants" element={<AdminDashboard />} />
      <Route path="/admin/comptabilite" element={<AdminDashboard />} />
      <Route path="/admin/paiements" element={<AdminDashboard />} />
      <Route path="/admin/rapports" element={<AdminDashboard />} />
      <Route path="/admin/matching" element={<AdminDashboard />} />
      <Route path="/admin/entreprises" element={<AdminDashboard />} />
      <Route path="/admin/placements" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
