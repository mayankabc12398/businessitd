// Module 13 · ROI Dashboard — cost, revenue & ROI per feature.
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gauge, CircleDollarSign, TrendingUp, Users, Star, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, Skeleton, HBarList } from '../../components/ui';
import { fmtINR, fmtNum } from '../../utils/format';

const roiTone = (r) => (r >= 85 ? 'success' : r >= 70 ? 'warning' : r > 0 ? 'info' : 'neutral');

export default function RoiDashboard() {
  const navigate = useNavigate();
  const { data: rows, loading } = useApi(() => api.getFeatures());

  const deployed = useMemo(() => (rows || []).filter((f) => f.revenueGenerated > 0), [rows]);
  const totalRevenue = deployed.reduce((s, f) => s + f.revenueGenerated, 0);
  const totalCost = deployed.reduce((s, f) => s + f.devCost, 0);
  const avgRoi = deployed.length ? Math.round(deployed.reduce((s, f) => s + f.roiScore, 0) / deployed.length) : 0;
  const topRoi = [...deployed].sort((a, b) => b.roiScore - a.roiScore).slice(0, 7).map((f) => ({ label: f.name, value: f.roiScore }));

  const columns = [
    { key: 'name', header: 'Feature', minWidth: 200, render: (r) => <div><div className="fw-6 t-sm">{r.name}</div><div className="t-xs ink-3">{r.module}</div></div> },
    { key: 'devCost', header: 'Dev Cost', align: 'right', accessor: (r) => r.devCost, render: (r) => fmtINR(r.devCost, true) },
    { key: 'revenueGenerated', header: 'Revenue', align: 'right', accessor: (r) => r.revenueGenerated, render: (r) => <span className="fw-6" style={{ color: 'var(--success-ink)' }}>{fmtINR(r.revenueGenerated, true)}</span> },
    { key: 'clientsUsing', header: 'Clients', align: 'right', accessor: (r) => r.clientsUsing },
    { key: 'totalImpl', header: 'Implementations', align: 'right', accessor: (r) => r.totalImpl },
    { key: 'supportTickets', header: 'Tickets', align: 'right', accessor: (r) => r.supportTickets },
    { key: 'satisfaction', header: 'CSAT', align: 'center', accessor: (r) => r.satisfaction, render: (r) => r.satisfaction ? <Badge tone="warning"><Star size={11} /> {r.satisfaction}</Badge> : <span className="ink-3">—</span> },
    { key: 'roiScore', header: 'ROI Score', align: 'center', accessor: (r) => r.roiScore, render: (r) => <Badge tone={roiTone(r.roiScore)}>{r.roiScore}</Badge> },
    { key: 'action', header: '', sortable: false, align: 'center', render: (r) => <button className="btn btn-outline btn-sm btn-icon" onClick={(e) => { e.stopPropagation(); navigate(`/revenue/features?id=${r.id}`); }} title="Open"><Eye size={14} /></button> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Gauge size={22} />} tint="green" title="ROI Dashboard" desc="Development cost vs revenue, adoption & ROI score per feature (Module 13)"
        crumbs={[{ label: 'Feature Intelligence' }, { label: 'ROI Dashboard' }]} />

      <div className="kpi-grid stagger">
        <MetricCard label="Revenue Generated" value={fmtINR(totalRevenue, true)} tint="green" icon={<CircleDollarSign size={19} />} footer="From deployed features" />
        <MetricCard label="Development Cost" value={fmtINR(totalCost, true)} tint="peach" icon={<TrendingUp size={19} />} footer="Total invested" />
        <MetricCard label="Net ROI" value={totalCost ? `${Math.round(((totalRevenue - totalCost) / totalCost) * 100)}%` : '—'} tint="mint" icon={<Gauge size={19} />} footer={`Avg score ${avgRoi}`} />
        <MetricCard label="Total Clients Using" value={fmtNum(deployed.reduce((s, f) => s + f.clientsUsing, 0))} tint="cyan" icon={<Users size={19} />} footer="Across features" />
      </div>

      <div className="card card-pad anim-fade-up">
        <div className="card-title mb-1">Top Features by ROI Score</div>
        <div className="card-sub mb-4">Best return on investment</div>
        {rows ? <HBarList data={topRoi} formatValue={(v) => `${v}`} /> : <Skeleton h={200} />}
      </div>

      <DataTable columns={columns} rows={deployed} loading={loading} exportName="roi.csv" searchPlaceholder="Search features…" pageSize={15} emptyTitle="No deployed features yet" onRowClick={(r) => navigate(`/revenue/features?id=${r.id}`)} />
    </div>
  );
}
