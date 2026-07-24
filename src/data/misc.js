// ============================================================
// Cross-cutting data — notifications, activity feed, calendar,
// and dashboard analytics series.
// ============================================================
import { PROJECTS } from './projects';
import { LIFECYCLE } from './masters';
import { TEAM } from './team';

export const NOTIFICATIONS = [
  { id: 1, type: 'approval', title: 'UAT sign-off requested', desc: 'City Care Hospital — Billing & Revenue module UAT ready for sign-off.', time: '12 min ago', unread: true },
  { id: 2, type: 'alert', title: 'Project at risk', desc: 'Sunrise Medicity — development blocked on OT-EMR integration spec.', time: '40 min ago', unread: true },
  { id: 3, type: 'task', title: 'Master data overdue', desc: 'Lifeline Multispeciality — Insurance/TPA master awaited for 9 days.', time: '2 hrs ago', unread: true },
  { id: 4, type: 'system', title: 'Go-Live scheduled', desc: 'Gulf Medical Center — final go-live confirmed for 10 Aug 2026.', time: '5 hrs ago', unread: false },
  { id: 5, type: 'info', title: 'New change request', desc: 'Al Noor Specialist — SFDA compliance CR raised (₹1.5L).', time: 'Yesterday', unread: false },
  { id: 6, type: 'approval', title: 'Kick-off MOM signed', desc: 'MetroDiagnostics Labs — kick-off minutes signed by client.', time: 'Yesterday', unread: false },
];

export const ACTIVITY_FEED = [
  { id: 1, who: 'Neha Patel', action: 'signed off SRS for', target: 'OPD — City Care Hospital', time: '18 min ago', color: 'var(--success)' },
  { id: 2, who: 'Sana Qureshi', action: 'deployed feature', target: 'Package billing engine — Gulf Medical', time: '1 hr ago', color: 'var(--primary)' },
  { id: 3, who: 'Priya Nair', action: 'flagged a risk on', target: 'Sunrise Medicity (Technical)', time: '2 hrs ago', color: 'var(--danger)' },
  { id: 4, who: 'Ananya Iyer', action: 'completed training for', target: 'Pharmacy — Apollo Care', time: '3 hrs ago', color: 'var(--pending)' },
  { id: 5, who: 'Karthik Rao', action: 'imported master data', target: 'Doctors (312 records) — Nairobi County', time: '5 hrs ago', color: 'var(--info)' },
  { id: 6, who: 'Rahul Sharma', action: 'created change request', target: 'Al Noor Specialist — SFDA compliance', time: 'Yesterday', color: 'var(--warning)' },
  { id: 7, who: 'Daniel Joseph', action: 'closed 4 bugs on', target: 'City Care Hospital — UAT', time: 'Yesterday', color: 'var(--success)' },
];

// upcoming meetings + go-lives for the dashboard calendar
export const UPCOMING = [
  { id: 1, kind: 'meeting', title: 'Weekly steering — Sunrise Medicity', date: '2026-07-25', time: '11:00', tint: 'blue' },
  { id: 2, kind: 'uat', title: 'UAT walkthrough — City Care Billing', date: '2026-07-26', time: '15:00', tint: 'lavender' },
  { id: 3, kind: 'golive', title: 'Go-Live — Gulf Medical Center', date: '2026-08-10', time: '06:00', tint: 'green' },
  { id: 4, kind: 'training', title: 'Nursing training — Apollo Care', date: '2026-07-28', time: '10:00', tint: 'pink' },
  { id: 5, kind: 'golive', title: 'Go-Live — City Care Hospital', date: '2026-08-25', time: '06:00', tint: 'green' },
  { id: 6, kind: 'meeting', title: 'Kick-off — Dhaka General Phase 1', date: '2026-07-30', time: '12:30', tint: 'cyan' },
];

// ---- Dashboard analytics ----
export const PROJECT_TREND = [
  { label: 'Feb', started: 2, golive: 1 }, { label: 'Mar', started: 3, golive: 0 },
  { label: 'Apr', started: 2, golive: 1 }, { label: 'May', started: 4, golive: 2 },
  { label: 'Jun', started: 3, golive: 1 }, { label: 'Jul', started: 2, golive: 2 },
];

export const REVENUE_TREND = [
  { label: 'Feb', billed: 3.2, collected: 2.8 }, { label: 'Mar', billed: 4.1, collected: 3.6 },
  { label: 'Apr', billed: 3.8, collected: 3.9 }, { label: 'May', billed: 5.2, collected: 4.4 },
  { label: 'Jun', billed: 4.6, collected: 4.8 }, { label: 'Jul', billed: 5.9, collected: 5.1 },
];

// phase distribution across active projects
export const PHASE_DISTRIBUTION = (() => {
  const groups = { Discovery: ['lead', 'registration', 'po', 'scope', 'kickoff'], 'Analysis': ['srs', 'gap', 'masterdata'], Build: ['development', 'configuration', 'testing'], Validation: ['deployment', 'uat', 'training'], 'Go-Live': ['migration', 'parallel', 'golive', 'support', 'closure'] };
  return Object.entries(groups).map(([label, keys]) => ({ label, value: PROJECTS.filter((p) => keys.includes(p.currentStage)).length }));
})();

export const HEALTH_MIX = [
  { label: 'On Track', value: PROJECTS.filter((p) => p.health === 'On Track').length, color: 'var(--success)' },
  { label: 'At Risk', value: PROJECTS.filter((p) => p.health === 'At Risk').length, color: 'var(--warning)' },
  { label: 'Delayed', value: PROJECTS.filter((p) => p.health === 'Delayed').length, color: 'var(--danger)' },
];

export const CATEGORY_MIX = [
  { label: 'Enterprise', value: PROJECTS.filter((p) => p.category === 'Enterprise').length },
  { label: 'Mid-Market', value: PROJECTS.filter((p) => p.category === 'Mid-Market').length },
  { label: 'SMB', value: PROJECTS.filter((p) => p.category === 'SMB').length },
  { label: 'Government', value: PROJECTS.filter((p) => p.category === 'Government').length },
];

// consultant workload for the dashboard
export const WORKLOAD = TEAM.filter((t) => ['pm', 'fc', 'tc', 'im', 'dev'].includes(t.roleId)).map((t) => ({ label: t.name.split(' ')[0], value: t.util }));

export const STAGE_FUNNEL = LIFECYCLE.filter((_, i) => i % 2 === 0).map((s) => ({ stage: s.label.split(' ')[0], count: PROJECTS.filter((p) => p.milestones.find((m) => m.key === s.key)?.status !== 'Pending').length }));
