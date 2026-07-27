// Reports & Analytics — feature intelligence analytics + CSV exports.
import { BarChart3, Download, Lightbulb, CircleDollarSign, Recycle, Building2 } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, Badge, Skeleton, LineChart, DonutChart, HBarList } from '../../components/ui';
import { fmtINR, fmtNum, exportCSV } from '../../utils/format';
import { FEATURES, CLIENT_ADOPTION, FEATURE_LIBRARY, FEATURE_STATUSES } from '../../data/revenue';

const REPORTS = [
  { key: 'features', label: 'Feature Register', desc: 'All features with status, category & impact', icon: <Lightbulb size={16} />, rows: FEATURES, cols: [{ header: 'ID', key: 'id' }, { header: 'Name', key: 'name' }, { header: 'Module', key: 'module' }, { header: 'Category', key: 'category' }, { header: 'Client', key: 'client' }, { header: 'Status', key: 'status' }, { header: 'Impact', key: 'impactScore' }, { header: 'Revenue', key: 'revenueGenerated' }], file: 'feature-register.csv' },
  { key: 'library', label: 'Feature Library', desc: 'Reusable / published features', icon: <Recycle size={16} />, rows: FEATURE_LIBRARY, cols: [{ header: 'ID', key: 'id' }, { header: 'Name', key: 'name' }, { header: 'Category', key: 'category' }, { header: 'Impact', key: 'impactScore' }, { header: 'ROI', key: 'roiScore' }], file: 'feature-library.csv' },
  { key: 'adoption', label: 'Client Adoption', desc: 'Which client runs which feature', icon: <Building2 size={16} />, rows: CLIENT_ADOPTION, cols: [{ header: 'Client', key: 'client' }, { header: 'Feature', key: 'featureName' }, { header: 'Version', key: 'version' }, { header: 'Status', key: 'status' }, { header: 'Go-Live', key: 'goLive' }], file: 'client-adoption.csv' },
];

export default function Reports() {
  const { data: kpis } = useApi(() => api.getSfrKpis());
  const { data: mix } = useApi(() => api.getFeatureStatusMix());
  const { data: trend } = useApi(() => api.getFeatureTrend());

  const revByCat = {};
  FEATURES.forEach((f) => { revByCat[f.category] = (revByCat[f.category] || 0) + f.revenueGenerated; });
  const revBars = Object.entries(revByCat).map(([label, value]) => ({ label, value })).filter((x) => x.value > 0).sort((a, b) => b.value - a.value);

  return (
    <div className="page">
      <PageHeader icon={<BarChart3 size={22} />} tint="indigo" title="Reports & Analytics" desc="Feature intelligence analytics and one-click CSV exports"
        crumbs={[{ label: 'Feature Intelligence' }, { label: 'Reports' }]} />

      <div className="kpi-grid stagger">
        <MetricCard label="Total Features" value={kpis ? fmtNum(kpis.totalFeatures) : '—'} tint="lavender" icon={<Lightbulb size={19} />} footer={`${kpis?.reusableFeatures ?? 0} reusable`} />
        <MetricCard label="Revenue Generated" value={kpis ? fmtINR(kpis.revenueGenerated, true) : '—'} tint="green" icon={<CircleDollarSign size={19} />} footer="From features" />
        <MetricCard label="Adoption Rate" value={kpis ? `${kpis.adoptionRate}%` : '—'} tint="cyan" icon={<BarChart3 size={19} />} footer="Across base" />
        <MetricCard label="Avg Dev Time" value={kpis ? `${kpis.avgDevTime} days` : '—'} tint="lemon" icon={<BarChart3 size={19} />} footer="Per feature" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }} className="dashboard-two">
        <div className="card card-pad anim-fade-up">
          <div className="card-title mb-1">Feature Throughput</div>
          <div className="card-sub mb-4">Requested vs deployed per month</div>
          {trend ? <LineChart height={240} data={trend} series={[{ key: 'requested', label: 'Requested' }, { key: 'deployed', label: 'Deployed' }]} /> : <Skeleton h={240} />}
        </div>
        <div className="card card-pad anim-fade-up">
          <div className="card-title mb-1">Status Distribution</div>
          <div className="card-sub mb-4">All {FEATURE_STATUSES.length} stages</div>
          {mix ? <DonutChart data={mix} centerLabel="TOTAL" centerValue={kpis?.totalFeatures ?? 0} /> : <Skeleton h={200} />}
        </div>
      </div>

      <div className="card card-pad anim-fade-up">
        <div className="card-title mb-1">Revenue by Category</div>
        <div className="card-sub mb-4">Where new-feature revenue comes from</div>
        <HBarList data={revBars} formatValue={(v) => fmtINR(v, true)} />
      </div>

      <div className="card card-pad anim-fade-up">
        <div className="card-title mb-1">Export Reports</div>
        <div className="card-sub mb-4">Download feature intelligence data as CSV</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {REPORTS.map((r) => (
            <div key={r.key} className="flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
              <span className="metric-icon" style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--tint-indigo)', color: 'var(--tint-indigo-ink)' }}>{r.icon}</span>
              <div className="flex-1" style={{ minWidth: 0 }}><div className="fw-6 t-sm">{r.label}</div><div className="t-xs ink-3">{r.desc}</div></div>
              <button className="btn btn-outline btn-sm" onClick={() => exportCSV(r.rows, r.cols, r.file)}><Download size={13} /> CSV</button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 t-xs ink-3"><Badge tone="success">Tip</Badge> Promote reusable features to all 1,100+ clients to maximise ROI.</div>
      </div>

      <style>{`@media (max-width:900px){ .dashboard-two{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}
