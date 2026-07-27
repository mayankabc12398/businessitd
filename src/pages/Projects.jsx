// Delivery — merged Projects + Clients & Hospitals workspace.
// One screen, two tabs: Projects (registration, portfolio list, kanban board,
// lifecycle detail drawer, 4-step register wizard) and Clients & Hospitals
// (group directory, contacts, escalation matrix, add-client form). Each tab
// keeps ALL of its original functionality; shared chrome (header, KPI grid,
// filter card, data table, drawers) is reused per active tab.
import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  FolderKanban, Plus, LayoutGrid, Table2, Rocket, ClipboardCheck, AlertTriangle,
  CircleDollarSign, Pencil, Eye, MoreVertical, CheckCircle2, Clock, Ban,
  ArrowRight, FileSignature, CheckSquare, Square, Upload, FileText, X,
  Building2, Bed, MapPin, Phone, Mail, Users, ShieldAlert, Globe, Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import {
  PageHeader, MetricCard, DataTable, Drawer, Tabs, Segmented, Badge, StatusBadge,
  Avatar, ProgressBar, ProgressRing, Stepper, Timeline, DetailRow, Dropdown,
  Field, Input, Select, SearchSelect, useToast, Chip, Skeleton, FormDrawer,
} from '../components/ui';
import { fmtDate } from '../utils/format';
import { LIFECYCLE, PROJECT_STATUS, PRIORITIES, HEALTH, IMPLEMENTATION_TYPES, INTEGRATION_TYPES, HIMS_MODULES, HOSPITAL_TYPES, COUNTRIES } from '../data/masters';
import { CLIENTS, findClient } from '../data/clients';
import { PROJECTS } from '../data/projects';
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

