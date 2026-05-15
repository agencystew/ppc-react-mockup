// Mock chat data for the /chat surface.
//
// Two halves:
//   1. CHAT_HISTORY  — the inner-sidebar list of prior conversations
//   2. CHAT_MESSAGES — full thread bodies for active-chat playback
//
// One thread is rendered in detail (the Smith Law CPA-spike thread that
// matches the screenshots Stewart provided). The rest are list-only stubs
// to give the sidebar realistic density.

export type ChatRole = 'user' | 'assistant';

export interface ChatChartBar { value: number; spike?: boolean; }

export interface ChatChart {
  kind: 'bars';
  label: string;
  delta: string;
  axisLeft: string;
  axisRight: string;
  bars: ChatChartBar[];
}

export interface ChatActionChip {
  emoji: string;
  /** Optional Phosphor icon hint — falls back to emoji if absent. Used by the
   *  active-chat action chip row, which renders thin-stroke icons over emoji
   *  for a refined editorial feel that matches the reference. */
  icon?: 'magnifying-glass' | 'chart-bar' | 'calendar' | 'users' | 'sparkle';
  label: string;
  variant?: 'default' | 'schedule';
}

export interface ChatFactor {
  label: string;
  /** Display value, e.g. "+12%", "+24%", or "—" for "not yet quantified". */
  value: string;
  /** Tone drives the value's color. Default = critical (red), muted for "—". */
  tone?: 'critical' | 'muted';
}

export interface ChatFactorsCard {
  title: string;
  rows: ChatFactor[];
  /** Right-aligned link inside the card ("View details →"). */
  linkLabel: string;
  linkHref?: string;
}

export interface ChatRunningCard {
  agentEmoji: string;
  agentName: string;
  description: string;
  stageCurrent: number;
  stageTotal: number;
  stageDescription: string;
  elapsed: string;
  progressPct: number; // 0–100
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  /** Plain-text body. For assistant messages, body is the lede before chart/bullets/factors. */
  body?: string;
  /** Wall-clock timestamp shown muted next to the message ("10:42 AM"). */
  timestamp?: string;
  /** Bullets render with a small purple dot. `lead` is optional emphasized prefix;
   *  if empty, the bullet renders as a single flat sentence (the 2026-05-15 ref shape). */
  bullets?: { lead: string; rest: string }[];
  chart?: ChatChart;
  /** Sub-card with weighted contributing factors + "View details" link. */
  factors?: ChatFactorsCard;
  /** Lower-body paragraph rendered AFTER chart, BEFORE chips. Optional. */
  followUp?: string;
  chips?: ChatActionChip[];
  running?: ChatRunningCard;
}

export interface ChatThread {
  id: string;
  /** Title shown in the history list + active-chat header. */
  title: string;
  /** Project label shown under title (or "All projects" if cross-account). */
  projectLabel: string;
  /** Emoji used as the row avatar in the history list. */
  emoji: string;
  /** Sub-label timestamp shown in the history row ("just now", "2h ago"). */
  relativeTime: string;
  /** Model badge in active-chat header. */
  model: string;
  /** Avatar monogram letter for the header (single uppercase char). */
  monogram: string;
  /** Tint background for the monogram square. */
  monogramBg: string;
  /** Marks the thread as "active / live" in the sidebar (purple pulse dot). */
  live?: boolean;
  /** Full message log; empty arrays render an empty thread shell. */
  messages: ChatMessage[];
}

// ─── Detailed thread that matches the screenshots ─────────────────────────

const SMITH_LAW_THREAD: ChatThread = {
  id: 'smith-law-cpa-spike',
  title: "Why did Smith Law's CPA spike?",
  projectLabel: 'Smith Law Group',
  emoji: '📊',
  relativeTime: 'yesterday',
  model: 'Haiku 4.5',
  monogram: 'S',
  monogramBg: '#1a1625',
  messages: [
    {
      id: 'm1',
      role: 'user',
      body: "Why did Smith Law's CPA spike yesterday?",
      timestamp: '10:42 AM',
    },
    {
      id: 'm2',
      role: 'assistant',
      body: "Smith Law's CPA jumped from **$143 to $217** yesterday. Here are the three biggest drivers.",
      timestamp: '10:42 AM',
      chart: {
        kind: 'bars',
        label: 'CPA · Last 14 days',
        delta: '+52% on May 13',
        axisLeft: 'APR 30',
        axisRight: 'MAY 13',
        bars: [
          { value: 40 }, { value: 42 }, { value: 38 }, { value: 41 },
          { value: 39 }, { value: 43 }, { value: 40 }, { value: 42 },
          { value: 38 }, { value: 41 }, { value: 44 }, { value: 42 },
          { value: 45 }, { value: 95, spike: true },
        ],
      },
      bullets: [
        { lead: 'Auction pressure', rest: 'increased 12% WoW across top terms.' },
        { lead: 'Time-of-day shift:', rest: '38% of spend ran 11pm–5am vs 14% typical.' },
        { lead: '', rest: "A lead form variant launched Sunday hasn't fired any conversions." },
      ],
      factors: {
        title: 'Top contributing factors',
        rows: [
          { label: 'Auction pressure',     value: '+12%' },
          { label: 'Time-of-day shift',    value: '+24%' },
          { label: 'Conversion gap (form)', value: '—', tone: 'muted' },
        ],
        linkLabel: 'View details',
        linkHref: '/reports/run-deep-audit-001',
      },
      chips: [
        { emoji: '🔍', icon: 'magnifying-glass', label: 'Check form tracking' },
        { emoji: '📊', icon: 'chart-bar',        label: 'Full account audit' },
        { emoji: '🗓️', icon: 'calendar',         label: 'Schedule a daily check' },
      ],
    },
    {
      id: 'm3',
      role: 'user',
      body: 'Yeah, check the form tracking',
      timestamp: '10:44 AM',
    },
    {
      id: 'm4',
      role: 'assistant',
      body: 'On it. Sending Account Audit in to verify the tracking pixel on the new variant.',
      timestamp: '10:44 AM',
      running: {
        agentEmoji: '📊',
        agentName: 'Account Audit',
        description: 'Checking tracking pixels across all Smith Law campaigns',
        stageCurrent: 2,
        stageTotal: 4,
        stageDescription: 'Validating GA4 conversion imports',
        elapsed: '~12s elapsed',
        progressPct: 35,
      },
    },
  ],
};

