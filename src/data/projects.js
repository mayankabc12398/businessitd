// ============================================================
// Implementation projects — the central entity of the PMO suite.
// Each carries a computed 19-stage milestone plan.
// ============================================================
import { LIFECYCLE, stageIndex } from './masters';

// deterministic date helper: add days to an ISO date
const addDays = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
};

// planned cadence (days) each stage takes — used to lay out the timeline
const STAGE_DAYS = [3, 2, 4, 5, 2, 14, 6, 12, 20, 10, 8, 3, 12, 10, 6, 14, 2, 21, 5];

function buildMilestones(startDate, currentKey, blockedAt) {
  const cur = stageIndex(currentKey);
  let cursor = startDate;
  return LIFECYCLE.map((s, i) => {
    const planStart = cursor;
    const planEnd = addDays(cursor, STAGE_DAYS[i]);
    cursor = addDays(planEnd, 1);
    let status = 'Pending';
    if (i < cur) status = 'Completed';
    else if (i === cur) status = blockedAt === s.key ? 'Blocked' : 'In Progress';
    const actualEnd = i < cur ? addDays(planEnd, i % 3 === 0 ? 1 : i % 4 === 0 ? -1 : 0) : null;
    return {
      key: s.key, label: s.label, tint: s.tint, seq: i + 1,
      planStart, planEnd, actualEnd, status,
      owner: s.key === 'srs' || s.key === 'gap' ? 'FC' : s.key === 'development' || s.key === 'configuration' ? 'TC' : s.key === 'training' ? 'Trainer' : s.key === 'uat' || s.key === 'testing' ? 'QA' : 'PM',
      signoff: i < cur ? (['kickoff', 'scope', 'srs', 'gap', 'masterdata', 'uat', 'training', 'golive', 'closure'].includes(s.key) ? 'Signed' : '—') : 'Pending',
    };
  });
}