export default function Projects({ initialTab = 'projects' }) {
  const location = useLocation();
  const { data: projects, loading: pLoading } = useApi(() => api.getProjects());
  const { data: kpis } = useApi(() => api.getProjectKpis());
  const { data: clients, loading: cLoading } = useApi(() => api.getClients());
  const toast = useToast();
  const [params, setParams] = useSearchParams();

  const [tab, setTab] = useState(initialTab);

  // ── Projects tab state ──
  const [view, setView] = useState('table');
  const [statusF, setStatusF] = useState('All');
  const [healthF, setHealthF] = useState('All');
  const [activeProj, setActiveProj] = useState(null);
  const [showNewProj, setShowNewProj] = useState(false);
  const [extraProj, setExtraProj] = useState([]);

  // ── Clients tab state ──
  const [typeF, setTypeF] = useState('All');
  const [activeClient, setActiveClient] = useState(null);
  const [showClient, setShowClient] = useState(false);
  const [extraClient, setExtraClient] = useState([]);

  const allProjects = useMemo(() => [...extraProj, ...(projects || [])], [extraProj, projects]);
  const allClients = useMemo(() => [...extraClient, ...(clients || [])], [extraClient, clients]);

  // deep-links from global search / quick actions — route decides the tab
  useEffect(() => {
    const code = params.get('code');
    const id = params.get('id');
    const isNew = params.get('new') === '1';
    if (code && projects) { const p = projects.find((x) => x.code === code); if (p) { setTab('projects'); setActiveProj(p); } setParams({}, { replace: true }); return; }
    if (id && clients) { const c = clients.find((x) => x.id === id); if (c) { setTab('clients'); setActiveClient(c); } setParams({}, { replace: true }); return; }
    if (isNew) {
      if (location.pathname === '/clients') { setTab('clients'); setShowClient(true); }
      else { setTab('projects'); setShowNewProj(true); }
      setParams({}, { replace: true });
    }
  }, [params, projects, clients, location.pathname, setParams]);

  const filteredProjects = useMemo(() => allProjects.filter((p) =>
    (statusF === 'All' || p.status === statusF) &&
    (healthF === 'All' || p.health === healthF)
  ), [allProjects, statusF, healthF]);

  const filteredClients = useMemo(() => allClients.filter((c) => typeF === 'All' || c.type === typeF), [allClients, typeF]);

  const addProject = (f) => {
    const start = f.startDate || '2026-07-24';
    const milestones = LIFECYCLE.map((s, i) => ({
      key: s.key, label: s.label, tint: s.tint, seq: i + 1, planStart: start, planEnd: f.targetGoLive || start,
      actualEnd: i === 0 ? start : null, status: i === 0 ? 'Completed' : i === 1 ? 'In Progress' : 'Pending',
      owner: 'PM', signoff: i === 0 ? 'Signed' : 'Pending',
    }));
    const proj = {
      code: `PRJ-2026-${String(120 + allProjects.length)}`, name: f.name, clientId: f.clientId,
      category: 'Mid-Market', implType: f.implType, priority: f.priority, status: f.status || 'Planning',
      contractValue: Number(f.contractValue) || 0, poNumber: f.poNumber || '—', poDate: start,
      startDate: start, targetGoLive: f.targetGoLive || start, currency: f.currency || 'INR',
      pm: f.pm || 'U-01', fc: f.fc || 'U-02', tc: 'U-05', engineer: 'U-06', support: 'U-09', salesPerson: 'U-12',
      currentStage: 'registration', health: 'On Track', riskLevel: 'Low', users: 0,
      machines: Number(f.machines) || 0, integrationType: f.integrationType || 'None',
      poDoc: f.poFile || null, otherDoc: f.otherFile || null,
      modules: f.modules || [], interfaces: f.integrationType && f.integrationType !== 'None' ? [f.integrationType] : [],
      remarks: 'Newly registered project — lifecycle plan auto-generated.',
      progress: Math.round((1.5 / LIFECYCLE.length) * 100), milestones, milestonesDone: 1, milestonesTotal: milestones.length,
      expectedCompletion: f.targetGoLive || start, openIssues: 0, pendingSignoffs: 0,
    };
    setExtraProj((prev) => [proj, ...prev]);
    toast.success('Project registered', `${f.name} · ${proj.code}`);
    setShowNewProj(false);
  };

  const addClient = (v) => {
    const id = `CL-${String(allClients.length + 1).padStart(3, '0')}`;
    setExtraClient((prev) => [{
      id, name: v.name, group: v.group || v.name, type: v.type, country: v.country, state: v.state || '—', city: v.city || '—',
      beds: Number(v.beds) || 0, branches: Number(v.branches) || 1, gst: v.gst || '—', timezone: '—', currency: (COUNTRIES.find((c) => c.label === v.country)?.currency) || 'INR',
      since: '2026-07-24', activeProjects: 0, health: 'On Track',
      contacts: [{ name: v.contactName || 'TBD', title: v.contactTitle || 'Client SPOC', phone: v.phone || '—', email: v.email || '—', primary: true }],
      escalation: [{ level: 'L1', role: 'Project Manager', name: 'Rahul Sharma', sla: '4 hrs' }],
    }, ...prev]);
    toast.success('Client added', `${v.name} · ${id}`);
    setShowClient(false);
  };

  const projColumns = [
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
            { icon: <Eye size={14} />, label: 'Open details', onClick: () => setActiveProj(p) },
            { icon: <Pencil size={14} />, label: 'Edit project', onClick: () => toast.info('Edit', p.code) },
            { icon: <FileSignature size={14} />, label: 'Record sign-off', onClick: () => toast.info('Sign-off', p.code) },
            { sep: true },
            { icon: <Ban size={14} />, label: 'Put on hold', danger: true, onClick: () => toast.warning('On hold', p.code) },
          ]} />
      ),
    },
  ];

  const clientColumns = [
    { key: 'name', header: 'Hospital / Group', minWidth: 240, render: (c) => (
      <div className="flex items-center gap-3"><Avatar name={c.name} hue={3} size="md" /><div><div className="fw-6 ink-1">{c.name}</div><div className="t-xs ink-3">{c.group} · {c.id}</div></div></div>
    ) },
    { key: 'type', header: 'Type', render: (c) => <Badge tone="info">{c.type}</Badge> },
    { key: 'loc', header: 'Location', render: (c) => <span className="t-sm"><MapPin size={12} style={{ verticalAlign: -1 }} /> {c.city}, {c.country}</span> },
    { key: 'beds', header: 'Beds', align: 'right', accessor: (c) => c.beds, render: (c) => <b className="tabular">{c.beds || '—'}</b> },
    { key: 'branches', header: 'Branches', align: 'right', accessor: (c) => c.branches },
    { key: 'proj', header: 'Projects', align: 'center', accessor: (c) => PROJECTS.filter((p) => p.clientId === c.id).length, render: (c) => <Badge tone="primary">{PROJECTS.filter((p) => p.clientId === c.id).length}</Badge> },
    { key: 'health', header: 'Health', render: (c) => <StatusBadge status={c.health} tone={healthTone(c.health)} /> },
  ];

  const totalBeds = allClients.reduce((s, c) => s + c.beds, 0);
  const isProjects = tab === 'projects';

  return (
    <div className="page">
      <PageHeader
        icon={isProjects ? <FolderKanban size={22} /> : <Building2 size={22} />} tint={isProjects ? 'blue' : 'cyan'}
        title="Projects & Clients"
        desc={isProjects ? 'End-to-end HIMS implementation tracking — registration to go-live' : 'Hospital groups, contacts, escalation matrix and licensing'}
        crumbs={[{ label: 'Delivery' }, { label: isProjects ? 'Projects' : 'Clients' }]}
        actions={isProjects ? (
          <>
            <Segmented size="sm" value={view} onChange={setView} options={[{ value: 'table', icon: <Table2 size={14} />, label: 'Table' }, { value: 'board', icon: <LayoutGrid size={14} />, label: 'Board' }]} />
            <button className="btn btn-primary" onClick={() => setShowNewProj(true)}><Plus size={15} /> New Project</button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={() => setShowClient(true)}><Plus size={15} /> Add Client</button>
        )}
      />

      <Tabs active={tab} onChange={setTab} tabs={[
        { key: 'projects', label: 'Projects', count: allProjects.length || undefined },
        { key: 'clients', label: 'Clients & Hospitals', count: allClients.length || undefined },
      ]} />

      {isProjects ? (
        <>
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
            <DataTable columns={projColumns} rows={filteredProjects} loading={pLoading} onRowClick={setActiveProj} exportName="projects.csv" searchPlaceholder="Search projects, codes, clients…" pageSize={10} />
          ) : (
            <Board projects={filteredProjects} loading={pLoading} onOpen={setActiveProj} />
          )}
        </>
      ) : (
        <>
          <div className="kpi-grid stagger">
            <MetricCard label="Total Clients" value={allClients.length || '—'} tint="cyan" icon={<Building2 size={19} />} footer={`${new Set(allClients.map(c=>c.country)).size} countries`} />
            <MetricCard label="Total Beds Served" value={totalBeds.toLocaleString()} tint="blue" icon={<Bed size={19} />} footer="Across all facilities" />
            <MetricCard label="Countries" value={new Set(allClients.map(c=>c.country)).size} tint="mint" icon={<Globe size={19} />} footer="India, UAE, KSA, Kenya, BD" />
            <MetricCard label="Multi-branch Groups" value={allClients.filter(c=>c.branches>1).length} tint="lavender" icon={<Layers size={19} />} footer="Chains & networks" />
          </div>

          <div className="card card-pad" style={{ paddingBottom: 12 }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Type</span>
              {['All', ...HOSPITAL_TYPES].map((t) => <Chip key={t} active={typeF === t} onClick={() => setTypeF(t)}>{t}</Chip>)}
            </div>
          </div>

          <DataTable columns={clientColumns} rows={filteredClients} loading={cLoading} onRowClick={setActiveClient} exportName="clients.csv" searchPlaceholder="Search hospitals, groups, cities…" />
        </>
      )}

      {/* drawers & forms — kept mounted regardless of active tab */}
      <ProjectDrawer project={activeProj} onClose={() => setActiveProj(null)} />
      <NewProjectDrawer open={showNewProj} onClose={() => setShowNewProj(false)} onSaved={addProject} />
      <ClientDrawer
        client={activeClient}
        onClose={() => setActiveClient(null)}
        onNewProject={() => { setActiveClient(null); setTab('projects'); setShowNewProj(true); }}
      />
      <FormDrawer open={showClient} onClose={() => setShowClient(false)} title="Add Client / Hospital" subtitle="Register a new hospital or group"
        submitLabel="Add Client" onSubmit={addClient}
        fields={[
          { name: 'name', label: 'Hospital / Client Name', required: true, full: true, placeholder: 'e.g. City Care Hospital' },
          { name: 'group', label: 'Group Name', placeholder: 'Parent group' },
          { name: 'type', label: 'Hospital Type', type: 'select', required: true, options: HOSPITAL_TYPES },
          { name: 'country', label: 'Country', type: 'select', required: true, options: COUNTRIES.map((c) => c.label) },
          { name: 'state', label: 'State / Region', placeholder: 'State' },
          { name: 'city', label: 'City', placeholder: 'City' },
          { name: 'beds', label: 'No. of Beds', type: 'number', placeholder: '0' },
          { name: 'branches', label: 'Branches', type: 'number', placeholder: '1' },
          { name: 'gst', label: 'Tax / Registration No.', full: true, placeholder: 'GST / TRN / VAT / PIN' },
          { name: 'contactName', label: 'Primary Contact (SPOC)', placeholder: 'Full name' },
          { name: 'contactTitle', label: 'Designation', placeholder: 'e.g. Medical Director' },
          { name: 'phone', label: 'Phone', placeholder: '+91 …' },
          { name: 'email', label: 'Email', type: 'email', placeholder: 'name@hospital.com' },
        ]} />
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

