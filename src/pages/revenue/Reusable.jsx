// Module 10 · Reusability Analysis — evaluate & share features across clients.
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recycle, Building2, Globe, Settings2, Gauge, TrendingUp, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, Badge, Chip, Skeleton, ProgressBar } from '../../components/ui';
import { fmtINR } from '../../utils/format';
import { APPLICABLE_SEGMENTS, featureAdoption } from '../../data/revenue';
import { StatusChip } from './_shared';

export default function Reusable() {
  const navigate = useNavigate();
  const { data: rows, loading } = useApi(() => api.getFeatures());
  const [segment, setSegment] = useState('All');

  const reusable = useMemo(() => (rows || []).filter((f) => f.reusable), [rows]);
  const segments = ['All', ...APPLICABLE_SEGMENTS];
  const filtered = useMemo(() => reusable.filter((f) => segment === 'All' || (f.applicableTo || []).includes(segment)), [reusable, segment]);

  return (
    <div className="page">
      <PageHeader icon={<Recycle size={22} />} tint="green" title="Reusable Features" desc="Reusability analysis — decide what to publish and share across all 1,100+ clients (Module 10)"
        crumbs={[{ label: 'Feature Intelligence' }, { label: 'Reusable Features' }]} />

      <div className="kpi-grid stagger">
        <MetricCard label="Reusable Features" value={reusable.length} tint="green" icon={<Recycle size={19} />} footer="Marked shareable" />
        <MetricCard label="Available for All" value={reusable.filter((f) => f.status === 'Available for All').length} tint="mint" icon={<Globe size={19} />} footer="Published" />
        <MetricCard label="Avg Adoption" value={`${Math.round(reusable.reduce((s, f) => s + f.adoptionRate, 0) / Math.max(1, reusable.length))}%`} tint="cyan" icon={<TrendingUp size={19} />} footer="Across base" />
        <MetricCard label="Reuse Revenue" value={fmtINR(reusable.reduce((s, f) => s + f.revenueGenerated, 0), true)} tint="lavender" icon={<Gauge size={19} />} footer="Unlocked" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Applicable to</span>{segments.map((s) => <Chip key={s} active={segment === s} onClick={() => setSegment(s)}>{s}</Chip>)}</div>
      </div>

      {loading ? <Skeleton h={240} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map((f) => {
            const clients = featureAdoption(f.id).length;
            return (
              <div key={f.id} className="card card-pad card-hover anim-fade-up" style={{ cursor: 'pointer' }} onClick={() => navigate(`/revenue/features?id=${f.id}`)}>
                <div className="flex items-center justify-between mb-2"><span className="fw-7 t-md">{f.name}</span><StatusChip status={f.status} /></div>
                <div className="t-xs ink-3 mb-3">{f.module} · {f.category}</div>

                <div className="flex-col gap-2 mb-3">
                  <div className="flex items-center justify-between t-sm"><span className="ink-2 fw-5">Can be reused?</span><Badge tone="success"><CheckCircle2 size={11} /> Yes</Badge></div>
                  <div className="flex items-center justify-between t-sm"><span className="ink-2 fw-5">Configuration required?</span><Badge tone={f.category === 'Integration' ? 'warning' : 'neutral'}>{f.category === 'Integration' ? 'Yes' : 'Minimal'}</Badge></div>
                  <div className="flex items-center justify-between t-sm"><span className="ink-2 fw-5">Est. implementation</span><span className="fw-6">{f.estDevTime}</span></div>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between t-xs mb-1"><span className="ink-3">Adoption</span><b>{f.adoptionRate}%</b></div>
                  <ProgressBar value={f.adoptionRate} color="var(--success)" />
                </div>

                <div className="t-xs ink-3 fw-6 mb-1" style={{ marginTop: 8 }}>Applicable to</div>
                <div className="flex items-center gap-1 flex-wrap mb-3">
                  {(f.applicableTo || []).map((s) => <span key={s} className="badge badge-info">{s}</span>)}
                </div>

                <div className="flex items-center justify-between" style={{ borderTop: '1px dashed var(--border)', paddingTop: 10 }}>
                  <span className="flex items-center gap-1 t-xs ink-3"><Building2 size={12} /> {clients} clients live</span>
                  <span className="flex items-center gap-1 t-xs fw-6" style={{ color: 'var(--success-ink)' }}><Settings2 size={12} /> {fmtINR(f.revenueGenerated, true)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
