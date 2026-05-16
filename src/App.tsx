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

/* v3 reports evidence redesign (2026-05-15)
   Parallel-agent variants archived under _v3/_archive/ after failing the
   app-fidelity test. Single rebuild ReportV3 extends the canonical
   AgentResults page patterns with Jose's evidence model. */
import { ReportV3 } from './pages/_v3/ReportV3';

/* v4 report summary redesign (2026-05-15)
   Replaces v1's split FindingTiles + RecommendationsSection with a single
   stacked feed of paired Discovery cards. Atomic unit for the upcoming Key
   Discoveries cross-report aggregator. See
   docs/plans/2026-05-15-summary-section-v4-design.md. */
import { AgentResultsV4 } from './pages/_v4/AgentResultsV4';

/* v5 report — world-class redesign (2026-05-16)
   Builds on v4 with four new trust layers: Investigation hero · Strategy
   Verdict · Business Context on every card · Checks Before Export. Drops
   the Methodology tab — folds into Deep Report. See
   docs/plans/2026-05-16-agent-results-v5-design.md. */
import { AgentResultsV5 } from './pages/_v5/AgentResultsV5';

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
        {/* v5 promoted to canonical /reports/:runId on 2026-05-16.
           The previous v1 report page is reachable at /v1/reports/:runId. */}
        <Route path="reports/:runId" element={<AgentResultsV5 />} />
        <Route path="v1/reports/:runId" element={<AgentResults />} />

        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectPage />} />

        {/* Project-scoped surfaces (URL = scope). Same components, two URL shapes:
           the ScopePill + AgentDetail launch panel pre-fill key off useParams.id. */}
        <Route path="projects/:id/agents" element={<AgentCatalog />} />
        <Route path="projects/:id/agents/:slug" element={<AgentDetail />} />
        <Route path="projects/:id/agents/:slug/loading/:runId" element={<AgentRunning />} />
        <Route path="projects/:id/agents/:slug/run/:runId" element={<AgentRunning />} />
        <Route path="projects/:id/runs/:runId" element={<AgentResultsV5 />} />
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

        {/* ─── v3 reports evidence redesign ─────────────────────────────
           Single rebuild after parallel-agent variants were archived. */}
        <Route path="v3/reports/run-competitor-spy" element={<ReportV3 />} />

        {/* ─── v4 summary tab redesign ──────────────────────────────────
           Discovery cards (finding+rec paired). Same page chrome as v1;
           only the Summary tab body differs. Compare v1↔v4 by swapping
           `/v4` in/out of the URL:  /reports/<id>  ↔  /v4/reports/<id>. */}
        <Route path="v4/reports/:runId" element={<AgentResultsV4 />} />

        {/* ─── v5 report — world-class redesign ─────────────────────────
           New chrome (own InvestigationHero + StrategyVerdict + Finding↔
           Next-Step Discovery cards). AI Summary | Deep Report tabs only.
           Compare v4↔v5 by swapping `/v4`↔`/v5` in the URL. Only the
           competitor-spy fixture is authored in v5 (so far). */}
        <Route path="v5/reports/:runId" element={<AgentResultsV5 />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
