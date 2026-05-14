import type { Project, GoogleAdsAccount } from '../types/agent';

// Mock agency-team setup: 8 client projects across 11 Google Ads accounts.
// Roster mirrors the /projects mockup — names, order, and industries here
// are the single source of truth for the sidebar, dashboard, and the table.
export const PROJECTS: Project[] = [
  { id: 'boulder-care',       name: 'Boulder Care',         industry: 'Addiction Recovery', accountCount: 2 },
  { id: 'the-hoth',           name: 'The HOTH',             industry: 'SEO Software',       accountCount: 1 },
  { id: 'durable',            name: 'Durable',              industry: 'AI Website Builder', accountCount: 2 },
  { id: 'linkbuilder',        name: 'LinkBuilder.io',       industry: 'SEO Tool',           accountCount: 1 },
  { id: 'livingyoung',        name: 'LivingYoung Center',   industry: 'Med Spa',            accountCount: 1 },
  { id: 'authority-builders', name: 'Authority Builders',   industry: 'Link Building',      accountCount: 1 },
  { id: 'edwin-novel',        name: 'Edwin Novel Jewelry',  industry: 'D2C Jewelry',        accountCount: 1 },
  { id: 'flock',              name: 'Flock',                industry: 'Travel SaaS',        accountCount: 2 },
];

export const ACCOUNTS: GoogleAdsAccount[] = [
  { id: 'a1',  customerId: '124-893-7251', name: 'Boulder Care — Brand',         projectId: 'boulder-care',       health: 'good' },
  { id: 'a2',  customerId: '385-401-9248', name: 'Boulder Care — Non-brand',     projectId: 'boulder-care',       health: 'attention' },
  { id: 'a3',  customerId: '512-887-3361', name: 'The HOTH',                     projectId: 'the-hoth',           health: 'attention' },
  { id: 'a4',  customerId: '209-664-8810', name: 'Durable — National',           projectId: 'durable',            health: 'good' },
  { id: 'a5',  customerId: '901-225-7438', name: 'Durable — SMB',                projectId: 'durable',            health: 'warning' },
  { id: 'a6',  customerId: '774-129-3056', name: 'LinkBuilder.io',               projectId: 'linkbuilder',        health: 'warning' },
  { id: 'a7',  customerId: '623-980-1119', name: 'LivingYoung Center',           projectId: 'livingyoung',        health: 'warning' },
  { id: 'a8',  customerId: '116-743-2008', name: 'Authority Builders',           projectId: 'authority-builders', health: 'good' },
  { id: 'a9',  customerId: '550-204-8843', name: 'Edwin Novel Jewelry',          projectId: 'edwin-novel',        health: 'good' },
  { id: 'a10', customerId: '887-301-9027', name: 'Flock — Edinburgh',            projectId: 'flock',              health: 'good' },
  { id: 'a11', customerId: '412-688-3349', name: 'Flock — London',               projectId: 'flock',              health: 'good' },
];

export const CURRENT_PROJECT_ID = 'boulder-care';
