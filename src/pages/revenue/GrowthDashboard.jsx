// Feature Management & Revenue Generation — growth dashboard.
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, CircleDollarSign, Users, Repeat, ArrowRight,
  Lightbulb, Wallet, Target,
} from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import {
  PageHeader, MetricCard, Badge, Skeleton, LineChart, HBarList, DonutChart, ProgressBar,
} from '../../components/ui';
import { fmtINR } from '../../utils/format';
import { FEATURE_STATUS_TINT } from '../../data/revenue';

export default function GrowthDashboard() {
  const navigate = useNavigate();
  const { data: kpis } = useApi(() => api.getRevenueKpis());
  const { data: trend } = useApi(() => api.getRevenueMrrTrend());
  const { data: byModule } = useApi(() => api.getRevenueByModule());
  const { data: streams } = useApi(() => api.getRevenueStreams());
  const { data: features } = useApi(() => api.getFeatures());

  const pipeline = (features || []).filter((f) => f.status !== 'Shipped').sort((a, b) => b.revenueImpact - a.revenueImpact).slice(0, 5);
  const funnelMix = ['Idea', 'Planned', 'In Dev', 'Beta', 'Shipped'].map((s) => ({
    label: s, value: (features || []).filter((f) => f.status === s).length,
    color: `var(--tint-${FEATURE_STATUS_TINT[s]}-ink)`,
  }));

  return (
    <div className="page">
      <PageHeader icon={<TrendingUp size={22} />} tint="green" title="Feature Management & Revenue"
        desc="Product pipeline, subscription revenue and growth performance"
        crumbs={[{ label: 'Revenue' }, { label: 'Dashboard' }]}
        actions={<button className="btn btn-primary" onClick={() => navigate('/revenue/features')}><Lightbulb size={15} /> Feature Backlog</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Monthly Recurring (MRR)" value={kpis ? fmtINR(kpis.mrr, true) : '—'} delta={8.3} tint="green" icon={<Repeat size={19} />} footer={`${kpis ? fmtINR(kpis.arr, true) : '—'} ARR`} onClick={() => navigate('/revenue/streams')} />
        <MetricCard label="Pipeline Value" value={kpis ? fmtINR(kpis.pipelineValue, true) : '—'} delta={12.4} tint="lavender" icon={<Target size={19} />} footer={`${kpis?.featuresInDev ?? 0} features in dev`} onClick={() => navigate('/revenue/features')} />
        <MetricCard label="Active Clients" value={kpis?.activeClients ?? '—'} delta={4} tint="cyan" icon={<Users size={19} />} footer={`${kpis?.netRevenueRetention ?? 0}% net retention`} onClick={() => navigate('/revenue/plans')} />
        <MetricCard label="Churn Rate" value={kpis ? `${kpis.churnRate}%` : '—'} delta={-1.2} deltaLabel="vs last month" tint="peach" icon={<Wallet size={19} />} footer="Logo churn (monthly)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }} className="dashboard-two">
        <div className="card card-pad anim-fade-up">
          <div className="flex items-center justify-between mb-4">
            <div><div className="card-title">MRR Growth</div><div className="card-sub">Monthly recurring revenue vs new & churned (₹ lakh) · Jan–Jul</div></div>
            <Badge tone="success"><TrendingUp size={12} /> +36% YTD</Badge>
          </div>
          {trend ? (
            <LineChart height={240} data={trend}
              series={[{ key: 'mrr', label: 'MRR (₹L)' }, { key: 'newMrr', label: 'New (₹L)' }, { key: 'churn', label: 'Churn (₹L)' }]} />
          ) : <Skeleton h={240} />}
        </div>
        <div className="card card-pad anim-fade-up">
          <div className="card-title mb-1">Feature Pipeline</div>
          <div className="card-sub mb-4">Backlog by stage</div>
          {features ? <DonutChart data={funnelMix} centerLabel="FEATURES" centerValue={features.length} /> : <Skeleton h={200} />}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }} className="dashboard-two">
        <div className="card card-pad anim-fade-up">
          <div className="card-title mb-1">Revenue by Module</div>
          <div className="card-sub mb-4">ARR contribution (₹ lakh)</div>
          {byModule ? <HBarList data={byModule} formatValue={(v) => `₹${v}L`} /> : <Skeleton h={220} />}
        </div>
        <div className="card card-pad anim-fade-up">
          <div className="flex items-center justify-between mb-3">
            <div><div className="card-title">Top Revenue Opportunities</div><div className="card-sub">Highest-impact features in the pipeline</div></div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/revenue/features')}>All <ArrowRight size={13} /></button>
          </div>
          {features ? (
            <div className="flex-col gap-2">
              {pipeline.map((f) => (
                <button key={f.id} className="flex items-center justify-between card-hover" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px', cursor: 'pointer', textAlign: 'left' }} onClick={() => navigate('/revenue/features')}>
                  <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
                    <div className="metric-icon" style={{ width: 34, height: 34, borderRadius: 9, background: `var(--tint-${FEATURE_STATUS_TINT[f.status]})`, color: `var(--tint-${FEATURE_STATUS_TINT[f.status]}-ink)` }}><Lightbulb size={15} /></div>
                    <div style={{ minWidth: 0 }}><div className="fw-6 t-sm truncate">{f.title}</div><div className="t-xs ink-3">{f.status} · {f.targetQtr}</div></div>
                  </div>
                  <div className="text-right" style={{ flexShrink: 0 }}><div className="fw-7 t-sm" style={{ color: 'var(--success-ink)' }}>{fmtINR(f.revenueImpact, true)}</div><div className="t-xs ink-3">impact</div></div>
                </button>
              ))}
            </div>
          ) : <Skeleton h={220} />}
        </div>
      </div>

      <div className="card card-pad anim-fade-up">
        <div className="flex items-center justify-between mb-3">
          <div><div className="card-title">Revenue Streams</div><div className="card-sub">Recurring & one-time sources by ARR</div></div>
          <CircleDollarSign size={18} color="var(--success)" />
        </div>
        {streams ? (
          <div className="flex-col gap-2">
            {[...streams].sort((a, b) => b.arr - a.arr).slice(0, 6).map((s) => (
              <div key={s.id} className="flex items-center gap-3" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="flex-1" style={{ minWidth: 0 }}><div className="fw-6 t-sm truncate">{s.source}</div><div className="t-xs ink-3">{s.category} · {s.clients} clients</div></div>
                <div style={{ width: 160 }}><ProgressBar value={(s.arr / Math.max(...streams.map((x) => x.arr))) * 100} color={s.category === 'Recurring' ? 'var(--success)' : 'var(--tint-lavender-ink)'} /></div>
                <div className="text-right" style={{ minWidth: 90 }}><div className="t-sm fw-7">{fmtINR(s.arr, true)}</div><Badge tone={s.growth >= 0 ? 'success' : 'danger'}>{s.growth >= 0 ? '+' : ''}{s.growth}%</Badge></div>
              </div>
            ))}
          </div>
        ) : <Skeleton h={220} />}
      </div>

      <style>{`@media (max-width: 900px){ .dashboard-two{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}
