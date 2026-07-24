// Go-Live — Readiness (checklist), Live Data Import (Module 10),
// Parallel Go-Live (Module 11) and Final Go-Live (Module 12).
import { useState, useMemo } from 'react';
import {
  Rocket, CheckCircle2, Clock, Circle, CalendarClock, ShieldCheck, Database,
  Upload, Activity, Award, Star, AlertTriangle, FileCheck2,
} from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import {
  PageHeader, MetricCard, Tabs, DataTable, Drawer, Badge, StatusBadge, ProgressRing,
  ProgressBar, Skeleton, FormDrawer, useToast,
} from '../components/ui';
import { fmtDate, fmtNum } from '../utils/format';
import { PROJECTS } from '../data/projects';

const CHK_ICON = { Done: <CheckCircle2 size={15} color="var(--success)" />, 'In Progress': <Clock size={15} color="var(--info)" />, Pending: <Circle size={14} color="var(--text-3)" /> };
const readyTone = (s) => ({ Ready: 'success', 'Almost Ready': 'warning', Preparing: 'info' }[s] || 'neutral');
const LIVE_MASTERS = ['Doctors / Consultants', 'Services & Tariff', 'Pharmacy Items', 'Lab Tests', 'Patients (Active)', 'Outstanding Bills', 'Stock / Inventory', 'Insurance Panels', 'Ledger Balances'];
const projName = (code) => { const p = PROJECTS.find((x) => x.code === code); return p ? p.name.split(' — ')[0] : code; };

