// ============================================================
// Governance — Issues, Risk Register, Sign-offs, Document Repository.
// ============================================================
import { makeRand, pad, isoDate } from './_seed';
import { PROJECTS } from './projects';
import { HIMS_MODULES, ISSUE_TYPES, SEVERITIES, RISK_TYPES, SIGNOFF_MILESTONES, DOC_CATEGORIES } from './masters';

const modName = (id) => HIMS_MODULES.find((m) => m.id === id)?.name ?? id;
const activeCodes = PROJECTS.filter((p) => !['Completed'].includes(p.status)).map((p) => p.code);
const OWNERS = ['Rahul Sharma', 'Priya Nair', 'Amit Verma', 'Karthik Rao', 'Sana Qureshi', 'Farhan Shaikh'];

// ---- Issue Tracker ----
const ISSUE_TITLES = [
  'Analyzer interface dropping results intermittently', 'Client SPOC unavailable for SRS sign-off',
  'Tariff master has duplicate service codes', 'Network latency in radiology PACS viewer',
  'Insurance master incomplete from client', 'Print server not configured in ward',
  'Biometric device SDK version mismatch', 'EMR template needs specialty-wise variants',
  'Slow report generation on month-end', 'User provisioning delayed by IT team',
];
export const ISSUES = (() => {
  const r = makeRand(210133);
  const rows = [];
  let n = 1;
  activeCodes.forEach((code) => {
    const proj = PROJECTS.find((p) => p.code === code);
    const cnt = proj.openIssues;
    for (let i = 0; i < cnt; i++) {
      const status = i < cnt - 2 ? r.pick(['Open', 'In Progress', 'On Hold']) : r.pick(['Resolved', 'Closed']);
      const sev = r.pick(SEVERITIES);
      rows.push({
        id: `ISS-${pad(n++)}`, projectCode: code, projectName: proj.name.split(' — ')[0],
        title: r.pick(ISSUE_TITLES), type: r.pick(ISSUE_TYPES), module: modName(r.pick(proj.modules)),
        severity: sev, status, reportedBy: 'Client', assignedTo: r.pick(OWNERS),
        raised: isoDate(2026, r.int(3, 7), r.int(1, 27)),
        due: isoDate(2026, r.int(6, 8), r.int(1, 27)),
        resolved: ['Resolved', 'Closed'].includes(status) ? isoDate(2026, r.int(6, 7), r.int(1, 27)) : null,
        ageDays: r.int(1, 45),
      });
    }
  });
  return rows;
})();

// ---- Risk Register ----
const RISK_TITLES = [
  'Legacy data extraction dependent on incumbent vendor', 'Scope creep from mid-cycle compliance changes',
  'Key consultant allocated across parallel projects', 'Third-party interface API instability',
  'Poor master data quality delaying import', 'Client user adoption / change resistance',
  'Contract milestone payment slippage', 'Regulatory (ABDM/SFDA) certification timelines',
];
export const RISKS = (() => {
  const r = makeRand(220144);
  const rows = [];
  let n = 1;
  activeCodes.forEach((code) => {
    const proj = PROJECTS.find((p) => p.code === code);
    const cnt = proj.riskLevel === 'Critical' ? 4 : proj.riskLevel === 'High' ? 3 : 2;
    for (let i = 0; i < cnt; i++) {
      const prob = r.int(2, 5);
      const impact = r.int(2, 5);
      const score = prob * impact;
      const level = score >= 16 ? 'Critical' : score >= 10 ? 'High' : score >= 5 ? 'Medium' : 'Low';
      rows.push({
        id: `RSK-${pad(n++)}`, projectCode: code, projectName: proj.name.split(' — ')[0],
        title: r.pick(RISK_TITLES), category: r.pick(RISK_TYPES), probability: prob, impact, score, level,
        owner: r.pick(OWNERS), status: r.pick(['Open', 'Mitigating', 'Monitoring', 'Closed']),
        mitigation: 'Documented mitigation plan with weekly review cadence.',
        target: isoDate(2026, r.int(7, 9), r.int(1, 27)),
      });
    }
  });
  return rows;
})();

// ---- Sign-off management ----
export const SIGNOFFS = (() => {
  const r = makeRand(230155);
  const rows = [];
  let n = 1;
  PROJECTS.forEach((proj) => {
    const cur = proj.milestones.filter((m) => m.status === 'Completed').length;
    SIGNOFF_MILESTONES.forEach((ms, i) => {
      const reached = i < cur - 2;
      const status = proj.status === 'Completed' ? 'Signed' : reached ? (r.chance(0.85) ? 'Signed' : 'Pending') : i <= cur ? 'Pending' : 'Not Reached';
      rows.push({
        id: `SGN-${pad(n++)}`, projectCode: proj.code, projectName: proj.name.split(' — ')[0], milestone: ms,
        status, signedBy: status === 'Signed' ? proj.name.includes('Gulf') || proj.name.includes('Al Noor') ? 'Client CIO' : 'Client SPOC' : '—',
        designation: status === 'Signed' ? 'Authorised Signatory' : '—',
        date: status === 'Signed' ? isoDate(2026, r.int(1, 7), r.int(1, 27)) : null,
        method: status === 'Signed' ? r.pick(['Digital Signature', 'e-Sign (OTP)', 'Scanned PDF']) : '—',
        remarks: status === 'Signed' ? 'Approved without exceptions.' : status === 'Pending' ? 'Awaiting client confirmation.' : '—',
      });
    });
  });
  return rows;
})();

// ---- Document Repository ----
const DOC_EXT = { 'Purchase Order': 'pdf', Contract: 'pdf', MOM: 'pdf', SRS: 'docx', 'Master Excel': 'xlsx', 'Training Manual': 'pdf', 'UAT Report': 'xlsx', 'Go-Live Checklist': 'xlsx', 'Sign-off': 'pdf', 'Closure Report': 'pdf' };
export const DOCUMENTS = (() => {
  const r = makeRand(240166);
  const rows = [];
  let n = 1;
  PROJECTS.forEach((proj) => {
    const cats = [...DOC_CATEGORIES].sort(() => r.next() - 0.5).slice(0, r.int(4, 8));
    cats.forEach((cat) => {
      const ext = DOC_EXT[cat] || 'pdf';
      rows.push({
        id: `DOC-${pad(n++)}`, projectCode: proj.code, projectName: proj.name.split(' — ')[0],
        name: `${cat.replace(/[^a-zA-Z]+/g, '_')}_${proj.code}.${ext}`, category: cat, ext,
        version: `v${r.int(1, 3)}.${r.int(0, 5)}`, sizeKB: r.int(80, 5200),
        uploadedBy: r.pick(OWNERS), uploadedOn: isoDate(2026, r.int(1, 7), r.int(1, 27)),
        shared: r.chance(0.4),
      });
    });
  });
  return rows;
})();

export const GOVERNANCE_KPIS = {
  issuesOpen: ISSUES.filter((i) => !['Resolved', 'Closed'].includes(i.status)).length,
  issuesCritical: ISSUES.filter((i) => i.severity === 'Critical' && !['Closed', 'Resolved'].includes(i.status)).length,
  risksOpen: RISKS.filter((r) => r.status !== 'Closed').length,
  risksHigh: RISKS.filter((r) => ['High', 'Critical'].includes(r.level) && r.status !== 'Closed').length,
  signoffsPending: SIGNOFFS.filter((s) => s.status === 'Pending').length,
  signoffsSigned: SIGNOFFS.filter((s) => s.status === 'Signed').length,
  documents: DOCUMENTS.length,
};
