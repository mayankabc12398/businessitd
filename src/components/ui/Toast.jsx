import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const ToastCtx = createContext(null);

const ICONS = {
  success: <CheckCircle2 size={18} color="var(--success)" />,
  error: <XCircle size={18} color="var(--danger)" />,
  warning: <AlertTriangle size={18} color="var(--warning)" />,
  info: <Info size={18} color="var(--info)" />,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const push = useCallback((type, title, desc) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, type, title, desc }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const toast = {
    success: (title, desc) => push('success', title, desc),
    error: (title, desc) => push('error', title, desc),
    warning: (title, desc) => push('warning', title, desc),
    info: (title, desc) => push('info', title, desc),
  };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {ICONS[t.type]}
            <div className="flex-1">
              <div className="toast-title">{t.title}</div>
              {t.desc && <div className="toast-desc">{t.desc}</div>}
            </div>
            <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}>
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
