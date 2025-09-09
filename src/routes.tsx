import { Routes, Route, Navigate } from 'react-router-dom'
import Intro from '@/pages/Intro'
import Workspace from '@/pages/Workspace'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/app" element={<Workspace />} />
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
