// Go-Live — readiness checklist, data migration & cutover per project.
import { useState } from 'react';
import { Rocket, CheckCircle2, Clock, Circle, CalendarClock, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, Drawer, Badge, ProgressRing, ProgressBar, Skeleton, useToast } from '../components/ui';
import { fmtDate } from '../utils/format';

const CHK_ICON = { Done: <CheckCircle2 size={15} color="var(--success)" />, 'In Progress': <Clock size={15} color="var(--info)" />, Pending: <Circle size={14} color="var(--text-3)" /> };
const readyTone = (s) => ({ Ready: 'success', 'Almost Ready': 'warning', Preparing: 'info' }[s] || 'neutral');

export default function GoLive() {
  const { data: rows, loading } = useApi(() => api.getGoLiveReadiness());
  const toast = useToast();
  const [active, setActive] = useState(null);

  const ready = (rows || []).filter((r) => r.status === 'Ready').length;
  const soon = (rows || []).filter((r) => r.status === 'Almost Ready').length;
  const avg = rows && rows.length ? Math.round(rows.reduce((s, r) => s + r.readiness, 0) / rows.length) : 0;

  return (
    <div className="page">
      <PageHeader icon={<Rocket size={22} />} tint="green" title="Go-Live Readiness" desc="Readiness checklist, data migration & cutover across the portfolio"
        crumbs={[{ label: 'Build & Validate' }, { label: 'Go-Live' }]}
        actions={<button className="btn btn-primary" onClick={() => toast.info('Cutover plan')}><ShieldCheck size={15} /> Cutover Plan</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Projects Preparing" value={rows?.length ?? '—'} tint="green" icon={<Rocket size={19} />} footer="Active go-live tracks" />
        <MetricCard label="Ready to Go-Live" value={ready} tint="mint" icon={<CheckCircle2 size={19} />} footer="All checks passed" />
        <MetricCard label="Almost Ready" value={soon} tint="peach" icon={<Clock size={19} />} footer="≥ 70% checklist" />
        <MetricCard label="Avg Readiness" value={`${avg}%`} tint="cyan" icon={<ShieldCheck size={19} />} footer="Across tracks" />
      </div>

      {loading ? (
        <div className="kpi-grid">{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={180} r={16} />)}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }} className="stagger">
          {rows.map((r) => (
            <button key={r.projectCode} className="card card-pad card-hover text-left" style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => setActive(r)}>
              <div className="flex items-center justify-between mb-3">
                <div style={{ minWidth: 0 }}><div className="fw-7 t-md truncate">{r.projectName}</div><div className="t-xs ink-3 mono">{r.projectCode}</div></div>
                <Badge tone={readyTone(r.status)}>{r.status}</Badge>
              </div>
              <div className="flex items-center gap-4">
                <ProgressRing value={r.readiness} size={72} color={r.readiness >= 90 ? 'var(--success)' : r.readiness >= 70 ? 'var(--warning)' : 'var(--info)'} />
                <div className="flex-1">
                  <div className="t-xs ink-3 mb-1">Target go-live</div>
                  <div className="fw-7 t-md flex items-center gap-1"><CalendarClock size={14} /> {fmtDate(r.targetGoLive)}</div>
                  <div className="t-sm ink-2 mt-2">{r.items.filter((i) => i.status === 'Done').length}/{r.items.length} checklist items complete</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Drawer open={!!active} onClose={() => setActive(null)} size="md" title={active ? `${active.projectName} — Go-Live Readiness` : ''} subtitle={active ? `${active.projectCode} · target ${fmtDate(active.targetGoLive)}` : ''}
        headerExtra={active && <Badge tone={readyTone(active.status)}>{active.readiness}%</Badge>}
        footer={<><button className="btn btn-ghost" onClick={() => setActive(null)}>Close</button><button className="btn btn-primary"><CheckCircle2 size={14} /> Issue Go-Live Certificate</button></>}>
        {active && (
          <div className="flex-col gap-3">
            <ProgressBar value={active.readiness} height={9} color={active.readiness >= 90 ? 'var(--success)' : 'var(--warning)'} />
            <div className="card" style={{ overflow: 'hidden' }}>
              <table className="data-table"><thead><tr><th>Checklist Item</th><th>Owner</th><th>Status</th></tr></thead>
                <tbody>{active.items.map((it, i) => <tr key={i}><td className="fw-6 t-sm">{it.item}</td><td><Badge tone="neutral">{it.owner}</Badge></td><td><span className="flex items-center gap-1 t-sm">{CHK_ICON[it.status]} {it.status}</span></td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
