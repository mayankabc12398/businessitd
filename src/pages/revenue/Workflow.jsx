// Feature Workflow — 8-step lifecycle with features grouped by stage.
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Workflow as WorkflowIcon, FileText, ClipboardCheck, Stamp, Code2, FlaskConical, Rocket, Gauge, Share2, ArrowRight } from 'lucide-react';
import { PageHeader, Badge, useToast } from '../../components/ui';
import { WORKFLOW_STEPS, STATUS_STAGE } from '../../data/revenue';
import { getFeatures, subscribeFeatures, advanceFeature, ADVANCE_LABEL } from '../../data/featuresStore';
import { PRIO_TONE } from './_shared';

const STEP_ICON = { request: FileText, review: ClipboardCheck, approve: Stamp, dev: Code2, test: FlaskConical, deploy: Rocket, impact: Gauge, share: Share2 };

export default function Workflow() {
  const navigate = useNavigate();
  const toast = useToast();
  const [rows, setRows] = useState(getFeatures);
  useEffect(() => subscribeFeatures(setRows), []);

  const advance = (id) => { const nx = advanceFeature(id); if (nx) toast.success('Feature advanced', nx); };

  const byStage = useMemo(() => {
    const map = Object.fromEntries(WORKFLOW_STEPS.map((s) => [s.step, []]));
    (rows || []).forEach((f) => { const st = STATUS_STAGE[f.status] || 1; (map[st] ||= []).push(f); });
    return map;
  }, [rows]);

  return (
    <div className="page">
      <PageHeader icon={<WorkflowIcon size={22} />} tint="indigo" title="Feature Workflow" desc="Eight-stage lifecycle — client request to shared reusable innovation"
        crumbs={[{ label: 'Feature Intelligence' }, { label: 'Workflow' }]} />

      {/* strip */}
      <div className="card card-pad anim-fade-up">
        <div className="wf-strip">
          {WORKFLOW_STEPS.map((s, i) => {
            const Icon = STEP_ICON[s.icon] || FileText;
            return (
              <div key={s.key} className="wf-step-wrap">
                <div className="wf-step">
                  <div className="wf-ico"><Icon size={18} /></div>
                  <div className="wf-num">{s.step}</div>
                  <div className="wf-label">{s.label}</div>
                  <div className="wf-desc">{s.desc}</div>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && <ArrowRight className="wf-arrow" size={15} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="wf-board" style={{ display: 'grid', gridTemplateColumns: `repeat(${WORKFLOW_STEPS.length}, minmax(200px, 1fr))`, gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {WORKFLOW_STEPS.map((s) => {
          const items = byStage[s.step] || [];
          const Icon = STEP_ICON[s.icon] || FileText;
          return (
            <div key={s.key} className="card card-pad" style={{ background: 'var(--surface-2)', minWidth: 200 }}>
              <div className="flex items-center gap-2 mb-1"><span className="metric-icon" style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--tint-indigo)', color: 'var(--tint-indigo-ink)' }}><Icon size={14} /></span><span className="fw-8 t-sm">{s.step}</span><Badge tone="neutral">{items.length}</Badge></div>
              <div className="fw-7 t-sm">{s.label}</div>
              <div className="t-xs ink-3 mb-3">{s.desc}</div>
              <div className="flex-col gap-2">
                {items.map((f) => (
                  <div key={f.id} className="card card-pad card-hover" style={{ padding: 10, background: 'var(--surface)', cursor: 'pointer' }} onClick={() => navigate(`/revenue/features?id=${f.id}`)}>
                    <div className="fw-6 t-xs" style={{ lineHeight: 1.3 }}>{f.name}</div>
                    <div className="flex items-center justify-between mt-1 gap-2"><span className="t-xs ink-3 truncate">{f.client}</span><Badge tone={PRIO_TONE[f.priority]}>{f.priority}</Badge></div>
                    {ADVANCE_LABEL[f.status] && (
                      <button className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: 8, justifyContent: 'center' }} onClick={(e) => { e.stopPropagation(); advance(f.id); }}>{ADVANCE_LABEL[f.status]} <ArrowRight size={12} /></button>
                    )}
                  </div>
                ))}
                {items.length === 0 && <div className="t-xs ink-3 text-center" style={{ padding: 12 }}>—</div>}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .wf-strip { display:flex; align-items:stretch; gap:0; overflow-x:auto; padding-bottom:6px; }
        .wf-step-wrap { display:flex; align-items:center; flex:1; min-width:130px; }
        .wf-step { flex:1; text-align:center; padding:6px 6px; }
        .wf-ico { width:44px; height:44px; border-radius:13px; margin:0 auto 8px; display:flex; align-items:center; justify-content:center; background:var(--tint-indigo); color:var(--tint-indigo-ink); }
        .wf-num { font-size:11px; font-weight:800; color:var(--primary); }
        .wf-label { font-weight:700; font-size:12px; margin-top:2px; }
        .wf-desc { font-size:10.5px; color:var(--text-3); margin-top:3px; line-height:1.35; }
        .wf-arrow { color:var(--text-3); flex-shrink:0; }
      `}</style>
    </div>
  );
}
