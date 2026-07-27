// Feature Roadmap — pipeline board across every status (Module workflow view).
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Recycle } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Badge, SkeletonRows } from '../../components/ui';
import { fmtINR } from '../../utils/format';
import { FEATURE_STATUSES, STATUS_TINT } from '../../data/revenue';
import { PRIO_TONE } from './_shared';

export default function Roadmap() {
  const navigate = useNavigate();
  const { data: rows, loading } = useApi(() => api.getFeatures());

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(FEATURE_STATUSES.map((s) => [s, []]));
    (rows || []).forEach((f) => { (map[f.status] ||= []).push(f); });
    return map;
  }, [rows]);

  return (
    <div className="page">
      <PageHeader icon={<Map size={22} />} tint="sky" title="Feature Roadmap" desc="Pipeline board — from new request to available for all clients"
        crumbs={[{ label: 'Feature Intelligence' }, { label: 'Roadmap' }]} />

      {loading ? (
        <div className="card"><SkeletonRows rows={6} /></div>
      ) : (
        <div className="rm-board" style={{ display: 'grid', gridTemplateColumns: `repeat(${FEATURE_STATUSES.length}, minmax(210px, 1fr))`, gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
          {FEATURE_STATUSES.map((status) => {
            const items = byStatus[status] || [];
            const tint = STATUS_TINT[status] || 'neutral';
            return (
              <div key={status} className="card card-pad" style={{ background: 'var(--surface-2)', minWidth: 210 }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2 fw-7 t-sm"><span style={{ width: 9, height: 9, borderRadius: '50%', background: `var(--tint-${tint}-ink)` }} />{status}</span>
                  <Badge tone="neutral">{items.length}</Badge>
                </div>
                <div className="flex-col gap-2">
                  {items.map((f) => (
                    <button key={f.id} className="card card-pad card-hover" style={{ padding: 11, background: 'var(--surface)', cursor: 'pointer', textAlign: 'left', animation: 'fadeUp var(--dur) var(--ease) both' }} onClick={() => navigate(`/revenue/features?id=${f.id}`)}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="fw-6 t-sm" style={{ lineHeight: 1.3 }}>{f.name}</span>
                        <Badge tone={PRIO_TONE[f.priority]}>{f.priority}</Badge>
                      </div>
                      <div className="t-xs ink-3 mt-1">{f.client} · {f.module}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="t-xs fw-6" style={{ color: 'var(--success-ink)' }}>{f.revenueGenerated ? fmtINR(f.revenueGenerated, true) : '—'}</span>
                        {f.reusable && <span className="flex items-center gap-1 t-xs ink-3"><Recycle size={11} /> reusable</span>}
                      </div>
                    </button>
                  ))}
                  {items.length === 0 && <div className="t-xs ink-3 text-center" style={{ padding: 14 }}>—</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
