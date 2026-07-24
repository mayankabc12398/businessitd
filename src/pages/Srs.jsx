// SRS Management — department-wise SRS planning schedule & sign-off.
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileSignature, Plus, CheckCircle2, ClipboardList, GitBranch, FileCheck2 } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, StatusBadge, Chip, FormDrawer, useToast } from '../components/ui';
import { fmtDate } from '../utils/format';
import { PROJECTS } from '../data/projects';
import { HOSPITAL_DEPTS } from '../data/masters';

export default function Srs() {
  const { data: rows, loading } = useApi(() => api.getSrsSchedule());
  const { data: kpis } = useApi(() => api.getSrsKpis());
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [proj, setProj] = useState('All');
  const [statusF, setStatusF] = useState('All');
  const [show, setShow] = useState(false);
  const [extra, setExtra] = useState([]);

  useEffect(() => { if (params.get('new') === '1') { setShow(true); setParams({}, { replace: true }); } }, [params, setParams]);

  const allRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const projOptions = useMemo(() => ['All', ...new Set(allRows.map((r) => r.projectName))], [allRows]);
  const filtered = useMemo(() => allRows.filter((r) => (proj === 'All' || r.projectName === proj) && (statusF === 'All' || r.status === statusF)), [allRows, proj, statusF]);

  const addSrs = (v) => {
    const p = PROJECTS.find((x) => x.code === v.projectCode);
    setExtra((prev) => [{
      id: `SRS-${String(allRows.length + 1).padStart(3, '0')}`, projectCode: v.projectCode, projectName: p ? p.name.split(' — ')[0] : v.projectCode,
      dept: v.dept, consultant: v.consultant, planned: v.planned, actual: null, status: 'Scheduled',
      requirements: Number(v.requirements) || 0, gaps: 0, crs: 0, signoff: '—',
    }, ...prev]);
    toast.success('SRS scheduled', `${v.dept} · ${p ? p.name.split(' — ')[0] : ''}`);
    setShow(false);
  };

  const columns = [
    { key: 'id', header: 'SRS ID', width: 90, render: (r) => <span className="mono t-xs ink-3">{r.id}</span> },
    { key: 'project', header: 'Project', minWidth: 160, render: (r) => <div><div className="fw-6 t-sm">{r.projectName}</div><div className="t-xs ink-3 mono">{r.projectCode}</div></div> },
    { key: 'dept', header: 'Department', render: (r) => <Badge tone="info">{r.dept}</Badge> },
    { key: 'consultant', header: 'Consultant' },
    { key: 'planned', header: 'Planned', accessor: (r) => r.planned, nowrap: true, render: (r) => fmtDate(r.planned) },
    { key: 'reqs', header: 'Reqs', align: 'right', accessor: (r) => r.requirements },
    { key: 'gaps', header: 'Gaps', align: 'right', accessor: (r) => r.gaps, render: (r) => r.gaps ? <Badge tone="warning">{r.gaps}</Badge> : <span className="ink-3">0</span> },
    { key: 'crs', header: 'CRs', align: 'right', accessor: (r) => r.crs, render: (r) => r.crs ? <Badge tone="pending">{r.crs}</Badge> : <span className="ink-3">0</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'signoff', header: 'Sign-off', render: (r) => r.signoff === 'Signed' ? <Badge tone="success"><CheckCircle2 size={11} /> Signed</Badge> : r.signoff === 'Pending' ? <Badge tone="pending">Pending</Badge> : <span className="ink-3">—</span> },
  ];

  const STATUSES = ['All', 'Signed Off', 'Completed', 'In Progress', 'Scheduled'];

  return (
    <div className="page">
      <PageHeader icon={<FileSignature size={22} />} tint="mint" title="SRS Management" desc="Department-wise SRS planning, discussion & sign-off — linked to Smart SRS"
        crumbs={[{ label: 'Delivery' }, { label: 'SRS' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> Schedule SRS</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Sessions Scheduled" value={kpis?.scheduled ?? '—'} tint="mint" icon={<ClipboardList size={19} />} footer="Across active projects" />
        <MetricCard label="Completed / Signed" value={kpis?.completed ?? '—'} tint="green" icon={<FileCheck2 size={19} />} footer={`${kpis?.signed ?? 0} sign-offs received`} />
        <MetricCard label="Gaps Identified" value={kpis?.gaps ?? '—'} tint="peach" icon={<GitBranch size={19} />} footer="Requiring resolution" />
        <MetricCard label="Change Requests" value={kpis?.crs ?? '—'} tint="lavender" icon={<GitBranch size={19} />} footer={kpis ? `₹${(kpis.crValue/1e5).toFixed(1)}L value` : '—'} />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Project</span>
          {projOptions.map((p) => <Chip key={p} active={proj === p} onClick={() => setProj(p)}>{p}</Chip>)}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Status</span>
          {STATUSES.map((s) => <Chip key={s} active={statusF === s} onClick={() => setStatusF(s)}>{s}</Chip>)}
        </div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="srs-schedule.csv" searchPlaceholder="Search departments, consultants…" pageSize={15} />

      <FormDrawer open={show} onClose={() => setShow(false)} title="Schedule SRS Session" subtitle="Plan a department-wise SRS discussion"
        submitLabel="Schedule" onSubmit={addSrs}
        fields={[
          { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: PROJECTS.filter((p) => p.status !== 'Completed').map((p) => ({ value: p.code, label: p.name })) },
          { name: 'dept', label: 'Department', type: 'select', required: true, options: HOSPITAL_DEPTS },
          { name: 'consultant', label: 'Consultant', type: 'select', required: true, options: ['Neha Patel', 'Amit Verma', 'Meera Krishnan'] },
          { name: 'planned', label: 'Planned Date', type: 'date', required: true },
          { name: 'requirements', label: 'Est. Requirements', type: 'number', placeholder: '0' },
        ]} />
    </div>
  );
}
