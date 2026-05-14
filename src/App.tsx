import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { Dashboard } from './pages/Dashboard';
import { AgentCatalog } from './pages/AgentCatalog';
import { AgentDetail } from './pages/AgentDetail';
import { AgentRunning } from './pages/AgentRunning';
import { AgentResults } from './pages/AgentResults';
import { Projects } from './pages/Projects';
import { ProjectPage } from './pages/Project';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />

        {/* Agent surfaces ---------------------------------------------------
           /agents              — catalog (28 specialists)
           /agents/:slug        — agent detail + launch form
           /agents/:slug/loading/:runId — agent LOADING (running state)
           /reports/:runId      — agent REPORT (completed state)
           Old running URL still works for backward-compat redirects. */}
        <Route path="agents" element={<AgentCatalog />} />
        <Route path="agents/:slug" element={<AgentDetail />} />
        <Route path="agents/:slug/loading/:runId" element={<AgentRunning />} />
        <Route path="agents/:slug/run/:runId" element={<AgentRunning />} />
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
