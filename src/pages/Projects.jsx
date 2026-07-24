// Projects — registration, portfolio list, kanban board and a rich
// per-project lifecycle detail drawer. The flagship module.
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FolderKanban, Plus, LayoutGrid, Table2, Rocket, ClipboardCheck, AlertTriangle,
  CircleDollarSign, Pencil, Eye, MoreVertical, CheckCircle2, Clock, Ban,
  ArrowRight, FileSignature,
} from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import {
  PageHeader, MetricCard, DataTable, Drawer, Tabs, Segmented, Badge, StatusBadge,
  Avatar, ProgressBar, ProgressRing, Stepper, Timeline, DetailRow, Dropdown,
  Field, Input, Select, SearchSelect, TagInput, useToast, Chip, Skeleton,
} from '../components/ui';
import { fmtDate } from '../utils/format';
import { LIFECYCLE, PROJECT_STATUS, PRIORITIES, HEALTH, IMPLEMENTATION_TYPES, HIMS_MODULES } from '../data/masters';
import { CLIENTS, findClient } from '../data/clients';
import { TEAM, findUser } from '../data/team';

const money = (n, cur = 'INR') => {
  if (n == null) return '—';
  try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur, maximumFractionDigits: 0, notation: n >= 1e7 ? 'compact' : 'standard' }).format(n); }
  catch { return `${cur} ${n.toLocaleString()}`; }
};
const modName = (id) => HIMS_MODULES.find((m) => m.id === id)?.name ?? id;
const healthTone = (h) => ({ 'On Track': 'success', 'At Risk': 'warning', Delayed: 'danger', Blocked: 'danger', Planning: 'info' }[h] || 'neutral');
const MS_ICON = { Completed: <CheckCircle2 size={14} color="var(--success)" />, 'In Progress': <Clock size={14} color="var(--info)" />, Blocked: <Ban size={14} color="var(--danger)" />, Pending: <Clock size={14} color="var(--text-3)" /> };

// board columns group the 19-stage lifecycle into 5 phases
const BOARD = [
  { key: 'Discovery', stages: ['lead', 'registration', 'po', 'scope', 'kickoff'], tint: 'blue' },
  { key: 'Analysis', stages: ['srs', 'gap', 'masterdata'], tint: 'mint' },
  { key: 'Build', stages: ['development', 'configuration', 'testing'], tint: 'peach' },
  { key: 'Validation', stages: ['deployment', 'uat', 'training'], tint: 'lavender' },
  { key: 'Go-Live', stages: ['migration', 'parallel', 'golive', 'support', 'closure'], tint: 'green' },
];

