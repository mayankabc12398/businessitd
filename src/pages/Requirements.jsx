// Requirements, Gap Analysis & Change Requests register.
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GitPullRequestArrow, Plus, GitBranch, CheckCircle2, CircleDollarSign, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, StatusBadge, Chip, FormDrawer, useToast } from '../components/ui';
import { fmtDate } from '../utils/format';
import { PROJECTS } from '../data/projects';
import { HOSPITAL_DEPTS, PRIORITIES } from '../data/masters';

const typeTone = { Standard: 'info', Gap: 'warning', 'Change Request': 'pending' };
const prioTone = { Critical: 'danger', High: 'warning', Medium: 'info', Low: 'neutral' };

export default function Requirements() {
  const { data: rows, loading } = useApi(() => api.getRequirements());
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [typeF, setTypeF] = useState('All');
  const [proj, setProj] = useState('All');
  const [show, setShow] = useState(false);
  const [extra, setExtra] = useState([]);

  useEffect(() => { if (params.get('new') === '1') { setShow(true); setParams({}, { replace: true }); } }, [params, setParams]);

  const allRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const projOptions = useMemo(() => ['All', ...new Set(allRows.map((r) => r.projectName))], [allRows]);
  const filtered = useMemo(() => allRows.filter((r) => (typeF === 'All' || r.type === typeF) && (proj === 'All' || r.projectName === proj)), [allRows, typeF, proj]);

  const crValue = allRows.reduce((s, r) => s + r.crValue, 0);
  const gaps = allRows.filter((r) => r.type === 'Gap').length;
  const crs = allRows.filter((r) => r.type === 'Change Request').length;
  const approved = allRows.filter((r) => r.status === 'Approved').length;

  const addReq = (v) => {
    const p = PROJECTS.find((x) => x.code === v.projectCode);
    setExtra((prev) => [{
      id: `REQ-${String(allRows.length + 1).padStart(3, '0')}`, projectCode: v.projectCode, projectName: p ? p.name.split(' — ')[0] : v.projectCode,
      title: v.title, dept: v.dept, type: v.type, priority: v.priority, status: 'In Discussion',
      effortDays: Number(v.effortDays) || 0, raisedBy: v.raisedBy || 'PMO', approvedBy: '—', signoffDate: null,
      crValue: v.type === 'Change Request' ? (Number(v.crValue) || 0) : 0,
    }, ...prev]);
    toast.success('Requirement logged', v.title);
    setShow(false);
  };

  const columns = [
    { key: 'id', header: 'ID', width: 90, render: (r) => <span className="mono t-xs ink-3">{r.id}</span> },
    { key: 'title', header: 'Requirement', minWidth: 250, render: (r) => <div><div className="fw-6 t-sm">{r.title}</div><div className="t-xs ink-3">{r.projectName} · {r.dept}</div></div> },
    { key: 'type', header: 'Type', render: (r) => <Badge tone={typeTone[r.type]}>{r.type}</Badge> },
    { key: 'priority', header: 'Priority', render: (r) => <Badge tone={prioTone[r.priority]}>{r.priority}</Badge> },
    { key: 'effort', header: 'Effort', align: 'right', accessor: (r) => r.effortDays, render: (r) => r.effortDays ? `${r.effortDays}d` : '—' },
    { key: 'crValue', header: 'CR Value', align: 'right', accessor: (r) => r.crValue, render: (r) => r.crValue ? <b className="tabular">₹{(r.crValue / 1000).toFixed(0)}k</b> : <span className="ink-3">—</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'raisedBy', header: 'Raised By' },
    { key: 'signoff', header: 'Approved', accessor: (r) => r.signoffDate, nowrap: true, render: (r) => r.signoffDate ? <span className="t-sm"><CheckCircle2 size={12} color="var(--success)" style={{ verticalAlign: -1 }} /> {fmtDate(r.signoffDate)}</span> : '—' },
  ];

  return (
    <div className="page">
      <PageHeader icon={<GitPullRequestArrow size={22} />} tint="lavender" title="Requirements & Change Requests" desc="Requirement discussion, gap analysis and change-request register"
        crumbs={[{ label: 'Delivery' }, { label: 'Requirements & CR' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> Add Requirement</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Requirements" value={rows?.length ?? '—'} tint="lavender" icon={<MessageSquare size={19} />} footer={`${approved} approved`} />
        <MetricCard label="Gaps" value={gaps} tint="peach" icon={<GitBranch size={19} />} footer="Identified in SRS" />
        <MetricCard label="Change Requests" value={crs} tint="pink" icon={<GitPullRequestArrow size={19} />} footer="Scope additions" />
        <MetricCard label="CR Value" value={`₹${(crValue / 1e5).toFixed(1)}L`} tint="mint" icon={<CircleDollarSign size={19} />} footer="Billable enhancements" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap mb-1"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Type</span>{['All', 'Standard', 'Gap', 'Change Request'].map((t) => <Chip key={t} active={typeF === t} onClick={() => setTypeF(t)}>{t}</Chip>)}</div>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Project</span>{projOptions.map((p) => <Chip key={p} active={proj === p} onClick={() => setProj(p)}>{p}</Chip>)}</div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="requirements.csv" searchPlaceholder="Search requirements…" pageSize={15} />

      <FormDrawer open={show} onClose={() => setShow(false)} title="Add Requirement / Change Request" subtitle="Log a requirement, gap or change request"
        submitLabel="Log Requirement" onSubmit={addReq}
        fields={[
          { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: PROJECTS.filter((p) => p.status !== 'Completed').map((p) => ({ value: p.code, label: p.name })) },
          { name: 'title', label: 'Requirement', required: true, full: true, placeholder: 'Describe the requirement…' },
          { name: 'dept', label: 'Department', type: 'select', required: true, options: HOSPITAL_DEPTS },
          { name: 'type', label: 'Type', type: 'select', required: true, default: 'Standard', options: ['Standard', 'Gap', 'Change Request'] },
          { name: 'priority', label: 'Priority', type: 'select', required: true, default: 'Medium', options: PRIORITIES },
          { name: 'effortDays', label: 'Effort (days)', type: 'number', placeholder: '0' },
          { name: 'crValue', label: 'CR Value (₹)', type: 'number', placeholder: '0', help: 'Only for change requests', show: (v) => v.type === 'Change Request' },
          { name: 'raisedBy', label: 'Raised By', placeholder: 'Consultant name' },
        ]} />
    </div>
  );
}
