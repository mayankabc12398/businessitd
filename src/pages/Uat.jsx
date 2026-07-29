// Testing & UAT — module test coverage plus the bug tracker.
import { useState, useMemo } from 'react';
import { FlaskConical, Plus, Bug, CheckCircle2, ShieldAlert, Tag, AlignLeft, User, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Tabs, Badge, StatusBadge, ProgressBar, Chip, Drawer, DetailRow, FormDrawer, useToast } from '../components/ui';
import { fmtDate } from '../utils/format';
import { HIMS_MODULES, SEVERITIES } from '../data/masters';
import { BUG_CATEGORIES } from '../data/delivery';

const sevTone = { Critical: 'danger', High: 'warning', Medium: 'info', Low: 'neutral' };

export default function Uat() {
  const { data: cases, loading, reload: reloadCases } = useApi(() => api.getUatCases());
  const { data: bugs, loading: bl, reload: reloadBugs } = useApi(() => api.getBugs());
  const { data: kpis } = useApi(() => api.getDeliveryKpis());
  const { data: projects } = useApi(() => api.getProjects());
  const toast = useToast();
  const [tab, setTab] = useState('uat');
  const [proj, setProj] = useState('All');
  const [show, setShow] = useState(false);
  const [extraCases] = useState([]);
  const [extraBugs] = useState([]);
  const [activeUat, setActiveUat] = useState(null);
  const [activeBug, setActiveBug] = useState(null);

  const allCases = useMemo(() => [...extraCases, ...(cases || [])], [extraCases, cases]);
  const allBugs = useMemo(() => [...extraBugs, ...(bugs || [])], [extraBugs, bugs]);
  const projOptions = useMemo(() => ['All', ...new Set(allCases.map((r) => r.projectName))], [allCases]);
  const fCases = useMemo(() => allCases.filter((r) => proj === 'All' || r.projectName === proj), [allCases, proj]);
  const fBugs = useMemo(() => allBugs.filter((r) => proj === 'All' || r.projectName === proj), [allBugs, proj]);

  const addUat = async (v) => {
    const total = Number(v.total) || 0;
    const modules = Array.isArray(v.module) ? v.module : v.module ? [v.module] : [];
    try {
      await Promise.all(modules.map((module) => api.createUatCase({
        project: v.projectCode, module, total, passed: 0, failed: 0, pending: total,
        status: 'Not Started', tester: 'Client + QA', uatDate: v.uatDate || '2026-07-24', signoff: 'Pending',
      })));
      toast.success('UAT round created', `${modules.length} module${modules.length > 1 ? 's' : ''}`);
      setShow(false);
      reloadCases();
    } catch (e) {
      toast.error('Could not save', e?.message || 'Request failed');
    }
  };
  const addBug = async (v) => {
    try {
      await api.createBug({
        project: v.projectCode, title: v.title, severity: v.severity, module: v.module,
        category: v.category, status: 'Open', details: v.details || '',
        reportedBy: 'Client UAT', assignedTo: v.assignedTo, reported: '2026-07-24',
      });
      toast.success('Bug logged', v.title);
      setShow(false);
      reloadBugs();
    } catch (e) {
      toast.error('Could not save', e?.message || 'Request failed');
    }
  };

  const uatCols = [
    { key: 'module', header: 'Module', minWidth: 170, render: (r) => <div><div className="fw-6 t-sm">{r.module}</div><div className="t-xs ink-3">{r.projectName}</div></div> },
    { key: 'total', header: 'Cases', align: 'right', accessor: (r) => r.total },
    { key: 'passed', header: 'Passed', align: 'right', accessor: (r) => r.passed, render: (r) => <Badge tone="success">{r.passed}</Badge> },
    { key: 'failed', header: 'Failed', align: 'right', accessor: (r) => r.failed, render: (r) => r.failed ? <Badge tone="danger">{r.failed}</Badge> : <span className="ink-3">0</span> },
    { key: 'cov', header: 'Coverage', minWidth: 140, accessor: (r) => Math.round(r.passed / r.total * 100), render: (r) => { const pct = Math.round(r.passed / r.total * 100); return <div style={{ minWidth: 120 }}><div className="flex justify-between t-xs mb-1"><span className="ink-3">{r.pending} pending</span><b>{pct}%</b></div><ProgressBar value={pct} color={pct === 100 ? 'var(--success)' : r.failed > 2 ? 'var(--danger)' : 'var(--primary)'} /></div>; } },
    { key: 'bugCategory', header: 'Bug Category', render: (r) => r.bugCategory && r.bugCategory !== '—' ? <Badge tone="info"><Tag size={10} /> {r.bugCategory}</Badge> : <span className="ink-3">—</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'signoff', header: 'Sign-off', render: (r) => r.signoff === 'Signed' ? <Badge tone="success"><CheckCircle2 size={11} /> Signed</Badge> : <Badge tone="pending">Pending</Badge> },
  ];

  const bugCols = [
    { key: 'id', header: 'ID', width: 90, render: (r) => <span className="mono t-xs ink-3">{r.id}</span> },
    { key: 'title', header: 'Bug', minWidth: 240, render: (r) => <div><div className="fw-6 t-sm">{r.title}</div><div className="t-xs ink-3">{r.projectName} · {r.module}</div></div> },
    { key: 'category', header: 'Category', render: (r) => r.category ? <Badge tone="info"><Tag size={10} /> {r.category}</Badge> : <span className="ink-3">—</span> },
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
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> {tab === 'uat' ? 'New UAT Round' : 'Log Bug'}</button>} />

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
        ? <DataTable columns={uatCols} rows={fCases} loading={loading} onRowClick={(r) => setActiveUat(r)} exportName="uat-coverage.csv" searchPlaceholder="Search modules…" pageSize={15} />
        : <DataTable columns={bugCols} rows={fBugs} loading={bl} onRowClick={(r) => setActiveBug(r)} exportName="bugs.csv" searchPlaceholder="Search bugs…" pageSize={15} />}

      {tab === 'uat' ? (
        <FormDrawer key="uat-form" open={show} onClose={() => setShow(false)} title="New UAT Round" subtitle="Create a module UAT test cycle"
          submitLabel="Create Round" onSubmit={addUat}
          fields={[
            { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: (projects || []).filter((p) => p.status !== 'Completed').map((p) => ({ value: p.code, label: p.name })) },
            { name: 'module', label: 'Module', type: 'multiselect', required: true, options: HIMS_MODULES.map((m) => m.name), placeholder: 'Select one or more…' },
            { name: 'total', label: 'Test Cases', type: 'number', required: true, placeholder: '0' },
            { name: 'bugCategory', label: 'Bug Category', type: 'select', options: BUG_CATEGORIES },
            { name: 'uatDate', label: 'UAT Date', type: 'date' },
            { name: 'fromDate', label: 'From Date', type: 'date' },
            { name: 'toDate', label: 'To Date', type: 'date' },
            { name: 'bugSummary', label: 'Bug Summary', type: 'textarea', full: true, rows: 3, placeholder: 'Summary of bugs / observations found in this round…' },
          ]} />
      ) : (
        <FormDrawer key="bug-form" open={show} onClose={() => setShow(false)} title="Log Bug" subtitle="Report a defect found during testing"
          submitLabel="Log Bug" onSubmit={addBug}
          fields={[
            { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: (projects || []).filter((p) => p.status !== 'Completed').map((p) => ({ value: p.code, label: p.name })) },
            { name: 'title', label: 'Bug Summary', required: true, full: true, placeholder: 'Short one-line summary…' },
            { name: 'category', label: 'Bug Category', type: 'select', required: true, default: 'Functional', options: BUG_CATEGORIES },
            { name: 'severity', label: 'Severity', type: 'select', required: true, default: 'Medium', options: SEVERITIES },
            { name: 'module', label: 'Module', type: 'select', required: true, options: HIMS_MODULES.map((m) => m.name) },
            { name: 'assignedTo', label: 'Assign To', type: 'select', required: true, options: ['Sana Qureshi', 'Karthik Rao', 'Vikram Menon'] },
            { name: 'details', label: 'Summary / Details', type: 'textarea', full: true, rows: 4, placeholder: 'Steps to reproduce, expected vs actual, environment…' },
          ]} />
      )}

      {/* UAT round detail slide */}
      <Drawer open={!!activeUat} onClose={() => setActiveUat(null)} size="md"
        title={activeUat ? `${activeUat.module} — UAT Round` : ''} subtitle={activeUat ? `${activeUat.id} · ${activeUat.projectName}` : ''}
        headerExtra={activeUat && <StatusBadge status={activeUat.status} />}
        footer={<button className="btn btn-ghost" onClick={() => setActiveUat(null)}>Close</button>}>
        {activeUat && (
          <div className="flex-col gap-4">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[['Cases', activeUat.total, 'lavender'], ['Passed', activeUat.passed, 'green'], ['Failed', activeUat.failed, 'rose'], ['Pending', activeUat.pending, 'peach']].map(([l, v, t]) => (
                <div key={l} className="card card-pad text-center">
                  <div className="t-2xl fw-8" style={{ color: `var(--tint-${t}-ink)` }}>{v}</div>
                  <div className="t-xs ink-3">{l}</div>
                </div>
              ))}
            </div>
            <div className="card card-pad">
              <div className="flex justify-between t-xs mb-1"><span className="ink-3">Coverage</span><b>{Math.round(activeUat.passed / activeUat.total * 100)}%</b></div>
              <ProgressBar value={Math.round(activeUat.passed / activeUat.total * 100)} color={activeUat.passed === activeUat.total ? 'var(--success)' : 'var(--primary)'} />
            </div>
            {activeUat.bugSummary && (
              <div className="card card-pad">
                <div className="flex items-center gap-2 card-title mb-2"><AlignLeft size={15} /> Bug Summary</div>
                <div className="t-sm ink-2" style={{ lineHeight: 1.6 }}>{activeUat.bugSummary}</div>
              </div>
            )}
            <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
              <div className="detail-list">
                <DetailRow label="Project">{activeUat.projectName} <span className="mono t-xs ink-3">({activeUat.projectCode})</span></DetailRow>
                <DetailRow label="Module"><Badge tone="info">{activeUat.module}</Badge></DetailRow>
                <DetailRow label="Bug Category">{activeUat.bugCategory && activeUat.bugCategory !== '—' ? <Badge tone="info"><Tag size={11} /> {activeUat.bugCategory}</Badge> : '—'}</DetailRow>
                <DetailRow label="Tester">{activeUat.tester}</DetailRow>
                <DetailRow label="UAT Date">{fmtDate(activeUat.uatDate)}</DetailRow>
                {(activeUat.fromDate || activeUat.toDate) && <DetailRow label="Test Window">{activeUat.fromDate ? fmtDate(activeUat.fromDate) : '—'} → {activeUat.toDate ? fmtDate(activeUat.toDate) : '—'}</DetailRow>}
                <DetailRow label="Status"><StatusBadge status={activeUat.status} /></DetailRow>
                <DetailRow label="Sign-off">{activeUat.signoff === 'Signed' ? <Badge tone="success"><CheckCircle2 size={11} /> Signed</Badge> : <Badge tone="pending">Pending</Badge>}</DetailRow>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Bug detail slide */}
      <Drawer open={!!activeBug} onClose={() => setActiveBug(null)} size="md"
        title={activeBug ? activeBug.title : ''} subtitle={activeBug ? `${activeBug.id} · ${activeBug.projectName}` : ''}
        headerExtra={activeBug && <Badge tone={sevTone[activeBug.severity]}>{activeBug.severity}</Badge>}
        footer={<button className="btn btn-ghost" onClick={() => setActiveBug(null)}>Close</button>}>
        {activeBug && (
          <div className="flex-col gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {activeBug.category && <Badge tone="info"><Tag size={11} /> {activeBug.category}</Badge>}
              <Badge tone={sevTone[activeBug.severity]}><ShieldAlert size={11} /> {activeBug.severity}</Badge>
              <StatusBadge status={activeBug.status} />
            </div>
            <div className="card card-pad">
              <div className="flex items-center gap-2 card-title mb-2"><AlignLeft size={15} /> Summary / Details</div>
              <div className="t-sm ink-2" style={{ lineHeight: 1.6 }}>{activeBug.details || 'No additional details provided.'}</div>
            </div>
            <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
              <div className="detail-list">
                <DetailRow label="Project">{activeBug.projectName} <span className="mono t-xs ink-3">({activeBug.projectCode})</span></DetailRow>
                <DetailRow label="Module"><Badge tone="neutral">{activeBug.module}</Badge></DetailRow>
                <DetailRow label="Category">{activeBug.category || '—'}</DetailRow>
                <DetailRow label="Reported By"><span className="flex items-center gap-1"><User size={13} /> {activeBug.reportedBy}</span></DetailRow>
                <DetailRow label="Assigned To"><span className="flex items-center gap-1"><User size={13} /> {activeBug.assignedTo}</span></DetailRow>
                <DetailRow label="Reported"><span className="flex items-center gap-1"><Calendar size={13} /> {fmtDate(activeBug.reported)}</span></DetailRow>
                <DetailRow label="Resolved">{activeBug.resolved ? <span className="flex items-center gap-1"><Calendar size={13} /> {fmtDate(activeBug.resolved)}</span> : '—'}</DetailRow>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