// ─── Stub threads that fill the history list ──────────────────────────────

export const CHAT_HISTORY: ChatThread[] = [
  {
    id: 'hims-vs-boulder',
    title: 'Compare hims to Boulder Care offer',
    projectLabel: 'Boulder Care',
    emoji: '🕵️',
    relativeTime: 'just now',
    model: 'Sonnet 4.6',
    monogram: 'B',
    monogramBg: '#534AB7',
    live: true,
    messages: [],
  },
  {
    id: 'flock-negatives',
    title: '47 negatives for Flock Events',
    projectLabel: 'Flock Events',
    emoji: '🧹',
    relativeTime: '2h ago',
    model: 'Sonnet 4.6',
    monogram: 'F',
    monogramBg: '#378ADD',
    messages: [],
  },
  SMITH_LAW_THREAD,
  {
    id: 'mason-monthly',
    title: 'Draft monthly report for Mason',
    projectLabel: 'Mason & Co.',
    emoji: '📝',
    relativeTime: '2 days ago',
    model: 'Sonnet 4.6',
    monogram: 'M',
    monogramBg: '#F0997B',
    messages: [],
  },
  {
    id: 'nordic-pmax',
    title: 'Tune PMAX for Nordic Outdoor',
    projectLabel: 'Nordic Outdoor',
    emoji: '🎯',
    relativeTime: '3 days ago',
    model: 'Sonnet 4.6',
    monogram: 'N',
    monogramBg: '#5DCAA5',
    messages: [],
  },
  {
    id: 'rocket-pet-leak',
    title: 'Spend leak on Rocket Pet',
    projectLabel: 'Rocket Pet Insurance',
    emoji: '💧',
    relativeTime: 'last week',
    model: 'Sonnet 4.6',
    monogram: 'R',
    monogramBg: '#E24B4A',
    messages: [],
  },
  {
    id: 'lemon-leaf-shopping',
    title: 'Shopping feed health for Lemon Leaf',
    projectLabel: 'Lemon Leaf Mattress',
    emoji: '🛒',
    relativeTime: 'last week',
    model: 'Sonnet 4.6',
    monogram: 'L',
    monogramBg: '#BA7517',
    messages: [],
  },
];

// Convenience finder used by the active-chat route.
export function findChatThread(id: string | undefined): ChatThread | undefined {
  if (!id) return undefined;
  return CHAT_HISTORY.find((t) => t.id === id);
}

// Starter prompts shown in the pre-chat hero ("Try one of these").
export interface StarterPrompt {
  icon: 'lightning' | 'coins' | 'trend' | 'pulse';
  label: string;
}
export const STARTER_PROMPTS: StarterPrompt[] = [
  { icon: 'lightning', label: 'What broke in my accounts overnight?' },
  { icon: 'coins',     label: "Where's spend leaking right now?" },
  { icon: 'trend',     label: 'Which campaigns are ready to scale?' },
  { icon: 'pulse',     label: "Why did Smith Law's CPA spike yesterday?" },
];

// Specialist chips shown below the input ("Or send a specialist in").
export interface SpecialistChip {
  slug: string;
  emoji: string;
  label: string;
}
export const SPECIALIST_CHIPS: SpecialistChip[] = [
  { slug: 'competitor-spy',     emoji: '🕵️',  label: 'Competitor Spy' },
  { slug: 'negative-keyword',   emoji: '🧹',  label: 'Negative Keywords' },
  { slug: 'deep-account-audit', emoji: '📊',  label: 'Account Audit' },
  { slug: 'pmax',               emoji: '🎯',  label: 'PMAX Advisor' },
];
