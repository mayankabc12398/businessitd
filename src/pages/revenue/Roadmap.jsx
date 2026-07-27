// Roadmap — feature delivery pipeline as a stage board.
import { useMemo } from 'react';
import { Map, ThumbsUp } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Badge, SkeletonRows } from '../../components/ui';
import { fmtINR } from '../../utils/format';
import { FEATURE_STATUSES, FEATURE_STATUS_TINT } from '../../data/revenue';

const PRIO_TONE = { Critical: 'danger', High: 'warning', Medium: 'info', Low: 'neutral' };

export default function Roadmap() {
  const { data: rows, loading } = useApi(() => api.getFeatures());

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(FEATURE_STATUSES.map((s) => [s, []]));
    (rows || []).forEach((f) => { (map[f.status] ||= []).push(f); });
    return map;
  }, [rows]);

  return (
    <div className="page">
      <PageHeader icon={<Map size={22} />} tint="blue" title="Product Roadmap" desc="Feature delivery pipeline across every stage — Idea to Shipped"
        crumbs={[{ label: 'Revenue' }, { label: 'Roadmap' }]} />

      {loading ? (
        <div className="card"><SkeletonRows rows={6} /></div>
      ) : (
        <div className="roadmap-board" style={{ display: 'grid', gridTemplateColumns: `repeat(${FEATURE_STATUSES.length}, minmax(220px, 1fr))`, gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
          {FEATURE_STATUSES.map((stage) => {
            const items = byStatus[stage] || [];
            const stageValue = items.reduce((s, f) => s + f.revenueImpact, 0);
            return (
              <div key={stage} className="card card-pad" style={{ background: 'var(--surface-2)', minWidth: 220 }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2 fw-7 t-sm">
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: `var(--tint-${FEATURE_STATUS_TINT[stage]}-ink)` }} />
                    {stage}
                  </span>
                  <Badge tone="neutral">{items.length}</Badge>
                </div>
                <div className="t-xs ink-3 mb-3">{fmtINR(stageValue, true)} pipeline</div>
                <div className="flex-col gap-2">
                  {items.map((f) => (
                    <div key={f.id} className="card card-pad card-hover" style={{ padding: 12, background: 'var(--surface)', animation: 'fadeUp var(--dur) var(--ease) both' }}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="fw-6 t-sm" style={{ lineHeight: 1.3 }}>{f.title}</span>
                        <Badge tone={PRIO_TONE[f.priority]}>{f.priority}</Badge>
                      </div>
                      <div className="t-xs ink-3 mt-1">{f.module}</div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="t-xs fw-6" style={{ color: 'var(--success-ink)' }}>{fmtINR(f.revenueImpact, true)}</span>
                        <span className="flex items-center gap-3 t-xs ink-3">
                          <span className="flex items-center gap-1"><ThumbsUp size={11} /> {f.votes}</span>
                          <span>{f.targetQtr}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <div className="t-xs ink-3 text-center" style={{ padding: 16 }}>No features</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
