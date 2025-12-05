import { Routes, Route, Navigate } from 'react-router-dom'
import Intro from '@/pages/Intro'
import Workspace from '@/pages/Workspace'
import CMSLogin from '@/pages/cms/Login'
import CMSLayout from '@/pages/cms/CMSLayout'
import CMSDashboard from '@/pages/cms/Dashboard'
import ArticlesList from '@/pages/cms/articles/ArticlesList'
import ArticleEditor from '@/pages/cms/articles/ArticleEditor'
import FAQManager from '@/pages/cms/faq/FAQManager'
import MenuManager from '@/pages/cms/menu/MenuManager'
import FAQEditor from '@/pages/cms/faq/FAQEditor'
import CarouselEditor from '@/pages/cms/carousel/CarouselEditor'
import WorkspaceCardsEditor from '@/pages/cms/workspace/WorkspaceCardsEditor'
import Analytics from '@/pages/cms/analytics/Analytics'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/app" element={<Workspace />} />

      {/* CMS Routes */}
      <Route path="/CMS/login" element={<CMSLogin />} />
      <Route path="/CMS" element={
        <ProtectedRoute>
          <CMSLayout />
        </ProtectedRoute>
      }>
        <Route index element={<CMSDashboard />} />
        <Route path="articles" element={<ArticlesList />} />
        <Route path="articles/new" element={<ArticleEditor />} />
        <Route path="articles/edit/:id" element={<ArticleEditor />} />
        <Route path="menu" element={<MenuManager />} />
        <Route path="faq" element={<FAQManager />} />
        <Route path="faq/edit/:category" element={<FAQEditor />} />
        <Route path="carousel" element={<CarouselEditor />} />
        <Route path="workspace" element={<WorkspaceCardsEditor />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

