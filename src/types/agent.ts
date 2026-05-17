// Shared types for the PPC.io app mockup.
//
// These are the shapes Jose will eventually plug real backend data into.
// Keep them stable so the UI doesn't have to reshape when reality lands.

export type AgentCategory =
  | 'operations'
  | 'creative'
  | 'strategic'
  | 'buyer'
  | 'diagnostics'
  | 'client'
  | 'context';

export type LaunchLevel = 'account' | 'project' | 'campaign' | 'adgroup';

export type FindingPriority = 'high' | 'medium' | 'low';

export type RunStatus = 'idle' | 'running' | 'completed' | 'failed';

// One row in an agent's "territory" map — the named places it looks.
// Single-prompt agents have these too; the items map to dimensions the
// prompt covers, not to multi-stage steps.
export interface InspectionItem {
  title: string;
  desc: string;
}

export interface AgentDefinition {
  slug: string;
  name: string;
  emoji: string;
  category: AgentCategory;
  // Pre-run pages use this. Compelling outcome copy, NEVER a $ figure.
  // See feedback_no_pre_run_dollar_figures.md.
  headline: string;
  // 1-2 lines under the headline describing what the user GETS.
  outcomeDescription: string;
  // Time to expect — OK pre-run because we control runtime.
  expectedDuration: string;
  // How the agent thinks (3 steps: context → alignment → recommendation).
  thinkingSteps: [string, string, string];
  // The territory this agent inspects. Renders as the numbered expedition
  // map on AgentDetail. Optional during rollout — falls back gracefully
  // if absent.
  inspects?: InspectionItem[];
}

export interface Project {
  id: string;
  name: string;             // e.g. "Smith Law Group"
  accountCount: number;     // number of Google Ads accounts connected
  industry?: string;        // shown in switcher subtitle
}

export interface GoogleAdsAccount {
  id: string;
  customerId: string;       // e.g. "123-456-7890"
  name: string;
  projectId: string;
  health: 'good' | 'warning' | 'attention';
}

// === Run-shaped data (the StagePage payload) ============================

export interface AgentStageRunning {
  initial: string;          // single-letter avatar
  role: string;             // active card title — e.g. "Competitor Gap Finder"
  task: string;             // descriptive sentence inside the active card
  elapsed: string;
  // Mission-feed active card extensions
  toolCallCount?: number;
  insightLabel?: string;    // e.g. "11 unclaimed angles with CTR benchmarks"
  tools?: string[];         // tool pills, e.g. ["compare.matrix", "ctr.benchmark"]
  progressPct?: number;
}

export interface AgentStageCompleted {
  title: string;
  agent: string;
  time: string;
}

// One row inside the dark "Live mission feed" card — sub-step level,
// distinct from the stage-level Completed section below the card.
export interface MissionFeedStep {
  time: string;
  title: string;
  description: string;
}

export interface AgentStageUpcoming {
  title: string;
  agent: string;
  dim?: boolean;
}

export interface StatTile {
  value: string;
  label: string;
}

export interface Finding {
  agent: string;
  priority: FindingPriority;
  finding: string;
  impact?: string;
  action?: string;
}

export interface DataPreviewTable {
  headers: string[];
  rows: string[][];
  moreCount?: number;
  moreLabel?: string;
}

export interface DataSource {
  agent: string;
  tools: string[];
  toolCallCount: number;
  dataPointsLabel: string;
  summary: string;
  dataPreview?: DataPreviewTable;
}

export interface ActionButton {
  label: string;
  primary?: boolean;
}

export interface AgentRun {
  runId: string;
  agentSlug: string;
  projectId: string;
  status: RunStatus;
  // Header data
  parentAgent: { icon: string; name: string };
  stage: { current: number; total: number };
  totalDuration?: string;
  // Running-state data
  headline: string;
  description: string;
  activeAgent?: AgentStageRunning;
  progressPct?: number;
  completedStages?: AgentStageCompleted[];
  upcomingStages?: AgentStageUpcoming[];
  moreUpcomingCount?: number;
  // Mission-feed rows shown inside the dark card (recent sub-steps within
  // the currently-active stage, with descriptions). Separate from
  // completedStages, which is the stage-level overview below the card.
  recentMissionSteps?: MissionFeedStep[];
  moreRecentStepsCount?: number;
  // Footer callout — the lavender "we're analyzing live signals" panel.
  liveSignalsLabel?: string;
  // Completed-state data
  stats?: StatTile[];
  findings?: Finding[];
  dataSources?: DataSource[];
  actions?: ActionButton[];
}
