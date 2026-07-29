// Portfolio dashboard — the landing view for the PMO suite.
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban, Rocket, AlertTriangle, FileSignature, ArrowRight,
  TrendingUp, Database, FlaskConical, GraduationCap,
  CircleDollarSign, ShieldAlert, CheckCircle2, TriangleAlert,
} from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import {
  MetricCard, Avatar, Badge, Skeleton, LineChart, BarChart, DonutChart,
  HBarList, Timeline, ProgressBar,
} from '../components/ui';
import { LIFECYCLE } from '../data/masters';
import { fmtDate } from '../utils/format';

const money = (n) => `₹${(n / 1e7).toFixed(2)} Cr`;
const healthTone = (h) => ({ 'On Track': 'success', 'At Risk': 'warning', Delayed: 'danger', Planning: 'info' }[h] || 'neutral');
const UPCOMING_TINT = { golive: 'green', meeting: 'blue', uat: 'lavender', training: 'pink' };

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: currentUser } = useApi(() => api.getCurrentUser());
  const { data: projects } = useApi(() => api.getProjects());
  const { data: clients } = useApi(() => api.getClients());
  const findClient = (id) => (clients || []).find((c) => c.id === id || c.code === id);
  const { data: kpis } = useApi(() => api.getProjectKpis());
  const { data: gov } = useApi(() => api.getGovernanceKpis());
  const { data: md } = useApi(() => api.getMasterDataKpis());
  const { data: del } = useApi(() => api.getDeliveryKpis());
  const { data: srsK } = useApi(() => api.getSrsKpis());
  const { data: goliveK } = useApi(() => api.getGoLiveKpis());
  const { data: trend } = useApi(() => api.getProjectTrend());
  const { data: revenue } = useApi(() => api.getRevenueTrend());
  const { data: phase } = useApi(() => api.getPhaseDistribution());
  const { data: health } = useApi(() => api.getHealthMix());
  const { data: workload } = useApi(() => api.getWorkload());
  const { data: activity } = useApi(() => api.getActivityFeed());
  const { data: upcoming } = useApi(() => api.getUpcoming());

  const attention = (projects || []).filter((p) => p.health === 'At Risk' || p.health === 'Delayed');
  const goLives = (projects || [])
    .filter((p) => p.status !== 'Completed' && p.targetGoLive)
    .sort((a, b) => String(a.targetGoLive).localeCompare(String(b.targetGoLive)))
    .slice(0, 5);

  return (
    <div className="page">
      {/* Hero */}
      <div className="card card-pad anim-fade-up hero-banner" style={{ background: 'linear-gradient(120deg, #eef1ff 0%, #e8f4fd 45%, #eafaf2 100%)', border: '1px solid #dfe6f7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div className="flex items-center gap-4">
          <Avatar name={currentUser?.name} hue={0} size="xl" ring />
          <div>
            <div className="t-sm fw-6" style={{ color: 'var(--primary-700)' }}>Friday, 24 July 2026</div>
            <h1 className="t-2xl fw-8" style={{ letterSpacing: '-0.03em' }}>Good morning, {currentUser?.firstName || (currentUser?.name || '').split(' ')[0]} 👋</h1>
            <p className="t-base ink-2 mt-1">You have <b>{kpis?.atRisk ?? '—'} projects</b> needing attention, <b>{gov?.signoffsPending ?? '—'} sign-offs</b> pending, and <b>2 go-lives</b> in the next 30 days.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-primary" onClick={() => navigate('/projects')}><FolderKanban size={15} /> View Projects</button>
          <button className="btn btn-outline" onClick={() => navigate('/reports')}>Reports <ArrowRight size={14} /></button>
        </div>
      </div>

      {/* KPI row */}
      <div className="kpi-grid stagger">
        <MetricCard label="Active Projects" value={kpis?.inProgress ?? '—'} delta={12} tint="blue" icon={<Rocket size={19} />} footer={`${kpis?.total ?? 0} total · ${kpis?.completed ?? 0} completed`} onClick={() => navigate('/projects')} />
        <MetricCard label="Portfolio Value" value={kpis ? money(kpis.contractValue) : '—'} delta={8.4} tint="mint" icon={<CircleDollarSign size={19} />} footer={`${kpis?.onHold ?? 0} on hold`} onClick={() => navigate('/reports')} />
        <MetricCard label="At Risk / Delayed" value={kpis?.atRisk ?? '—'} delta={-2} deltaLabel="vs last week" tint="peach" icon={<AlertTriangle size={19} />} footer={`${gov?.issuesOpen ?? 0} open issues`} onClick={() => navigate('/issues')} />
        <MetricCard label="Pending Sign-offs" value={gov?.signoffsPending ?? '—'} tint="lavender" icon={<FileSignature size={19} />} footer={`${gov?.signoffsSigned ?? 0} signed to date`} onClick={() => navigate('/signoff')} />
      </div>

      {/* lifecycle KPI strip — SRS → Master Data → UAT → Training */}
      <div className="kpi-grid stagger">
        <MetricCard label="SRS Completed" value={`${srsK?.completed ?? 0}/${srsK?.scheduled ?? 0}`} tint="mint" icon={<FileSignature size={19} />} footer={`${srsK?.signed ?? 0} signed · ${srsK?.gaps ?? 0} gaps`} onClick={() => navigate('/srs')} />
        <MetricCard label="Master Data Imported" value={`${md?.imported ?? 0}/${md?.total ?? 0}`} tint="lemon" icon={<Database size={19} />} footer={`${md?.awaited ?? 0} pending · ${md?.errors ?? 0} errors`} onClick={() => navigate('/master-data')} />
        <MetricCard label="UAT Modules Passed" value={`${del?.uatPassed ?? 0}/${del?.uatModules ?? 0}`} tint="cyan" icon={<FlaskConical size={19} />} footer={`${del?.bugsOpen ?? 0} open bugs`} onClick={() => navigate('/uat')} />
        <MetricCard label="Training Completed" value={`${del?.trainingDone ?? 0}/${del?.trainingTotal ?? 0}`} tint="pink" icon={<GraduationCap size={19} />} footer="Dept-wise sessions" onClick={() => navigate('/training')} />
      </div>

      {/* go-live & governance KPI strip */}
      <div className="kpi-grid stagger">
        <MetricCard label="Ready for Go-Live" value={goliveK?.readyProjects ?? '—'} tint="green" icon={<Rocket size={19} />} footer={`${goliveK?.parallelRunning ?? 0} in parallel run`} onClick={() => navigate('/go-live')} />
        <MetricCard label="Go-Live Completed" value={goliveK?.finalLive ?? '—'} tint="mint" icon={<CheckCircle2 size={19} />} footer={`${goliveK?.certsIssued ?? 0} certificates issued`} onClick={() => navigate('/go-live')} />
        <MetricCard label="Open Issues" value={gov?.issuesOpen ?? '—'} tint="peach" icon={<ShieldAlert size={19} />} footer={`${gov?.issuesCritical ?? 0} critical`} onClick={() => navigate('/issues')} />
        <MetricCard label="High / Critical Risks" value={gov?.risksHigh ?? '—'} tint="rose" icon={<TriangleAlert size={19} />} footer={`${gov?.risksOpen ?? 0} risks open`} onClick={() => navigate('/risks')} />
      </div>

      {/* charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }} className="dashboard-two">
        <div className="card card-pad anim-fade-up">
          <div className="flex items-center justify-between mb-4">
            <div><div className="card-title">Delivery & Revenue Trend</div><div className="card-sub">Projects started vs go-lives, and billing (₹ Cr) · Feb–Jul</div></div>
            <Badge tone="success"><TrendingUp size={12} /> On plan</Badge>
          </div>
          {trend && revenue ? (
            <LineChart height={240} data={trend.map((t, i) => ({ label: t.label, started: t.started, golive: t.golive, billed: revenue[i]?.billed ?? 0 }))}
              series={[{ key: 'started', label: 'Started' }, { key: 'golive', label: 'Go-Lives' }, { key: 'billed', label: 'Billed (₹Cr)' }]} />
          ) : <Skeleton h={240} />}
        </div>
        <div className="card card-pad anim-fade-up">
          <div className="card-title mb-1">Portfolio Health</div>
          <div className="card-sub mb-4">By project status</div>
          {health ? <DonutChart data={health} centerLabel="PROJECTS" centerValue={(projects || []).length} /> : <Skeleton h={200} />}
          <div className="mt-4" style={{ borderTop: '1px dashed var(--border)', paddingTop: 14 }}>
            <div className="flex items-center justify-between"><span className="t-sm ink-2 fw-5">On-time delivery (12m)</span><span className="t-md fw-8" style={{ color: 'var(--success-ink)' }}>88%</span></div>
            <div className="t-xs ink-3 mt-1">Industry HIMS benchmark: 72% — you're 16 pts ahead.</div>
          </div>
        </div>
      </div>

      {/* phase distribution + workload + attention */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 20 }} className="dashboard-three">
        <div className="card card-pad anim-fade-up">
          <div className="card-title mb-1">Projects by Phase</div>
          <div className="card-sub mb-4">Where the portfolio sits</div>
          {phase ? <BarChart height={220} data={phase} series={[{ key: 'value', label: 'Projects' }]} showLegend={false} /> : <Skeleton h={220} />}
        </div>
        <div className="card card-pad anim-fade-up">
          <div className="card-title mb-1">Consultant Workload</div>
          <div className="card-sub mb-4">Utilisation %</div>
          {workload ? <HBarList data={[...workload].sort((a, b) => b.value - a.value)} formatValue={(v) => `${v}%`} /> : <Skeleton h={220} />}
        </div>
        <div className="card card-pad anim-fade-up">
          <div className="flex items-center justify-between mb-3">
            <div className="card-title">Needs Attention</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>All <ArrowRight size={13} /></button>
          </div>
          <div className="flex-col gap-2">
            {attention.map((p) => (
              <button key={p.code} className="flex items-center justify-between card-hover" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px', cursor: 'pointer' }} onClick={() => navigate(`/projects?code=${p.code}`)}>
                <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
                  <Avatar name={findClient(p.clientId)?.name} hue={5} size="sm" />
                  <div style={{ minWidth: 0 }}><div className="fw-6 t-sm truncate">{p.name.split(' — ')[0]}</div><div className="t-xs ink-3">{LIFECYCLE.find((s) => s.key === p.currentStage)?.label}</div></div>
                </div>
                <Badge tone={healthTone(p.health)}>{p.health}</Badge>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* upcoming go-lives + activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }} className="dashboard-two">
        <div className="card card-pad anim-fade-up">
          <div className="flex items-center justify-between mb-3">
            <div><div className="card-title">Upcoming Go-Lives</div><div className="card-sub">Next milestones across the portfolio</div></div>
            <Rocket size={18} color="var(--success)" />
          </div>
          <div className="flex-col gap-2">
            {goLives.map((p) => (
              <div key={p.code} className="flex items-center gap-3" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="metric-icon" style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--tint-green)', color: 'var(--tint-green-ink)' }}><Rocket size={17} /></div>
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <div className="fw-6 t-sm truncate">{p.name.split(' — ')[0]}</div>
                  <div className="t-xs ink-3">{findClient(p.clientId)?.city} · {LIFECYCLE.find((s) => s.key === p.currentStage)?.label}</div>
                </div>
                <div style={{ width: 140 }}><ProgressBar value={p.progress} /></div>
                <div className="text-right" style={{ minWidth: 90 }}><div className="t-sm fw-6">{fmtDate(p.targetGoLive)}</div><div className="t-xs ink-3">target</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card card-pad anim-fade-up">
          <div className="card-title mb-1">Calendar</div>
          <div className="card-sub mb-3">Meetings, UAT, training & go-lives</div>
          <div className="flex-col gap-2">
            {(upcoming || []).map((u) => (
              <div key={u.id} className="flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px' }}>
                <div className="text-center" style={{ width: 42, flexShrink: 0 }}>
                  <div className="t-lg fw-8" style={{ lineHeight: 1 }}>{u.date.slice(8)}</div>
                  <div className="t-xs ink-3">{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+u.date.slice(5,7)-1]}</div>
                </div>
                <div className="flex-1" style={{ minWidth: 0 }}><div className="fw-6 t-sm truncate">{u.title}</div><div className="t-xs ink-3">{u.time} · {u.kind}</div></div>
                <span style={{ width: 8, height: 8, borderRadius: 3, background: `var(--tint-${UPCOMING_TINT[u.kind]}-ink)` }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* activity feed */}
      <div className="card card-pad anim-fade-up">
        <div className="card-title mb-3">Recent Activity</div>
        {activity ? (
          <Timeline items={activity.map((a) => ({ title: <span><b>{a.who}</b> {a.action} <span className="ink-2">{a.target}</span></span>, time: a.time, color: a.color }))} />
        ) : <Skeleton h={220} />}
      </div>

      <style>{`
        @media (max-width: 1100px){ .dashboard-three{ grid-template-columns:1fr !important; } }
        @media (max-width: 900px){ .dashboard-two{ grid-template-columns:1fr !important; } }
      `}</style>
    </div>
  );
}
