// Shared bits for the Feature Intelligence Platform (SFR) workspace pages.
import { STATUS_TINT } from '../../data/revenue';

export const PRIO_TONE = { High: 'danger', Medium: 'warning', Low: 'neutral' };
export const ADOPT_TONE = { Live: 'success', UAT: 'warning', Planned: 'info', Pending: 'pending' };

export const UAT_TONE = { Passed: 'success', 'In Progress': 'info', Failed: 'danger', Pending: 'pending', Approved: 'success' };

// Status pill with the status colour dot
export function StatusChip({ status }) {
  const tint = STATUS_TINT[status] || 'neutral';
  return (
    <span className="badge badge-neutral">
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: `var(--tint-${tint}-ink)`, display: 'inline-block' }} />
      {status}
    </span>
  );
}

// Impact score bar (0–10)
export function ImpactBar({ score }) {
  const pct = Math.min(100, (score / 10) * 100);
  const color = score >= 8 ? 'var(--success)' : score >= 6.5 ? 'var(--tint-lemon-ink)' : 'var(--tint-peach-ink)';
  return (
    <div className="flex items-center gap-2" style={{ minWidth: 120 }}>
      <div className="progress-track" style={{ height: 7, flex: 1 }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <b className="tabular t-sm" style={{ width: 26, textAlign: 'right' }}>{score}</b>
    </div>
  );
}