export default function GoLive() {
  const { data: readiness, loading } = useApi(() => api.getGoLiveReadiness());
  const { data: imports } = useApi(() => api.getLiveImports());
  const { data: parallel } = useApi(() => api.getParallelGoLive());
  const { data: finalGl } = useApi(() => api.getFinalGoLive());
  const { data: kpis } = useApi(() => api.getGoLiveKpis());
  const toast = useToast();
  const [tab, setTab] = useState('readiness');
  const [active, setActive] = useState(null);
  const [showCutover, setShowCutover] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [xImports, setXImports] = useState([]);
  const [xFinal, setXFinal] = useState([]);

  const allImports = useMemo(() => [...xImports, ...(imports || [])], [xImports, imports]);
  const allFinal = useMemo(() => [...xFinal, ...(finalGl || [])], [xFinal, finalGl]);

  const addImport = (v) => {
    const total = Number(v.records) || 0; const failed = Number(v.failed) || 0;
    setXImports((p) => [{
      id: `LIM-${p.length + 900}`, projectCode: v.projectCode, projectName: projName(v.projectCode), master: v.master,
      importDate: '2026-07-24', importedBy: v.importedBy || 'PMO', records: total, failed,
      validation: failed > 0 ? 'Errors' : 'Passed', status: failed > 0 ? 'Imported (errors)' : 'Imported',
    }, ...p]);
    toast.success('Live import recorded', `${v.master} · ${fmtNum(total)} records`);
    setShowImport(false);
  };
  const addFinal = (v) => {
    const p = PROJECTS.find((x) => x.code === v.projectCode);
    const pending = Number(v.pendingItems) || 0;
    setXFinal((prev) => [{
      id: `FGL-${v.projectCode}-n`, projectCode: v.projectCode, projectName: projName(v.projectCode),
      goLiveDate: v.goLiveDate, approvedBy: v.approvedBy || 'Client CIO', modulesLive: p ? p.modules.length : 0, modulesTotal: p ? p.modules.length : 0,
      pendingItems: pending, certificate: pending === 0 ? 'Issued' : 'Draft', signoff: pending === 0 ? 'Signed' : 'Pending',
      status: pending === 0 ? 'Live' : 'Live (with punch-list)',
    }, ...prev]);
    toast.success('Final go-live recorded', projName(v.projectCode));
    setShowFinal(false);
  };

  const avg = readiness && readiness.length ? Math.round(readiness.reduce((s, r) => s + r.readiness, 0) / readiness.length) : 0;

  const addAction = tab === 'imports'
    ? <button className="btn btn-primary" onClick={() => setShowImport(true)}><Upload size={15} /> Record Import</button>
    : tab === 'final'
      ? <button className="btn btn-primary" onClick={() => setShowFinal(true)}><Award size={15} /> Record Go-Live</button>
      : <button className="btn btn-primary" onClick={() => setShowCutover(true)}><ShieldCheck size={15} /> Cutover Plan</button>;

  const importCols = [
    { key: 'master', header: 'Master', minWidth: 170, render: (r) => <div><div className="fw-6 t-sm">{r.master}</div><div className="t-xs ink-3">{r.projectName}</div></div> },
    { key: 'importDate', header: 'Import Date', accessor: (r) => r.importDate, nowrap: true, render: (r) => r.importDate ? fmtDate(r.importDate) : '—' },
    { key: 'importedBy', header: 'Imported By' },
    { key: 'records', header: 'Records', align: 'right', accessor: (r) => r.records, render: (r) => <b className="tabular">{fmtNum(r.records)}</b> },
    { key: 'failed', header: 'Failed', align: 'right', accessor: (r) => r.failed, render: (r) => r.failed ? <Badge tone="danger">{r.failed}</Badge> : <span className="ink-3">0</span> },
    { key: 'validation', header: 'Validation', render: (r) => r.validation === 'Passed' ? <Badge tone="success">Passed</Badge> : r.validation === 'Errors' ? <Badge tone="danger"><AlertTriangle size={11} /> Errors</Badge> : <Badge tone="pending">Pending</Badge> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];
  const finalCols = [
    { key: 'project', header: 'Project', minWidth: 180, render: (r) => <div><div className="fw-6 t-sm">{r.projectName}</div><div className="t-xs ink-3 mono">{r.projectCode}</div></div> },
    { key: 'goLiveDate', header: 'Go-Live Date', accessor: (r) => r.goLiveDate, nowrap: true, render: (r) => fmtDate(r.goLiveDate) },
    { key: 'approvedBy', header: 'Approved By' },
    { key: 'modules', header: 'Modules Live', align: 'center', accessor: (r) => r.modulesLive, render: (r) => <Badge tone="info">{r.modulesLive}/{r.modulesTotal}</Badge> },
    { key: 'pending', header: 'Pending', align: 'center', accessor: (r) => r.pendingItems, render: (r) => r.pendingItems ? <Badge tone="warning">{r.pendingItems}</Badge> : <span className="ink-3">0</span> },
    { key: 'cert', header: 'Certificate', render: (r) => r.certificate === 'Issued' ? <Badge tone="success"><Award size={11} /> Issued</Badge> : r.certificate === 'Draft' ? <Badge tone="pending">Draft</Badge> : <span className="ink-3">—</span> },
    { key: 'signoff', header: 'Sign-off', render: (r) => r.signoff === 'Signed' ? <Badge tone="success">Signed</Badge> : r.signoff === 'Pending' ? <Badge tone="pending">Pending</Badge> : <span className="ink-3">—</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Rocket size={22} />} tint="green" title="Go-Live" desc="Readiness, live data import, parallel run & final go-live cutover"
        crumbs={[{ label: 'Build & Validate' }, { label: 'Go-Live' }]} actions={addAction} />

      <div className="kpi-grid stagger">
        <MetricCard label="Ready to Go-Live" value={kpis?.readyProjects ?? '—'} tint="green" icon={<CheckCircle2 size={19} />} footer={`avg readiness ${avg}%`} />
        <MetricCard label="Live Imports Done" value={`${kpis?.liveImports ?? 0}/${kpis?.liveImportsTotal ?? 0}`} tint="lemon" icon={<Database size={19} />} footer={kpis ? `${fmtNum(kpis.liveRecords)} records` : '—'} />
        <MetricCard label="Parallel Runs Active" value={kpis?.parallelRunning ?? '—'} tint="sky" icon={<Activity size={19} />} footer="In transition" />
        <MetricCard label="Projects Live" value={kpis?.finalLive ?? '—'} tint="mint" icon={<Award size={19} />} footer={`${kpis?.certsIssued ?? 0} certificates issued`} />
      </div>

      <Tabs active={tab} onChange={setTab} tabs={[
        { key: 'readiness', label: 'Readiness', count: readiness?.length },
        { key: 'imports', label: 'Live Data Import', count: allImports.length },
        { key: 'parallel', label: 'Parallel Go-Live', count: parallel?.length },
        { key: 'final', label: 'Final Go-Live', count: allFinal.length },
      ]} />

      {tab === 'readiness' && (
        loading ? <div className="kpi-grid">{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={180} r={16} />)}</div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }} className="stagger">
            {readiness.map((r) => (
              <button key={r.projectCode} className="card card-pad card-hover" style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => setActive(r)}>
                <div className="flex items-center justify-between mb-3">
                  <div style={{ minWidth: 0 }}><div className="fw-7 t-md truncate">{r.projectName}</div><div className="t-xs ink-3 mono">{r.projectCode}</div></div>
                  <Badge tone={readyTone(r.status)}>{r.status}</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <ProgressRing value={r.readiness} size={72} color={r.readiness >= 90 ? 'var(--success)' : r.readiness >= 70 ? 'var(--warning)' : 'var(--info)'} />
                  <div className="flex-1">
                    <div className="t-xs ink-3 mb-1">Target go-live</div>
                    <div className="fw-7 t-md flex items-center gap-1"><CalendarClock size={14} /> {fmtDate(r.targetGoLive)}</div>
                    <div className="t-sm ink-2 mt-2">{r.items.filter((i) => i.status === 'Done').length}/{r.items.length} checklist items complete</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )
      )}

      {tab === 'imports' && <DataTable columns={importCols} rows={allImports} exportName="live-imports.csv" searchPlaceholder="Search masters, projects…" pageSize={12} />}

      {tab === 'parallel' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }} className="stagger">
          {(parallel || []).map((p) => (
            <div key={p.id} className="card card-pad">
              <div className="flex items-center justify-between mb-3">
                <div style={{ minWidth: 0 }}><div className="fw-7 t-md truncate">{p.projectName}</div><div className="t-xs ink-3 mono">{p.projectCode}</div></div>
                <StatusBadge status={p.status} />
              </div>
              <div className="detail-list">
                <div className="detail-row"><span className="detail-key">Window</span><span className="detail-val">{fmtDate(p.startDate)} → {fmtDate(p.endDate)} ({p.days}d)</span></div>
                <div className="detail-row"><span className="detail-key">Support Engineer</span><span className="detail-val">{p.supportEngineer}</span></div>
                <div className="detail-row"><span className="detail-key">Daily Status</span><span className="detail-val"><Badge tone={p.dailyStatus === 'Stable' ? 'success' : p.dailyStatus === 'Critical watch' ? 'danger' : 'warning'}>{p.dailyStatus}</Badge></span></div>
                <div className="detail-row"><span className="detail-key">Client Feedback</span><span className="detail-val"><Badge tone="warning"><Star size={11} /> {p.clientFeedback}</Badge></span></div>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between t-xs mb-1"><span className="ink-3">Issues resolved</span><b>{p.issuesResolved}/{p.issuesLogged}</b></div>
                <ProgressBar value={Math.round(p.issuesResolved / Math.max(1, p.issuesLogged) * 100)} color="var(--success)" />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'final' && <DataTable columns={finalCols} rows={allFinal} exportName="final-golive.csv" searchPlaceholder="Search projects…" pageSize={12} />}

      {/* Readiness detail drawer */}
      <Drawer open={!!active} onClose={() => setActive(null)} size="md" title={active ? `${active.projectName} — Go-Live Readiness` : ''} subtitle={active ? `${active.projectCode} · target ${fmtDate(active.targetGoLive)}` : ''}
        headerExtra={active && <Badge tone={readyTone(active.status)}>{active.readiness}%</Badge>}
        footer={<><button className="btn btn-ghost" onClick={() => setActive(null)}>Close</button><button className="btn btn-primary"><FileCheck2 size={14} /> Issue Go-Live Certificate</button></>}>
        {active && (
          <div className="flex-col gap-3">
            <ProgressBar value={active.readiness} height={9} color={active.readiness >= 90 ? 'var(--success)' : 'var(--warning)'} />
            <div className="card" style={{ overflow: 'hidden' }}>
              <table className="data-table"><thead><tr><th>Checklist Item</th><th>Owner</th><th>Status</th></tr></thead>
                <tbody>{active.items.map((it, i) => <tr key={i}><td className="fw-6 t-sm">{it.item}</td><td><Badge tone="neutral">{it.owner}</Badge></td><td><span className="flex items-center gap-1 t-sm">{CHK_ICON[it.status]} {it.status}</span></td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add forms */}
      <FormDrawer open={showCutover} onClose={() => setShowCutover(false)} title="Create Cutover Plan" subtitle="Define the go-live cutover window and steps"
        submitLabel="Save Plan" submitIcon={<ShieldCheck size={14} />}
        onSubmit={(v) => { toast.success('Cutover plan saved', projName(v.projectCode)); setShowCutover(false); }}
        fields={[
          { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: PROJECTS.filter((p) => p.status !== 'Completed').map((p) => ({ value: p.code, label: p.name })) },
          { name: 'cutoverDate', label: 'Cutover Date', type: 'date', required: true },
          { name: 'window', label: 'Downtime Window', placeholder: 'e.g. 02:00 – 06:00' },
          { name: 'lead', label: 'Cutover Lead', type: 'select', options: ['Rahul Sharma', 'Priya Nair', 'Karthik Rao'] },
          { name: 'rollback', label: 'Rollback Owner', placeholder: 'Owner name' },
          { name: 'steps', label: 'Cutover Steps', type: 'textarea', full: true, rows: 4, placeholder: 'List the sequenced cutover steps…' },
        ]} />

      <FormDrawer open={showImport} onClose={() => setShowImport(false)} title="Record Live Data Import" subtitle="Production master import at go-live"
        submitLabel="Record Import" submitIcon={<Upload size={14} />} onSubmit={addImport}
        fields={[
          { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: PROJECTS.map((p) => ({ value: p.code, label: p.name })) },
          { name: 'master', label: 'Master', type: 'select', required: true, options: LIVE_MASTERS },
          { name: 'importedBy', label: 'Imported By', type: 'select', options: ['Karthik Rao', 'Sana Qureshi', 'Vikram Menon'] },
          { name: 'records', label: 'Records Imported', type: 'number', required: true, placeholder: '0' },
          { name: 'failed', label: 'Failed Records', type: 'number', placeholder: '0' },
        ]} />

      <FormDrawer open={showFinal} onClose={() => setShowFinal(false)} title="Record Final Go-Live" subtitle="Production cutover completion"
        submitLabel="Record Go-Live" submitIcon={<Award size={14} />} onSubmit={addFinal}
        fields={[
          { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: PROJECTS.map((p) => ({ value: p.code, label: p.name })) },
          { name: 'goLiveDate', label: 'Go-Live Date', type: 'date', required: true },
          { name: 'approvedBy', label: 'Approved By', placeholder: 'Client authority' },
          { name: 'pendingItems', label: 'Pending Items', type: 'number', placeholder: '0' },
        ]} />
    </div>
  );
}
