import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { Dashboard } from './pages/Dashboard';
import { AgentCatalog } from './pages/AgentCatalog';
import { AgentDetail } from './pages/AgentDetail';
import { AgentRunning } from './pages/AgentRunning';
import { AgentResults } from './pages/AgentResults';
import { ProjectPage } from './pages/Project';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="agents" element={<AgentCatalog />} />
        <Route path="agents/:slug" element={<AgentDetail />} />
        <Route path="agents/:slug/run/:runId" element={<AgentRunning />} />
        <Route path="reports/:runId" element={<AgentResults />} />
        <Route path="projects/:id" element={<ProjectPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