// ---------------- Project detail drawer ----------------
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
  const [f, setF] = useState({ name: '', clientId: '', implType: 'New Implementation', priority: 'Medium', status: 'Planning', poNumber: '', contractValue: '', currency: 'INR', startDate: '', targetGoLive: '', pm: '', fc: '', machines: '', integrationType: '', modules: [], poFile: '', otherFile: '' });
  const [moduleOpts, setModuleOpts] = useState(() => HIMS_MODULES.map((m) => m.name));
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const addModule = (raw) => {
    const v = (raw || '').trim();
    if (!v) return;
    setModuleOpts((o) => (o.includes(v) ? o : [...o, v]));
    setF((s) => ({ ...s, modules: s.modules.includes(v) ? s.modules : [...s.modules, v] }));
  };
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
            : <button className="btn btn-primary" onClick={() => onSaved({ ...f, name: f.name || 'New Project' })}><CheckCircle2 size={14} /> Register Project</button>}
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
          <Field label="Client / Hospital" required help="Pick an existing client or add a new one from the Clients tab"><SearchSelect value={f.clientId} onChange={(v) => set('clientId', v)} options={CLIENTS.map((c) => ({ value: c.id, label: `${c.name} — ${c.city}` }))} placeholder="Search hospitals…" /></Field>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Project Manager"><SearchSelect value={f.pm} onChange={(v) => set('pm', v)} options={TEAM.filter((t) => ['pm', 'im'].includes(t.roleId)).map((t) => ({ value: t.id, label: t.name }))} placeholder="Assign a manager…" /></Field>
            <Field label="Functional Consultant"><SearchSelect value={f.fc} onChange={(v) => set('fc', v)} options={TEAM.filter((t) => t.roleId === 'fc').map((t) => ({ value: t.id, label: t.name }))} placeholder="Assign a consultant…" /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Number of Machines"><Input type="number" min="0" value={f.machines} onChange={(e) => set('machines', e.target.value)} placeholder="0" /></Field>
            <Field label="Integration Type"><Select value={f.integrationType} onChange={(e) => set('integrationType', e.target.value)} options={INTEGRATION_TYPES} placeholder="Select integration…" /></Field>
          </div>

          <ModuleMultiSelect options={moduleOpts} value={f.modules} onChange={(v) => set('modules', v)} onAddNew={addModule} />

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 12 }}>
            <FileField label="Upload Purchase Order" icon={<Upload size={15} />} value={f.poFile} onChange={(v) => set('poFile', v)} />
            <FileField label="Other Document" icon={<FileText size={15} />} value={f.otherFile} onChange={(v) => set('otherFile', v)} />
          </div>

          <div className="card card-pad" style={{ background: 'var(--primary-softer)', border: '1px solid var(--primary-soft)' }}>
            <div className="flex items-center gap-2 fw-6 t-sm" style={{ color: 'var(--primary-700)' }}><ClipboardCheck size={15} /> Ready to register</div>
            <div className="t-sm ink-2 mt-1">A 19-stage lifecycle plan and milestone tracker will be auto-generated on save.</div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

