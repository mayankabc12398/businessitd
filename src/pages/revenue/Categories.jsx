// Feature Categories — browse features grouped by category & module.
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shapes, ArrowRight, CircleDollarSign } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Badge, Skeleton, DonutChart, HBarList } from '../../components/ui';
import { fmtINR } from '../../utils/format';
import { FEATURE_CATEGORIES } from '../../data/revenue';
import { StatusChip } from './_shared';

const CAT_TINT = { Revenue: 'green', Efficiency: 'blue', Compliance: 'peach', 'Patient Experience': 'cyan', Automation: 'lavender', Analytics: 'lemon', Integration: 'mint' };

export default function Categories() {
  const navigate = useNavigate();
  const { data: rows, loading } = useApi(() => api.getFeatures());
  const { data: mix } = useApi(() => api.getFeatureCategoryMix());
  const [active, setActive] = useState(null);

  const byCat = useMemo(() => {
    const map = {};
    (rows || []).forEach((f) => { (map[f.category] ||= []).push(f); });
    return map;
  }, [rows]);

  const cats = FEATURE_CATEGORIES.filter((c) => (byCat[c] || []).length);
  const moduleBars = useMemo(() => {
    const m = {};
    (rows || []).forEach((f) => { m[f.module] = (m[f.module] || 0) + 1; });
    return Object.entries(m).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [rows]);

  const shown = active ? cats.filter((c) => c === active) : cats;

  return (
    <div className="page">
      <PageHeader icon={<Shapes size={22} />} tint="peach" title="Feature Categories" desc="Browse the repository by category and module"
        crumbs={[{ label: 'Feature Intelligence' }, { label: 'Categories' }]} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="dashboard-two">
        <div className="card card-pad anim-fade-up">
          <div className="card-title mb-1">Features by Category</div>
          <div className="card-sub mb-4">Distribution</div>
          {mix ? <DonutChart data={mix} centerLabel="FEATURES" centerValue={(rows || []).length} /> : <Skeleton h={200} />}
        </div>
        <div className="card card-pad anim-fade-up">
          <div className="card-title mb-1">Features by Module</div>
          <div className="card-sub mb-4">Where features land</div>
          {rows ? <HBarList data={moduleBars} /> : <Skeleton h={200} />}
        </div>
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Category</span>
          <button className={`chip ${!active ? 'active' : ''}`} onClick={() => setActive(null)}>All</button>
          {cats.map((c) => <button key={c} className={`chip ${active === c ? 'active' : ''}`} onClick={() => setActive(c)}>{c}</button>)}
        </div>
      </div>

      {loading ? <Skeleton h={240} /> : (
        <div className="flex-col gap-4">
          {shown.map((cat) => (
            <div key={cat} className="card card-pad anim-fade-up">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><span className="metric-icon" style={{ width: 32, height: 32, borderRadius: 9, background: `var(--tint-${CAT_TINT[cat] || 'blue'})`, color: `var(--tint-${CAT_TINT[cat] || 'blue'}-ink)` }}><Shapes size={15} /></span><div className="card-title">{cat}</div><Badge tone="neutral">{byCat[cat].length}</Badge></div>
                <span className="t-sm fw-6" style={{ color: 'var(--success-ink)' }}>{fmtINR(byCat[cat].reduce((s, f) => s + f.revenueGenerated, 0), true)}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                {byCat[cat].map((f) => (
                  <button key={f.id} className="card-hover" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', textAlign: 'left' }} onClick={() => navigate(`/revenue/features?id=${f.id}`)}>
                    <div className="flex items-center justify-between gap-2 mb-1"><span className="fw-6 t-sm truncate">{f.name}</span><ArrowRight size={13} className="ink-3" /></div>
                    <div className="t-xs ink-3 mb-2">{f.module} · {f.client}</div>
                    <div className="flex items-center justify-between"><StatusChip status={f.status} />{f.revenueGenerated > 0 && <span className="flex items-center gap-1 t-xs fw-6" style={{ color: 'var(--success-ink)' }}><CircleDollarSign size={11} />{fmtINR(f.revenueGenerated, true)}</span>}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`@media (max-width:900px){ .dashboard-two{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}
