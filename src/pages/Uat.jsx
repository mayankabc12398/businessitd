// Testing & UAT — module test coverage plus the bug tracker.
import { useState, useMemo } from 'react';
import { FlaskConical, Plus, Bug, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Tabs, Badge, StatusBadge, ProgressBar, Chip, FormDrawer, useToast } from '../components/ui';
import { fmtDate } from '../utils/format';
import { PROJECTS } from '../data/projects';
import { HIMS_MODULES, SEVERITIES } from '../data/masters';

const sevTone = { Critical: 'danger', High: 'warning', Medium: 'info', Low: 'neutral' };

export default function Uat() {
  const { data: cases, loading } = useApi(() => api.getUatCases());
  const { data: bugs, loading: bl } = useApi(() => api.getBugs());
  const { data: kpis } = useApi(() => api.getDeliveryKpis());
  const toast = useToast();
  const [tab, setTab] = useState('uat');
  const [proj, setProj] = useState('All');
  const [show, setShow] = useState(false);
  const [extraCases, setExtraCases] = useState([]);
  const [extraBugs, setExtraBugs] = useState([]);

  const allCases = useMemo(() => [...extraCases, ...(cases || [])], [extraCases, cases]);
  const allBugs = useMemo(() => [...extraBugs, ...(bugs || [])], [extraBugs, bugs]);
  const projOptions = useMemo(() => ['All', ...new Set(allCases.map((r) => r.projectName))], [allCases]);
  const fCases = useMemo(() => allCases.filter((r) => proj === 'All' || r.projectName === proj), [allCases, proj]);
  const fBugs = useMemo(() => allBugs.filter((r) => proj === 'All' || r.projectName === proj), [allBugs, proj]);

  const projName = (code) => { const p = PROJECTS.find((x) => x.code === code); return p ? p.name.split(' — ')[0] : code; };
  const addUat = (v) => {
    const total = Number(v.total) || 0;
    setExtraCases((prev) => [{
      id: `UAT-${String(allCases.length + 1).padStart(3, '0')}`, projectCode: v.projectCode, projectName: projName(v.projectCode),
      module: v.module, total, passed: 0, failed: 0, pending: total, status: 'Not Started',
      tester: 'Client + QA', uatDate: v.uatDate || '2026-07-24', signoff: 'Pending',
    }, ...prev]);
    toast.success('UAT round created', `${v.module}`);
    setShow(false);
  };
  const addBug = (v) => {
    setExtraBugs((prev) => [{
      id: `BUG-${String(allBugs.length + 1).padStart(3, '0')}`, projectCode: v.projectCode, projectName: projName(v.projectCode),
      title: v.title, module: v.module, severity: v.severity, status: 'Open', reportedBy: 'Client UAT',
      assignedTo: v.assignedTo, reported: '2026-07-24', resolved: null,
    }, ...prev]);
    toast.success('Bug logged', v.title);
    setShow(false);
  };

  const uatCols = [
    { key: 'module', header: 'Module', minWidth: 170, render: (r) => <div><div className="fw-6 t-sm">{r.module}</div><div className="t-xs ink-3">{r.projectName}</div></div> },
    { key: 'total', header: 'Cases', align: 'right', accessor: (r) => r.total },
    { key: 'passed', header: 'Passed', align: 'right', accessor: (r) => r.passed, render: (r) => <Badge tone="success">{r.passed}</Badge> },
    { key: 'failed', header: 'Failed', align: 'right', accessor: (r) => r.failed, render: (r) => r.failed ? <Badge tone="danger">{r.failed}</Badge> : <span className="ink-3">0</span> },
    { key: 'cov', header: 'Coverage', minWidth: 140, accessor: (r) => Math.round(r.passed / r.total * 100), render: (r) => { const pct = Math.round(r.passed / r.total * 100); return <div style={{ minWidth: 120 }}><div className="flex justify-between t-xs mb-1"><span className="ink-3">{r.pending} pending</span><b>{pct}%</b></div><ProgressBar value={pct} color={pct === 100 ? 'var(--success)' : r.failed > 2 ? 'var(--danger)' : 'var(--primary)'} /></div>; } },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'signoff', header: 'Sign-off', render: (r) => r.signoff === 'Signed' ? <Badge tone="success"><CheckCircle2 size={11} /> Signed</Badge> : <Badge tone="pending">Pending</Badge> },
  ];

  const bugCols = [
    { key: 'id', header: 'ID', width: 90, render: (r) => <span className="mono t-xs ink-3">{r.id}</span> },
    { key: 'title', header: 'Bug', minWidth: 240, render: (r) => <div><div className="fw-6 t-sm">{r.title}</div><div className="t-xs ink-3">{r.projectName} · {r.module}</div></div> },
    { key: 'severity', header: 'Severity', render: (r) => <Badge tone={sevTone[r.severity]}>{r.severity}</Badge> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'assigned', header: 'Assigned To' },
    { key: 'reported', header: 'Reported', accessor: (r) => r.reported, nowrap: true, render: (r) => fmtDate(r.reported) },
    { key: 'resolved', header: 'Resolved', accessor: (r) => r.resolved, nowrap: true, render: (r) => r.resolved ? fmtDate(r.resolved) : '—' },
  ];

  return (
    <div className="page">
      <PageHeader icon={<FlaskConical size={22} />} tint="lavender" title="Testing & UAT" desc="Module test coverage, client UAT sign-off and bug tracker"
        crumbs={[{ label: 'Build & Validate' }, { label: 'UAT' }]}
        actions={<button className="btn btn-primary" onClick={() => toast.info(tab === 'uat' ? 'Add UAT round' : 'Log bug')}><Plus size={15} /> {tab === 'uat' ? 'New UAT Round' : 'Log Bug'}</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Modules in UAT" value={kpis?.uatModules ?? '—'} tint="lavender" icon={<FlaskConical size={19} />} footer={`${kpis?.uatPassed ?? 0} fully passed`} />
        <MetricCard label="Pass Rate" value={cases ? `${Math.round(cases.reduce((s,c)=>s+c.passed,0)/cases.reduce((s,c)=>s+c.total,0)*100)}%` : '—'} tint="green" icon={<CheckCircle2 size={19} />} footer="Weighted across cases" />
        <MetricCard label="Open Bugs" value={kpis?.bugsOpen ?? '—'} tint="peach" icon={<Bug size={19} />} footer={`${kpis?.bugsCritical ?? 0} critical`} />
        <MetricCard label="Critical Bugs" value={kpis?.bugsCritical ?? '—'} tint="rose" icon={<ShieldAlert size={19} />} footer="Blocking go-live" />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <Tabs active={tab} onChange={setTab} tabs={[{ key: 'uat', label: 'UAT Coverage', count: (cases || []).length }, { key: 'bugs', label: 'Bug Tracker', count: (bugs || []).length }]} />
        <div className="flex items-center gap-2 flex-wrap">{projOptions.map((p) => <Chip key={p} active={proj === p} onClick={() => setProj(p)}>{p}</Chip>)}</div>
      </div>

      {tab === 'uat'
        ? <DataTable columns={uatCols} rows={fCases} loading={loading} exportName="uat-coverage.csv" searchPlaceholder="Search modules…" pageSize={15} />
        : <DataTable columns={bugCols} rows={fBugs} loading={bl} exportName="bugs.csv" searchPlaceholder="Search bugs…" pageSize={15} />}
    </div>
  );
}
