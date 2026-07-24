// Small shared primitives: Avatar, Badge, Chip, EmptyState, Skeleton,
// Detail rows, Accordion, ProgressBar, Dropdown menu.
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Inbox } from 'lucide-react';
import { AVATAR_HUES } from '../../data/team';
import { initials, statusTone } from '../../utils/format';

export function Avatar({ name, hue = 0, size = 'md', ring = false, src }) {
  const [from, to] = AVATAR_HUES[hue % AVATAR_HUES.length];
  return (
    <span
      className={`avatar avatar-${size} ${ring ? 'avatar-ring' : ''}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      title={name}
    >
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : initials(name)}
    </span>
  );
}

export function StatusBadge({ status, tone }) {
  const t = tone || statusTone(status);
  return (
    <span className={`badge badge-${t}`}>
      <span className="dot" />
      {status}
    </span>
  );
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Chip({ active, onClick, children, onRemove }) {
  return (
    <button type="button" className={`chip ${active ? 'active' : ''}`} onClick={onClick}>
      {children}
      {onRemove && (
        <span className="chip-x" onClick={(e) => { e.stopPropagation(); onRemove(); }}>×</span>
      )}
    </button>
  );
}

export function EmptyState({ icon, title = 'Nothing here yet', desc, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon || <Inbox size={26} />}</div>
      <div className="empty-title">{title}</div>
      {desc && <div className="empty-desc">{desc}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Skeleton({ w = '100%', h = 14, r, style }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

export function SkeletonRows({ rows = 5, height = 44 }) {
  return (
    <div className="flex-col gap-2" style={{ padding: 16 }}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} h={height} style={{ opacity: 1 - i * 0.13 }} />
      ))}
    </div>
  );
}

export function ProgressBar({ value = 0, color = 'var(--primary)', height = 7 }) {
  return (
    <div className="progress-track" style={{ height }}>
      <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
    </div>
  );
}

export function DetailRow({ label, children }) {
  return (
    <div className="detail-row">
      <span className="detail-key">{label}</span>
      <span className="detail-val">{children ?? '—'}</span>
    </div>
  );
}

export function Accordion({ title, badge, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="accordion-item">
      <button type="button" className="accordion-head" onClick={() => setOpen((o) => !o)}>
        <span className="flex items-center gap-2">{title}{badge}</span>
        <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur) var(--ease)', color: 'var(--text-3)' }} />
      </button>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
}

// Dropdown action menu — trigger renders children; items = [{label, icon, onClick, danger, sep}]
// The menu is portaled to <body> with fixed positioning so it never gets
// clipped by scroll containers (e.g. the DataTable scroller) or overlapped
// by sibling rows' stacking contexts.
export function Dropdown({ trigger, items, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const toggle = (e) => {
    e.stopPropagation();
    if (!open && triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    setOpen((o) => !o);
  };

  const menuStyle = rect
    ? {
        position: 'fixed',
        top: Math.round(rect.bottom + 6),
        ...(align === 'left'
          ? { left: Math.round(rect.left) }
          : { right: Math.round(Math.max(8, window.innerWidth - rect.right)) }),
        zIndex: 1000,
      }
    : { position: 'fixed', zIndex: 1000 };

  return (
    <span ref={triggerRef} style={{ display: 'inline-flex' }} onClick={toggle}>
      {trigger}
      {open && createPortal(
        <div ref={menuRef} className="menu-pop" style={menuStyle}>
          {items.map((it, i) =>
            it.sep ? (
              <div key={i} className="menu-sep" />
            ) : it.label2 ? (
              <div key={i} className="menu-label">{it.label2}</div>
            ) : (
              <button
                key={i}
                type="button"
                className={`menu-item ${it.danger ? 'danger' : ''}`}
                onClick={(e) => { e.stopPropagation(); setOpen(false); it.onClick?.(); }}
              >
                {it.icon}
                {it.label}
              </button>
            )
          )}
        </div>,
        document.body
      )}
    </span>
  );
}

export function Timeline({ items }) {
  return (
    <div className="timeline">
      {items.map((it, i) => (
        <div key={i} className="timeline-item" style={{ animationDelay: `${i * 60}ms` }}>
          <span className="timeline-dot" style={{ background: it.color || 'var(--primary)' }} />
          <div className="timeline-title">{it.title}</div>
          {it.time && <div className="timeline-time">{it.time}</div>}
          {it.desc && <div className="timeline-desc">{it.desc}</div>}
        </div>
      ))}
    </div>
  );
}

export function Stepper({ steps, current }) {
  return (
    <div className="stepper">
      {steps.map((s, i) => (
        <div key={i} className={`step ${i < current ? 'done' : ''} ${i === current ? 'current' : ''}`} style={{ flex: i === steps.length - 1 ? '0 0 auto' : 1 }}>
          <span className="step-dot">{i < current ? '✓' : i + 1}</span>
          <span className="step-meta hide-sm">
            <span className="step-title">{s.title || s}</span>
            {s.sub && <div className="step-sub">{s.sub}</div>}
          </span>
          {i < steps.length - 1 && <span className="step-line" />}
        </div>
      ))}
    </div>
  );
}