const RAW = [
  { code: 'PRJ-2025-014', name: 'City Care Hospital — HIMS Implementation', clientId: 'CL-001', category: 'Enterprise', implType: 'New Implementation', priority: 'High', status: 'UAT', contractValue: 9800000, poNumber: 'PO-CC-88213', poDate: '2025-11-05', startDate: '2025-11-10', targetGoLive: '2026-08-25', pm: 'U-01', fc: 'U-02', tc: 'U-05', engineer: 'U-06', support: 'U-09', salesPerson: 'U-12', currentStage: 'uat', health: 'On Track', riskLevel: 'Medium', users: 320, modules: ['M-OPD', 'M-IPD', 'M-EMR', 'M-PHARM', 'M-LAB', 'M-RAD', 'M-BILL', 'M-INS'], interfaces: ['HL7 ADT', 'ABDM / ABHA', 'Payment Gateway', 'SMS Gateway'], remarks: 'Flagship enterprise rollout across 3 branches. UAT in progress, targeting go-live end Aug.' },
  { code: 'PRJ-2025-009', name: 'Sunrise Medicity — Full Suite', clientId: 'CL-002', category: 'Enterprise', implType: 'New Implementation', priority: 'Critical', status: 'In Progress', contractValue: 14500000, poNumber: 'PO-SR-40021', poDate: '2025-09-18', startDate: '2025-09-20', targetGoLive: '2026-09-15', pm: 'U-04', fc: 'U-03', tc: 'U-11', engineer: 'U-06', support: 'U-09', salesPerson: 'U-12', currentStage: 'development', blockedAt: 'development', health: 'At Risk', riskLevel: 'High', users: 540, modules: ['M-OPD', 'M-IPD', 'M-EMR', 'M-PHARM', 'M-LAB', 'M-RAD', 'M-OT', 'M-BB', 'M-INS', 'M-HR', 'M-ACC'], interfaces: ['HL7 ADT', 'HL7 ORU (Lab)', 'DICOM Modality Worklist', 'Insurance TPA API'], remarks: 'Largest deal. Development blocked on OT-EMR integration spec; escalated to PMO.' },
  { code: 'PRJ-2026-002', name: 'Gulf Medical Center — Clinical + Billing', clientId: 'CL-003', category: 'Enterprise', implType: 'New Implementation', priority: 'High', status: 'Training', contractValue: 7200000, poNumber: 'PO-GMC-5567', poDate: '2026-01-22', startDate: '2026-01-25', targetGoLive: '2026-08-10', pm: 'U-01', fc: 'U-10', tc: 'U-05', engineer: 'U-06', support: 'U-09', salesPerson: 'U-12', currentStage: 'training', health: 'On Track', riskLevel: 'Low', users: 260, modules: ['M-OPD', 'M-IPD', 'M-EMR', 'M-LAB', 'M-BILL', 'M-INS', 'M-APP'], interfaces: ['HL7 ADT', 'Payment Gateway', 'WhatsApp Business'], remarks: 'Bilingual (EN/AR) deployment. Training underway across departments.' },
  { code: 'PRJ-2025-006', name: 'Lifeline Multispeciality — Migration', clientId: 'CL-004', category: 'Mid-Market', implType: 'Migration', priority: 'High', status: 'On Hold', contractValue: 5400000, poNumber: 'PO-LL-33110', poDate: '2025-07-10', startDate: '2025-07-12', targetGoLive: '2026-07-30', pm: 'U-04', fc: 'U-02', tc: 'U-11', engineer: 'U-06', support: 'U-09', salesPerson: 'U-12', currentStage: 'masterdata', blockedAt: 'masterdata', health: 'Delayed', riskLevel: 'Critical', users: 210, modules: ['M-OPD', 'M-IPD', 'M-PHARM', 'M-BILL', 'M-INV', 'M-ACC'], interfaces: ['HL7 ADT', 'Biometric Devices'], remarks: 'On hold — legacy data extraction pending from incumbent vendor. Master data 40% received.' },
  { code: 'PRJ-2026-004', name: 'Nairobi County Hospital — Core HIMS', clientId: 'CL-005', category: 'Government', implType: 'New Implementation', priority: 'Medium', status: 'In Progress', contractValue: 6100000, poNumber: 'PO-NCH-2026-11', poDate: '2026-02-13', startDate: '2026-02-15', targetGoLive: '2026-10-20', pm: 'U-01', fc: 'U-10', tc: 'U-05', engineer: 'U-06', support: 'U-09', salesPerson: 'U-12', currentStage: 'srs', health: 'On Track', riskLevel: 'Medium', users: 300, modules: ['M-OPD', 'M-IPD', 'M-PHARM', 'M-LAB', 'M-BILL', 'M-INV'], interfaces: ['HL7 ADT', 'SMS Gateway'], remarks: 'Government tender. Department-wise SRS in progress; strong client engagement.' },
  { code: 'PRJ-2026-007', name: 'Apollo Care Clinics — Multi-branch OPD', clientId: 'CL-006', category: 'Mid-Market', implType: 'New Implementation', priority: 'Medium', status: 'In Progress', contractValue: 3200000, poNumber: 'PO-ACC-77001', poDate: '2026-04-01', startDate: '2026-04-03', targetGoLive: '2026-09-05', pm: 'U-04', fc: 'U-03', tc: 'U-11', engineer: 'U-06', support: 'U-09', salesPerson: 'U-12', currentStage: 'configuration', health: 'On Track', riskLevel: 'Low', users: 120, modules: ['M-OPD', 'M-EMR', 'M-PHARM', 'M-BILL', 'M-APP', 'M-QMS'], interfaces: ['Payment Gateway', 'WhatsApp Business', 'SMS Gateway'], remarks: 'Centralised config for 8 clinics. Configuration nearing completion.' },
  { code: 'PRJ-2025-012', name: 'Al Noor Specialist — Enterprise HIMS', clientId: 'CL-007', category: 'Enterprise', implType: 'New Implementation', priority: 'Critical', status: 'In Progress', contractValue: 11200000, poNumber: 'PO-AN-990021', poDate: '2025-12-08', startDate: '2025-12-10', targetGoLive: '2026-09-28', pm: 'U-01', fc: 'U-02', tc: 'U-05', engineer: 'U-06', support: 'U-09', salesPerson: 'U-12', currentStage: 'testing', health: 'At Risk', riskLevel: 'High', users: 410, modules: ['M-OPD', 'M-IPD', 'M-EMR', 'M-PHARM', 'M-LAB', 'M-RAD', 'M-OT', 'M-INS', 'M-ACC'], interfaces: ['HL7 ADT', 'HL7 ORU (Lab)', 'DICOM Modality Worklist', 'Insurance TPA API'], remarks: 'SFDA compliance requirements added mid-cycle; internal testing running behind by ~1 week.' },
  { code: 'PRJ-2026-009', name: 'Grace Mission — Essential HIMS', clientId: 'CL-008', category: 'SMB', implType: 'New Implementation', priority: 'Low', status: 'In Progress', contractValue: 1900000, poNumber: 'PO-GM-4412', poDate: '2026-04-20', startDate: '2026-04-22', targetGoLive: '2026-09-30', pm: 'U-04', fc: 'U-10', tc: 'U-11', engineer: 'U-06', support: 'U-09', salesPerson: 'U-12', currentStage: 'gap', health: 'On Track', riskLevel: 'Low', users: 90, modules: ['M-OPD', 'M-IPD', 'M-PHARM', 'M-BILL'], interfaces: ['SMS Gateway'], remarks: 'Charitable trust, budget-sensitive. Gap analysis & CR sign-off in progress.' },
  { code: 'PRJ-2026-011', name: 'MetroDiagnostics — LIS Rollout', clientId: 'CL-009', category: 'Mid-Market', implType: 'Add-on Module', priority: 'Medium', status: 'In Progress', contractValue: 2600000, poNumber: 'PO-MD-55120', poDate: '2026-05-24', startDate: '2026-05-26', targetGoLive: '2026-10-15', pm: 'U-01', fc: 'U-03', tc: 'U-05', engineer: 'U-06', support: 'U-09', salesPerson: 'U-12', currentStage: 'kickoff', health: 'On Track', riskLevel: 'Low', users: 140, modules: ['M-LAB', 'M-BILL', 'M-INV', 'M-APP'], interfaces: ['Analyzer Interface', 'Payment Gateway', 'SMS Gateway'], remarks: '12-lab chain. LIS + analyzer interfaces. Kick-off completed, SRS scheduling next.' },
  { code: 'PRJ-2026-013', name: 'Dhaka General — HIMS Phase 1', clientId: 'CL-010', category: 'Mid-Market', implType: 'New Implementation', priority: 'Medium', status: 'Planning', contractValue: 4300000, poNumber: 'PO-DG-2026-07', poDate: '2026-06-11', startDate: '2026-06-14', targetGoLive: '2026-12-05', pm: 'U-04', fc: 'U-02', tc: 'U-11', engineer: 'U-06', support: 'U-09', salesPerson: 'U-12', currentStage: 'scope', health: 'On Track', riskLevel: 'Medium', users: 280, modules: ['M-OPD', 'M-IPD', 'M-PHARM', 'M-LAB', 'M-BILL'], interfaces: ['HL7 ADT', 'SMS Gateway'], remarks: 'Phase 1 of 3. Scope confirmation ongoing; PO received.' },
  { code: 'PRJ-2024-021', name: 'City Care Hospital — Blood Bank Add-on', clientId: 'CL-001', category: 'Enterprise', implType: 'Add-on Module', priority: 'Low', status: 'Completed', contractValue: 800000, poNumber: 'PO-CC-71190', poDate: '2024-10-02', startDate: '2024-10-05', targetGoLive: '2025-01-15', actualCompletion: '2025-01-12', pm: 'U-01', fc: 'U-02', tc: 'U-05', engineer: 'U-06', support: 'U-09', salesPerson: 'U-12', currentStage: 'closure', health: 'On Track', riskLevel: 'Low', users: 40, modules: ['M-BB'], interfaces: ['HL7 ADT'], remarks: 'Delivered and closed. Reference site for blood-bank module.' },
  { code: 'PRJ-2024-018', name: 'Sunrise Medicity — Pharmacy Upgrade', clientId: 'CL-002', category: 'Enterprise', implType: 'Upgrade', priority: 'Low', status: 'Completed', contractValue: 650000, poNumber: 'PO-SR-30014', poDate: '2024-08-15', startDate: '2024-08-20', targetGoLive: '2024-11-30', actualCompletion: '2024-12-04', pm: 'U-04', fc: 'U-03', tc: 'U-11', engineer: 'U-06', support: 'U-09', salesPerson: 'U-12', currentStage: 'closure', health: 'Delayed', riskLevel: 'Low', users: 55, modules: ['M-PHARM', 'M-INV'], interfaces: [], remarks: 'Completed 4 days late due to data cleanup. Closed with client sign-off.' },
];

