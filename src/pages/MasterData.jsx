// Master Data Management — request → receive → validate → import tracker.
import { useState, useMemo } from 'react';
import { Database, Plus, CheckCircle2, Clock, FileSpreadsheet, Upload, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Chip, FormDrawer, useToast } from '../components/ui';
import { fmtNum } from '../utils/format';
import { PROJECTS } from '../data/projects';

const MASTER_NAMES = ['Doctors / Consultants', 'Services & Tariff', 'Pharmacy Items', 'Lab Tests & Panels', 'Radiology Procedures', 'Departments & Wards', 'Bed Master', 'Insurance / TPA Panels', 'Diagnosis (ICD)', 'Suppliers & Vendors', 'Package Master', 'User & Role Master', 'Ledger / Chart of Accounts', 'Diet Master', 'Referral Doctors'];

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
// "12-march-2026 12:50pm"
const fmtDT = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  let h = d.getHours(); const mi = d.getMinutes();
  const ap = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${d.getDate()}-${MONTHS[d.getMonth()]}-${d.getFullYear()} ${h}:${String(mi).padStart(2, '0')}${ap}`;
};

// Icon + timestamp stacked cell for a request/receive/import step
const StepCell = ({ done, at }) => (
  <div className="flex-col items-center gap-1">
    {done ? <CheckCircle2 size={16} color="var(--success)" /> : <Clock size={15} color="var(--text-3)" />}
    {done && at
      ? <span className="t-xs ink-3 nowrap" style={{ fontSize: 11 }}>{fmtDT(at)}</span>
      : <span className="t-xs ink-3">—</span>}
  </div>
);

export default function MasterData() {
  const { data: rows, loading } = useApi(() => api.getMasterData());
  const { data: kpis } = useApi(() => api.getMasterDataKpis());
  const toast = useToast();
  const [proj, setProj] = useState('All');
  const [statusF, setStatusF] = useState('All');
  const [showReq, setShowReq] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [extra, setExtra] = useState([]);

  const allRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const projOptions = useMemo(() => ['All', ...new Set(allRows.map((r) => r.projectName))], [allRows]);
  const filtered = useMemo(() => allRows.filter((r) => (proj === 'All' || r.projectName === proj) && (statusF === 'All' || r.status.startsWith(statusF))), [allRows, proj, statusF]);

  const addMaster = (v, imported) => {
    const p = PROJECTS.find((x) => x.code === v.projectCode);
    const records = imported ? (Number(v.records) || 0) : 0;
    setExtra((prev) => [{
      id: `MD-${String(allRows.length + 1).padStart(3, '0')}`, projectCode: v.projectCode, projectName: p ? p.name.split(' — ')[0] : v.projectCode,
      master: v.master, requested: true, received: imported, imported,
      requestedOn: '2026-07-24T10:00', receivedOn: imported ? '2026-07-24T10:05' : null, importedOn: imported ? '2026-07-24T10:10' : null,
      records, failed: 0, validation: imported ? 'Passed' : '—', owner: v.owner || 'PMO',
      requestedDate: v.requestedDate || null, importDate: v.importDate || null, type: v.type || null,
      status: imported ? 'Imported' : 'Awaited',
    }, ...prev]);
    toast.success(imported ? 'Master imported' : 'Master requested', `${v.master} · ${p ? p.name.split(' — ')[0] : ''}`);
    setShowReq(false); setShowImport(false);
  };

  const columns = [
    { key: 'master', header: 'Master', minWidth: 170, render: (r) => <div><div className="fw-6 t-sm">{r.master}</div><div className="t-xs ink-3">{r.projectName}</div></div> },
    { key: 'requested', header: 'Requested', align: 'center', minWidth: 150, accessor: (r) => r.requested ? 1 : 0, render: (r) => <StepCell done={r.requested} at={r.requestedOn} /> },
    { key: 'received', header: 'Received', align: 'center', minWidth: 150, accessor: (r) => r.received ? 1 : 0, render: (r) => <StepCell done={r.received} at={r.receivedOn} /> },
    { key: 'imported', header: 'Imported', align: 'center', minWidth: 150, accessor: (r) => r.imported ? 1 : 0, render: (r) => <StepCell done={r.imported} at={r.importedOn} /> },
    { key: 'records', header: 'Records', align: 'right', accessor: (r) => r.records, render: (r) => <b className="tabular">{r.records ? fmtNum(r.records) : '—'}</b> },
    { key: 'owner', header: 'Owner' },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Database size={22} />} tint="lemon" title="Master Data Management" desc="Track every master requested from the client — received, validated & imported"
        crumbs={[{ label: 'Delivery' }, { label: 'Master Data' }]}
        actions={<><button className="btn btn-outline" onClick={() => setShowImport(true)}><Upload size={15} /> Import Excel</button><button className="btn btn-primary" onClick={() => setShowReq(true)}><Plus size={15} /> Request Master</button></>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Masters Tracked" value={kpis?.total ?? '—'} tint="lemon" icon={<FileSpreadsheet size={19} />} footer={`${kpis?.received ?? 0} received`} />
        <MetricCard label="Imported" value={kpis?.imported ?? '—'} tint="green" icon={<CheckCircle2 size={19} />} footer={kpis ? `${fmtNum(kpis.records)} records` : '—'} />
        <MetricCard label="Awaited from Client" value={kpis?.awaited ?? '—'} tint="peach" icon={<Clock size={19} />} footer="Pending collection" />
        <MetricCard label="Validation Errors" value={kpis?.errors ?? '—'} tint="rose" icon={<AlertTriangle size={19} />} footer="Need re-import" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Project</span>
          {projOptions.map((p) => <Chip key={p} active={proj === p} onClick={() => setProj(p)}>{p}</Chip>)}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Status</span>
          {['All', 'Imported', 'Validation', 'Awaited'].map((s) => <Chip key={s} active={statusF === s} onClick={() => setStatusF(s)}>{s}</Chip>)}
        </div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="master-data.csv" searchPlaceholder="Search masters, projects…" pageSize={15} />

      <FormDrawer open={showReq} onClose={() => setShowReq(false)} title="Request Master from Client" subtitle="Track a master data collection request"
        submitLabel="Request Master" onSubmit={(v) => addMaster(v, false)}
        fields={[
          { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: PROJECTS.filter((p) => p.status !== 'Completed').map((p) => ({ value: p.code, label: p.name })) },
          { name: 'requestedDate', label: 'Requested Date', type: 'date' },
          { name: 'importDate', label: 'Import Date', type: 'date' },
          { name: 'type', label: 'Type', type: 'select', options: ['Onsite', 'Offsite', 'Online'], placeholder: 'Select type…' },
          { name: 'master', label: 'Master', type: 'select', required: true, full: true, options: MASTER_NAMES },
          { name: 'owner', label: 'Owner', placeholder: 'Responsible consultant' },
        ]} />

      <FormDrawer open={showImport} onClose={() => setShowImport(false)} title="Import Master Excel" subtitle="Record a validated master import"
        submitLabel="Import" submitIcon={<Upload size={14} />} onSubmit={(v) => addMaster(v, true)}
        intro="Upload the client's filled Excel template. On import the records are validated and counted."
        fields={[
          { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: PROJECTS.filter((p) => p.status !== 'Completed').map((p) => ({ value: p.code, label: p.name })) },
          { name: 'master', label: 'Master', type: 'select', required: true, options: MASTER_NAMES },
          { name: 'records', label: 'Records', type: 'number', required: true, placeholder: '0' },
          { name: 'owner', label: 'Imported By', placeholder: 'Consultant name' },
        ]} />
    </div>
  );
}
