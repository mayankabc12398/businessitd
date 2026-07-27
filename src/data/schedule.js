// ============================================================
// Project Activity Schedule — implementation plan (phase-wise) as
// captured in the client onboarding tracker. Mirrors the Excel sheet:
// activity · phase · clinic · status · onsite/offsite · days · planned &
// actual start/end dates. Dates stored ISO (YYYY-MM-DD) for filtering.
// ============================================================

const MENGO = 'MENGO Hospital';
const MENGO_UNITS = '1. MENGO Hospital [OPD & IPD]';

// raw rows straight from the schedule sheet
const RAW = [
  // ── Phase-1 Modules ──────────────────────────────────────────────────────
  ['Hardware Configuration / Server Setup', '1', MENGO, 'Done', 'Onsite', 1, '2024-06-10', '2024-06-10', '2024-06-10', '2024-06-10', 'Phase-1 Modules'],
  ['Base Hospedia Application configuration & Deployment on UAT Server', '1', MENGO, 'Done', 'Onsite', 2, '2024-06-10', '2024-06-10', '2024-06-10', '2024-06-10', 'Phase-1 Modules'],
  ['Master Data Required from Client', '1', MENGO, 'Pending', 'Onsite', 22, '2024-06-12', '2024-07-03', '2024-06-06', null, 'Phase-1 Modules'],
  ['Master Data import into Hospedia', '1', MENGO, 'Pending', 'Onsite', null, '2024-06-12', '2024-07-03', null, null, 'Phase-1 Modules'],
  ['SRS of Following modules [Phase-1] incl. Signoff', '1', MENGO, 'Pending', 'Onsite', 16, '2024-06-10', '2024-06-25', '2024-06-10', null, 'Phase-1 Modules'],
  ['SRS of Following modules [Phase-2] incl. Signoff', '2', MENGO, 'Pending', 'Onsite', 8, '2024-06-26', '2024-07-03', null, null, 'Phase-1 Modules'],
  ['Development & Configuration of the Hospedia as per the SRS document', '1,2', MENGO, 'Pending', 'Offsite', 26, '2024-06-10', '2024-07-05', null, null, 'Phase-1 Modules'],
  ['Demo of the customized (Based on the SRS) Phase-1 Modules', '1', MENGO, 'Pending', 'Offsite', 22, '2024-07-08', '2024-07-29', null, null, 'Phase-1 Modules'],
  ['Customization of the HIMS based on the feedback received during the Demo', '1', MENGO, 'Pending', 'Offsite', 22, '2024-07-08', '2024-07-29', null, null, 'Phase-1 Modules'],
  ['Training & UAT of the Phase-1 Modules incl. Signoff', '1', MENGO, 'Pending', 'Onsite', 22, '2024-07-08', '2024-07-29', null, null, 'Phase-1 Modules'],
  ['Parallel Run of the Phase-1 Modules', '1', MENGO_UNITS, 'Pending', 'Onsite', 2, '2024-07-09', '2024-07-30', null, null, 'Phase-1 Modules'],
  ['Live Run of the Phase-1 Modules', '1', MENGO_UNITS, 'Pending', 'Onsite', 1, '2024-08-01', '2024-08-01', null, null, 'Phase-1 Modules'],
  ['Post Live Support of Phase-1 Modules', '1', MENGO_UNITS, 'Pending', 'Onsite', 30, '2024-08-02', '2024-08-31', null, null, 'Phase-1 Modules'],
  ['Phase1 Module SignOff', '1', MENGO_UNITS, 'Pending', 'Onsite', null, '2024-08-31', '2024-08-31', null, null, 'Phase-1 Modules'],
  // ── Phase-2 Modules ──────────────────────────────────────────────────────
  ['Training and UAT of Phase-2 modules incl. Signoff', '2', MENGO_UNITS, 'Pending', 'Onsite', 10, '2024-09-01', '2024-09-10', null, null, 'Phase-2 Modules'],
  ['Parallel Run of the Phase-2 Modules', '2', MENGO_UNITS, 'Pending', 'Onsite', 10, '2024-09-02', '2024-09-12', null, null, 'Phase-2 Modules'],
  ['Live Run of the Phase-2 Modules', '2', MENGO_UNITS, 'Pending', 'Onsite', 1, '2024-09-15', '2024-09-15', null, null, 'Phase-2 Modules'],
  ['Post Live Support of Phase-2 modules', '2', MENGO_UNITS, 'Pending', 'Onsite', 15, '2024-09-16', '2024-09-30', null, null, 'Phase-2 Modules'],
  ['Final Project SignOff', '2', MENGO_UNITS, 'Pending', 'Onsite', null, '2024-11-30', '2024-11-30', null, null, 'Phase-2 Modules'],
];

export const ACTIVITY_SCHEDULE = RAW.map((c, i) => ({
  id: `ACT-${String(i + 1).padStart(3, '0')}`,
  activity: c[0],
  phase: c[1],
  clinic: c[2],
  status: c[3],
  mode: c[4],
  days: c[5],
  startDate: c[6],
  endDate: c[7],
  actualStart: c[8],
  actualEnd: c[9],
  group: c[10],
}));

// distinct filter option lists (derived so dropdowns stay in sync with data)
export const SCHEDULE_PHASES = [...new Set(ACTIVITY_SCHEDULE.map((r) => r.phase))];
export const SCHEDULE_CLINICS = [...new Set(ACTIVITY_SCHEDULE.map((r) => r.clinic))];
export const SCHEDULE_STATUSES = [...new Set(ACTIVITY_SCHEDULE.map((r) => r.status))];
export const SCHEDULE_MODES = [...new Set(ACTIVITY_SCHEDULE.map((r) => r.mode))];

export const SCHEDULE_KPIS = {
  total: ACTIVITY_SCHEDULE.length,
  done: ACTIVITY_SCHEDULE.filter((r) => r.status === 'Done').length,
  pending: ACTIVITY_SCHEDULE.filter((r) => r.status === 'Pending').length,
  totalDays: ACTIVITY_SCHEDULE.reduce((s, r) => s + (r.days || 0), 0),
};