export default function Projects() {
  const { data: projects, loading } = useApi(() => api.getProjects());
  const { data: kpis } = useApi(() => api.getProjectKpis());
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState('table');
  const [statusF, setStatusF] = useState('All');
  const [healthF, setHealthF] = useState('All');
  const [active, setActive] = useState(null);
  const [showNew, setShowNew] = useState(false);

  // deep-links from global search / quick actions
  useEffect(() => {
    if (params.get('new') === '1') { setShowNew(true); setParams({}, { replace: true }); }
    const code = params.get('code');
    if (code && projects) { const p = projects.find((x) => x.code === code); if (p) setActive(p); setParams({}, { replace: true }); }
  }, [params, projects, setParams]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) =>
      (statusF === 'All' || p.status === statusF) &&
      (healthF === 'All' || p.health === healthF)
    );
  }, [projects, statusF, healthF]);

  const columns = [
    {
      key: 'name', header: 'Project', minWidth: 260, render: (p) => (
        <div className="flex items-center gap-3">
          <Avatar name={findClient(p.clientId)?.name || p.name} hue={3} size="md" />
          <div style={{ minWidth: 0 }}>
            <div className="fw-6 ink-1 truncate">{p.name}</div>
            <div className="t-xs ink-3">{p.code} · {findClient(p.clientId)?.city}</div>
          </div>
        </div>
      ),
    },
    { key: 'stage', header: 'Current Stage', minWidth: 150, render: (p) => <Badge tone={healthTone(p.health)}>{LIFECYCLE.find((s) => s.key === p.currentStage)?.label}</Badge> },
    {
      key: 'progress', header: 'Progress', minWidth: 140, accessor: (p) => p.progress, render: (p) => (
        <div style={{ minWidth: 120 }}>
          <div className="flex items-center justify-between t-xs mb-1"><span className="ink-3">{p.milestonesDone}/{p.milestonesTotal}</span><b className="tabular">{p.progress}%</b></div>
          <ProgressBar value={p.progress} color={p.health === 'Delayed' ? 'var(--danger)' : p.health === 'At Risk' ? 'var(--warning)' : 'var(--primary)'} />
        </div>
      ),
    },
    { key: 'health', header: 'Health', render: (p) => <StatusBadge status={p.health} tone={healthTone(p.health)} /> },
    { key: 'priority', header: 'Priority', render: (p) => <Badge tone={{ Critical: 'danger', High: 'warning', Medium: 'info', Low: 'neutral' }[p.priority]}>{p.priority}</Badge> },
    { key: 'pm', header: 'Manager', render: (p) => { const u = findUser(p.pm); return <div className="flex items-center gap-2"><Avatar name={u?.name} hue={u?.avatarHue} size="sm" /><span className="t-sm hide-sm">{u?.name}</span></div>; } },
    { key: 'value', header: 'Contract', align: 'right', accessor: (p) => p.contractValue, render: (p) => <b className="tabular">{money(p.contractValue, p.currency)}</b> },
    { key: 'golive', header: 'Target Go-Live', accessor: (p) => p.targetGoLive, nowrap: true, render: (p) => <span className="t-sm">{fmtDate(p.targetGoLive)}</span> },
    {
      key: 'act', header: '', sortable: false, width: 44, render: (p) => (
        <Dropdown align="right" trigger={<button className="icon-btn" style={{ width: 30, height: 30 }}><MoreVertical size={15} /></button>}
          items={[
            { icon: <Eye size={14} />, label: 'Open details', onClick: () => setActive(p) },
            { icon: <Pencil size={14} />, label: 'Edit project', onClick: () => toast.info('Edit', p.code) },
            { icon: <FileSignature size={14} />, label: 'Record sign-off', onClick: () => toast.info('Sign-off', p.code) },
            { sep: true },
            { icon: <Ban size={14} />, label: 'Put on hold', danger: true, onClick: () => toast.warning('On hold', p.code) },
          ]} />
      ),
    },
  ];

  return (
    <div className="page">
      <PageHeader
        icon={<FolderKanban size={22} />} tint="blue" title="Projects"
        desc="End-to-end HIMS implementation tracking — registration to go-live"
        crumbs={[{ label: 'Delivery' }, { label: 'Projects' }]}
        actions={
          <>
            <Segmented size="sm" value={view} onChange={setView} options={[{ value: 'table', icon: <Table2 size={14} />, label: 'Table' }, { value: 'board', icon: <LayoutGrid size={14} />, label: 'Board' }]} />
            <button className="btn btn-primary" onClick={() => setShowNew(true)}><Plus size={15} /> New Project</button>
          </>
        }
      />

      <div className="kpi-grid stagger">
        <MetricCard label="Total Projects" value={kpis?.total ?? '—'} tint="blue" icon={<FolderKanban size={19} />} footer={`${kpis?.completed ?? 0} completed · ${kpis?.onHold ?? 0} on hold`} />
        <MetricCard label="In Progress" value={kpis?.inProgress ?? '—'} tint="mint" icon={<Rocket size={19} />} footer={`${kpis?.uat ?? 0} in UAT`} />
        <MetricCard label="At Risk / Delayed" value={kpis?.atRisk ?? '—'} tint="peach" icon={<AlertTriangle size={19} />} footer={`${kpis?.openIssues ?? 0} open issues`} />
        <MetricCard label="Portfolio Value" value={kpis ? money(kpis.contractValue) : '—'} tint="lavender" icon={<CircleDollarSign size={19} />} footer={`${kpis?.pendingSignoffs ?? 0} pending sign-offs`} />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Status</span>
          {['All', ...PROJECT_STATUS].map((s) => <Chip key={s} active={statusF === s} onClick={() => setStatusF(s)}>{s}</Chip>)}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Health</span>
          {['All', ...HEALTH].map((h) => <Chip key={h} active={healthF === h} onClick={() => setHealthF(h)}>{h}</Chip>)}
        </div>
      </div>

      {view === 'table' ? (
        <DataTable columns={columns} rows={filtered} loading={loading} onRowClick={setActive} exportName="projects.csv" searchPlaceholder="Search projects, codes, clients…" pageSize={10} />
      ) : (
        <Board projects={filtered} loading={loading} onOpen={setActive} />
      )}

      <ProjectDrawer project={active} onClose={() => setActive(null)} />
      <NewProjectDrawer open={showNew} onClose={() => setShowNew(false)} onSaved={(name) => { toast.success('Project registered', name); setShowNew(false); }} />
    </div>
  );
}

