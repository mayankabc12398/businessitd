// Issue Tracker — cross-project issues with severity & resolution SLA.
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldAlert, Plus, CheckCircle2, AlertOctagon, Timer } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, StatusBadge, Chip, FormDrawer, useToast } from '../components/ui';
import { fmtDate } from '../utils/format';
import { PROJECTS } from '../data/projects';
import { HIMS_MODULES, ISSUE_TYPES, SEVERITIES } from '../data/masters';

const sevTone = { Critical: 'danger', High: 'warning', Medium: 'info', Low: 'neutral' };

export default function Issues() {
  const { data: rows, loading } = useApi(() => api.getIssues());
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [sevF, setSevF] = useState('All');
  const [statusF, setStatusF] = useState('Open');
  const [show, setShow] = useState(false);
  const [extra, setExtra] = useState([]);

  useEffect(() => { if (params.get('new') === '1') { setShow(true); setParams({}, { replace: true }); } }, [params, setParams]);

  const allRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const filtered = useMemo(() => allRows.filter((r) =>
    (sevF === 'All' || r.severity === sevF) &&
    (statusF === 'All' || (statusF === 'Open' ? !['Resolved', 'Closed'].includes(r.status) : r.status === statusF))
  ), [allRows, sevF, statusF]);

  const open = allRows.filter((r) => !['Resolved', 'Closed'].includes(r.status));

  const addIssue = (v) => {
    const p = PROJECTS.find((x) => x.code === v.projectCode);
    setExtra((prev) => [{
      id: `ISS-${String(allRows.length + 1).padStart(3, '0')}`, projectCode: v.projectCode, projectName: p ? p.name.split(' — ')[0] : v.projectCode,
      title: v.title, type: v.type, module: v.module, severity: v.severity, status: 'Open',
      reportedBy: v.reportedBy || 'Client', assignedTo: v.assignedTo, raised: '2026-07-24', due: v.due || '2026-08-15', resolved: null, ageDays: 0,
    }, ...prev]);
    toast.success('Issue logged', v.title);
    setShow(false);
  };
  const critical = open.filter((r) => r.severity === 'Critical').length;
  const overdue = open.filter((r) => r.ageDays > 21).length;

  const columns = [
    { key: 'id', header: 'ID', width: 90, render: (r) => <span className="mono t-xs ink-3">{r.id}</span> },
    { key: 'title', header: 'Issue', minWidth: 250, render: (r) => <div><div className="fw-6 t-sm">{r.title}</div><div className="t-xs ink-3">{r.projectName} · {r.module}</div></div> },
    { key: 'type', header: 'Type', render: (r) => <Badge tone="neutral">{r.type}</Badge> },
    { key: 'severity', header: 'Severity', render: (r) => <Badge tone={sevTone[r.severity]}>{r.severity}</Badge> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'assigned', header: 'Assigned To' },
    { key: 'age', header: 'Age', align: 'right', accessor: (r) => r.ageDays, render: (r) => <Badge tone={r.ageDays > 21 ? 'danger' : r.ageDays > 10 ? 'warning' : 'neutral'}>{r.ageDays}d</Badge> },
    { key: 'due', header: 'Due', accessor: (r) => r.due, nowrap: true, render: (r) => fmtDate(r.due) },
  ];

  return (
    <div className="page">
      <PageHeader icon={<ShieldAlert size={22} />} tint="rose" title="Issue Tracker" desc="Cross-project issues, ownership and resolution SLA"
        crumbs={[{ label: 'Governance' }, { label: 'Issues' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> Log Issue</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Open Issues" value={open.length} tint="rose" icon={<AlertOctagon size={19} />} footer={`${(rows||[]).length} total logged`} />
        <MetricCard label="Critical" value={critical} tint="peach" icon={<ShieldAlert size={19} />} footer="Need immediate action" />
        <MetricCard label="Overdue (>21d)" value={overdue} tint="lemon" icon={<Timer size={19} />} footer="Breaching SLA" />
        <MetricCard label="Resolved" value={(rows||[]).filter(r=>['Resolved','Closed'].includes(r.status)).length} tint="green" icon={<CheckCircle2 size={19} />} footer="Closed to date" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap mb-1"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Severity</span>{['All', 'Critical', 'High', 'Medium', 'Low'].map((s) => <Chip key={s} active={sevF === s} onClick={() => setSevF(s)}>{s}</Chip>)}</div>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Status</span>{['Open', 'All', 'In Progress', 'On Hold', 'Resolved', 'Closed'].map((s) => <Chip key={s} active={statusF === s} onClick={() => setStatusF(s)}>{s}</Chip>)}</div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="issues.csv" searchPlaceholder="Search issues…" pageSize={15} />

      <FormDrawer open={show} onClose={() => setShow(false)} title="Log Issue" subtitle="Raise a cross-project implementation issue"
        submitLabel="Log Issue" onSubmit={addIssue}
        fields={[
          { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: PROJECTS.filter((p) => p.status !== 'Completed').map((p) => ({ value: p.code, label: p.name })) },
          { name: 'title', label: 'Issue Summary', required: true, full: true, placeholder: 'Describe the issue…' },
          { name: 'type', label: 'Type', type: 'select', required: true, default: 'Bug', options: ISSUE_TYPES },
          { name: 'severity', label: 'Severity', type: 'select', required: true, default: 'Medium', options: SEVERITIES },
          { name: 'module', label: 'Module', type: 'select', required: true, options: HIMS_MODULES.map((m) => m.name) },
          { name: 'assignedTo', label: 'Assign To', type: 'select', required: true, options: ['Rahul Sharma', 'Priya Nair', 'Amit Verma', 'Karthik Rao', 'Sana Qureshi', 'Farhan Shaikh'] },
          { name: 'due', label: 'Due Date', type: 'date' },
          { name: 'reportedBy', label: 'Reported By', placeholder: 'Client / Internal' },
        ]} />
    </div>
  );
}
