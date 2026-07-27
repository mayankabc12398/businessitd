// ============================================================
// Delivery execution — Development/Config, UAT & Bugs, Training, Go-Live.
// ============================================================
import { makeRand, pad, isoDate } from './_seed';
import { PROJECTS } from './projects';
import { HIMS_MODULES, HOSPITAL_DEPTS, TRAINING_TYPES } from './masters';

const modName = (id) => HIMS_MODULES.find((m) => m.id === id)?.name ?? id;
const activeCodes = PROJECTS.filter((p) => !['Completed', 'Planning'].includes(p.status)).map((p) => p.code);
const DEVS = ['Sana Qureshi', 'Karthik Rao', 'Vikram Menon'];

// ---- Development & Configuration tracker ----
const FEATURES = [
  'OPD registration & MRN', 'Appointment scheduler', 'Discharge summary builder', 'Package billing engine',
  'Insurance pre-auth flow', 'Lab order-to-result', 'Radiology worklist push', 'e-Prescription',
  'Nursing e-MAR', 'Bed management board', 'Tariff versioning', 'ABDM linkage', 'GST/VAT tax engine', 'Analyzer interface',
];
const DEV_STATUS = ['Deployed', 'In Testing', 'In Development', 'Configured', 'Backlog'];

export const DEV_ITEMS = (() => {
  const r = makeRand(140088);
  const rows = [];
  let n = 1;
  activeCodes.forEach((code) => {
    const proj = PROJECTS.find((p) => p.code === code);
    const cnt = r.int(5, 9);
    for (let i = 0; i < cnt; i++) {
      const status = r.pick(DEV_STATUS);
      const done = ['Deployed', 'Configured', 'In Testing'].includes(status);
      rows.push({
        id: `DEV-${pad(n++)}`, projectCode: code, projectName: proj.name.split(' — ')[0],
        feature: r.pick(FEATURES), module: modName(r.pick(proj.modules)), type: r.chance(0.5) ? 'Development' : 'Configuration',
        developer: r.pick(DEVS), status, effortDays: r.int(1, 15),
        devDate: done ? isoDate(2026, r.int(2, 6), r.int(1, 27)) : null,
        deployDate: status === 'Deployed' ? isoDate(2026, r.int(3, 7), r.int(1, 27)) : null,
        progress: status === 'Deployed' ? 100 : status === 'In Testing' ? 80 : status === 'Configured' ? 70 : status === 'In Development' ? r.int(20, 60) : 0,
      });
    }
  });
  return rows;
})();

// ---- UAT cases + Bugs ----
const UAT_MODULES_STATUS = ['Passed', 'Failed', 'In Progress', 'Blocked', 'Not Started'];
export const UAT_CASES = (() => {
  const r = makeRand(550099);
  const rows = [];
  let n = 1;
  activeCodes.forEach((code) => {
    const proj = PROJECTS.find((p) => p.code === code);
    proj.modules.slice(0, r.int(4, 7)).forEach((mid) => {
      const total = r.int(12, 60);
      const passed = r.int(Math.floor(total * 0.4), total);
      const failed = r.int(0, Math.min(6, total - passed));
      const status = passed === total ? 'Passed' : failed > 3 ? 'Failed' : passed > total * 0.6 ? 'In Progress' : r.pick(UAT_MODULES_STATUS);
      rows.push({
        id: `UAT-${pad(n++)}`, projectCode: code, projectName: proj.name.split(' — ')[0], module: modName(mid),
        total, passed, failed, pending: total - passed - failed, status,
        tester: 'Client + QA', uatDate: isoDate(2026, r.int(4, 7), r.int(1, 27)),
        signoff: status === 'Passed' ? (r.chance(0.5) ? 'Signed' : 'Pending') : 'Pending',
      });
    });
  });
  return rows;
})();