// ---------------- Module multi-select (checkbox grid + select-all + add-new) ----------------
function ModuleMultiSelect({ options, value, onChange, onAddNew }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const allSelected = options.length > 0 && value.length === options.length;
  const toggle = (m) => onChange(value.includes(m) ? value.filter((x) => x !== m) : [...value, m]);
  const toggleAll = () => onChange(allSelected ? [] : [...options]);
  const commit = () => { const v = name.trim(); if (v) onAddNew(v); setName(''); setAdding(false); };

  return (
    <div className="field" style={{ minWidth: 0 }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="field-label" style={{ margin: 0 }}>
          Modules Purchased {value.length > 0 && <Badge tone="primary">{value.length} selected</Badge>}
        </span>
        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={toggleAll}>
            {allSelected ? <><Square size={13} /> Clear</> : <><CheckSquare size={13} /> Select all</>}
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setAdding((a) => !a)}><Plus size={13} /> New Module</button>
        </div>
      </div>

      {adding && (
        <div className="flex items-center gap-2">
          <Input autoFocus value={name} placeholder="New module name…" onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } if (e.key === 'Escape') { setName(''); setAdding(false); } }} />
          <button type="button" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={commit}>Add</button>
        </div>
      )}

      <div className="mod-grid">
        {options.map((m) => {
          const on = value.includes(m);
          return (
            <label key={m} className={`mod-chip ${on ? 'on' : ''}`}>
              <input type="checkbox" className="checkbox" checked={on} onChange={() => toggle(m)} />
              <span className="truncate" title={m}>{m}</span>
            </label>
          );
        })}
      </div>
      <span className="field-help">Tick modules in scope, use Select all, or add a custom one with New Module.</span>
    </div>
  );
}

