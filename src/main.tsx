import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'
import '@/styles/globals.css'

// Use BASE_URL from Vite (set VITE_BASE for GH Pages).
const basename = import.meta.env.BASE_URL || '/'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>,
)
