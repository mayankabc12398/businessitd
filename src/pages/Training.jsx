// Training Management — department-wise training sessions & attendance.
import { useState, useMemo, useEffect, useRef } from 'react';
import { GraduationCap, Plus, CheckCircle2, Users, Star, CalendarClock, Clock, Mail, UploadCloud, FileText, Trash2, X, PenLine } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, StatusBadge, ProgressBar, Chip, Drawer, DetailRow, Field, Input, Select, SearchSelect, SwitchField, useToast } from '../components/ui';
import { fmtDate } from '../utils/format';
import { HOSPITAL_DEPTS, TRAINING_TYPES } from '../data/masters';

const fmtSize = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : b >= 1024 ? `${(b / 1024).toFixed(0)} KB` : `${b} B`);

// Duration in hours from two "HH:MM" strings (0 if invalid / non-positive).
const calcDuration = (from, to) => {
  if (!from || !to) return 0;
  const [fh, fm] = from.split(':').map(Number);
  const [th, tm] = to.split(':').map(Number);
  if ([fh, fm, th, tm].some((n) => Number.isNaN(n))) return 0;
  const mins = th * 60 + tm - (fh * 60 + fm);
  return mins > 0 ? Math.round((mins / 60) * 100) / 100 : 0;
};

export default function Training() {
  const { data: rows, loading, reload } = useApi(() => api.getTraining());
  const { data: kpis } = useApi(() => api.getDeliveryKpis());
  const { data: projects } = useApi(() => api.getProjects());
  const toast = useToast();
  const [proj, setProj] = useState('All');
  const [show, setShow] = useState(false);
  const [extra] = useState([]);
  const [selected, setSelected] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [overrides, setOverrides] = useState({}); // id -> edited fields / docs / signoff

  const baseRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const allRows = useMemo(() => baseRows.map((r) => (overrides[r.id] ? { ...r, ...overrides[r.id] } : r)), [baseRows, overrides]);
  const projOptions = useMemo(() => ['All', ...new Set(allRows.map((r) => r.projectName))], [allRows]);
  const filtered = useMemo(() => allRows.filter((r) => proj === 'All' || r.projectName === proj), [allRows, proj]);
  const avgFeedback = useMemo(() => { const f = allRows.filter((r) => r.feedback); return f.length ? (f.reduce((s, r) => s + r.feedback, 0) / f.length).toFixed(1) : '—'; }, [allRows]);
  const activeRow = useMemo(() => allRows.find((r) => r.id === activeId) || null, [allRows, activeId]);

  // Email a summary for all selected sessions (bulk)
  const sendBulk = () => {
    toast.success('Emails sent', `Training summary emailed for ${selected.length} session${selected.length > 1 ? 's' : ''}`);
    setSelected([]);
  };
  // Email a schedule/invite mail for a single scheduled session
  const sendSchedule = () => {
    toast.success('Schedule mail sent', `${activeRow.dept} training invite emailed to ${activeRow.trainer} · ${fmtDate(activeRow.date)}`);
  };
  // Inline-edit a numeric tile (Planned / Attendance / Feedback)
  const setTile = (field, raw, float = false) => {
    const n = raw === '' ? 0 : float ? Math.max(0, Number(raw)) : Math.max(0, Math.round(Number(raw)));
    setOverrides((o) => ({ ...o, [activeId]: { ...(o[activeId] || {}), [field]: n } }));
  };
  const uploadDocs = (files) => {
    const prev = overrides[activeId]?.docs ?? activeRow?.docs ?? [];
    setOverrides((o) => ({ ...o, [activeId]: { ...(o[activeId] || {}), docs: [...prev, ...files], signoff: 'Signed' } }));
    toast.success('Sign-off uploaded', `${files.length} file${files.length > 1 ? 's' : ''} attached · ${activeRow?.dept}`);
  };
  const removeDoc = (idx) => {
    const docs = (overrides[activeId]?.docs ?? activeRow?.docs ?? []).filter((_, i) => i !== idx);
    setOverrides((o) => ({ ...o, [activeId]: { ...(o[activeId] || {}), docs } }));
  };

  const addTraining = async (v) => {
    const p = (projects || []).find((x) => x.code === v.projectCode);
    const name = p ? p.name.split(' — ')[0] : v.projectCode;
    try {
      await api.createTraining({
        project: v.projectCode, department: v.dept, trainingType: v.type,
        trainer: v.trainer || 'Ananya Iyer', date: v.date, durationHrs: v.durationHrs,
        plannedAttendees: Number(v.plannedAttendees) || 0, attendance: 0, status: 'Scheduled',
        feedback: null, signoff: '—',
      });
      if (v.sendMail) toast.success('Training scheduled & invite emailed', `${v.dept} · ${name} — sent to ${v.trainer} + department attendees`);
      else toast.success('Training scheduled', `${v.dept} · ${name}`);
      setShow(false);
      reload();
    } catch (e) {
      toast.error('Could not save', e?.message || 'Request failed');
    }
  };

  const columns = [
    { key: 'dept', header: 'Department', minWidth: 150, render: (r) => <div><div className="fw-6 t-sm">{r.dept}</div><div className="t-xs ink-3">{r.projectName}</div></div> },
    { key: 'type', header: 'Type', render: (r) => <Badge tone="info">{r.type}</Badge> },
    { key: 'trainer', header: 'Trainer', render: (r) => <div><div className="t-sm">{r.trainer}</div>{r.coordinator && r.coordinator !== '—' && <div className="t-xs ink-3">Coord: {r.coordinator}</div>}</div> },
    { key: 'date', header: 'Date', accessor: (r) => r.date, nowrap: true, render: (r) => fmtDate(r.date) },
    { key: 'dur', header: 'Duration', align: 'right', accessor: (r) => r.durationHrs, render: (r) => <div style={{ lineHeight: 1.25 }}><div className="fw-6 t-sm">{r.durationHrs}h</div>{r.fromTime && r.toTime && <div className="t-xs ink-3" style={{ whiteSpace: 'nowrap' }}>{r.fromTime}–{r.toTime}</div>}</div> },
    { key: 'att', header: 'Attendance', minWidth: 140, accessor: (r) => r.plannedAttendees ? r.attendance / r.plannedAttendees : 0, render: (r) => { const pct = r.plannedAttendees ? Math.round(r.attendance / r.plannedAttendees * 100) : 0; return r.status === 'Completed' ? <div style={{ minWidth: 110 }}><div className="flex justify-between t-xs mb-1"><span className="ink-3">{r.attendance}/{r.plannedAttendees}</span><b>{pct}%</b></div><ProgressBar value={pct} color="var(--success)" /></div> : <span className="ink-3 t-sm">{r.plannedAttendees} planned</span>; } },
    { key: 'feedback', header: 'Rating', align: 'center', accessor: (r) => r.feedback || 0, render: (r) => r.feedback ? <Badge tone="warning"><Star size={11} /> {r.feedback}</Badge> : <span className="ink-3">—</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'signoff', header: 'Sign-off', render: (r) => r.signoff === 'Signed' ? <Badge tone="success"><CheckCircle2 size={11} /> Signed</Badge> : r.signoff === 'Pending' ? <Badge tone="pending">Pending</Badge> : <span className="ink-3">—</span> },
    { key: 'email', header: '', width: 46, align: 'center', sortable: false, render: (r) => (
      <button className="btn btn-icon btn-ghost btn-sm" title="Send email" onClick={(e) => { e.stopPropagation(); toast.success('Email sent', `${r.status === 'Scheduled' ? 'Invite' : 'Summary'} emailed · ${r.dept} (${r.projectName})`); }}>
        <Mail size={15} />
      </button>
    ) },
  ];

  return (
    <div className="page">
      <PageHeader icon={<GraduationCap size={22} />} tint="pink" title="Training Management" desc="Plan and record department-wise training, attendance & feedback"
        crumbs={[{ label: 'Build & Validate' }, { label: 'Training' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> Schedule Training</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Sessions" value={kpis?.trainingTotal ?? '—'} tint="pink" icon={<CalendarClock size={19} />} footer="Across projects" />
        <MetricCard label="Completed" value={kpis?.trainingDone ?? '—'} tint="green" icon={<CheckCircle2 size={19} />} footer="Dept-wise" />
        <MetricCard label="Avg Attendance" value={rows ? `${Math.round((rows.filter(r=>r.status==='Completed').reduce((s,r)=>s+(r.attendance/r.plannedAttendees),0)/Math.max(1,rows.filter(r=>r.status==='Completed').length))*100)}%` : '—'} tint="cyan" icon={<Users size={19} />} footer="Completed sessions" />
        <MetricCard label="Avg Feedback" value={avgFeedback} tint="lemon" icon={<Star size={19} />} footer="Out of 5.0" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Project</span>{projOptions.map((p) => <Chip key={p} active={proj === p} onClick={() => setProj(p)}>{p}</Chip>)}</div>
      </div>

      <DataTable
        columns={columns} rows={filtered} loading={loading}
        selectable selected={selected} onSelect={setSelected}
        onRowClick={(r) => setActiveId(r.id)}
        exportName="training.csv" searchPlaceholder="Search departments, trainers…" pageSize={15}
        toolbarLeft={selected.length > 0 && (
          <div className="flex items-center gap-2" style={{ background: 'var(--primary-soft)', borderRadius: 10, padding: '4px 6px 4px 12px' }}>
            <span className="t-sm fw-6" style={{ color: 'var(--primary-700)' }}>{selected.length} selected</span>
            <button className="btn btn-primary btn-sm" onClick={sendBulk}><Mail size={14} /> Send Email</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>Clear</button>
          </div>
        )}
      />

      {/* Row slider — single training detail & send email */}
      <Drawer open={!!activeRow} onClose={() => setActiveId(null)} size="md"
        title={activeRow ? `${activeRow.dept} — Training` : ''} subtitle={activeRow ? `${activeRow.id} · ${activeRow.projectName}` : ''}
        headerExtra={activeRow && <StatusBadge status={activeRow.status} />}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setActiveId(null)}>Close</button>
          {activeRow?.status === 'Scheduled' && (
            <button className="btn btn-ghost" onClick={sendSchedule}><CalendarClock size={14} /> Send Schedule Mail</button>
          )}
          <button className="btn btn-primary" onClick={() => { toast.success('Email sent', `Training summary emailed to ${activeRow.trainer} & department`); setActiveId(null); }}>
            <Mail size={14} /> Send Email
          </button>
        </>}>
        {activeRow && (
          <div className="flex-col gap-4">
            <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
              <div className="detail-list">
                <DetailRow label="Project">{activeRow.projectName} <span className="mono t-xs ink-3">({activeRow.projectCode})</span></DetailRow>
                <DetailRow label="Department"><Badge tone="info">{activeRow.dept}</Badge></DetailRow>
                <DetailRow label="Type">{activeRow.type}</DetailRow>
                <DetailRow label="Trainer">{activeRow.trainer}</DetailRow>
                <DetailRow label="Co-ordinator">{activeRow.coordinator && activeRow.coordinator !== '—' ? activeRow.coordinator : '—'}</DetailRow>
                <DetailRow label="Date">{fmtDate(activeRow.date)}</DetailRow>
                <DetailRow label="Time">{activeRow.fromTime && activeRow.toTime ? `${activeRow.fromTime}–${activeRow.toTime} · ${activeRow.durationHrs}h` : '—'}</DetailRow>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                ['Planned', 'plannedAttendees', activeRow.plannedAttendees ?? 0, <Users key="i" size={16} />, 'blue', false],
                ['Attendance', 'attendance', activeRow.attendance ?? 0, <CheckCircle2 key="i" size={16} />, 'green', false],
                ['Feedback', 'feedback', activeRow.feedback ?? 0, <Star key="i" size={16} />, 'lemon', true],
              ].map(([label, field, val, icon, tint, float]) => (
                <div key={label} className="card card-pad text-center">
                  <span className="metric-icon" style={{ width: 34, height: 34, borderRadius: 9, margin: '0 auto 6px', background: `var(--tint-${tint})`, color: `var(--tint-${tint}-ink)` }}>{icon}</span>
                  <input type="number" min="0" step={float ? '0.1' : '1'} max={float ? '5' : undefined} className="t-2xl fw-8 tile-edit" value={val}
                    onChange={(e) => setTile(field, e.target.value, float)} onFocus={(e) => e.target.select()}
                    style={{ width: '100%', textAlign: 'center', border: 'none', background: 'transparent', outline: 'none', font: 'inherit', color: 'inherit', padding: 0 }} />
                  <div className="t-xs ink-3">{label}</div>
                </div>
              ))}
            </div>

            <TrainingDocs docs={activeRow.docs || []} signed={activeRow.signoff === 'Signed'} onUpload={uploadDocs} onRemove={removeDoc} />

            <div className="card card-pad">
              <div className="detail-list">
                <DetailRow label="Status"><StatusBadge status={activeRow.status} /></DetailRow>
                <DetailRow label="Sign-off">{activeRow.signoff === 'Signed' ? <Badge tone="success">Signed</Badge> : activeRow.signoff === 'Pending' ? <Badge tone="pending">Pending</Badge> : '—'}</DetailRow>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <ScheduleTraining open={show} onClose={() => setShow(false)} onSchedule={addTraining} projects={projects} />
    </div>
  );
}

// ---- Sign-off documents upload (drag & drop, multi-file) ----
function TrainingDocs({ docs, signed, onUpload, onRemove }) {
  const [staged, setStaged] = useState([]);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  const addFiles = (fileList) => {
    const arr = Array.from(fileList).map((f) => ({ name: f.name, size: f.size, ext: (f.name.split('.').pop() || '').toLowerCase() }));
    if (arr.length) setStaged((p) => [...p, ...arr]);
  };
  const onDrop = (e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); };
  const confirm = () => { onUpload(staged); setStaged([]); };

  return (
    <div className="card card-pad">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 card-title"><PenLine size={15} /> Sign-off Documents</div>
        {signed ? <Badge tone="success"><CheckCircle2 size={11} /> Signed</Badge> : <Badge tone="pending">Pending</Badge>}
      </div>

      {docs.length > 0 && (
        <div className="flex-col gap-2 mb-3">
          {docs.map((d, i) => (
            <div key={i} className="flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px' }}>
              <span className="metric-icon" style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--tint-mint)', color: 'var(--tint-mint-ink)' }}><FileText size={14} /></span>
              <div className="flex-1" style={{ minWidth: 0 }}><div className="t-sm fw-6 truncate">{d.name}</div><div className="t-xs ink-3">{fmtSize(d.size)} · uploaded</div></div>
              <button className="icon-btn" style={{ width: 28, height: 28 }} title="Remove" onClick={() => onRemove(i)}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        style={{
          border: `1.5px dashed ${drag ? 'var(--primary)' : 'var(--border-strong)'}`, borderRadius: 12, padding: '20px 16px',
          textAlign: 'center', cursor: 'pointer', background: drag ? 'var(--primary-softer)' : 'var(--surface-2)', transition: 'all var(--dur) var(--ease)',
        }}
      >
        <UploadCloud size={26} color={drag ? 'var(--primary)' : 'var(--text-3)'} style={{ margin: '0 auto 6px' }} />
        <div className="t-sm fw-6 ink-1">Drag & drop sign-off files, or <span style={{ color: 'var(--primary-700)' }}>browse</span></div>
        <div className="t-xs ink-3 mt-1">Bulk upload — PDF, images or scanned sheets. Multiple files supported.</div>
        <input ref={inputRef} type="file" multiple hidden accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
      </div>

      {staged.length > 0 && (
        <div className="flex-col gap-2 mt-3">
          {staged.map((f, i) => (
            <div key={i} className="flex items-center gap-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px' }}>
              <span className="metric-icon" style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface-3)' }}><FileText size={14} color="var(--text-2)" /></span>
              <div className="flex-1" style={{ minWidth: 0 }}><div className="t-sm fw-6 truncate">{f.name}</div><div className="t-xs ink-3">{fmtSize(f.size)}</div></div>
              <button className="icon-btn" style={{ width: 28, height: 28 }} title="Remove" onClick={() => setStaged((p) => p.filter((_, x) => x !== i))}><X size={14} /></button>
            </div>
          ))}
          <div className="flex items-center justify-between mt-1">
            <span className="t-xs ink-3">{staged.length} file{staged.length > 1 ? 's' : ''} ready</span>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setStaged([])}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={confirm}><UploadCloud size={14} /> Upload & Sign off</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Schedule Training drawer — from/to time with auto-calculated duration + invite mail ----
const TRAINERS = ['Ananya Iyer', 'Neha Patel', 'Amit Verma'];

function ScheduleTraining({ open, onClose, onSchedule, projects }) {
  const [projectCode, setProjectCode] = useState('');
  const [dept, setDept] = useState('');
  const [type, setType] = useState('Classroom');
  const [trainer, setTrainer] = useState(TRAINERS[0]);
  const [coordinator, setCoordinator] = useState('');
  const [date, setDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [attendees, setAttendees] = useState('');
  const [sendMail, setSendMail] = useState(true);

  // reset each time the drawer opens
  useEffect(() => {
    if (open) { setProjectCode(''); setDept(''); setType('Classroom'); setTrainer(TRAINERS[0]); setCoordinator(''); setDate(''); setFromTime(''); setToTime(''); setAttendees(''); setSendMail(true); }
  }, [open]);

  const projOptions = useMemo(() => (projects || []).filter((p) => p.status !== 'Completed').map((p) => ({ value: p.code, label: p.name })), [projects]);
  const duration = calcDuration(fromTime, toTime);
  const timeError = fromTime && toTime && duration === 0;
  const valid = projectCode && dept && date && fromTime && toTime && duration > 0;

  const submit = () => {
    if (!valid) return;
    onSchedule({ projectCode, dept, type, trainer, coordinator, date, fromTime, toTime, durationHrs: duration, plannedAttendees: attendees, sendMail });
  };

  return (
    <Drawer open={open} onClose={onClose} size="md" title="Schedule Training" subtitle="Plan a department-wise training session"
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!valid} onClick={submit}>
          {sendMail ? <Mail size={14} /> : <CheckCircle2 size={14} />} Schedule{sendMail ? ' & Email' : ''}
        </button>
      </>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Project" required>
            <SearchSelect value={projectCode} onChange={setProjectCode} options={projOptions} placeholder="Search & select project…" />
          </Field>
        </div>
        <Field label="Department" required>
          <Select value={dept} onChange={(e) => setDept(e.target.value)} options={HOSPITAL_DEPTS} placeholder="Select…" />
        </Field>
        <Field label="Training Type" required>
          <Select value={type} onChange={(e) => setType(e.target.value)} options={TRAINING_TYPES} />
        </Field>
        <Field label="Trainer">
          <Select value={trainer} onChange={(e) => setTrainer(e.target.value)} options={TRAINERS} />
        </Field>
        <Field label="Date" required>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Hospital Co-ordinator">
            <Input value={coordinator} onChange={(e) => setCoordinator(e.target.value)} placeholder="Hospital-side coordinator name" />
          </Field>
        </div>
        <Field label="From Time" required>
          <Input type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} />
        </Field>
        <Field label="To Time" required>
          <Input type="time" value={toTime} onChange={(e) => setToTime(e.target.value)} />
        </Field>
        {/* Auto-calculated duration */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="card card-pad flex items-center justify-between" style={{ background: timeError ? 'var(--danger-soft)' : 'var(--surface-2)', padding: '10px 14px' }}>
            <span className="flex items-center gap-2 t-sm fw-6 ink-2"><Clock size={15} /> Duration (auto-calculated)</span>
            {timeError
              ? <span className="t-sm fw-7" style={{ color: 'var(--danger-ink)' }}>To time must be after From time</span>
              : <span className="t-lg fw-8" style={{ color: 'var(--primary-700)' }}>{duration} hr{duration === 1 ? '' : 's'}</span>}
          </div>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Planned Attendees">
            <Input type="number" value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="0" />
          </Field>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
            <SwitchField checked={sendMail} onChange={setSendMail} label="Send schedule invite email"
              desc="Email the training schedule to the trainer & department attendees on creation" />
          </div>
        </div>
      </div>
    </Drawer>
  );
}
