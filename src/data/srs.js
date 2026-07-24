// ============================================================
// SRS Planning (department-wise schedule) + Requirement / Gap / CR register.
// ============================================================
import { makeRand, pad, isoDate } from './_seed';
import { PROJECTS } from './projects';
import { HOSPITAL_DEPTS } from './masters';

const CONSULTANTS = ['Neha Patel', 'Amit Verma', 'Meera Krishnan'];
const activeCodes = PROJECTS.filter((p) => !['Completed'].includes(p.status)).map((p) => p.code);

// ---- Department-wise SRS schedule ----
export const SRS_SCHEDULE = (() => {
  const r = makeRand(710021);
  const rows = [];
  let n = 1;
  activeCodes.forEach((code) => {
    const proj = PROJECTS.find((p) => p.code === code);
    const deptCount = r.int(5, 8);
    const depts = [...HOSPITAL_DEPTS].sort(() => r.next() - 0.5).slice(0, deptCount);
    depts.forEach((dept, di) => {
      const day = r.int(1, 27);
      const planned = isoDate(2026, r.int(1, 7), day);
      const done = di < deptCount - 2;
      const status = done ? (r.chance(0.6) ? 'Signed Off' : 'Completed') : di === deptCount - 2 ? 'In Progress' : 'Scheduled';
      rows.push({
        id: `SRS-${pad(n++)}`, projectCode: code, projectName: proj.name.split(' — ')[0], dept,
        consultant: r.pick(CONSULTANTS), planned, actual: done ? planned : null, status,
        requirements: r.int(8, 34), gaps: done ? r.int(0, 5) : r.int(0, 2), crs: done ? r.int(0, 3) : 0,
        signoff: status === 'Signed Off' ? 'Signed' : done ? 'Pending' : '—',
      });
    });
  });
  return rows;
})();

// ---- Requirement / Gap / Change-request register ----
const REQ_TITLES = [
  'Auto-generate MRN with branch prefix', 'Consultant-wise OPD slot templates', 'Discharge summary auto-compile from EMR',
  'Package billing with tariff versioning', 'Insurance pre-auth workflow', 'Barcode-based sample collection',
  'Critical value callback log (LIS)', 'DICOM worklist push on order', 'Ward transfer with bed reallocation',
  'Pharmacy near-expiry FEFO picking', 'GST + VAT dual-tax billing', 'ABHA linkage at registration',
  'Nursing e-MAR medication chart', 'OT scheduling with anaesthetist availability', 'TPA claim reconciliation report',
  'Multi-currency receipt printing', 'Daily census & occupancy dashboard', 'Recurring lab test panels',
];
const PRIORITY = ['Critical', 'High', 'Medium', 'Low'];

export const REQUIREMENTS = (() => {
  const r = makeRand(920045);
  const rows = [];
  let n = 1;
  activeCodes.slice(0, 8).forEach((code) => {
    const proj = PROJECTS.find((p) => p.code === code);
    const cnt = r.int(5, 9);
    for (let i = 0; i < cnt; i++) {
      const type = r.chance(0.55) ? 'Standard' : r.chance(0.5) ? 'Gap' : 'Change Request';
      const status = type === 'Standard' ? (r.chance(0.7) ? 'Approved' : 'In Discussion') : type === 'Gap' ? r.pick(['Gap Identified', 'CR Raised', 'Approved']) : r.pick(['CR Raised', 'Approved', 'In Discussion']);
      rows.push({
        id: `REQ-${pad(n++)}`, projectCode: code, projectName: proj.name.split(' — ')[0],
        title: r.pick(REQ_TITLES), dept: r.pick(HOSPITAL_DEPTS), type,
        priority: r.pick(PRIORITY), status, effortDays: type === 'Standard' ? 0 : r.int(1, 12),
        raisedBy: r.pick(CONSULTANTS), approvedBy: status === 'Approved' ? 'Client SPOC' : '—',
        signoffDate: status === 'Approved' ? isoDate(2026, r.int(1, 7), r.int(1, 27)) : null,
        crValue: type === 'Change Request' ? r.int(1, 8) * 25000 : 0,
      });
    }
  });
  return rows;
})();

export const SRS_KPIS = {
  scheduled: SRS_SCHEDULE.length,
  completed: SRS_SCHEDULE.filter((s) => s.status === 'Completed' || s.status === 'Signed Off').length,
  signed: SRS_SCHEDULE.filter((s) => s.signoff === 'Signed').length,
  gaps: REQUIREMENTS.filter((r) => r.type === 'Gap').length,
  crs: REQUIREMENTS.filter((r) => r.type === 'Change Request').length,
  crValue: REQUIREMENTS.reduce((s, r) => s + r.crValue, 0),
};