// ---------------- Kanban board ----------------
function Board({ projects, loading, onOpen }) {
  if (loading) return <div className="card card-pad"><Skeleton h={320} /></div>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(220px, 1fr))', gap: 14, overflowX: 'auto', paddingBottom: 6 }}>
      {BOARD.map((col) => {
        const items = projects.filter((p) => col.stages.includes(p.currentStage));
        return (
          <div key={col.key} className="card" style={{ background: 'var(--surface-2)', padding: 12, minWidth: 220 }}>
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 fw-7 t-sm"><span style={{ width: 9, height: 9, borderRadius: 3, background: `var(--tint-${col.tint}-ink)` }} />{col.key}</span>
              <Badge tone="neutral">{items.length}</Badge>
            </div>
            <div className="flex-col gap-2">
              {items.length === 0 && <div className="t-xs ink-3 text-center" style={{ padding: '18px 0' }}>No projects</div>}
              {items.map((p) => (
                <button key={p.code} className="card card-hover" style={{ padding: 12, textAlign: 'left', cursor: 'pointer' }} onClick={() => onOpen(p)}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="t-xs mono ink-3">{p.code}</span>
                    <Badge tone={healthTone(p.health)}>{p.health}</Badge>
                  </div>
                  <div className="fw-6 t-sm ink-1 mb-2" style={{ lineHeight: 1.3 }}>{p.name}</div>
                  <ProgressBar value={p.progress} color={p.health === 'Delayed' ? 'var(--danger)' : 'var(--primary)'} />
                  <div className="flex items-center justify-between mt-2">
                    <Avatar name={findUser(p.pm)?.name} hue={findUser(p.pm)?.avatarHue} size="sm" />
                    <span className="t-xs ink-3">{fmtDate(p.targetGoLive)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------- Detail drawer ----------------
function ProjectDrawer({ project, onClose }) {
  const [tab, setTab] = useState('overview');
  useEffect(() => { if (project) setTab('overview'); }, [project]);
  if (!project) return null;
  const p = project;
  const client = findClient(p.clientId);
  const curIdx = LIFECYCLE.findIndex((s) => s.key === p.currentStage);

  return (
    <Drawer open={!!project} onClose={onClose} size="lg" title={p.name}
      subtitle={`${p.code} · ${client?.name} · ${client?.city}, ${client?.country}`}
      headerExtra={<Badge tone={healthTone(p.health)}>{p.health}</Badge>}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn btn-outline"><Pencil size={14} /> Edit</button><button className="btn btn-primary"><FileSignature size={14} /> Record Sign-off</button></>}
    >
      <div className="mb-4"><Tabs active={tab} onChange={setTab} tabs={[
        { key: 'overview', label: 'Overview' }, { key: 'lifecycle', label: 'Lifecycle' },
        { key: 'milestones', label: 'Milestones', count: p.milestonesTotal }, { key: 'team', label: 'Team & Scope' },
      ]} /></div>

      {tab === 'overview' && (
        <div className="flex-col gap-4">
          <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
            <div className="flex items-center gap-4 flex-wrap justify-between">
              <div className="flex items-center gap-4">
                <ProgressRing value={p.progress} size={80} color={p.health === 'Delayed' ? 'var(--danger)' : 'var(--primary)'} />
                <div>
                  <div className="t-sm ink-3">Current stage</div>
                  <div className="t-lg fw-7">{LIFECYCLE[curIdx]?.label}</div>
                  <div className="t-sm ink-2 mt-1">{p.milestonesDone} of {p.milestonesTotal} milestones complete</div>
                </div>
              </div>
              <div className="flex gap-4">
                {[['Contract', money(p.contractValue, p.currency)], ['Users', p.users], ['Open Issues', p.openIssues], ['Pending Sign-offs', p.pendingSignoffs]].map(([k, v]) => (
                  <div key={k} className="text-center"><div className="t-2xl fw-8">{v}</div><div className="t-xs ink-3">{k}</div></div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="drawer-two">
            <div className="card card-pad">
              <div className="card-title mb-3">Project Details</div>
              <div className="detail-list">
                <DetailRow label="Implementation Type">{p.implType}</DetailRow>
                <DetailRow label="Category">{p.category}</DetailRow>
                <DetailRow label="Priority"><Badge tone={{ Critical: 'danger', High: 'warning', Medium: 'info', Low: 'neutral' }[p.priority]}>{p.priority}</Badge></DetailRow>
                <DetailRow label="Risk Level"><Badge tone={healthTone(p.health)}>{p.riskLevel}</Badge></DetailRow>
                <DetailRow label="PO Number">{p.poNumber}</DetailRow>
                <DetailRow label="PO Date">{fmtDate(p.poDate)}</DetailRow>
                <DetailRow label="Start Date">{fmtDate(p.startDate)}</DetailRow>
                <DetailRow label="Target Go-Live">{fmtDate(p.targetGoLive)}</DetailRow>
              </div>
            </div>
            <div className="card card-pad">
              <div className="card-title mb-3">Client & Hospital</div>
              <div className="detail-list">
                <DetailRow label="Hospital">{client?.name}</DetailRow>
                <DetailRow label="Group">{client?.group}</DetailRow>
                <DetailRow label="Type">{client?.type}</DetailRow>
                <DetailRow label="Beds">{client?.beds || '—'}</DetailRow>
                <DetailRow label="Location">{client?.city}, {client?.country}</DetailRow>
                <DetailRow label="Client SPOC">{client?.contacts?.find((c) => c.primary)?.name}</DetailRow>
                <DetailRow label="Timezone">{client?.timezone}</DetailRow>
              </div>
              <div className="mt-3 t-sm ink-2" style={{ borderTop: '1px dashed var(--border)', paddingTop: 10 }}>{p.remarks}</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'lifecycle' && (
        <div className="flex-col gap-4">
          <div className="card card-pad">
            <div className="card-title mb-3">Implementation Lifecycle</div>
            <Stepper current={curIdx} steps={LIFECYCLE.map((s) => ({ title: s.label }))} />
          </div>
          <div className="card card-pad">
            <div className="card-title mb-3">Stage Timeline</div>
            <Timeline items={p.milestones.map((m) => ({
              title: `${m.seq}. ${m.label}`,
              time: m.status === 'Completed' ? `Completed ${fmtDate(m.actualEnd)}` : m.status === 'In Progress' ? `In progress · due ${fmtDate(m.planEnd)}` : m.status === 'Blocked' ? `Blocked · planned ${fmtDate(m.planEnd)}` : `Planned ${fmtDate(m.planStart)} – ${fmtDate(m.planEnd)}`,
              color: m.status === 'Completed' ? 'var(--success)' : m.status === 'In Progress' ? 'var(--primary)' : m.status === 'Blocked' ? 'var(--danger)' : 'var(--border-strong)',
            }))} />
          </div>
        </div>
      )}

      {tab === 'milestones' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead><tr><th style={{ width: 40 }}>#</th><th>Milestone</th><th>Owner</th><th>Planned</th><th>Status</th><th>Sign-off</th></tr></thead>
            <tbody>
              {p.milestones.map((m) => (
                <tr key={m.key}>
                  <td className="mono ink-3">{m.seq}</td>
                  <td className="fw-6">{m.label}</td>
                  <td><Badge tone="neutral">{m.owner}</Badge></td>
                  <td className="t-sm ink-2 nowrap">{fmtDate(m.planStart)} – {fmtDate(m.planEnd)}</td>
                  <td><span className="flex items-center gap-1 t-sm">{MS_ICON[m.status]} {m.status}</span></td>
                  <td>{m.signoff === 'Signed' ? <Badge tone="success">Signed</Badge> : m.signoff === 'Pending' ? <Badge tone="pending">Pending</Badge> : <span className="ink-3">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'team' && (
        <div className="flex-col gap-4">
          <div className="card card-pad">
            <div className="card-title mb-3">Project Team</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['Project Manager', p.pm], ['Functional Consultant', p.fc], ['Technical Lead', p.tc], ['Implementation Engineer', p.engineer], ['Support Engineer', p.support], ['Account Manager', p.salesPerson]].map(([role, id]) => {
                const u = findUser(id);
                return (
                  <div key={role} className="flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}>
                    <Avatar name={u?.name} hue={u?.avatarHue} size="md" />
                    <div style={{ minWidth: 0 }}><div className="t-xs ink-3">{role}</div><div className="fw-6 t-sm truncate">{u?.name || '—'}</div></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card card-pad">
            <div className="card-title mb-1">Purchased Modules <Badge tone="primary">{p.modules.length}</Badge></div>
            <div className="flex flex-wrap gap-2 mt-3">{p.modules.map((m) => <Badge key={m} tone="info">{modName(m)}</Badge>)}</div>
            <div className="card-title mb-1 mt-4">Interfaces & Integrations</div>
            <div className="flex flex-wrap gap-2 mt-2">{p.interfaces.length ? p.interfaces.map((i) => <Badge key={i} tone="neutral">{i}</Badge>) : <span className="ink-3 t-sm">None</span>}</div>
          </div>
        </div>
      )}
      <style>{`@media (max-width: 720px){ .drawer-two{ grid-template-columns:1fr !important; } }`}</style>
    </Drawer>
  );
}

// ---------------- New project wizard ----------------
const STEPS = [{ title: 'Basics' }, { title: 'Client' }, { title: 'Commercials' }, { title: 'Scope & Team' }];
function NewProjectDrawer({ open, onClose, onSaved }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ name: '', clientId: '', implType: 'New Implementation', priority: 'Medium', status: 'Planning', poNumber: '', contractValue: '', currency: 'INR', startDate: '', targetGoLive: '', pm: '', modules: [] });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  useEffect(() => { if (open) { setStep(0); } }, [open]);
  const canNext = step === 0 ? f.name.trim() : step === 1 ? f.clientId : true;

  return (
    <Drawer open={open} onClose={onClose} size="md" title="Register New Project" subtitle="Create a new HIMS implementation project"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          {step > 0 && <button className="btn btn-outline" onClick={() => setStep((s) => s - 1)}>Back</button>}
          {step < STEPS.length - 1
            ? <button className="btn btn-primary" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>Continue <ArrowRight size={14} /></button>
            : <button className="btn btn-primary" onClick={() => onSaved(f.name || 'New Project')}><CheckCircle2 size={14} /> Register Project</button>}
        </>
      }
    >
      <div className="mb-4"><Stepper current={step} steps={STEPS} /></div>
      {step === 0 && (
        <div className="flex-col gap-3">
          <Field label="Project Name" required><Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. City Care Hospital — HIMS Implementation" /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Implementation Type"><Select value={f.implType} onChange={(e) => set('implType', e.target.value)} options={IMPLEMENTATION_TYPES} /></Field>
            <Field label="Priority"><Select value={f.priority} onChange={(e) => set('priority', e.target.value)} options={PRIORITIES} /></Field>
          </div>
          <Field label="Initial Status"><Select value={f.status} onChange={(e) => set('status', e.target.value)} options={PROJECT_STATUS} /></Field>
        </div>
      )}
      {step === 1 && (
        <div className="flex-col gap-3">
          <Field label="Client / Hospital" required help="Pick an existing client or add a new one from Clients"><SearchSelect value={f.clientId} onChange={(v) => set('clientId', v)} options={CLIENTS.map((c) => ({ value: c.id, label: `${c.name} — ${c.city}` }))} placeholder="Search hospitals…" /></Field>
          {f.clientId && (() => { const c = findClient(f.clientId); return (
            <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
              <div className="detail-list">
                <DetailRow label="Group">{c.group}</DetailRow>
                <DetailRow label="Type">{c.type}</DetailRow>
                <DetailRow label="Beds">{c.beds || '—'}</DetailRow>
                <DetailRow label="Location">{c.city}, {c.country}</DetailRow>
                <DetailRow label="SPOC">{c.contacts?.find((x) => x.primary)?.name}</DetailRow>
              </div>
            </div>
          ); })()}
        </div>
      )}
      {step === 2 && (
        <div className="flex-col gap-3">
          <Field label="PO Number"><Input value={f.poNumber} onChange={(e) => set('poNumber', e.target.value)} placeholder="PO-XXXX-00000" /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <Field label="Contract Value"><Input type="number" value={f.contractValue} onChange={(e) => set('contractValue', e.target.value)} placeholder="0" /></Field>
            <Field label="Currency"><Select value={f.currency} onChange={(e) => set('currency', e.target.value)} options={['INR', 'AED', 'SAR', 'KES', 'BDT', 'GBP']} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Start Date"><Input type="date" value={f.startDate} onChange={(e) => set('startDate', e.target.value)} /></Field>
            <Field label="Target Go-Live"><Input type="date" value={f.targetGoLive} onChange={(e) => set('targetGoLive', e.target.value)} /></Field>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="flex-col gap-3">
          <Field label="Project Manager"><SearchSelect value={f.pm} onChange={(v) => set('pm', v)} options={TEAM.filter((t) => ['pm', 'im'].includes(t.roleId)).map((t) => ({ value: t.id, label: t.name }))} placeholder="Assign a manager…" /></Field>
          <Field label="Modules Purchased" help="Add HIMS modules included in this scope"><TagInput value={f.modules} onChange={(v) => set('modules', v)} suggestions={HIMS_MODULES.map((m) => m.name)} placeholder="Add module and press Enter…" /></Field>
          <div className="card card-pad" style={{ background: 'var(--primary-softer)', border: '1px solid var(--primary-soft)' }}>
            <div className="flex items-center gap-2 fw-6 t-sm" style={{ color: 'var(--primary-700)' }}><ClipboardCheck size={15} /> Ready to register</div>
            <div className="t-sm ink-2 mt-1">A 19-stage lifecycle plan and milestone tracker will be auto-generated on save.</div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
