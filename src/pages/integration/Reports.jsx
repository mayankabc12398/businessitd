// Reports — repository analytics & one-click CSV exports.
import { BarChart3, Download, Boxes, Braces, Building2, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, Badge, Skeleton, DonutChart, BarChart, HBarList } from '../../components/ui';
import { exportCSV } from '../../utils/format';
import { INTEGRATION_STATUS } from '../../data/integration';

export default function Reports() {
  const { data: kpis } = useApi(() => api.getSirKpis());
  const { data: mix } = useApi(() => api.getTypeMix());
  const { data: integrations } = useApi(() => api.getIntegrations());
  const { data: apis } = useApi(() => api.getApis());
  const { data: clients } = useApi(() => api.getClientImplementations());

  const REPORTS = [
    { key: 'integrations', label: 'Integrations Register', desc: 'All integrations with vendor, type & status', icon: <Boxes size={16} />, rows: (integrations || []), cols: [{ header: 'ID', key: 'id' }, { header: 'Name', key: 'name' }, { header: 'Type', key: 'type' }, { header: 'Vendor', key: 'vendor' }, { header: 'Status', key: 'status' }, { header: 'APIs', key: 'totalApis' }, { header: 'Last Updated', key: 'lastUpdated' }], file: 'integrations-register.csv' },
    { key: 'apis', label: 'API Catalogue', desc: 'Every documented API endpoint', icon: <Braces size={16} />, rows: (apis || []), cols: [{ header: 'ID', key: 'id' }, { header: 'Integration', key: 'integrationName' }, { header: 'API', key: 'name' }, { header: 'Method', key: 'method' }, { header: 'URL', key: 'url' }, { header: 'Auth', key: 'authType' }], file: 'api-catalogue.csv' },
    { key: 'clients', label: 'Client Implementations', desc: 'Which hospital runs which integration', icon: <Building2 size={16} />, rows: (clients || []), cols: [{ header: 'Client', key: 'client' }, { header: 'Integration', key: 'integrationName' }, { header: 'Version', key: 'version' }, { header: 'Status', key: 'status' }, { header: 'Live Date', key: 'liveDate' }], file: 'client-implementations.csv' },
  ];

  const byStatus = INTEGRATION_STATUS.map((s) => ({ label: s, value: (integrations || []).filter((i) => i.status === s).length }));
  const apisByIntegration = [...(integrations || [])].map((i) => ({ label: i.name, value: i.totalApis })).sort((a, b) => b.value - a.value).slice(0, 7);

  return (
    <div className="page">
      <PageHeader icon={<BarChart3 size={22} />} tint="indigo" title="Reports & Analytics" desc="Repository analytics and one-click CSV exports"
        crumbs={[{ label: 'Integration' }, { label: 'Reports' }]} />

      <div className="kpi-grid stagger">
        <MetricCard label="Integrations" value={kpis?.totalIntegrations ?? '—'} tint="blue" icon={<Boxes size={19} />} footer={`${kpis?.reusable ?? 0} reusable`} />
        <MetricCard label="APIs Documented" value={kpis?.totalApis ?? '—'} tint="mint" icon={<Braces size={19} />} footer="Endpoints" />
        <MetricCard label="Client Roll-outs" value={kpis?.completedImplementations ?? '—'} tint="cyan" icon={<Building2 size={19} />} footer="Live implementations" />
        <MetricCard label="Documents" value={kpis?.documents ?? '—'} tint="lavender" icon={<FileText size={19} />} footer="Archived" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="dashboard-two">
        <div className="card card-pad anim-fade-up">
          <div className="card-title mb-1">Integrations by Status</div>
          <div className="card-sub mb-4">Repository health</div>
          <BarChart height={220} data={byStatus} series={[{ key: 'value', label: 'Integrations' }]} showLegend={false} />
        </div>
        <div className="card card-pad anim-fade-up">
          <div className="card-title mb-1">Integrations by Type</div>
          <div className="card-sub mb-4">Distribution</div>
          {mix ? <DonutChart data={mix} centerLabel="TOTAL" centerValue={kpis?.totalIntegrations ?? 0} /> : <Skeleton h={200} />}
        </div>
      </div>

      <div className="card card-pad anim-fade-up">
        <div className="card-title mb-1">Top Integrations by API Count</div>
        <div className="card-sub mb-4">Most extensively documented</div>
        <HBarList data={apisByIntegration} formatValue={(v) => `${v} APIs`} />
      </div>

      <div className="card card-pad anim-fade-up">
        <div className="card-title mb-1">Export Reports</div>
        <div className="card-sub mb-4">Download repository data as CSV</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {REPORTS.map((r) => (
            <div key={r.key} className="flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
              <span className="metric-icon" style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--tint-indigo)', color: 'var(--tint-indigo-ink)' }}>{r.icon}</span>
              <div className="flex-1" style={{ minWidth: 0 }}>
                <div className="fw-6 t-sm">{r.label}</div>
                <div className="t-xs ink-3">{r.desc}</div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => exportCSV(r.rows, r.cols, r.file)}><Download size={13} /> CSV</button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 t-xs ink-3"><Badge tone="success">Tip</Badge> Reuse existing integration data for new clients with minimal effort.</div>
      </div>

      <style>{`@media (max-width:900px){ .dashboard-two{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}
