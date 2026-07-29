// Module 11 · Feature Library — searchable catalog of reusable features.
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, Search, CheckCircle2, Building2, Braces, MonitorSmartphone, CircleDollarSign } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, Badge, Chip, SearchBox, Skeleton, EmptyState } from '../../components/ui';
import { fmtINR } from '../../utils/format';
import { FEATURE_CATEGORIES } from '../../data/revenue';

export default function FeatureLibrary() {
  const navigate = useNavigate();
  const { data: rows, loading } = useApi(() => api.getFeatureLibrary());
  const { data: adoption } = useApi(() => api.getClientAdoption());
  const featureAdoption = (id) => (adoption || []).filter((x) => x.featureId === id || x.featureCode === id);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');

  const allRows = useMemo(() => rows || [], [rows]);
  const cats = ['All', ...FEATURE_CATEGORIES.filter((c) => allRows.some((f) => f.category === c))];
  const filtered = useMemo(() => allRows.filter((f) =>
    (cat === 'All' || f.category === cat) &&
    (!q.trim() || `${f.name} ${f.module} ${f.category}`.toLowerCase().includes(q.toLowerCase()))
  ), [allRows, cat, q]);

  return (
    <div className="page">
      <PageHeader icon={<Library size={22} />} tint="mint" title="Feature Library" desc="Searchable catalog of proven, reusable features — search before you build (Module 11)"
        crumbs={[{ label: 'Feature Intelligence' }, { label: 'Feature Library' }]} />

      <div className="kpi-grid stagger">
        <MetricCard label="Published Features" value={allRows.length} tint="mint" icon={<Library size={19} />} footer="Ready to reuse" />
        <MetricCard label="Client Implementations" value={allRows.reduce((s, f) => s + featureAdoption(f.id).length, 0)} tint="cyan" icon={<Building2 size={19} />} footer="Across the base" />
        <MetricCard label="Revenue Unlocked" value={fmtINR(allRows.reduce((s, f) => s + f.revenueGenerated, 0), true)} tint="green" icon={<CircleDollarSign size={19} />} footer="From reuse" />
        <MetricCard label="Categories" value={new Set(allRows.map((f) => f.category)).size} tint="lavender" icon={<Library size={19} />} footer="Covered" />
      </div>

      <div className="card card-pad" style={{ background: 'var(--primary-softer)', border: '1px solid var(--primary-soft)' }}>
        <div className="flex items-center gap-2 t-sm ink-2"><Search size={15} color="var(--primary)" /> <b>Before starting new development</b>, search here — a proven feature may already exist and can be reused with minimal effort.</div>
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-3 flex-wrap">
          <SearchBox value={q} onChange={setQ} placeholder="Search the feature library…" style={{ width: 280 }} />
          <div className="flex items-center gap-2 flex-wrap">{cats.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}</div>
        </div>
      </div>

      {loading ? <Skeleton h={240} /> : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={<Library size={26} />} title="No features found" desc="Try a different search or category." /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map((f) => (
            <div key={f.id} className="card card-pad card-hover anim-fade-up" style={{ cursor: 'pointer' }} onClick={() => navigate(`/revenue/features?id=${f.id}`)}>
              <div className="flex items-center justify-between mb-2">
                <Badge tone="success"><CheckCircle2 size={11} /> Reusable</Badge>
                <Badge tone="lavender">{f.category}</Badge>
              </div>
              <div className="fw-7 t-md">{f.name}</div>
              <div className="t-xs ink-3 mb-3">{f.module} · impact {f.impactScore}</div>
              <div className="t-sm ink-2 mb-3" style={{ lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{f.proposedSolution}</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 t-xs fw-5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px', color: 'var(--text-2)' }}><Building2 size={12} /> {featureAdoption(f.id).length} clients</span>
                <span className="flex items-center gap-1 t-xs fw-5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px', color: 'var(--text-2)' }}><Braces size={12} /> APIs</span>
                <span className="flex items-center gap-1 t-xs fw-5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px', color: 'var(--text-2)' }}><MonitorSmartphone size={12} /> Screens</span>
                <span className="flex items-center gap-1 t-xs fw-6" style={{ background: 'var(--tint-green)', color: 'var(--tint-green-ink)', borderRadius: 8, padding: '4px 8px' }}><CircleDollarSign size={12} /> {fmtINR(f.revenueGenerated, true)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
