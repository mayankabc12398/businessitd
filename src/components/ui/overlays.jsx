// Modal, Drawer, ConfirmDialog — portal-based overlays with animations.
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';
import { useEscape, useBodyLock } from '../../hooks/useApi';

export function Drawer({ open, onClose, title, subtitle, size = '', footer, children, headerExtra }) {
  useEscape(onClose, open);
  useBodyLock(open);
  if (!open) return null;
  return createPortal(
    <>
      <div className="overlay" onClick={onClose} />
      <aside className={`drawer ${size ? `drawer-${size}` : ''}`} role="dialog" aria-modal="true">
        <div className="drawer-head">
          <div className="flex-1" style={{ minWidth: 0 }}>
            <div className="t-lg fw-7 truncate">{title}</div>
            {subtitle && <div className="t-sm ink-3 mt-1">{subtitle}</div>}
          </div>
          {headerExtra}
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </aside>
    </>,
    document.body
  );
}

export function Modal({ open, onClose, title, subtitle, size = '', footer, children }) {
  useEscape(onClose, open);
  useBodyLock(open);
  if (!open) return null;
  return createPortal(
    <div className="modal-wrap">
      <div className="overlay" onClick={onClose} />
      <div className={`modal ${size ? `modal-${size}` : ''}`} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div className="flex-1" style={{ minWidth: 0 }}>
            <div className="t-lg fw-7">{title}</div>
            {subtitle && <div className="t-sm ink-3 mt-1">{subtitle}</div>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', desc, confirmText = 'Confirm', danger = false }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <span
            style={{
              width: 34, height: 34, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: danger ? 'var(--danger-soft)' : 'var(--warning-soft)',
              color: danger ? 'var(--danger-ink)' : 'var(--warning-ink)',
            }}
          >
            <AlertTriangle size={17} />
          </span>
          {title}
        </span>
      }
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => { onConfirm?.(); onClose(); }}>
            {confirmText}
          </button>
        </>
      }
    >
      <p className="t-base ink-2" style={{ lineHeight: 1.6 }}>{desc}</p>
    </Modal>
  );
}
