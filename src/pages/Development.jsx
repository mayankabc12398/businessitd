// Development & Configuration tracker.
import { useState, useMemo } from 'react';
import { Code2, Plus, Rocket, Wrench, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, StatusBadge, ProgressBar, Chip, FormDrawer, useToast } from '../components/ui';
import { fmtDate } from '../utils/format';
import { PROJECTS } from '../data/projects';
import { HIMS_MODULES } from '../data/masters';

export default function Development() {
  const { data: rows, loading } = useApi(() => api.getDevItems());
  const { data: kpis } = useApi(() => api.getDeliveryKpis());
  const toast = useToast();
  const [proj, setProj] = useState('All');
  const [typeF, setTypeF] = useState('All');
  const [show, setShow] = useState(false);
  const [extra, setExtra] = useState([]);

  const allRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const projOptions = useMemo(() => ['All', ...new Set(allRows.map((r) => r.projectName))], [allRows]);
  const filtered = useMemo(() => allRows.filter((r) => (proj === 'All' || r.projectName === proj) && (typeF === 'All' || r.type === typeF)), [allRows, proj, typeF]);

  const addItem = (v) => {
    const p = PROJECTS.find((x) => x.code === v.projectCode);
    setExtra((prev) => [{
      id: `DEV-${String(allRows.length + 1).padStart(3, '0')}`, projectCode: v.projectCode, projectName: p ? p.name.split(' — ')[0] : v.projectCode,
      feature: v.feature, module: v.module, type: v.type, developer: v.developer, status: 'Backlog',
      effortDays: Number(v.effortDays) || 0, devDate: null, deployDate: null, progress: 0,
    }, ...prev]);
    toast.success('Item added', v.feature);
    setShow(false);
  };

  const columns = [
    { key: 'feature', header: 'Feature', minWidth: 200, render: (r) => <div><div className="fw-6 t-sm">{r.feature}</div><div className="t-xs ink-3">{r.projectName} · {r.module}</div></div> },
    { key: 'type', header: 'Type', render: (r) => <Badge tone={r.type === 'Development' ? 'info' : 'pending'}>{r.type}</Badge> },
    { key: 'developer', header: 'Developer' },
    { key: 'effort', header: 'Effort', align: 'right', accessor: (r) => r.effortDays, render: (r) => `${r.effortDays}d` },
    { key: 'progress', header: 'Progress', minWidth: 130, accessor: (r) => r.progress, render: (r) => <div style={{ minWidth: 110 }}><div className="flex justify-between t-xs mb-1"><span /><b className="tabular">{r.progress}%</b></div><ProgressBar value={r.progress} color={r.progress === 100 ? 'var(--success)' : 'var(--primary)'} /></div> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'deploy', header: 'Deployed', accessor: (r) => r.deployDate, nowrap: true, render: (r) => r.deployDate ? fmtDate(r.deployDate) : '—' },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Code2 size={22} />} tint="peach" title="Development & Configuration" desc="Feature build, configuration and deployment tracking"
        crumbs={[{ label: 'Build & Validate' }, { label: 'Development' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> Add Item</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Total Items" value={kpis?.devTotal ?? '—'} tint="peach" icon={<Code2 size={19} />} footer="Dev + config" />
        <MetricCard label="Deployed" value={kpis?.devDeployed ?? '—'} tint="green" icon={<Rocket size={19} />} footer="Live in UAT/prod" />
        <MetricCard label="In Development" value={(rows||[]).filter(r=>r.status==='In Development').length} tint="lavender" icon={<Wrench size={19} />} footer="Active build" />
        <MetricCard label="Configured" value={(rows||[]).filter(r=>r.status==='Configured').length} tint="cyan" icon={<CheckCircle2 size={19} />} footer="Ready to test" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap mb-1"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Project</span>{projOptions.map((p) => <Chip key={p} active={proj === p} onClick={() => setProj(p)}>{p}</Chip>)}</div>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Type</span>{['All', 'Development', 'Configuration'].map((t) => <Chip key={t} active={typeF === t} onClick={() => setTypeF(t)}>{t}</Chip>)}</div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="development.csv" searchPlaceholder="Search features, modules…" pageSize={15} />

      <FormDrawer open={show} onClose={() => setShow(false)} title="Add Development / Config Item" subtitle="Track a feature build or configuration task"
        submitLabel="Add Item" onSubmit={addItem}
        fields={[
          { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: PROJECTS.filter((p) => p.status !== 'Completed').map((p) => ({ value: p.code, label: p.name })) },
          { name: 'feature', label: 'Feature / Task', required: true, full: true, placeholder: 'e.g. Package billing engine' },
          { name: 'type', label: 'Type', type: 'select', required: true, default: 'Development', options: ['Development', 'Configuration'] },
          { name: 'module', label: 'Module', type: 'select', required: true, options: HIMS_MODULES.map((m) => m.name) },
          { name: 'developer', label: 'Developer', type: 'select', required: true, options: ['Sana Qureshi', 'Karthik Rao', 'Vikram Menon'] },
          { name: 'effortDays', label: 'Effort (days)', type: 'number', placeholder: '0' },
        ]} />
    </div>
  );
}
