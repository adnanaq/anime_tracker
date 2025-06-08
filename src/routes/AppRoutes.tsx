import { Routes, Route } from 'react-router-dom'
import { Dashboard } from '../components/Dashboard/Dashboard'
import { AnimeDetail } from '../pages/AnimeDetail'
import { AuthCallback } from '../pages/AuthCallback'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/anime/:source/:id" element={<AnimeDetail />} />
      <Route path="/auth/:source/callback" element={<AuthCallback />} />
    </Routes>
  )
}