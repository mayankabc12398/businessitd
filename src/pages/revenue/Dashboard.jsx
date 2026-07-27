// SFR Dashboard — Feature Intelligence Platform summary.
import { useNavigate } from 'react-router-dom';
import {
  Lightbulb, Plus, Inbox, Hammer, CheckCircle2, Globe, Building2,
  CircleDollarSign, Timer, ArrowRight,
  FileText, ClipboardCheck, Stamp, Code2, FlaskConical, Rocket, Gauge, Share2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, Badge, Skeleton, DonutChart } from '../../components/ui';
import { fmtINR, fmtDate, fmtNum } from '../../utils/format';
import { WORKFLOW_STEPS, FEATURE_STATUSES } from '../../data/revenue';
import { StatusChip, PRIO_TONE, ImpactBar } from './_shared';

const STEP_ICON = { request: FileText, review: ClipboardCheck, approve: Stamp, dev: Code2, test: FlaskConical, deploy: Rocket, impact: Gauge, share: Share2 };

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: kpis } = useApi(() => api.getSfrKpis());
  const { data: features } = useApi(() => api.getFeatures());
  const { data: mix } = useApi(() => api.getFeatureStatusMix());
  const { data: top } = useApi(() => api.getTopByImpact());

  const recent = [...(features || [])].sort((a, b) => b.requestDate.localeCompare(a.requestDate)).slice(0, 6);
  const pipeline = FEATURE_STATUSES.map((s) => ({ status: s, items: (features || []).filter((f) => f.status === s) }));

  return (
    <div className="page">
      <PageHeader icon={<Lightbulb size={22} />} tint="green" title="Feature & Workflow Management"
        desc="Centralized platform to manage new features, workflows & sharing across all clients and teams"
        crumbs={[{ label: 'Feature Intelligence' }, { label: 'Dashboard' }]}
        actions={<button className="btn btn-primary" onClick={() => navigate('/revenue/requests?new=1')}><Plus size={15} /> New Feature Request</button>} />

      {/* KPI strip */}
      <div className="kpi-grid stagger">
        <MetricCard label="Total Features" value={kpis ? fmtNum(kpis.totalFeatures) : '—'} tint="lavender" icon={<Lightbulb size={19} />} footer="All time" onClick={() => navigate('/revenue/features')} />
        <MetricCard label="New Requests" value={kpis?.newRequests ?? '—'} tint="blue" icon={<Inbox size={19} />} footer="Pending review" onClick={() => navigate('/revenue/requests')} />
        <MetricCard label="In Development" value={kpis?.inDevelopment ?? '—'} tint="peach" icon={<Hammer size={19} />} footer="Active features" onClick={() => navigate('/revenue/roadmap')} />
        <MetricCard label="Completed" value={kpis ? fmtNum(kpis.completed) : '—'} tint="green" icon={<CheckCircle2 size={19} />} footer="Deployed features" />
      </div>
      <div className="kpi-grid stagger">
        <MetricCard label="Available for All Clients" value={kpis?.availableForAll ?? '—'} tint="mint" icon={<Globe size={19} />} footer="Reusable features" onClick={() => navigate('/revenue/library')} />
        <MetricCard label="Total Clients" value={kpis ? fmtNum(kpis.totalClients) : '—'} tint="cyan" icon={<Building2 size={19} />} footer="Using HIMS" onClick={() => navigate('/revenue/adoption')} />
        <MetricCard label="Revenue Generated" value={kpis ? fmtINR(kpis.revenueGenerated, true) : '—'} tint="green" icon={<CircleDollarSign size={19} />} footer="From new features" onClick={() => navigate('/revenue/roi')} />
        <MetricCard label="Avg Development Time" value={kpis ? `${kpis.avgDevTime} days` : '—'} tint="lemon" icon={<Timer size={19} />} footer={`${kpis?.adoptionRate ?? 0}% adoption rate`} />
      </div>

      {/* status donut + top by impact */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 20 }} className="dashboard-two">
        <div className="card card-pad anim-fade-up">
          <div className="card-title mb-1">Feature Status Overview</div>
          <div className="card-sub mb-4">Distribution across the lifecycle</div>
          {mix ? <DonutChart data={mix} centerLabel="TOTAL" centerValue={kpis?.totalFeatures ?? mix.reduce((s, d) => s + d.value, 0)} /> : <Skeleton h={200} />}
        </div>
        <div className="card card-pad anim-fade-up">
          <div className="flex items-center justify-between mb-3">
            <div><div className="card-title">Top Features by Impact Score</div><div className="card-sub">Highest business value</div></div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/revenue/features')}>All <ArrowRight size={13} /></button>
          </div>
          {top ? (
            <div className="flex-col gap-3">
              {top.map((f, i) => (
                <button key={f.id} className="flex items-center gap-3 card-hover" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 11px', cursor: 'pointer', textAlign: 'left' }} onClick={() => navigate(`/revenue/features?id=${f.id}`)}>
                  <span className="metric-icon" style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--tint-green)', color: 'var(--tint-green-ink)', fontSize: 12, fontWeight: 800 }}>{i + 1}</span>
                  <div className="flex-1" style={{ minWidth: 0 }}><div className="fw-6 t-sm truncate">{f.name}</div><div className="t-xs ink-3">{f.module}</div></div>
                  <ImpactBar score={f.impactScore} />
                </button>
              ))}
            </div>
          ) : <Skeleton h={220} />}
        </div>
      </div>

      {/* feature pipeline */}
      <div className="card card-pad anim-fade-up">
        <div className="card-title mb-1">Feature Pipeline</div>
        <div className="card-sub mb-4">Features at each stage of the workflow</div>
        <div className="pipe-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${FEATURE_STATUSES.length}, minmax(150px, 1fr))`, gap: 10, overflowX: 'auto' }}>
          {pipeline.map((col) => (
            <div key={col.status} style={{ minWidth: 150 }}>
              <div className="flex items-center justify-between mb-2"><StatusChip status={col.status} /><b className="t-sm">{col.items.length}</b></div>
              <div className="flex-col gap-1">
                {col.items.slice(0, 3).map((f) => (
                  <button key={f.id} className="card-hover t-xs fw-5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 9px', cursor: 'pointer', textAlign: 'left', width: '100%' }} onClick={() => navigate(`/revenue/features?id=${f.id}`)}>
                    <div className="truncate">{f.name}</div>
                    <div className="t-xs ink-3 truncate">{f.client}</div>
                  </button>
                ))}
                {col.items.length > 3 && <button className="t-xs ink-3" style={{ textAlign: 'left', padding: '2px 4px', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/revenue/roadmap')}>+ {col.items.length - 3} more</button>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8-step workflow */}
      <div className="card card-pad anim-fade-up">
        <div className="card-title mb-1">Feature Workflow</div>
        <div className="card-sub mb-4">Every feature moves from client request to shared reusable innovation</div>
        <div className="wf-strip">
          {WORKFLOW_STEPS.map((s, i) => {
            const Icon = STEP_ICON[s.icon] || FileText;
            return (
              <div key={s.key} className="wf-step-wrap">
                <div className="wf-step">
                  <div className="wf-ico"><Icon size={18} /></div>
                  <div className="wf-num">{s.step}</div>
                  <div className="wf-label">{s.label}</div>
                  <div className="wf-desc">{s.desc}</div>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && <ArrowRight className="wf-arrow" size={15} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* sharing & reuse + recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }} className="dashboard-two">
        <div className="card card-pad anim-fade-up">
          <div className="card-title mb-1">Feature Sharing & Reuse</div>
          <div className="card-sub mb-4">Turn one client's feature into revenue everywhere</div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="text-center" style={{ flex: 1 }}><div className="metric-icon" style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--tint-blue)', color: 'var(--tint-blue-ink)', margin: '0 auto 6px' }}><Building2 size={18} /></div><div className="t-xs fw-6">Deployed for<br />1 Client</div></div>
            <ArrowRight size={16} className="ink-3" />
            <div className="text-center" style={{ flex: 1 }}><div className="metric-icon" style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--tint-lemon)', color: 'var(--tint-lemon-ink)', margin: '0 auto 6px' }}><Gauge size={18} /></div><div className="t-xs fw-6">Evaluate<br />& Analyze</div></div>
            <ArrowRight size={16} className="ink-3" />
            <div className="text-center" style={{ flex: 1 }}><div className="metric-icon" style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--tint-green)', color: 'var(--tint-green-ink)', margin: '0 auto 6px' }}><Globe size={18} /></div><div className="t-xs fw-6">Available for<br />All Clients</div></div>
          </div>
          <div className="flex-col gap-2" style={{ borderTop: '1px dashed var(--border)', paddingTop: 12 }}>
            {['No duplicate development', 'Faster implementation', 'Higher client satisfaction', 'Central knowledge base', 'New revenue opportunities'].map((b) => (
              <div key={b} className="flex items-center gap-2 t-sm ink-2"><CheckCircle2 size={14} color="var(--success)" /> {b}</div>
            ))}
          </div>
        </div>
        <div className="card card-pad anim-fade-up">
          <div className="flex items-center justify-between mb-3">
            <div><div className="card-title">Recent Features</div><div className="card-sub">Latest requests across clients</div></div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/revenue/features')}>View All <ArrowRight size={13} /></button>
          </div>
          {features ? (
            <div className="flex-col gap-2">
              {recent.map((f) => (
                <button key={f.id} className="flex items-center gap-3 card-hover" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px', cursor: 'pointer' }} onClick={() => navigate(`/revenue/features?id=${f.id}`)}>
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}><div className="fw-6 t-sm truncate">{f.name}</div><div className="t-xs ink-3">{f.client} · {fmtDate(f.requestDate)}</div></div>
                  <Badge tone={PRIO_TONE[f.priority]}>{f.priority}</Badge>
                  <StatusChip status={f.status} />
                </button>
              ))}
            </div>
          ) : <Skeleton h={240} />}
        </div>
      </div>

      <style>{`
        .wf-strip { display:flex; align-items:stretch; gap:0; overflow-x:auto; padding-bottom:6px; }
        .wf-step-wrap { display:flex; align-items:center; flex:1; min-width:130px; }
        .wf-step { flex:1; text-align:center; padding:6px 6px; }
        .wf-ico { width:44px; height:44px; border-radius:13px; margin:0 auto 8px; display:flex; align-items:center; justify-content:center; background:var(--tint-green); color:var(--tint-green-ink); }
        .wf-num { font-size:11px; font-weight:800; color:var(--primary); }
        .wf-label { font-weight:700; font-size:12px; margin-top:2px; }
        .wf-desc { font-size:10.5px; color:var(--text-3); margin-top:3px; line-height:1.35; }
        .wf-arrow { color:var(--text-3); flex-shrink:0; }
        @media (max-width:900px){ .dashboard-two{ grid-template-columns:1fr !important; } }
      `}</style>
    </div>
  );
}