const BUG_TITLES = [
  'Tax rounding mismatch on package bill', 'MRN duplicate on concurrent registration', 'Discharge summary missing vitals',
  'Lab result not auto-posting to EMR', 'Insurance co-pay calc incorrect', 'Bed status not refreshing after transfer',
  'Pharmacy stock going negative', 'Print layout broken on A5', 'Slow load on OPD queue board', 'ABHA API timeout',
];
const BUG_STATUS = ['Open', 'In Progress', 'Fixed', 'Retest', 'Closed', 'Reopened'];
const SEV = ['Critical', 'High', 'Medium', 'Low'];
export const BUG_CATEGORIES = ['Functional', 'UI / UX', 'Performance', 'Data / Integrity', 'Integration', 'Security', 'Configuration'];
export const BUGS = (() => {
  const r = makeRand(660100);
  const rows = [];
  let n = 1;
  activeCodes.forEach((code) => {
    const proj = PROJECTS.find((p) => p.code === code);
    const cnt = r.int(3, 8);
    for (let i = 0; i < cnt; i++) {
      const status = r.pick(BUG_STATUS);
      const title = r.pick(BUG_TITLES);
      const module = modName(r.pick(proj.modules));
      const severity = r.pick(SEV);
      rows.push({
        id: `BUG-${pad(n++)}`, projectCode: code, projectName: proj.name.split(' — ')[0],
        title, module, severity, category: r.pick(BUG_CATEGORIES),
        details: `${title}. Found on the ${module} module during client UAT. ${severity} severity — requires ${severity === 'Critical' ? 'immediate' : 'scheduled'} fix and retest before sign-off.`,
        status, reportedBy: 'Client UAT', assignedTo: r.pick(DEVS),
        reported: isoDate(2026, r.int(4, 7), r.int(1, 27)),
        resolved: ['Fixed', 'Closed'].includes(status) ? isoDate(2026, r.int(5, 7), r.int(1, 27)) : null,
      });
    }
  });
  return rows;
})();

// ---- Training sessions ----
export const TRAINING = (() => {
  const r = makeRand(770111);
  const rows = [];
  let n = 1;
  activeCodes.forEach((code) => {
    const proj = PROJECTS.find((p) => p.code === code);
    const depts = [...HOSPITAL_DEPTS].sort(() => r.next() - 0.5).slice(0, r.int(4, 7));
    depts.forEach((dept, di) => {
      const done = di < depts.length - 2;
      const planned = r.int(10, 40);
      rows.push({
        id: `TRN-${pad(n++)}`, projectCode: code, projectName: proj.name.split(' — ')[0], dept,
        type: r.pick(TRAINING_TYPES), trainer: 'Ananya Iyer',
        date: isoDate(2026, r.int(5, 7), r.int(1, 27)), durationHrs: r.int(2, 8),
        plannedAttendees: planned, attendance: done ? r.int(Math.floor(planned * 0.6), planned) : 0,
        status: done ? 'Completed' : di === depts.length - 2 ? 'Scheduled' : 'Planned',
        feedback: done ? (r.int(38, 49) / 10) : null,
        signoff: done ? (r.chance(0.5) ? 'Signed' : 'Pending') : '—',
      });
    });
  });
  return rows;
})();

// ---- Go-Live readiness checklist (per active-ish project) ----
const CHECKLIST = [
  'Master data imported & validated', 'UAT sign-off obtained', 'Training completed for all departments',
  'Production environment provisioned', 'Interfaces tested in prod', 'Data migration dry-run passed',
  'Cutover plan approved', 'Support roster & war-room ready', 'Rollback plan documented', 'Go-Live certificate prepared',
];
export const GOLIVE_READINESS = (() => {
  const r = makeRand(880122);
  return PROJECTS.filter((p) => !['Completed'].includes(p.status)).map((p) => {
    const advanced = ['uat', 'training', 'migration', 'parallel', 'golive'].includes(p.currentStage);
    const items = CHECKLIST.map((c, i) => {
      const status = advanced ? (i < 6 ? (r.chance(0.75) ? 'Done' : 'In Progress') : r.pick(['In Progress', 'Pending', 'Done'])) : (i < 2 ? 'Done' : i < 4 ? 'In Progress' : 'Pending');
      return { item: c, status, owner: r.pick(['PM', 'FC', 'TC', 'QA', 'Support']) };
    });
    const done = items.filter((i) => i.status === 'Done').length;
    return {
      projectCode: p.code, projectName: p.name.split(' — ')[0], targetGoLive: p.targetGoLive,
      readiness: Math.round((done / items.length) * 100), items,
      status: done === items.length ? 'Ready' : done >= 7 ? 'Almost Ready' : 'Preparing',
    };
  });
})();

