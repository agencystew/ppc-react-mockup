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
  label: string;
  variant?: 'default' | 'schedule';
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
  /** Plain-text body. For assistant messages, body is the lede before bullets/chart. */
  body?: string;
  bullets?: { lead: string; rest: string }[];
  chart?: ChatChart;
  /** Lower-body paragraph rendered AFTER chart, BEFORE chips. */
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
    },
    {
      id: 'm2',
      role: 'assistant',
      body: "Smith Law's CPA jumped from **$143 to $217** yesterday. I pulled the last 14 days. Three things shifted at once:",
      bullets: [
        {
          lead: 'Auction pressure.',
          rest: 'Smith & Associates bumped bids on your top 5 terms. Their impression share is up 12% week-over-week.',
        },
        {
          lead: 'Time-of-day drift.',
          rest: "38% of yesterday's spend ran between 11pm–5am, vs your typical 14%.",
        },
        {
          lead: 'Conversion gap.',
          rest: "A lead-form variant launched Sunday hasn't fired any conversions. Could be tracking, could be the form itself.",
        },
      ],
      chart: {
        kind: 'bars',
        label: 'CPA · last 14 days',
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
      followUp:
        "My money's on the lead-form. The tracking pixel probably isn't firing on the new variant, which means real conversions are happening but Google Ads can't see them. Want me to verify?",
      chips: [
        { emoji: '🔍', label: 'Check form tracking' },
        { emoji: '📊', label: 'Full account audit' },
        { emoji: '🕵️', label: 'Look into Smith & Associates' },
        { emoji: '🗓️', label: 'Schedule a daily check', variant: 'schedule' },
      ],
    },
    {
      id: 'm3',
      role: 'user',
      body: 'Yeah, check the form tracking',
    },
    {
      id: 'm4',
      role: 'assistant',
      body: 'On it. Sending Account Audit in to verify the tracking pixel on the new variant.',
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
