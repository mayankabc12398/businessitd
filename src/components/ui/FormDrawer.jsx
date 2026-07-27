// Generic schema-driven form drawer — used by every module's "Add" action.
// Pass a `fields` schema; it renders a 2-col grid, enforces required
// fields, and calls onSubmit(values) when valid.
import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Drawer } from './overlays';
import { Field, Input, Textarea, Select, SearchSelect, MultiSelect, TagInput, SwitchField, FileDrop } from './forms';

const emptyFor = (f) => (f.type === 'tags' || f.type === 'multiselect' ? [] : f.type === 'checkbox' ? false : '');

export function FormDrawer({ open, onClose, title, subtitle, size = 'md', fields = [], initial, submitLabel = 'Save', submitIcon, onSubmit, intro }) {
  const build = () => {
    const base = {};
    fields.forEach((f) => { base[f.name] = initial?.[f.name] ?? f.default ?? emptyFor(f); });
    return base;
  };
  const [values, setValues] = useState(build);
  useEffect(() => { if (open) setValues(build()); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open]);

  const set = (name, v) => setValues((s) => ({ ...s, [name]: v }));
  const visible = fields.filter((f) => !f.show || f.show(values));
  const valid = visible.every((f) => {
    if (!f.required) return true;
    const v = values[f.name];
    if (f.type === 'tags' || f.type === 'multiselect') return v.length > 0;
    if (f.type === 'checkbox') return v === true;
    return String(v ?? '').trim() !== '';
  });

  const submit = () => { if (valid) { onSubmit?.(values); } };

  return (
    <Drawer open={open} onClose={onClose} size={size} title={title} subtitle={subtitle}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!valid} onClick={submit}>{submitIcon || <CheckCircle2 size={14} />} {submitLabel}</button>
      </>}>
      {intro && <div className="card card-pad mb-4" style={{ background: 'var(--primary-softer)', border: '1px solid var(--primary-soft)' }}><div className="t-sm ink-2">{intro}</div></div>}
      <div className="form-grid">
        {visible.map((f) => (
          <div key={f.name} style={{ gridColumn: f.full ? '1 / -1' : 'auto' }}>
            {f.type === 'checkbox' ? (
              <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
                <SwitchField checked={!!values[f.name]} onChange={(v) => set(f.name, v)} label={f.label} desc={f.help} />
              </div>
            ) : (
            <Field label={f.label} required={f.required} help={f.help}>
              {f.type === 'textarea' ? (
                <Textarea rows={f.rows || 3} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} />
              ) : f.type === 'select' ? (
                <Select value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} options={f.options} placeholder={f.placeholder || 'Select…'} />
              ) : f.type === 'search' ? (
                <SearchSelect value={values[f.name]} onChange={(v) => set(f.name, v)} options={f.options} placeholder={f.placeholder || 'Search & select…'} />
              ) : f.type === 'multiselect' ? (
                <MultiSelect value={values[f.name]} onChange={(v) => set(f.name, v)} options={f.options} placeholder={f.placeholder || 'Select…'} />
              ) : f.type === 'tags' ? (
                <TagInput value={values[f.name]} onChange={(v) => set(f.name, v)} suggestions={f.suggestions} placeholder={f.placeholder} />
              ) : f.type === 'file' ? (
                <FileDrop value={values[f.name]} onChange={(v) => set(f.name, v)} placeholder={f.placeholder} accept={f.accept} />
              ) : (
                <Input type={f.type || 'text'} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} />
              )}
            </Field>
            )}
          </div>
        ))}
      </div>
    </Drawer>
  );
}
