// Revenue Streams — recurring & one-time revenue sources.
import { useState, useMemo } from 'react';
import { CircleDollarSign, TrendingUp, TrendingDown, Repeat, Coins } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, StatusBadge, Chip, Skeleton, HBarList } from '../../components/ui';
import { fmtINR } from '../../utils/format';

const STREAM_TONE = { Growing: 'success', Stable: 'info', Declining: 'danger' };

export default function RevenueStreams() {
  const { data: rows, loading } = useApi(() => api.getRevenueStreams());
  const [cat, setCat] = useState('All');

  const allRows = useMemo(() => rows || [], [rows]);
  const cats = ['All', 'Recurring', 'One-time'];
  const filtered = useMemo(() => allRows.filter((r) => cat === 'All' || r.category === cat), [allRows, cat]);
  const totalArr = allRows.reduce((s, r) => s + r.arr, 0);
  const recurringArr = allRows.filter((r) => r.category === 'Recurring').reduce((s, r) => s + r.arr, 0);
  const totalMrr = allRows.reduce((s, r) => s + r.mrr, 0);

  const columns = [
    { key: 'source', header: 'Revenue Source', minWidth: 210, render: (r) => <div><div className="fw-6 t-sm">{r.source}</div><div className="t-xs ink-3">{r.id} · {r.clients} clients</div></div> },
    { key: 'category', header: 'Type', render: (r) => <Badge tone={r.category === 'Recurring' ? 'success' : 'info'}>{r.category}</Badge> },
    { key: 'mrr', header: 'MRR', align: 'right', accessor: (r) => r.mrr, render: (r) => r.mrr ? fmtINR(r.mrr, true) : <span className="ink-3">—</span> },
    { key: 'arr', header: 'ARR', align: 'right', accessor: (r) => r.arr, render: (r) => <span className="fw-6" style={{ color: 'var(--success-ink)' }}>{fmtINR(r.arr, true)}</span> },
    { key: 'growth', header: 'Growth (YoY)', align: 'right', accessor: (r) => r.growth, render: (r) => <span className="flex items-center gap-1 t-sm fw-6" style={{ justifyContent: 'flex-end', color: r.growth >= 0 ? 'var(--success-ink)' : 'var(--danger-ink)' }}>{r.growth >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{Math.abs(r.growth)}%</span> },
    { key: 'status', header: 'Trend', render: (r) => <StatusBadge status={r.status} tone={STREAM_TONE[r.status]} /> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<CircleDollarSign size={22} />} tint="green" title="Revenue Streams" desc="Recurring and one-time revenue sources across the product"
        crumbs={[{ label: 'Revenue' }, { label: 'Streams' }]} />

      <div className="kpi-grid stagger">
        <MetricCard label="Total ARR" value={fmtINR(totalArr, true)} delta={11.6} tint="green" icon={<Coins size={19} />} footer="All streams combined" />
        <MetricCard label="Recurring ARR" value={fmtINR(recurringArr, true)} tint="mint" icon={<Repeat size={19} />} footer={`${Math.round((recurringArr / Math.max(1, totalArr)) * 100)}% of revenue`} />
        <MetricCard label="Total MRR" value={fmtINR(totalMrr, true)} delta={8.3} tint="cyan" icon={<TrendingUp size={19} />} footer="Monthly recurring" />
        <MetricCard label="Fastest Growing" value={allRows.length ? `+${Math.max(...allRows.map((r) => r.growth))}%` : '—'} tint="lavender" icon={<TrendingUp size={19} />} footer="API / Integration licensing" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }} className="dashboard-two">
        <div>
          <div className="card card-pad" style={{ paddingBottom: 12, marginBottom: 16 }}>
            <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Type</span>{cats.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}</div>
          </div>
          <DataTable columns={columns} rows={filtered} loading={loading} exportName="revenue-streams.csv" searchPlaceholder="Search streams…" pageSize={10} />
        </div>
        <div className="card card-pad anim-fade-up" style={{ alignSelf: 'start' }}>
          <div className="card-title mb-1">ARR by Source</div>
          <div className="card-sub mb-4">Annual recurring revenue (₹)</div>
          {rows ? <HBarList data={[...allRows].sort((a, b) => b.arr - a.arr).map((r) => ({ label: r.source, value: r.arr }))} formatValue={(v) => fmtINR(v, true)} /> : <Skeleton h={260} />}
        </div>
      </div>

      <style>{`@media (max-width: 900px){ .dashboard-two{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}