// ---------------- File upload field (mock — stores the chosen file name) ----------------
function FileField({ label, icon, value, onChange }) {
  const ref = useRef(null);
  return (
    <div className="field" style={{ minWidth: 0 }}>
      <label className="field-label">{label}</label>
      <button type="button" className={`file-drop ${value ? 'has-file' : ''}`} onClick={() => ref.current?.click()}>
        <span className="file-ic">{icon}</span>
        <span className={`truncate ${value ? 'ink-1 fw-6' : 'ink-3'}`} style={{ flex: 1, minWidth: 0, textAlign: 'left' }} title={value || undefined}>{value || 'Choose file…'}</span>
        {value
          ? <X size={15} className="file-x" onClick={(e) => { e.stopPropagation(); onChange(''); }} />
          : <span className="t-xs ink-3" style={{ flexShrink: 0 }}>Browse</span>}
      </button>
      <input ref={ref} type="file" hidden onChange={(e) => onChange(e.target.files?.[0]?.name || '')} />
    </div>
  );
}

// ---------------- Client detail drawer ----------------
function ClientDrawer({ client, onClose, onNewProject }) {
  if (!client) return null;
  const c = client;
  const projects = PROJECTS.filter((p) => p.clientId === c.id);
  return (
    <Drawer open={!!client} onClose={onClose} size="md" title={c.name} subtitle={`${c.group} · ${c.type}`}
      headerExtra={<Badge tone={healthTone(c.health)}>{c.health}</Badge>}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onNewProject}><Plus size={14} /> New Project</button></>}>
      <div className="flex-col gap-4">
        <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
          <div className="detail-list">
            <DetailRow label="Location">{c.city}, {c.state}, {c.country}</DetailRow>
            <DetailRow label="Beds / Branches">{c.beds || '—'} beds · {c.branches} branches</DetailRow>
            <DetailRow label="Tax / Reg">{c.gst}</DetailRow>
            <DetailRow label="Currency">{c.currency}</DetailRow>
            <DetailRow label="Timezone">{c.timezone}</DetailRow>
            <DetailRow label="Client since">{c.since}</DetailRow>
          </div>
        </div>

        <div className="card card-pad">
          <div className="card-title mb-3 flex items-center gap-2"><Users size={15} /> Key Contacts</div>
          <div className="flex-col gap-2">
            {c.contacts.map((ct) => (
              <div key={ct.email} className="flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}>
                <Avatar name={ct.name} hue={6} size="md" />
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <div className="fw-6 t-sm">{ct.name} {ct.primary && <Badge tone="primary">SPOC</Badge>}</div>
                  <div className="t-xs ink-3">{ct.title}</div>
                </div>
                <div className="t-xs ink-2 text-right hide-sm"><div><Phone size={11} /> {ct.phone}</div><div><Mail size={11} /> {ct.email}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad">
          <div className="card-title mb-3 flex items-center gap-2"><ShieldAlert size={15} /> Escalation Matrix</div>
          <table className="data-table"><thead><tr><th>Level</th><th>Role</th><th>Name</th><th>SLA</th></tr></thead>
            <tbody>{c.escalation.map((e) => <tr key={e.level}><td><Badge tone="neutral">{e.level}</Badge></td><td className="fw-6">{e.role}</td><td>{e.name}</td><td><Badge tone="warning">{e.sla}</Badge></td></tr>)}</tbody>
          </table>
        </div>

        <div className="card card-pad">
          <div className="card-title mb-3">Projects ({projects.length})</div>
          <div className="flex-col gap-2">
            {projects.map((p) => (
              <div key={p.code} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div><div className="fw-6 t-sm">{p.name.split(' — ')[1] || p.name}</div><div className="t-xs ink-3">{p.code}</div></div>
                <Badge tone={healthTone(p.health)}>{p.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
