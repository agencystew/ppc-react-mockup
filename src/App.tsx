import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { Dashboard } from './pages/Dashboard';
import { AgentCatalog } from './pages/AgentCatalog';
import { AgentDetail } from './pages/AgentDetail';
import { AgentRunning } from './pages/AgentRunning';
import { AgentResults } from './pages/AgentResults';
import { Reports } from './pages/Reports';
import { Projects } from './pages/Projects';
import { ProjectPage } from './pages/Project';
import { Chat } from './pages/Chat';
import { DevPrimitives } from './pages/_dev/Primitives';

export default function App() {
  return (
    <Routes>
      {/* Hidden v2 QA route — renders the four brand primitives in isolation,
          outside the AppShell layout. Used by page-rebuild agents only. */}
      <Route path="_dev/primitives" element={<DevPrimitives />} />

      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />

        {/* Chat surfaces ----------------------------------------------------
           /chat            — pre-chat (empty state, dark hero)
           /chat/:chatId    — active conversation playback
           Both render the inner chat-history rail on the left. */}
        <Route path="chat" element={<Chat />} />
        <Route path="chat/:chatId" element={<Chat />} />

        {/* Agent surfaces ---------------------------------------------------
           /agents              — catalog (28 specialists)
           /agents/:slug        — agent detail + launch form
           /agents/:slug/loading/:runId — agent LOADING (running state)
           /reports             — REPORTS inbox (list view, sorted by urgency)
           /reports/:runId      — single REPORT (completed agent results)
           Old running URL still works for backward-compat redirects. */}
        <Route path="agents" element={<AgentCatalog />} />
        <Route path="agents/:slug" element={<AgentDetail />} />
        <Route path="agents/:slug/loading/:runId" element={<AgentRunning />} />
        <Route path="agents/:slug/run/:runId" element={<AgentRunning />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/:runId" element={<AgentResults />} />

        {/* Projects surfaces ------------------------------------------------
           /projects        — LIST of every client
           /projects/:id    — DOSSIER for one client */}
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
