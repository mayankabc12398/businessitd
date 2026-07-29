// Implementation Onboarding — a guided 3-step wizard that walks a new HIMS
// engagement from project & client setup → kick-off → deployment & config.
// Big animated stepper (see .wiz-* in components.css) with slide/fade panels.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Route, FolderKanban, Handshake, Server, ArrowLeft, ArrowRight, Plus,
  Check, CheckCircle2, Sparkles, Building2, Layers, FileText, Rocket, Users,
  Database, FileSignature, FlaskConical, Bug, ClipboardList,
} from 'lucide-react';
import { PageHeader, MetricCard, Badge, Avatar, ProgressBar, FormDrawer, useToast } from '../components/ui';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { HIMS_MODULES } from '../data/masters';
import { fmtDate } from '../utils/format';

const money = (n) => {
  try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0, notation: n >= 1e7 ? 'compact' : 'standard' }).format(n); }
  catch { return `₹${n}`; }
};
const num = (n) => { try { return new Intl.NumberFormat('en-IN', { notation: n >= 1e5 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(n); } catch { return `${n}`; } };
const koStatus = (p) => { const m = p.milestones.find((x) => x.key === 'kickoff'); return m?.status === 'Completed' ? 'Done' : m?.status === 'In Progress' ? 'Scheduled' : 'Pending'; };

const STEPS = [
  { key: 'Step 1', title: 'Projects & Clients', sub: 'Register hospitals & projects', icon: FolderKanban },
  { key: 'Step 2', title: 'Kick-off', sub: 'Scope confirm & kick-off', icon: Handshake },
  { key: 'Step 3', title: 'Deployment & Config', sub: 'Build, configure & deploy', icon: Server },
  { key: 'Step 4', title: 'Master Data', sub: 'Request, validate & import', icon: Database },
  { key: 'Step 5', title: 'SRS', sub: 'Dept SRS & sign-off', icon: FileSignature },
  { key: 'Step 6', title: 'Testing & UAT', sub: 'Test cases & bug tracker', icon: FlaskConical },
];

const ADD_ACTIONS = ['Add Project', 'Schedule Kick-off', 'Add Build Item', 'Add Master', 'Schedule SRS', 'Add Test Case'];

export default function Onboarding() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: projects } = useApi(() => api.getProjects());
  const { data: clients } = useApi(() => api.getClients());
  const projectOpts = () => (projects || []).filter((p) => p.status !== 'Completed').map((p) => ({ value: p.code, label: p.name }));
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState('fwd');
  const [add, setAdd] = useState(false);

  const go = (next) => {
    if (next === step || next < 0 || next > STEPS.length - 1) return;
    setDir(next > step ? 'fwd' : 'back');
    setStep(next);
  };
  const finish = () => { toast.success('Onboarding complete', 'Opening the projects workspace'); navigate('/projects'); };

  return (
    <div className="page">
      <PageHeader icon={<Route size={22} />} tint="lavender" title="Implementation Onboarding"
        desc="Guided 3-step flow to stand up a new HIMS engagement — from setup to deployment"
        crumbs={[{ label: 'Overview' }, { label: 'Onboarding' }]}
        actions={<button className="btn btn-primary" onClick={() => setAdd(true)}><Plus size={15} /> {ADD_ACTIONS[step]}</button>} />

      {/* ── Stepper ─────────────────────────────────────── */}
      <div className="card wiz-card anim-fade-up">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2 t-sm fw-6 ink-2">
            <Sparkles size={15} style={{ color: 'var(--primary-600)' }} /> Step {step + 1} of {STEPS.length}
          </div>
          <div className="t-xs ink-3">{Math.round((step / (STEPS.length - 1)) * 100)}% complete</div>
        </div>
        <div className="wiz-rail">
          {STEPS.map((s, i) => {
            const state = i < step ? 'done' : i === step ? 'current' : 'upcoming';
            const Icon = s.icon;
            return (
              <div key={s.title} className={`wiz-step ${state} ${i <= step ? 'clickable' : ''}`}
                onClick={() => i <= step && go(i)} role="button" tabIndex={i <= step ? 0 : -1}>
                {i > 0 && <span className="wiz-connect"><span className="wiz-connect-fill" /></span>}
                <span className="wiz-node">
                  {state === 'done' ? <Check size={22} strokeWidth={3} className="wiz-check" /> : <Icon size={22} />}
                </span>
                <span className="wiz-text">
                  <span className="wiz-step-k">{s.key}</span>
                  <div className="wiz-step-title">{s.title}</div>
                  <div className="wiz-step-sub">{s.sub}</div>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Panel ───────────────────────────────────────── */}
      <div className={`wiz-panel ${dir}`} key={step}>
        {step === 0 && <StepProjects />}
        {step === 1 && <StepKickoff />}
        {step === 2 && <StepDeploy />}
        {step === 3 && <StepMaster />}
        {step === 4 && <StepSrs />}
        {step === 5 && <StepUat />}
      </div>

      {/* ── Nav ─────────────────────────────────────────── */}
      <div className="card card-pad wiz-nav">
        <button className="btn btn-ghost" disabled={step === 0} onClick={() => go(step - 1)}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="wiz-dots">
          {STEPS.map((s, i) => <span key={s.title} className={`wiz-dot ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`} />)}
        </div>
        {step < STEPS.length - 1
          ? <button className="btn btn-primary" onClick={() => go(step + 1)}>Continue <ArrowRight size={15} /></button>
          : <button className="btn btn-primary" onClick={finish}><CheckCircle2 size={15} /> Finish & Open Projects</button>}
      </div>

      {/* ── Step-aware Add form ──────────────────────────── */}
      {step === 0 && (
        <FormDrawer key="add-project" open={add} onClose={() => setAdd(false)} title="Register New Project" subtitle="Add a hospital project to onboarding"
          submitLabel="Add Project" onSubmit={(v) => { toast.success('Project added', v.name || 'New project'); setAdd(false); }}
          fields={[
            { name: 'name', label: 'Project Name', required: true, full: true, placeholder: 'e.g. City Care Hospital — HIMS Implementation' },
            { name: 'clientId', label: 'Client / Hospital', type: 'search', required: true, options: (clients || []).map((c) => ({ value: c.id, label: `${c.name} — ${c.city}` })) },
            { name: 'implType', label: 'Implementation Type', type: 'select', default: 'New Implementation', options: ['New Implementation', 'Migration', 'Version Upgrade', 'Multi-branch Rollout'] },
            { name: 'priority', label: 'Priority', type: 'select', default: 'Medium', options: ['Low', 'Medium', 'High', 'Critical'] },
            { name: 'targetGoLive', label: 'Target Go-Live', type: 'date' },
          ]} />
      )}
      {step === 1 && (
        <FormDrawer key="add-kickoff" open={add} onClose={() => setAdd(false)} title="Schedule Kick-off Meeting" subtitle="Capture kick-off meeting details"
          submitLabel="Schedule" onSubmit={(v) => { const p = (projects || []).find((x) => x.code === v.projectCode); toast.success('Kick-off scheduled', p ? p.name.split(' — ')[0] : v.projectCode); setAdd(false); }}
          fields={[
            { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: projectOpts() },
            { name: 'meetingDate', label: 'Meeting Date', type: 'date', required: true },
            { name: 'mode', label: 'Mode', type: 'select', default: 'On-site', options: ['On-site', 'Virtual', 'Hybrid'] },
            { name: 'agenda', label: 'Agenda', type: 'textarea', full: true, rows: 3, placeholder: 'Meeting agenda…' },
          ]} />
      )}
      {step === 2 && (
        <FormDrawer key="add-deploy" open={add} onClose={() => setAdd(false)} title="Add Build / Config Item" subtitle="Log a development or configuration item"
          submitLabel="Add Item" onSubmit={(v) => { toast.success('Build item added', v.feature || 'New item'); setAdd(false); }}
          fields={[
            { name: 'feature', label: 'Feature / Task', required: true, full: true, placeholder: 'e.g. OP Billing — Insurance workflow' },
            { name: 'projectCode', label: 'Project', type: 'search', required: true, options: projectOpts() },
            { name: 'module', label: 'Module', type: 'select', options: HIMS_MODULES.map((m) => m.name) },
            { name: 'type', label: 'Type', type: 'select', default: 'Development', options: ['Development', 'Configuration'] },
            { name: 'status', label: 'Status', type: 'select', default: 'In Development', options: ['Not Started', 'In Development', 'Configured', 'In Testing', 'Deployed'] },
          ]} />
      )}
      {step === 3 && (
        <FormDrawer key="add-master" open={add} onClose={() => setAdd(false)} title="Add Master Data" subtitle="Request, validate or import a master"
          submitLabel="Add Master" onSubmit={(v) => { toast.success('Master added', v.master || 'New master'); setAdd(false); }}
          fields={[
            { name: 'master', label: 'Master', required: true, full: true, placeholder: 'e.g. Service Master, Doctor Master, Tariff' },
            { name: 'projectCode', label: 'Project', type: 'search', required: true, options: projectOpts() },
            { name: 'owner', label: 'Owner', type: 'select', options: ['Neha Patel', 'Amit Verma', 'Meera Krishnan'] },
            { name: 'status', label: 'Status', type: 'select', default: 'Awaited', options: ['Awaited', 'Validation Pending', 'Imported', 'Imported (with errors)'] },
          ]} />
      )}
      {step === 4 && (
        <FormDrawer key="add-srs" open={add} onClose={() => setAdd(false)} title="Schedule SRS" subtitle="Plan a department SRS session"
          submitLabel="Schedule" onSubmit={(v) => { toast.success('SRS scheduled', v.dept || 'Department'); setAdd(false); }}
          fields={[
            { name: 'dept', label: 'Department', required: true, full: true, placeholder: 'e.g. Radiology, Pharmacy, OT' },
            { name: 'projectCode', label: 'Project', type: 'search', required: true, options: projectOpts() },
            { name: 'planned', label: 'Planned Date', type: 'date' },
            { name: 'status', label: 'Status', type: 'select', default: 'Scheduled', options: ['Scheduled', 'In Progress', 'Completed', 'Signed Off'] },
          ]} />
      )}
      {step === 5 && (
        <FormDrawer key="add-uat" open={add} onClose={() => setAdd(false)} title="Add Test Case" subtitle="Log a UAT test module"
          submitLabel="Add Test Case" onSubmit={(v) => { toast.success('Test case added', v.module || 'New module'); setAdd(false); }}
          fields={[
            { name: 'module', label: 'Module', required: true, full: true, placeholder: 'e.g. OPD Billing, Pharmacy, Lab' },
            { name: 'projectCode', label: 'Project', type: 'search', required: true, options: projectOpts() },
            { name: 'total', label: 'Total Cases', type: 'number', placeholder: '0' },
            { name: 'tester', label: 'Tester', default: 'Client + QA' },
            { name: 'status', label: 'Status', type: 'select', default: 'Not Started', options: ['Not Started', 'In Progress', 'Passed', 'Failed', 'Blocked'] },
          ]} />
      )}
    </div>
  );
}

// ── Step 1 · Projects & Clients ──────────────────────────
function StepProjects() {
  const { data: projects } = useApi(() => api.getProjects());
  const { data: kpis } = useApi(() => api.getProjectKpis());
  const { data: clients } = useApi(() => api.getClients());
  const findClient = (id) => (clients || []).find((c) => c.id === id || c.code === id);
  const rows = (projects || []).slice(0, 8);
  return (
    <div className="flex-col gap-4">
      <div className="kpi-grid stagger">
        <MetricCard label="Projects" value={kpis?.total ?? '—'} tint="blue" icon={<FolderKanban size={19} />} footer="Across all clients" />
        <MetricCard label="Active" value={kpis?.inProgress ?? '—'} tint="indigo" icon={<Rocket size={19} />} footer="In delivery" />
        <MetricCard label="Clients / Hospitals" value={(clients || []).length} tint="cyan" icon={<Building2 size={19} />} footer="Onboarded groups" />
        <MetricCard label="Contract Value" value={kpis ? money(kpis.contractValue) : '—'} tint="mint" icon={<FileText size={19} />} footer="Total booked" />
      </div>
      <div className="card card-pad">
        <div className="card-title mb-1 flex items-center gap-2"><FolderKanban size={15} /> Projects & their clients</div>
        <div className="wiz-list mt-2">
          {rows.map((p) => {
            const c = findClient(p.clientId);
            return (
              <div key={p.code} className="wiz-row">
                <Avatar name={c?.name} hue={8} size="md" />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="fw-6 t-sm truncate">{p.name}</div>
                  <div className="t-xs ink-3">{c?.name} · {c?.city} · <span className="mono">{p.code}</span></div>
                </div>
                <div style={{ width: 130 }} className="hide-sm">
                  <ProgressBar value={p.progress} color={p.progress >= 80 ? 'var(--success)' : 'var(--primary)'} />
                </div>
                <Badge tone={{ 'On Track': 'success', 'At Risk': 'warning', Delayed: 'danger' }[p.health] || 'info'}>{p.health}</Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Step 2 · Kick-off ────────────────────────────────────
function StepKickoff() {
  const { data: projects } = useApi(() => api.getProjects());
  const { data: clients } = useApi(() => api.getClients());
  const findClient = (id) => (clients || []).find((c) => c.id === id || c.code === id);
  const rows = (projects || []).filter((p) => p.status !== 'Completed').slice(0, 8);
  const koDone = rows.filter((p) => koStatus(p) === 'Done').length;
  const scopeValue = rows.reduce((s, p) => s + p.contractValue, 0);
  return (
    <div className="flex-col gap-4">
      <div className="kpi-grid stagger">
        <MetricCard label="Active Scopes" value={rows.length} tint="sky" icon={<Layers size={19} />} footer="Confirmed & in delivery" />
        <MetricCard label="Kick-offs Done" value={koDone} tint="green" icon={<CheckCircle2 size={19} />} footer={`${rows.length - koDone} pending`} />
        <MetricCard label="Scope Value" value={money(scopeValue)} tint="mint" icon={<FileText size={19} />} footer="Contracted" />
        <MetricCard label="Avg Modules / Deal" value={rows.length ? Math.round(rows.reduce((s, p) => s + p.modules.length, 0) / rows.length) : 0} tint="lavender" icon={<Layers size={19} />} footer="Purchased modules" />
      </div>
      <div className="card card-pad">
        <div className="card-title mb-1 flex items-center gap-2"><Handshake size={15} /> Scope confirmation & kick-off meetings</div>
        <div className="wiz-list mt-2">
          {rows.map((p) => {
            const s = koStatus(p);
            return (
              <div key={p.code} className="wiz-row">
                <Avatar name={findClient(p.clientId)?.name} hue={2} size="md" />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="fw-6 t-sm truncate">{p.name}</div>
                  <div className="t-xs ink-3 mono">{p.poNumber} · {fmtDate(p.poDate)}</div>
                </div>
                <span className="hide-sm"><Badge tone="info">{p.modules.length} modules</Badge></span>
                <Badge tone={s === 'Done' ? 'success' : s === 'Scheduled' ? 'pending' : 'neutral'}>
                  {s === 'Done' ? <><CheckCircle2 size={11} /> Done</> : s}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Step 3 · Deployment & Configuration ──────────────────
const DEV_TONE = { Deployed: 'success', Configured: 'info', 'In Testing': 'primary', 'In Development': 'pending', 'Not Started': 'neutral' };
function StepDeploy() {
  const { data: devItems } = useApi(() => api.getDevItems());
  const { data: kpis } = useApi(() => api.getDeliveryKpis());
  const rows = (devItems || []).slice(0, 8);
  const configured = (devItems || []).filter((d) => d.status === 'Configured').length;
  const inDev = (devItems || []).filter((d) => d.status === 'In Development').length;
  return (
    <div className="flex-col gap-4">
      <div className="kpi-grid stagger">
        <MetricCard label="Build Items" value={kpis?.devTotal ?? '—'} tint="peach" icon={<Server size={19} />} footer="Dev + config" />
        <MetricCard label="Deployed" value={kpis?.devDeployed ?? '—'} tint="green" icon={<Rocket size={19} />} footer="Live on server" />
        <MetricCard label="Configured" value={configured} tint="cyan" icon={<CheckCircle2 size={19} />} footer="Ready to test" />
        <MetricCard label="In Development" value={inDev} tint="lavender" icon={<Layers size={19} />} footer="Active build" />
      </div>
      <div className="card card-pad">
        <div className="card-title mb-1 flex items-center gap-2"><Server size={15} /> Feature build, configuration & deployment</div>
        <div className="wiz-list mt-2">
          {rows.map((d) => (
            <div key={d.id} className="wiz-row">
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="fw-6 t-sm truncate">{d.feature}</div>
                <div className="t-xs ink-3">{d.module} · {d.type} · <span className="mono">{d.id}</span></div>
              </div>
              <div style={{ width: 120 }} className="hide-sm">
                <ProgressBar value={d.progress} color={d.progress >= 100 ? 'var(--success)' : 'var(--primary)'} />
              </div>
              <Badge tone={DEV_TONE[d.status] || 'neutral'}>{d.status}</Badge>
            </div>
          ))}
        </div>
        <div className="card card-pad mt-3" style={{ background: 'var(--primary-softer)', border: '1px solid var(--primary-soft)' }}>
          <div className="flex items-center gap-2 fw-6 t-sm" style={{ color: 'var(--primary-700)' }}><Users size={15} /> Ready for go-live</div>
          <div className="t-sm ink-2 mt-1">Once deployment & configuration sign-off is complete, the engagement moves to UAT, training and go-live cutover.</div>
        </div>
      </div>
    </div>
  );
}

// ── Step 4 · Master Data ─────────────────────────────────
const MD_TONE = { Imported: 'success', 'Imported (with errors)': 'warning', 'Validation Pending': 'pending', Awaited: 'neutral' };
function StepMaster() {
  const { data: masterData } = useApi(() => api.getMasterData());
  const { data: kpis } = useApi(() => api.getMasterDataKpis());
  const rows = (masterData || []).slice(0, 8);
  return (
    <div className="flex-col gap-4">
      <div className="kpi-grid stagger">
        <MetricCard label="Masters" value={kpis?.total ?? '—'} tint="lemon" icon={<Database size={19} />} footer="Requested" />
        <MetricCard label="Received" value={kpis?.received ?? '—'} tint="sky" icon={<ClipboardList size={19} />} footer={`${kpis?.awaited ?? 0} awaited`} />
        <MetricCard label="Imported" value={kpis?.imported ?? '—'} tint="green" icon={<CheckCircle2 size={19} />} footer={`${kpis?.errors ?? 0} with errors`} />
        <MetricCard label="Records" value={num(kpis?.records || 0)} tint="cyan" icon={<Layers size={19} />} footer="Imported rows" />
      </div>
      <div className="card card-pad">
        <div className="card-title mb-1 flex items-center gap-2"><Database size={15} /> Request, validate & import masters</div>
        <div className="wiz-list mt-2">
          {rows.map((m) => (
            <div key={m.id} className="wiz-row">
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="fw-6 t-sm truncate">{m.master}</div>
                <div className="t-xs ink-3">{m.projectName} · {m.owner} · <span className="mono">{m.id}</span></div>
              </div>
              <span className="t-xs ink-3 tabular hide-sm" style={{ width: 90, textAlign: 'right' }}>{m.records ? `${num(m.records)} rows` : '—'}</span>
              <Badge tone={MD_TONE[m.status] || 'neutral'}>{m.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 5 · SRS ─────────────────────────────────────────
const SRS_TONE = { 'Signed Off': 'success', Completed: 'info', 'In Progress': 'pending', Scheduled: 'neutral' };
function StepSrs() {
  const { data: srsSchedule } = useApi(() => api.getSrsSchedule());
  const { data: kpis } = useApi(() => api.getSrsKpis());
  const rows = (srsSchedule || []).slice(0, 8);
  return (
    <div className="flex-col gap-4">
      <div className="kpi-grid stagger">
        <MetricCard label="SRS Scheduled" value={kpis?.scheduled ?? '—'} tint="lavender" icon={<FileSignature size={19} />} footer="Department sessions" />
        <MetricCard label="Completed" value={kpis?.completed ?? '—'} tint="green" icon={<CheckCircle2 size={19} />} footer={`${kpis?.signed ?? 0} signed off`} />
        <MetricCard label="Gaps Identified" value={kpis?.gaps ?? '—'} tint="orange" icon={<Layers size={19} />} footer="From gap analysis" />
        <MetricCard label="Change Requests" value={kpis?.crs ?? '—'} tint="peach" icon={<FileText size={19} />} footer={money(kpis?.crValue || 0)} />
      </div>
      <div className="card card-pad">
        <div className="card-title mb-1 flex items-center gap-2"><FileSignature size={15} /> Department-wise SRS & sign-off</div>
        <div className="wiz-list mt-2">
          {rows.map((s) => (
            <div key={s.id} className="wiz-row">
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="fw-6 t-sm truncate">{s.dept}</div>
                <div className="t-xs ink-3">{s.projectName} · {s.consultant} · <span className="mono">{s.id}</span></div>
              </div>
              <span className="hide-sm"><Badge tone="info">{s.requirements} reqs</Badge></span>
              <Badge tone={SRS_TONE[s.status] || 'neutral'}>{s.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 6 · Testing & UAT ───────────────────────────────
const UAT_TONE = { Passed: 'success', Failed: 'danger', 'In Progress': 'primary', Blocked: 'warning', 'Not Started': 'neutral' };
function StepUat() {
  const { data: uatCases } = useApi(() => api.getUatCases());
  const { data: kpis } = useApi(() => api.getDeliveryKpis());
  const rows = (uatCases || []).slice(0, 8);
  return (
    <div className="flex-col gap-4">
      <div className="kpi-grid stagger">
        <MetricCard label="Test Modules" value={kpis?.uatModules ?? '—'} tint="lavender" icon={<FlaskConical size={19} />} footer="Under UAT" />
        <MetricCard label="Passed" value={kpis?.uatPassed ?? '—'} tint="green" icon={<CheckCircle2 size={19} />} footer="Signed by client" />
        <MetricCard label="Open Bugs" value={kpis?.bugsOpen ?? '—'} tint="rose" icon={<Bug size={19} />} footer="Awaiting fix" />
        <MetricCard label="Critical" value={kpis?.bugsCritical ?? '—'} tint="orange" icon={<Bug size={19} />} footer="High severity" />
      </div>
      <div className="card card-pad">
        <div className="card-title mb-1 flex items-center gap-2"><FlaskConical size={15} /> Test cases & UAT sign-off</div>
        <div className="wiz-list mt-2">
          {rows.map((u) => (
            <div key={u.id} className="wiz-row">
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="fw-6 t-sm truncate">{u.module}</div>
                <div className="t-xs ink-3">{u.projectName} · <span className="mono">{u.id}</span></div>
              </div>
              <div style={{ width: 130 }} className="hide-sm">
                <ProgressBar value={u.total ? Math.round((u.passed / u.total) * 100) : 0} color={u.passed === u.total ? 'var(--success)' : 'var(--primary)'} />
              </div>
              <span className="t-xs ink-3 tabular hide-sm">{u.passed}/{u.total}</span>
              <Badge tone={UAT_TONE[u.status] || 'neutral'}>{u.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