// ---- Module 10: Live Data Import (production master import at go-live) ----
const LIVE_MASTERS = ['Doctors / Consultants', 'Services & Tariff', 'Pharmacy Items', 'Lab Tests', 'Patients (Active)', 'Outstanding Bills', 'Stock / Inventory', 'Insurance Panels', 'Ledger Balances'];
const goingLive = PROJECTS.filter((p) => ['migration', 'parallel', 'golive', 'support', 'closure'].includes(p.currentStage) || p.status === 'Completed');
export const LIVE_IMPORTS = (() => {
  const r = makeRand(990133);
  const rows = [];
  let n = 1;
  (goingLive.length ? goingLive : PROJECTS.slice(0, 4)).forEach((p) => {
    const masters = [...LIVE_MASTERS].sort(() => r.next() - 0.5).slice(0, r.int(5, 8));
    masters.forEach((m) => {
      const total = r.int(50, 18000);
      const failed = r.chance(0.4) ? r.int(0, Math.floor(total * 0.02)) : 0;
      const done = r.chance(0.7);
      rows.push({
        id: `LIM-${pad(n++)}`, projectCode: p.code, projectName: p.name.split(' — ')[0], master: m,
        importDate: done ? isoDate(2026, r.int(6, 8), r.int(1, 27)) : null,
        importedBy: r.pick(['Karthik Rao', 'Sana Qureshi', 'Vikram Menon']),
        records: done ? total : 0, failed,
        validation: done ? (failed > 0 ? 'Errors' : 'Passed') : 'Pending',
        status: done ? (failed > 0 ? 'Imported (errors)' : 'Imported') : 'Scheduled',
      });
    });
  });
  return rows;
})();

// ---- Module 11: Parallel Go-Live (transition monitoring) ----
export const PARALLEL_GOLIVE = (() => {
  const r = makeRand(1010144);
  return PROJECTS.filter((p) => ['parallel', 'golive', 'support', 'closure'].includes(p.currentStage) || p.status === 'Completed' || ['uat', 'training', 'migration'].includes(p.currentStage)).slice(0, 6).map((p) => {
    const days = r.int(5, 21);
    const logged = r.int(2, 24);
    return {
      id: `PGL-${p.code}`, projectCode: p.code, projectName: p.name.split(' — ')[0],
      startDate: isoDate(2026, r.int(6, 7), r.int(1, 20)), endDate: isoDate(2026, r.int(7, 8), r.int(21, 28)),
      days, issuesLogged: logged, issuesResolved: r.int(Math.floor(logged * 0.5), logged),
      supportEngineer: 'Farhan Shaikh', dailyStatus: r.pick(['Stable', 'Minor issues', 'Monitoring', 'Critical watch']),
      clientFeedback: r.int(35, 49) / 10,
      status: r.pick(['Running', 'Stabilising', 'Completed']),
    };
  });
})();

// ---- Module 12: Final Go-Live (production cutover record) ----
export const FINAL_GOLIVE = (() => {
  const r = makeRand(1020155);
  return PROJECTS.filter((p) => ['golive', 'support', 'closure'].includes(p.currentStage) || p.status === 'Completed' || ['parallel'].includes(p.currentStage)).slice(0, 6).map((p) => {
    const live = p.status === 'Completed' || ['golive', 'support', 'closure'].includes(p.currentStage);
    const pending = live ? r.int(0, 4) : r.int(3, 8);
    return {
      id: `FGL-${p.code}`, projectCode: p.code, projectName: p.name.split(' — ')[0],
      goLiveDate: live ? isoDate(2026, r.int(6, 8), r.int(1, 27)) : p.targetGoLive,
      approvedBy: live ? 'Client CIO' : '—', modulesLive: live ? p.modules.length : 0, modulesTotal: p.modules.length,
      pendingItems: pending, certificate: live && pending === 0 ? 'Issued' : live ? 'Draft' : '—',
      signoff: live && pending === 0 ? 'Signed' : live ? 'Pending' : '—',
      status: live ? (pending === 0 ? 'Live' : 'Live (with punch-list)') : 'Scheduled',
    };
  });
})();

export const DELIVERY_KPIS = {
  devTotal: DEV_ITEMS.length,
  devDeployed: DEV_ITEMS.filter((d) => d.status === 'Deployed').length,
  uatModules: UAT_CASES.length,
  uatPassed: UAT_CASES.filter((u) => u.status === 'Passed').length,
  bugsOpen: BUGS.filter((b) => !['Closed', 'Fixed'].includes(b.status)).length,
  bugsCritical: BUGS.filter((b) => b.severity === 'Critical' && !['Closed'].includes(b.status)).length,
  trainingDone: TRAINING.filter((t) => t.status === 'Completed').length,
  trainingTotal: TRAINING.length,
};

export const GOLIVE_KPIS = {
  readyProjects: GOLIVE_READINESS.filter((r) => r.status === 'Ready').length,
  liveImports: LIVE_IMPORTS.filter((l) => l.status.startsWith('Imported')).length,
  liveImportsTotal: LIVE_IMPORTS.length,
  liveRecords: LIVE_IMPORTS.reduce((s, l) => s + l.records, 0),
  parallelRunning: PARALLEL_GOLIVE.filter((p) => p.status !== 'Completed').length,
  finalLive: FINAL_GOLIVE.filter((f) => f.status.startsWith('Live')).length,
  certsIssued: FINAL_GOLIVE.filter((f) => f.certificate === 'Issued').length,
};
