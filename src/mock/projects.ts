import type { Project, GoogleAdsAccount } from '../types/agent';

// Mock agency-team setup: 6 client projects, 11 Google Ads accounts total.
// Realistic for a mid-size agency — gives the project switcher something
// to chew on without overloading the screen.
export const PROJECTS: Project[] = [
  { id: 'smith-law',       name: 'Smith Law Group',          industry: 'Personal Injury Law', accountCount: 2 },
  { id: 'clear-skies',     name: 'Clear Skies HVAC',         industry: 'Home Services',       accountCount: 1 },
  { id: 'northstar',       name: 'Northstar Dental',         industry: 'Dental',              accountCount: 3 },
  { id: 'lemon-leaf',      name: 'Lemon Leaf Mattress',      industry: 'D2C Sleep',           accountCount: 2 },
  { id: 'rocket-pet',      name: 'Rocket Pet Insurance',     industry: 'Pet Insurance',       accountCount: 2 },
  { id: 'ironclad',        name: 'Ironclad Roofing',         industry: 'Home Services',       accountCount: 1 },
];

export const ACCOUNTS: GoogleAdsAccount[] = [
  { id: 'a1',  customerId: '124-893-7251', name: 'Smith Law — Brand',     projectId: 'smith-law',   health: 'good' },
  { id: 'a2',  customerId: '385-401-9248', name: 'Smith Law — Non-brand', projectId: 'smith-law',   health: 'attention' },
  { id: 'a3',  customerId: '512-887-3361', name: 'Clear Skies HVAC',      projectId: 'clear-skies', health: 'warning' },
  { id: 'a4',  customerId: '209-664-8810', name: 'Northstar Dental — National', projectId: 'northstar', health: 'good' },
  { id: 'a5',  customerId: '901-225-7438', name: 'Northstar Dental — Local',    projectId: 'northstar', health: 'good' },
  { id: 'a6',  customerId: '774-129-3056', name: 'Northstar Dental — Implants', projectId: 'northstar', health: 'warning' },
  { id: 'a7',  customerId: '623-980-1119', name: 'Lemon Leaf — Search',  projectId: 'lemon-leaf', health: 'good' },
  { id: 'a8',  customerId: '116-743-2008', name: 'Lemon Leaf — Shopping',projectId: 'lemon-leaf', health: 'good' },
  { id: 'a9',  customerId: '550-204-8843', name: 'Rocket Pet — US',      projectId: 'rocket-pet', health: 'attention' },
  { id: 'a10', customerId: '887-301-9027', name: 'Rocket Pet — CA',      projectId: 'rocket-pet', health: 'good' },
  { id: 'a11', customerId: '412-688-3349', name: 'Ironclad Roofing',     projectId: 'ironclad',   health: 'good' },
];

export const CURRENT_PROJECT_ID = 'smith-law';
