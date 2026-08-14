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
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/cycles" element={<AdminDashboard />} />
      <Route path="/admin/filieres" element={<AdminDashboard />} />
      <Route path="/admin/tarifs" element={<AdminDashboard />} />
      <Route path="/admin/etapes" element={<AdminDashboard />} />
      <Route path="/admin/inscriptions" element={<AdminDashboard />} />
      <Route path="/admin/partenaires" element={<AdminDashboard />} />
      <Route path="/admin/avantages" element={<AdminDashboard />} />
      <Route path="/admin/rendezvous" element={<AdminDashboard />} />
      <Route path="/admin/travailleurs" element={<AdminDashboard />} />
      <Route path="/admin/matching" element={<AdminDashboard />} />
      <Route path="/admin/comptabilite" element={<AdminDashboard />} />
      <Route path="/admin/salles" element={<AdminDashboard />} />
      <Route path="/admin/placements" element={<AdminDashboard />} />
      <Route path="/admin/tuteurs" element={<AdminDashboard />} />
      <Route path="/admin/parametres" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