// stage → % progress lookup
const STAGE_PROGRESS = LIFECYCLE.reduce((acc, s, i) => { acc[s.key] = Math.round(((i + 0.5) / LIFECYCLE.length) * 100); return acc; }, {});

export const PROJECTS = RAW.map((p) => {
  const milestones = buildMilestones(p.startDate, p.currentStage, p.blockedAt);
  const progress = p.status === 'Completed' ? 100 : STAGE_PROGRESS[p.currentStage];
  const done = milestones.filter((m) => m.status === 'Completed').length;
  return {
    ...p,
    progress,
    milestones,
    milestonesDone: done,
    milestonesTotal: milestones.length,
    expectedCompletion: p.targetGoLive,
    openIssues: p.health === 'At Risk' ? 6 : p.health === 'Delayed' ? 9 : p.status === 'Completed' ? 0 : 3,
    pendingSignoffs: p.status === 'Completed' ? 0 : Math.max(0, milestones.filter((m) => m.signoff === 'Pending' && ['kickoff', 'scope', 'srs', 'gap', 'masterdata', 'uat', 'training', 'golive'].includes(m.key)).length - 3),
  };
});

export const findProject = (id) => PROJECTS.find((p) => p.code === id);

// KPI rollups for the dashboard
export const PROJECT_KPIS = {
  total: PROJECTS.length,
  inProgress: PROJECTS.filter((p) => ['In Progress', 'UAT', 'Training'].includes(p.status)).length,
  uat: PROJECTS.filter((p) => p.status === 'UAT').length,
  readyGoLive: PROJECTS.filter((p) => p.currentStage === 'parallel' || p.currentStage === 'golive').length,
  completed: PROJECTS.filter((p) => p.status === 'Completed').length,
  onHold: PROJECTS.filter((p) => p.status === 'On Hold').length,
  atRisk: PROJECTS.filter((p) => p.health === 'At Risk' || p.health === 'Delayed').length,
  contractValue: PROJECTS.reduce((s, p) => s + p.contractValue, 0),
  openIssues: PROJECTS.reduce((s, p) => s + p.openIssues, 0),
  pendingSignoffs: PROJECTS.reduce((s, p) => s + p.pendingSignoffs, 0),
};
