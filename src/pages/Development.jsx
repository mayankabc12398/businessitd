// Development & Configuration — deployment items & server/access credentials.
import { useState, useMemo } from 'react';
import {
  Code2, Plus, Rocket, Wrench, CheckCircle2, Server, MonitorSmartphone,
  Database, Globe, KeyRound, Copy, Eye, EyeOff, ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, StatusBadge, ProgressBar, Chip, Drawer, DetailRow, FormDrawer, useToast } from '../components/ui';
import { fmtDate } from '../utils/format';
import { PROJECTS } from '../data/projects';

const typeTone = { Development: 'info', Configuration: 'pending', Deployment: 'success' };
const envTone = { Production: 'danger', UAT: 'warning', Staging: 'info', Training: 'neutral' };

export default function Development() {
  const { data: rows, loading } = useApi(() => api.getDevItems());
  const { data: kpis } = useApi(() => api.getDeliveryKpis());
  const toast = useToast();
  const [proj, setProj] = useState('All');
  const [typeF, setTypeF] = useState('All');
  const [show, setShow] = useState(false);
  const [extra, setExtra] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const allRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const projOptions = useMemo(() => ['All', ...new Set(allRows.map((r) => r.projectName))], [allRows]);
  const filtered = useMemo(() => allRows.filter((r) => (proj === 'All' || r.projectName === proj) && (typeF === 'All' || r.type === typeF)), [allRows, proj, typeF]);
  const activeRow = useMemo(() => allRows.find((r) => r.id === activeId) || null, [allRows, activeId]);

  const addItem = (v) => {
    const p = PROJECTS.find((x) => x.code === v.projectCode);
    setExtra((prev) => [{
      id: `DEP-${String(allRows.length + 1).padStart(3, '0')}`, projectCode: v.projectCode, projectName: p ? p.name.split(' — ')[0] : v.projectCode,
      feature: `${v.env} Deployment`, module: v.serverHost || '—', type: 'Deployment',
      env: v.env, serverHost: v.serverHost, serverUser: v.serverUser, serverPass: v.serverPass,
      anydeskId: v.anydeskId, anydeskPass: v.anydeskPass, dbName: v.dbName, dbUser: v.dbUser, dbPass: v.dbPass,
      appUrl: v.appUrl, notes: v.notes, developer: v.developer || 'PMO', status: 'Configured',
      scheduleDate: v.scheduleDate || null,
      effortDays: 0, devDate: null, deployDate: null, progress: 0,
    }, ...prev]);
    toast.success('Deployment credentials saved', `${v.env} · ${p ? p.name.split(' — ')[0] : ''}`);
    setShow(false);
  };

  const copy = (val, label) => {
    if (!val) return;
    navigator.clipboard?.writeText(String(val));
    toast.success('Copied', label);
  };

  const columns = [
    { key: 'feature', header: 'Item', minWidth: 200, render: (r) => <div><div className="fw-6 t-sm">{r.feature}</div><div className="t-xs ink-3">{r.projectName}{r.module ? ` · ${r.module}` : ''}</div></div> },
    { key: 'type', header: 'Type', render: (r) => <Badge tone={typeTone[r.type] || 'neutral'}>{r.type}</Badge> },
    { key: 'env', header: 'Environment', render: (r) => r.env ? <Badge tone={envTone[r.env] || 'neutral'}>{r.env}</Badge> : <span className="ink-3">—</span> },
    { key: 'access', header: 'Access', minWidth: 150, render: (r) => (r.serverHost || r.anydeskId) ? (
      <div className="flex-col gap-1">
        {r.serverHost && <span className="t-xs mono flex items-center gap-1"><Server size={11} /> {r.serverHost}</span>}
        {r.anydeskId && <span className="t-xs mono flex items-center gap-1 ink-3"><MonitorSmartphone size={11} /> {r.anydeskId}</span>}
      </div>
    ) : <span className="ink-3">—</span> },
    { key: 'developer', header: 'Deployed By' },
    { key: 'progress', header: 'Progress', minWidth: 120, accessor: (r) => r.progress, render: (r) => <div style={{ minWidth: 100 }}><div className="flex justify-between t-xs mb-1"><span /><b className="tabular">{r.progress}%</b></div><ProgressBar value={r.progress} color={r.progress === 100 ? 'var(--success)' : 'var(--primary)'} /></div> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'deploy', header: 'Deployed', accessor: (r) => r.deployDate, nowrap: true, render: (r) => r.deployDate ? fmtDate(r.deployDate) : '—' },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Code2 size={22} />} tint="peach" title="Development & Configuration" desc="Feature build, configuration & deployment access tracking"
        crumbs={[{ label: 'Build & Validate' }, { label: 'Development' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> Add Deployment</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Total Items" value={kpis?.devTotal ?? '—'} tint="peach" icon={<Code2 size={19} />} footer="Dev + config" />
        <MetricCard label="Deployed" value={kpis?.devDeployed ?? '—'} tint="green" icon={<Rocket size={19} />} footer="Live in UAT/prod" />
        <MetricCard label="In Development" value={(rows||[]).filter(r=>r.status==='In Development').length} tint="lavender" icon={<Wrench size={19} />} footer="Active build" />
        <MetricCard label="Configured" value={(rows||[]).filter(r=>r.status==='Configured').length} tint="cyan" icon={<CheckCircle2 size={19} />} footer="Ready to test" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap mb-1"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Project</span>{projOptions.map((p) => <Chip key={p} active={proj === p} onClick={() => setProj(p)}>{p}</Chip>)}</div>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Type</span>{['All', 'Deployment', 'Development', 'Configuration'].map((t) => <Chip key={t} active={typeF === t} onClick={() => setTypeF(t)}>{t}</Chip>)}</div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} onRowClick={(r) => setActiveId(r.id)}
        exportName="development.csv" searchPlaceholder="Search items, servers, projects…" pageSize={15} />

      {/* Deployment credentials detail */}
      <Drawer open={!!activeRow} onClose={() => setActiveId(null)} size="md"
        title={activeRow ? activeRow.feature : ''} subtitle={activeRow ? `${activeRow.id} · ${activeRow.projectName}` : ''}
        headerExtra={activeRow?.env && <Badge tone={envTone[activeRow.env] || 'neutral'}>{activeRow.env}</Badge>}
        footer={<button className="btn btn-ghost" onClick={() => setActiveId(null)}>Close</button>}>
        {activeRow && <CredentialsView row={activeRow} onCopy={copy} />}
      </Drawer>

      <FormDrawer open={show} onClose={() => setShow(false)} title="Add Deployment / Server Credentials" subtitle="Record server access, AnyDesk & credentials used for deployment"
        submitLabel="Save Credentials" onSubmit={addItem}
        fields={[
          { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: PROJECTS.filter((p) => p.status !== 'Completed').map((p) => ({ value: p.code, label: p.name })) },
          { name: 'scheduleDate', label: 'Schedule Date', type: 'date', full: true },
          { name: 'env', label: 'Environment', type: 'select', required: true, default: 'Production', options: ['Production', 'UAT', 'Staging', 'Training'] },
          { name: 'developer', label: 'Deployed By', type: 'select', required: true, options: ['Sana Qureshi', 'Karthik Rao', 'Vikram Menon'] },
          { name: 'serverHost', label: 'Server IP / Host', required: true, placeholder: '192.168.1.10 / server.hospital.local' },
          { name: 'serverUser', label: 'Server Username', placeholder: 'administrator' },
          { name: 'serverPass', label: 'Server Password', placeholder: '••••••••' },
          { name: 'anydeskId', label: 'AnyDesk ID', placeholder: '123 456 789' },
          { name: 'anydeskPass', label: 'AnyDesk Password', placeholder: '••••••••' },
          { name: 'dbName', label: 'Database Name', placeholder: 'HIMS_PROD' },
          { name: 'dbUser', label: 'DB Username', placeholder: 'sa' },
          { name: 'dbPass', label: 'DB Password', placeholder: '••••••••' },
          { name: 'appUrl', label: 'Application URL', full: true, placeholder: 'https://hims.hospital.com' },
          { name: 'notes', label: 'Notes', type: 'textarea', full: true, placeholder: 'VPN, ports, RDP or other access notes…' },
        ]} />
    </div>
  );
}

// ---- Credentials detail with reveal + copy ----
function CredentialsView({ row, onCopy }) {
  const [reveal, setReveal] = useState(false);
  const has = (...keys) => keys.some((k) => row[k]);

  return (
    <div className="flex-col gap-4">
      <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
        <div className="detail-list">
          <DetailRow label="Project">{row.projectName} <span className="mono t-xs ink-3">({row.projectCode})</span></DetailRow>
          <DetailRow label="Environment">{row.env ? <Badge tone={envTone[row.env] || 'neutral'}>{row.env}</Badge> : '—'}</DetailRow>
          <DetailRow label="Deployed By">{row.developer}</DetailRow>
          <DetailRow label="Schedule Date">{row.scheduleDate ? fmtDate(row.scheduleDate) : '—'}</DetailRow>
          <DetailRow label="Status"><StatusBadge status={row.status} /></DetailRow>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 card-title"><ShieldCheck size={15} /> Deployment Credentials</div>
        <button className="btn btn-ghost btn-sm" onClick={() => setReveal((r) => !r)}>
          {reveal ? <EyeOff size={14} /> : <Eye size={14} />} {reveal ? 'Hide' : 'Reveal'}
        </button>
      </div>

      {has('serverHost', 'serverUser', 'serverPass') && (
        <CredCard icon={<Server size={15} />} title="Server Access">
          <Cred label="Host / IP" value={row.serverHost} onCopy={onCopy} />
          <Cred label="Username" value={row.serverUser} onCopy={onCopy} />
          <Cred label="Password" value={row.serverPass} secret reveal={reveal} onCopy={onCopy} />
        </CredCard>
      )}

      {has('anydeskId', 'anydeskPass') && (
        <CredCard icon={<MonitorSmartphone size={15} />} title="AnyDesk">
          <Cred label="AnyDesk ID" value={row.anydeskId} onCopy={onCopy} />
          <Cred label="Password" value={row.anydeskPass} secret reveal={reveal} onCopy={onCopy} />
        </CredCard>
      )}

      {has('dbName', 'dbUser', 'dbPass') && (
        <CredCard icon={<Database size={15} />} title="Database">
          <Cred label="Database" value={row.dbName} onCopy={onCopy} />
          <Cred label="Username" value={row.dbUser} onCopy={onCopy} />
          <Cred label="Password" value={row.dbPass} secret reveal={reveal} onCopy={onCopy} />
        </CredCard>
      )}

      {has('appUrl', 'notes') && (
        <CredCard icon={<Globe size={15} />} title="Application">
          <Cred label="URL" value={row.appUrl} onCopy={onCopy} />
          {row.notes && <div className="t-sm ink-2" style={{ padding: '6px 2px' }}>{row.notes}</div>}
        </CredCard>
      )}

      {!has('serverHost', 'anydeskId', 'dbName', 'appUrl') && (
        <div className="card card-pad text-center t-sm ink-3">No deployment credentials recorded for this item.</div>
      )}
    </div>
  );
}

function CredCard({ icon, title, children }) {
  return (
    <div className="card card-pad">
      <div className="flex items-center gap-2 card-title mb-3">{icon} {title}</div>
      <div className="flex-col gap-2">{children}</div>
    </div>
  );
}

function Cred({ label, value, secret, reveal, onCopy }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px' }}>
      <span className="metric-icon" style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surface-3)', flexShrink: 0 }}>
        {secret ? <KeyRound size={13} color="var(--text-2)" /> : <span className="t-xs fw-7 ink-3">·</span>}
      </span>
      <div className="flex-1" style={{ minWidth: 0 }}>
        <div className="t-xs ink-3">{label}</div>
        <div className="t-sm fw-6 mono truncate">{secret && !reveal ? '••••••••' : value}</div>
      </div>
      <button className="icon-btn" style={{ width: 28, height: 28 }} title="Copy" onClick={() => onCopy(value, label)}><Copy size={13} /></button>
    </div>
  );
}
