// ============================================================
// Master Data Management — tracks each master requested from the client.
// ============================================================
import { makeRand, pad, isoDate } from './_seed';
import { PROJECTS } from './projects';

const MASTERS = [
  'Doctors / Consultants', 'Services & Tariff', 'Pharmacy Items', 'Lab Tests & Panels', 'Radiology Procedures',
  'Departments & Wards', 'Bed Master', 'Insurance / TPA Panels', 'Diagnosis (ICD)', 'Suppliers & Vendors',
  'Package Master', 'User & Role Master', 'Ledger / Chart of Accounts', 'Diet Master', 'Referral Doctors',
];
const activeCodes = PROJECTS.filter((p) => !['Completed', 'Planning'].includes(p.status)).map((p) => p.code);
const isoDT = (y, mo, da, hh, mi) => `${isoDate(y, mo, da)}T${pad(hh, 2)}:${pad(mi, 2)}`;

export const MASTER_DATA = (() => {
  const r = makeRand(330077);
  const rows = [];
  let n = 1;
  activeCodes.forEach((code) => {
    const proj = PROJECTS.find((p) => p.code === code);
    const cnt = r.int(6, 11);
    const masters = [...MASTERS].sort(() => r.next() - 0.5).slice(0, cnt);
    masters.forEach((m) => {
      const requested = true;
      const received = r.chance(0.72);
      const imported = received && r.chance(0.6);
      const total = r.int(20, 4200);
      const failed = imported ? r.int(0, Math.floor(total * 0.04)) : 0;
      const status = imported ? (failed > 0 ? 'Imported (with errors)' : 'Imported') : received ? 'Validation Pending' : 'Awaited';
      // chronological: requested → received → imported
      const reqM = r.int(1, 4), recM = reqM + r.int(0, 2), impM = recM + r.int(0, 2);
      rows.push({
        id: `MD-${pad(n++)}`, projectCode: code, projectName: proj.name.split(' — ')[0], master: m,
        requested, received, imported,
        requestedOn: isoDT(2026, reqM, r.int(1, 27), r.int(9, 18), r.int(0, 59)),
        receivedOn: received ? isoDT(2026, recM, r.int(1, 27), r.int(9, 18), r.int(0, 59)) : null,
        importedOn: imported ? isoDT(2026, impM, r.int(1, 27), r.int(9, 18), r.int(0, 59)) : null,
        records: imported ? total : received ? total : 0, failed,
        validation: imported ? (failed > 0 ? 'Errors' : 'Passed') : received ? 'Pending' : '—',
        owner: r.pick(['Neha Patel', 'Amit Verma', 'Meera Krishnan']), status,
      });
    });
  });
  return rows;
})();

export const MASTERDATA_KPIS = {
  total: MASTER_DATA.length,
  received: MASTER_DATA.filter((m) => m.received).length,
  imported: MASTER_DATA.filter((m) => m.imported).length,
  awaited: MASTER_DATA.filter((m) => !m.received).length,
  errors: MASTER_DATA.filter((m) => m.validation === 'Errors').length,
  records: MASTER_DATA.reduce((s, m) => s + (m.imported ? m.records : 0), 0),
};
