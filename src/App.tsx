import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';

/* v1 (canonical / live) */
import { Dashboard } from './pages/Dashboard';
import { AgentCatalog } from './pages/AgentCatalog';
import { AgentDetail } from './pages/AgentDetail';
import { AgentRunning } from './pages/AgentRunning';
import { AgentResults } from './pages/AgentResults';
import { Reports } from './pages/Reports';
import { Projects } from './pages/Projects';
import { ProjectPage } from './pages/Project';
import { Chat } from './pages/Chat';

/* v2 (parked for comparison — same routes prefixed with /v2) */
import { Dashboard as V2Dashboard } from './pages/_v2/Dashboard';
import { AgentCatalog as V2AgentCatalog } from './pages/_v2/AgentCatalog';
import { AgentDetail as V2AgentDetail } from './pages/_v2/AgentDetail';
import { AgentRunning as V2AgentRunning } from './pages/_v2/AgentRunning';
import { AgentResults as V2AgentResults } from './pages/_v2/AgentResults';
import { Reports as V2Reports } from './pages/_v2/Reports';
import { Projects as V2Projects } from './pages/_v2/Projects';
import { ProjectPage as V2ProjectPage } from './pages/_v2/Project';

import { DevPrimitives } from './pages/_dev/Primitives';

export default function App() {
  return (
    <Routes>
      {/* v2 brand primitives QA route — outside AppShell. */}
      <Route path="_dev/primitives" element={<DevPrimitives />} />

      <Route element={<AppShell />}>
        {/* ─── v1 (canonical / live) ─────────────────────────────────── */}
        <Route index element={<Dashboard />} />

        <Route path="chat" element={<Chat />} />
        <Route path="chat/:chatId" element={<Chat />} />

        <Route path="agents" element={<AgentCatalog />} />
        <Route path="agents/:slug" element={<AgentDetail />} />
        <Route path="agents/:slug/loading/:runId" element={<AgentRunning />} />
        <Route path="agents/:slug/run/:runId" element={<AgentRunning />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/:runId" element={<AgentResults />} />

        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectPage />} />

        {/* Project-scoped surfaces (URL = scope). Same components, two URL shapes:
           the ScopePill + AgentDetail launch panel pre-fill key off useParams.id. */}
        <Route path="projects/:id/agents" element={<AgentCatalog />} />
        <Route path="projects/:id/agents/:slug" element={<AgentDetail />} />
        <Route path="projects/:id/agents/:slug/loading/:runId" element={<AgentRunning />} />
        <Route path="projects/:id/agents/:slug/run/:runId" element={<AgentRunning />} />
        <Route path="projects/:id/runs/:runId" element={<AgentResults />} />
        <Route path="projects/:id/reports" element={<Reports />} />

        {/* ─── v2 (parked for A/B comparison) ─────────────────────────
           Same routes as v1, prefixed with /v2.  Swap "/v2" in/out of any
           URL to compare:  /agents  ↔  /v2/agents.  AppShell wraps both. */}
        <Route path="v2" element={<V2Dashboard />} />

        {/* v2/chat retired 2026-05-15: replaced by the canonical /chat redesign. */}

        <Route path="v2/agents" element={<V2AgentCatalog />} />
        <Route path="v2/agents/:slug" element={<V2AgentDetail />} />
        <Route path="v2/agents/:slug/loading/:runId" element={<V2AgentRunning />} />
        <Route path="v2/agents/:slug/run/:runId" element={<V2AgentRunning />} />
        <Route path="v2/reports" element={<V2Reports />} />
        <Route path="v2/reports/:runId" element={<V2AgentResults />} />

        <Route path="v2/projects" element={<V2Projects />} />
        <Route path="v2/projects/:id" element={<V2ProjectPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
