// Activity Schedule — phase-wise implementation plan with filter bar
// (search input + dropdowns + date-range pickers) driving a full-column table,
// plus full CRUD: add / view / edit / delete activities.
import { useState, useMemo, useEffect } from 'react';
import {
  CalendarRange, ListChecks, CheckCircle2, Clock, Hourglass, RotateCcw,
  Plus, PenLine, Trash2,
} from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import {
  PageHeader, MetricCard, DataTable, Badge, StatusBadge, Field,
  Drawer, DetailRow, FormDrawer, ConfirmDialog, useToast,
} from '../components/ui';
import { fmtDate } from '../utils/format';
import {
  SCHEDULE_PHASES, SCHEDULE_CLINICS, SCHEDULE_STATUSES, SCHEDULE_MODES,
} from '../data/schedule';

const modeTone = { Onsite: 'info', Offsite: 'neutral' };
const phaseTone = { '1': 'info', '2': 'warning', '1,2': 'success' };
const GROUPS = ['Phase-1 Modules', 'Phase-2 Modules'];

const BLANK = { q: '', phase: 'All', clinic: 'All', status: 'All', mode: 'All', from: '', to: '' };
const EMPTY = [];

export default function Schedule() {
  const { data: rows, loading } = useApi(() => api.getActivitySchedule());
  const toast = useToast();

  // local editable copy — seeded from the API once, then CRUD mutates it
  const [items, setItems] = useState(null);
  useEffect(() => { if (rows && items === null) setItems(rows); }, [rows, items]);
  const list = items || EMPTY;

  const [f, setF] = useState(BLANK);
  const [formOpen, setFormOpen] = useState(false);
  const [editRow, setEditRow] = useState(null); // row being edited (null = add)
  const [viewId, setViewId] = useState(null);    // row shown in detail drawer
  const [delRow, setDelRow] = useState(null);     // row pending delete confirm

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const filtered = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return list.filter((r) =>
      (!q || r.activity.toLowerCase().includes(q)) &&
      (f.phase === 'All' || r.phase === f.phase) &&
      (f.clinic === 'All' || r.clinic === f.clinic) &&
      (f.status === 'All' || r.status === f.status) &&
      (f.mode === 'All' || r.mode === f.mode) &&
      (!f.from || (r.startDate && r.startDate >= f.from)) &&
      (!f.to || (r.startDate && r.startDate <= f.to))
    );
  }, [list, f]);

  const kpis = useMemo(() => ({
    total: list.length,
    done: list.filter((r) => r.status === 'Done').length,
    pending: list.filter((r) => r.status === 'Pending').length,
    totalDays: list.reduce((s, r) => s + (Number(r.days) || 0), 0),
  }), [list]);

  const dirty = JSON.stringify(f) !== JSON.stringify(BLANK);
  const viewRow = useMemo(() => list.find((r) => r.id === viewId) || null, [list, viewId]);

  // ---- CRUD ----
  const openAdd = () => { setEditRow(null); setFormOpen(true); };
  const openEdit = (row) => { setEditRow(row); setFormOpen(true); };

  const normalize = (v) => ({
    activity: v.activity.trim(),
    phase: v.phase, clinic: v.clinic, status: v.status, mode: v.mode, group: v.group,
    days: v.days === '' || v.days == null ? null : Number(v.days),
    startDate: v.startDate || null, endDate: v.endDate || null,
    actualStart: v.actualStart || null, actualEnd: v.actualEnd || null,
  });

  const submitForm = (v) => {
    const data = normalize(v);
    if (editRow) {
      setItems((prev) => prev.map((r) => (r.id === editRow.id ? { ...r, ...data } : r)));
      toast.success('Activity updated', data.activity);
    } else {
      const nextNum = list.reduce((m, r) => Math.max(m, +String(r.id).split('-')[1] || 0), 0) + 1;
      setItems((prev) => [{ id: `ACT-${String(nextNum).padStart(3, '0')}`, ...data }, ...prev]);
      toast.success('Activity added', data.activity);
    }
    setFormOpen(false); setEditRow(null);
  };

  const confirmDelete = () => {
    if (!delRow) return;
    setItems((prev) => prev.filter((r) => r.id !== delRow.id));
    toast.success('Activity deleted', delRow.activity);
    if (viewId === delRow.id) setViewId(null);
    setDelRow(null);
  };

  const columns = [
    { key: 'activity', header: 'Activity Schedule', minWidth: 300, render: (r) => (
      <div><div className="fw-6 t-sm">{r.activity}</div><div className="t-xs ink-3">{r.group}</div></div>
    ) },
    { key: 'phase', header: 'Phase', render: (r) => <Badge tone={phaseTone[r.phase] || 'neutral'}>{r.phase}</Badge> },
    { key: 'clinic', header: 'Hospital Name', minWidth: 180 },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'mode', header: 'Onsite / Offsite', render: (r) => r.mode ? <Badge tone={modeTone[r.mode] || 'neutral'}>{r.mode}</Badge> : <span className="ink-3">—</span> },
    { key: 'days', header: 'Days Required', align: 'right', accessor: (r) => r.days, render: (r) => r.days != null ? <b className="tabular">{r.days}</b> : <span className="ink-3">—</span> },
    { key: 'startDate', header: 'Start Date', nowrap: true, render: (r) => fmtDate(r.startDate) },
    { key: 'endDate', header: 'End Date', nowrap: true, render: (r) => fmtDate(r.endDate) },
    { key: 'actualStart', header: 'Actual Start Date', nowrap: true, render: (r) => r.actualStart ? fmtDate(r.actualStart) : <span className="ink-3">—</span> },
    { key: 'actualEnd', header: 'Actual End Date', nowrap: true, render: (r) => r.actualEnd ? fmtDate(r.actualEnd) : <span className="ink-3">—</span> },
    { key: '_act', header: '', sortable: false, width: 84, render: (r) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn" style={{ width: 28, height: 28 }} title="Edit" onClick={() => openEdit(r)}><PenLine size={13} /></button>
        <button className="icon-btn" style={{ width: 28, height: 28 }} title="Delete" onClick={() => setDelRow(r)}><Trash2 size={13} /></button>
      </div>
    ) },
  ];

  const formFields = [
    { name: 'activity', label: 'Activity Schedule', required: true, full: true, placeholder: 'e.g. Training & UAT of Phase-1 Modules' },
    { name: 'group', label: 'Module Group', type: 'select', required: true, default: GROUPS[0], options: GROUPS },
    { name: 'phase', label: 'Phase', type: 'select', required: true, default: '1', options: SCHEDULE_PHASES.map((p) => ({ value: p, label: `Phase ${p}` })) },
    { name: 'clinic', label: 'Hospital Name', type: 'select', required: true, default: SCHEDULE_CLINICS[0], options: SCHEDULE_CLINICS },
    { name: 'status', label: 'Status', type: 'select', required: true, default: 'Pending', options: SCHEDULE_STATUSES },
    { name: 'mode', label: 'Onsite / Offsite', type: 'select', required: true, default: 'Onsite', options: SCHEDULE_MODES },
    { name: 'days', label: 'Days Required', type: 'number', placeholder: 'e.g. 22' },
    { name: 'startDate', label: 'Start Date', type: 'date' },
    { name: 'endDate', label: 'End Date', type: 'date' },
    { name: 'actualStart', label: 'Actual Start Date', type: 'date' },
    { name: 'actualEnd', label: 'Actual End Date', type: 'date' },
  ];

  return (
    <div className="page">
      <PageHeader icon={<CalendarRange size={22} />} tint="indigo" title="Activity Schedule"
        desc="Phase-wise implementation plan — planned vs actual dates per activity"
        crumbs={[{ label: 'Overview' }, { label: 'Activity Schedule' }]}
        actions={<button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Activity</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Total Activities" value={kpis.total} tint="indigo" icon={<ListChecks size={19} />} footer="Across both phases" />
        <MetricCard label="Completed" value={kpis.done} tint="green" icon={<CheckCircle2 size={19} />} footer="Marked Done" />
        <MetricCard label="Pending" value={kpis.pending} tint="peach" icon={<Clock size={19} />} footer="Open activities" />
        <MetricCard label="Planned Effort" value={`${kpis.totalDays} d`} tint="lavender" icon={<Hourglass size={19} />} footer="Total days required" />
      </div>

      {/* Filter bar — search input + dropdowns + date-range pickers */}
      <div className="card card-pad">
        <div className="filter-grid">
          <Field label="Search Activity">
            <input className="input" value={f.q} onChange={set('q')} placeholder="Type activity name…" />
          </Field>
          <Field label="Phase">
            <select className="select" value={f.phase} onChange={set('phase')}>
              <option value="All">All Phases</option>
              {SCHEDULE_PHASES.map((p) => <option key={p} value={p}>Phase {p}</option>)}
            </select>
          </Field>
          <Field label="Hospital">
            <select className="select" value={f.clinic} onChange={set('clinic')}>
              <option value="All">All Hospitals</option>
              {SCHEDULE_CLINICS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className="select" value={f.status} onChange={set('status')}>
              <option value="All">All Status</option>
              {SCHEDULE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Onsite / Offsite">
            <select className="select" value={f.mode} onChange={set('mode')}>
              <option value="All">All Modes</option>
              {SCHEDULE_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Start Date — From">
            <input className="input" type="date" value={f.from} onChange={set('from')} />
          </Field>
          <Field label="Start Date — To">
            <input className="input" type="date" value={f.to} onChange={set('to')} />
          </Field>
          <div className="flex items-end">
            <button className="btn btn-outline w-full" disabled={!dirty} onClick={() => setF(BLANK)}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading || items === null} searchable={false}
        onRowClick={(r) => setViewId(r.id)}
        exportName="activity-schedule.csv" pageSize={20}
        emptyTitle="No activities match" emptyDesc="Adjust the filters or clear the date range." />

      {/* Read — detail drawer */}
      <Drawer open={!!viewRow} onClose={() => setViewId(null)} size="md"
        title={viewRow ? viewRow.activity : ''} subtitle={viewRow ? `${viewRow.id} · ${viewRow.group}` : ''}
        headerExtra={viewRow && <StatusBadge status={viewRow.status} />}
        footer={viewRow && <>
          <button className="btn btn-ghost" onClick={() => setDelRow(viewRow)}><Trash2 size={14} /> Delete</button>
          <button className="btn btn-primary" onClick={() => { openEdit(viewRow); setViewId(null); }}><PenLine size={14} /> Edit</button>
        </>}>
        {viewRow && (
          <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
            <div className="detail-list">
              <DetailRow label="Activity">{viewRow.activity}</DetailRow>
              <DetailRow label="Phase"><Badge tone={phaseTone[viewRow.phase] || 'neutral'}>{viewRow.phase}</Badge></DetailRow>
              <DetailRow label="Hospital Name">{viewRow.clinic}</DetailRow>
              <DetailRow label="Status"><StatusBadge status={viewRow.status} /></DetailRow>
              <DetailRow label="Onsite / Offsite">{viewRow.mode || '—'}</DetailRow>
              <DetailRow label="Days Required">{viewRow.days ?? '—'}</DetailRow>
              <DetailRow label="Start Date">{fmtDate(viewRow.startDate)}</DetailRow>
              <DetailRow label="End Date">{fmtDate(viewRow.endDate)}</DetailRow>
              <DetailRow label="Actual Start Date">{viewRow.actualStart ? fmtDate(viewRow.actualStart) : '—'}</DetailRow>
              <DetailRow label="Actual End Date">{viewRow.actualEnd ? fmtDate(viewRow.actualEnd) : '—'}</DetailRow>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create / Update — form drawer (distinct key so edit values don't leak) */}
      <FormDrawer key={editRow?.id || 'new'} open={formOpen} onClose={() => { setFormOpen(false); setEditRow(null); }}
        title={editRow ? 'Edit Activity' : 'Add Activity'}
        subtitle={editRow ? editRow.id : 'New schedule line item'}
        submitLabel={editRow ? 'Save Changes' : 'Add Activity'}
        initial={editRow || undefined} fields={formFields} onSubmit={submitForm} />

      {/* Delete — confirm */}
      <ConfirmDialog open={!!delRow} onClose={() => setDelRow(null)} onConfirm={confirmDelete}
        danger title="Delete activity?"
        desc={delRow ? `“${delRow.activity}” will be removed from the schedule. This cannot be undone.` : ''}
        confirmText="Delete" />
    </div>
  );
}
