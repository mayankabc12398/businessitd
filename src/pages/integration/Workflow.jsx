// Integration Workflow — 6-step lifecycle board.
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Workflow as WorkflowIcon, FileText, Database, Code2, CheckCircle2, Users, Archive } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Badge, StatusBadge, SkeletonRows } from '../../components/ui';
import { WORKFLOW_STEPS } from '../../data/integration';
import { INT_STATUS_TONE } from './_shared';

const STEP_ICON = { file: FileText, database: Database, code: Code2, check: CheckCircle2, users: Users, archive: Archive };

export default function Workflow() {
  const navigate = useNavigate();
  const { data: rows, loading } = useApi(() => api.getIntegrations());

  const byStage = useMemo(() => {
    const map = Object.fromEntries(WORKFLOW_STEPS.map((s) => [s.step, []]));
    (rows || []).forEach((i) => { (map[i.stage] ||= []).push(i); });
    return map;
  }, [rows]);

  return (
    <div className="page">
      <PageHeader icon={<WorkflowIcon size={22} />} tint="indigo" title="Integration Workflow" desc="Every integration progresses through six stages — creation to reusable archive"
        crumbs={[{ label: 'Integration' }, { label: 'Workflow' }]} />

      {loading ? (
        <div className="card"><SkeletonRows rows={6} /></div>
      ) : (
        <div className="wf-board" style={{ display: 'grid', gridTemplateColumns: `repeat(${WORKFLOW_STEPS.length}, minmax(210px, 1fr))`, gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
          {WORKFLOW_STEPS.map((s) => {
            const items = byStage[s.step] || [];
            const Icon = STEP_ICON[s.icon] || FileText;
            return (
              <div key={s.key} className="card card-pad" style={{ background: 'var(--surface-2)', minWidth: 210 }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="metric-icon" style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--tint-indigo)', color: 'var(--tint-indigo-ink)' }}><Icon size={15} /></span>
                  <span className="fw-8 t-sm">{s.step}</span>
                  <Badge tone="neutral">{items.length}</Badge>
                </div>
                <div className="fw-7 t-sm">{s.label}</div>
                <div className="t-xs ink-3 mb-3" style={{ lineHeight: 1.4 }}>{s.desc}</div>
                <div className="flex-col gap-2">
                  {items.map((it) => (
                    <button key={it.id} className="card card-pad card-hover" style={{ padding: 11, background: 'var(--surface)', cursor: 'pointer', textAlign: 'left', animation: 'fadeUp var(--dur) var(--ease) both' }} onClick={() => navigate(`/integration/all?id=${it.id}`)}>
                      <div className="fw-6 t-sm" style={{ lineHeight: 1.3 }}>{it.name}</div>
                      <div className="t-xs ink-3 mt-1">{it.type} · {it.vendor}</div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge tone="neutral">{it.totalApis} APIs</Badge>
                        <StatusBadge status={it.status} tone={INT_STATUS_TONE[it.status]} />
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
