// SIR Dashboard — central integration repository summary.
import { useNavigate } from 'react-router-dom';
import {
  Boxes, Activity, Building2, Braces, CheckCircle2, Plus, ArrowRight,
  FileText, Database, Code2, Users, Archive, Rocket, FlaskConical, Recycle,
  FolderOpen, PlusCircle, UploadCloud, BarChart3,
} from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, Badge, StatusBadge, Skeleton, DonutChart } from '../../components/ui';
import { fmtDate } from '../../utils/format';
import { WORKFLOW_STEPS } from '../../data/integration';
import { INT_STATUS_TONE } from './_shared';

const STEP_ICON = { file: FileText, database: Database, code: Code2, check: CheckCircle2, users: Users, archive: Archive };

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: kpis } = useApi(() => api.getSirKpis());
  const { data: integrations } = useApi(() => api.getIntegrations());
  const { data: mix } = useApi(() => api.getTypeMix());
  const { data: clients } = useApi(() => api.getClientImplementations());

  const recent = [...(integrations || [])].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, 5);
  const clientCounts = (clients || []).reduce((acc, c) => { acc[c.client] = (acc[c.client] || 0) + 1; return acc; }, {});
  const topClients = Object.entries(clientCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const QUICK = [
    { label: 'Add New Integration', icon: <PlusCircle size={15} />, to: '/integration/all?new=1', tint: 'blue' },
    { label: 'Add New API', icon: <Braces size={15} />, to: '/integration/apis?new=1', tint: 'mint' },
    { label: 'Add HIMS Change', icon: <Database size={15} />, to: '/integration/hims-changes?new=1', tint: 'peach' },
    { label: 'Upload Document', icon: <UploadCloud size={15} />, to: '/integration/documents?new=1', tint: 'lavender' },
    { label: 'View Reports', icon: <BarChart3 size={15} />, to: '/integration/reports', tint: 'indigo' },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Boxes size={22} />} tint="cyan" title="Integration Management"
        desc="Central repository — Knowledge Base · API Repository · Implementation Tracker · Code Reuse"
        crumbs={[{ label: 'Smart Integration Records' }, { label: 'Dashboard' }]}
        actions={<button className="btn btn-primary" onClick={() => navigate('/integration/all?new=1')}><Plus size={15} /> New Integration</button>} />

      {/* KPI strip */}
      <div className="kpi-grid stagger">
        <MetricCard label="Total Integrations" value={kpis?.totalIntegrations ?? '—'} tint="blue" icon={<Boxes size={19} />} footer={`${kpis?.reusable ?? 0} reusable`} onClick={() => navigate('/integration/all')} />
        <MetricCard label="Active Integrations" value={kpis?.activeIntegrations ?? '—'} tint="green" icon={<Activity size={19} />} footer={`${kpis?.underTesting ?? 0} testing · ${kpis?.inDevelopment ?? 0} in dev`} onClick={() => navigate('/integration/all')} />
        <MetricCard label="Clients Using" value={kpis?.totalClients ?? '—'} tint="cyan" icon={<Building2 size={19} />} footer={`${kpis?.completedImplementations ?? 0} live implementations`} onClick={() => navigate('/integration/clients')} />
        <MetricCard label="APIs Documented" value={kpis?.totalApis ?? '—'} tint="mint" icon={<Braces size={19} />} footer="Across all integrations" onClick={() => navigate('/integration/apis')} />
      </div>
      <div className="kpi-grid stagger">
        <MetricCard label="HIMS Screens Modified" value={kpis?.screensModified ?? '—'} tint="peach" icon={<Code2 size={19} />} footer={`${kpis?.dbChanges ?? 0} database changes`} onClick={() => navigate('/integration/hims-changes')} />
        <MetricCard label="Live Integrations" value={kpis?.liveIntegrations ?? '—'} tint="green" icon={<Rocket size={19} />} footer="In production" onClick={() => navigate('/integration/clients')} />
        <MetricCard label="Under Testing" value={kpis?.underTesting ?? '—'} tint="lemon" icon={<FlaskConical size={19} />} footer="In UAT / QA" onClick={() => navigate('/integration/testing')} />
        <MetricCard label="Reusable Integrations" value={kpis?.reusable ?? '—'} tint="lavender" icon={<Recycle size={19} />} footer={`${kpis?.documents ?? 0} documents archived`} onClick={() => navigate('/integration/reuse')} />
      </div>

      {/* Workflow strip */}
      <div className="card card-pad anim-fade-up">
        <div className="card-title mb-1">Integration Workflow</div>
        <div className="card-sub mb-4">Every integration moves through six stages — from creation to reusable archive</div>
        <div className="wf-strip">
          {WORKFLOW_STEPS.map((s, i) => {
            const Icon = STEP_ICON[s.icon] || FileText;
            return (
              <div key={s.key} className="wf-step-wrap">
                <div className="wf-step">
                  <div className="wf-ico"><Icon size={20} /></div>
                  <div className="wf-num">{s.step}</div>
                  <div className="wf-label">{s.label}</div>
                  <div className="wf-desc">{s.desc}</div>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && <ArrowRight className="wf-arrow" size={16} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* summary donut + recent + clients */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: 20 }} className="dashboard-three">
        <div className="card card-pad anim-fade-up">
          <div className="card-title mb-1">Integration Summary</div>
          <div className="card-sub mb-4">By integration type</div>
          {mix ? <DonutChart data={mix} centerLabel="TOTAL" centerValue={kpis?.totalIntegrations ?? mix.reduce((s, d) => s + d.value, 0)} /> : <Skeleton h={200} />}
        </div>
        <div className="card card-pad anim-fade-up">
          <div className="flex items-center justify-between mb-3">
            <div className="card-title">Recent Integrations</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/integration/all')}>All <ArrowRight size={13} /></button>
          </div>
          {integrations ? (
            <div className="flex-col gap-2">
              {recent.map((r) => (
                <button key={r.id} className="flex items-center justify-between card-hover" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 11px', cursor: 'pointer', textAlign: 'left' }} onClick={() => navigate(`/integration/all?id=${r.id}`)}>
                  <div style={{ minWidth: 0 }}><div className="fw-6 t-sm truncate">{r.name}</div><div className="t-xs ink-3">Updated {fmtDate(r.lastUpdated)}</div></div>
                  <StatusBadge status={r.status} tone={INT_STATUS_TONE[r.status]} />
                </button>
              ))}
            </div>
          ) : <Skeleton h={220} />}
        </div>
        <div className="card card-pad anim-fade-up">
          <div className="flex items-center justify-between mb-3">
            <div className="card-title">Clients Implemented</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/integration/clients')}>All <ArrowRight size={13} /></button>
          </div>
          {clients ? (
            <div className="flex-col gap-2">
              {topClients.map(([name, n]) => (
                <div key={name} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span className="flex items-center gap-2 t-sm fw-5"><Building2 size={14} className="ink-3" /> {name}</span>
                  <Badge tone="info">{n} integrations</Badge>
                </div>
              ))}
            </div>
          ) : <Skeleton h={220} />}
        </div>
      </div>

      {/* all integrations snapshot + quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }} className="dashboard-two">
        <div className="card card-pad anim-fade-up">
          <div className="flex items-center justify-between mb-3">
            <div><div className="card-title">All Integrations</div><div className="card-sub">Snapshot of the repository</div></div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/integration/all')}>Open list <ArrowRight size={13} /></button>
          </div>
          {integrations ? (
            <div className="flex-col gap-2">
              {integrations.slice(0, 6).map((r) => (
                <button key={r.id} className="flex items-center gap-3 card-hover" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px', cursor: 'pointer' }} onClick={() => navigate(`/integration/all?id=${r.id}`)}>
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}><div className="fw-6 t-sm truncate">{r.name}</div><div className="t-xs ink-3">{r.type} · {r.vendor}</div></div>
                  <Badge tone="neutral">{r.totalApis} APIs</Badge>
                  <StatusBadge status={r.status} tone={INT_STATUS_TONE[r.status]} />
                </button>
              ))}
            </div>
          ) : <Skeleton h={260} />}
        </div>
        <div className="card card-pad anim-fade-up">
          <div className="card-title mb-1">Quick Actions</div>
          <div className="card-sub mb-3">Add to the repository</div>
          <div className="flex-col gap-2">
            {QUICK.map((q) => (
              <button key={q.label} className="flex items-center gap-3 card-hover" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }} onClick={() => navigate(q.to)}>
                <span className="metric-icon" style={{ width: 30, height: 30, borderRadius: 8, background: `var(--tint-${q.tint})`, color: `var(--tint-${q.tint}-ink)` }}>{q.icon}</span>
                <span className="fw-6 t-sm">{q.label}</span>
                <ArrowRight size={14} className="ink-3" style={{ marginLeft: 'auto' }} />
              </button>
            ))}
          </div>
          <div className="mt-3" style={{ borderTop: '1px dashed var(--border)', paddingTop: 12 }}>
            <div className="flex items-center gap-2 t-xs ink-3"><FolderOpen size={13} /> All integration data is securely stored & version-controlled for reuse.</div>
          </div>
        </div>
      </div>

      <style>{`
        .wf-strip { display:flex; align-items:stretch; gap:0; overflow-x:auto; padding-bottom:6px; }
        .wf-step-wrap { display:flex; align-items:center; flex:1; min-width:150px; }
        .wf-step { flex:1; text-align:center; padding:6px 8px; }
        .wf-ico { width:46px; height:46px; border-radius:14px; margin:0 auto 8px; display:flex; align-items:center; justify-content:center; background:var(--tint-cyan); color:var(--tint-cyan-ink); position:relative; }
        .wf-num { position:relative; margin-top:-6px; font-size:11px; font-weight:800; color:var(--primary); }
        .wf-label { font-weight:700; font-size:12.5px; margin-top:2px; }
        .wf-desc { font-size:11px; color:var(--text-3); margin-top:3px; line-height:1.35; }
        .wf-arrow { color:var(--text-3); flex-shrink:0; }
        @media (max-width:1100px){ .dashboard-three{ grid-template-columns:1fr !important; } }
        @media (max-width:900px){ .dashboard-two{ grid-template-columns:1fr !important; } }
      `}</style>
    </div>
  );
}
