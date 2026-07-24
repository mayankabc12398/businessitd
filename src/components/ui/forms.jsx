// Form controls: Field wrapper, inputs, floating labels, searchable
// select, tag input, switch field. All controlled components.
import { useState, useRef, useMemo } from 'react';
import { Search, ChevronDown, X, AlertCircle } from 'lucide-react';
import { useClickOutside } from '../../hooks/useApi';

export function Field({ label, required, help, error, children }) {
  return (
    <div className="field">
      {label && (
        <label className="field-label">
          {label} {required && <span className="req">*</span>}
        </label>
      )}
      {children}
      {help && !error && <span className="field-help">{help}</span>}
      {error && (
        <span className="field-error"><AlertCircle size={12} /> {error}</span>
      )}
    </div>
  );
}

export function Input({ invalid, ...props }) {
  return <input className={`input ${invalid ? 'invalid' : ''}`} {...props} />;
}

export function Textarea({ invalid, ...props }) {
  return <textarea className={`textarea ${invalid ? 'invalid' : ''}`} {...props} />;
}

export function Select({ options = [], placeholder = 'Select…', invalid, value, onChange, ...props }) {
  return (
    <select className={`select ${invalid ? 'invalid' : ''}`} value={value ?? ''} onChange={onChange} {...props}>
      <option value="" disabled>{placeholder}</option>
      {options.map((o) => {
        const v = o.value ?? o;
        return <option key={v} value={v}>{o.label ?? o}</option>;
      })}
    </select>
  );
}

// Floating-label text input
export function FloatInput({ label, value, onChange, type = 'text', required, ...props }) {
  return (
    <div className={`float-field ${value ? 'has-value' : ''}`}>
      <input className="input" type={type} value={value} onChange={onChange} {...props} />
      <label>{label}{required && ' *'}</label>
    </div>
  );
}

// Searchable dropdown (combobox)
export function SearchSelect({ options = [], value, onChange, placeholder = 'Search & select…', renderOption }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const filtered = useMemo(() => {
    const needle = q.toLowerCase();
    return options.filter((o) => String(o.label ?? o).toLowerCase().includes(needle)).slice(0, 60);
  }, [options, q]);

  const selected = options.find((o) => (o.value ?? o) === value);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className="input flex items-center justify-between gap-2"
        style={{ cursor: 'pointer', textAlign: 'left' }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`truncate ${selected ? '' : 'ink-3'}`}>{selected ? (selected.label ?? selected) : placeholder}</span>
        <ChevronDown size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
      </button>
      {open && (
        <div className="menu-pop w-full" style={{ top: 'calc(100% + 6px)', left: 0, maxHeight: 300, overflowY: 'auto' }}>
          <div className="searchbox" style={{ padding: '2px 2px 8px' }}>
            <Search size={14} style={{ left: 12 }} />
            <input className="input" autoFocus placeholder="Type to filter…" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 32 }} />
          </div>
          {filtered.length === 0 && <div className="t-sm ink-3 text-center" style={{ padding: 12 }}>No matches</div>}
          {filtered.map((o) => {
            const v = o.value ?? o;
            return (
              <button
                key={v}
                type="button"
                className="menu-item"
                style={v === value ? { background: 'var(--primary-soft)', color: 'var(--primary-700)', fontWeight: 600 } : undefined}
                onClick={() => { onChange(v, o); setOpen(false); setQ(''); }}
              >
                {renderOption ? renderOption(o) : (o.label ?? o)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Tag / chip input
export function TagInput({ value = [], onChange, placeholder = 'Add and press Enter…', suggestions = [] }) {
  const [text, setText] = useState('');
  const add = (t) => {
    const v = t.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setText('');
  };
  return (
    <div className="input" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 40, height: 'auto', alignItems: 'center' }}>
      {value.map((t) => (
        <span key={t} className="badge badge-primary" style={{ gap: 6 }}>
          {t}
          <X size={11} style={{ cursor: 'pointer' }} onClick={() => onChange(value.filter((x) => x !== t))} />
        </span>
      ))}
      <input
        style={{ border: 'none', outline: 'none', flex: 1, minWidth: 120, fontSize: 13, background: 'transparent' }}
        value={text}
        placeholder={value.length ? '' : placeholder}
        list={suggestions.length ? 'tag-suggestions' : undefined}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); add(text); }
          if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1));
        }}
      />
      {suggestions.length > 0 && (
        <datalist id="tag-suggestions">
          {suggestions.map((s) => <option key={s} value={s} />)}
        </datalist>
      )}
    </div>
  );
}

export function SwitchField({ checked, onChange, label, desc }) {
  return (
    <label className="flex items-center gap-3" style={{ cursor: 'pointer' }}>
      <span className="switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="track" />
        <span className="thumb" />
      </span>
      <span>
        <span className="t-base fw-6 ink-1">{label}</span>
        {desc && <div className="t-sm ink-3">{desc}</div>}
      </span>
    </label>
  );
}

export function SearchBox({ value, onChange, placeholder = 'Search…', style, autoFocus }) {
  return (
    <div className="searchbox" style={style}>
      <Search size={15} />
      <input className="input" value={value} autoFocus={autoFocus} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
