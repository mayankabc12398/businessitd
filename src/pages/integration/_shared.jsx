// Shared bits for the Smart Integration Records (SIR) workspace pages.
import { Badge } from '../../components/ui';

export const INT_STATUS_TONE = {
  Active: 'success',
  'Under Testing': 'warning',
  'In Development': 'info',
  Deprecated: 'neutral',
  Live: 'success',
  UAT: 'warning',
  Pending: 'pending',
  Pass: 'success',
  Fail: 'danger',
  'In Progress': 'info',
};

export const METHOD_TONE = { GET: 'info', POST: 'success', PUT: 'warning', DELETE: 'danger', PATCH: 'lavender' };

export function MethodBadge({ method }) {
  return <span className={`badge badge-${METHOD_TONE[method] || 'neutral'}`} style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, minWidth: 52, justifyContent: 'center' }}>{method}</span>;
}

// Monospace code / payload block
export function CodeBlock({ children, label }) {
  return (
    <div>
      {label && <div className="t-xs fw-6 ink-3 mb-1" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>}
      <pre style={{
        background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 10,
        padding: '12px 14px', margin: 0, overflowX: 'auto', fontSize: 12, lineHeight: 1.55,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', color: 'var(--text-1)',
        whiteSpace: 'pre',
      }}>{children}</pre>
    </div>
  );
}

// Inline "chip" for a stat with tint
export function StatPill({ label, value, tint = 'blue' }) {
  return (
    <div style={{ background: `var(--tint-${tint})`, color: `var(--tint-${tint}-ink)`, borderRadius: 10, padding: '8px 12px', minWidth: 90 }}>
      <div className="t-xl fw-8" style={{ lineHeight: 1 }}>{value}</div>
      <div className="t-xs fw-6" style={{ opacity: 0.85, marginTop: 2 }}>{label}</div>
    </div>
  );
}

export { Badge };
