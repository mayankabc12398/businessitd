// SRS Management — department-wise SRS planning schedule & sign-off.
import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileSignature, Plus, CheckCircle2, ClipboardList, GitBranch, FileCheck2, Mail,
  Users, ListChecks, UploadCloud, FileText, X, Trash2, PenLine,
  CalendarPlus, CalendarClock, Building2, Check, Paperclip,
} from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Drawer, Badge, StatusBadge, Chip, DetailRow, FormDrawer, Field, Input, Select, SearchSelect, SwitchField, useToast } from '../components/ui';
import { fmtDate } from '../utils/format';
import { PROJECTS } from '../data/projects';
import { HOSPITAL_DEPTS } from '../data/masters';

const fmtDateTime = (dt) => {
  if (!dt) return '—';
  const [d, t] = String(dt).split('T');
  return `${fmtDate(d)}${t ? ` · ${t}` : ''}`;
};
const fmtSize = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : b >= 1024 ? `${(b / 1024).toFixed(0)} KB` : `${b} B`);

export default function Srs() {
  const { data: rows, loading } = useApi(() => api.getSrsSchedule());
  const { data: kpis } = useApi(() => api.getSrsKpis());
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [proj, setProj] = useState('All');
  const [statusF, setStatusF] = useState('All');
  const [show, setShow] = useState(false);
  const [bulk, setBulk] = useState(false);
  const [extra, setExtra] = useState([]);
  const [selected, setSelected] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [overrides, setOverrides] = useState({}); // id -> { signoff, status, docs }

  useEffect(() => { if (params.get('new') === '1') { setShow(true); setParams({}, { replace: true }); } }, [params, setParams]);

  const baseRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const allRows = useMemo(() => baseRows.map((r) => (overrides[r.id] ? { ...r, ...overrides[r.id] } : r)), [baseRows, overrides]);
  const projOptions = useMemo(() => ['All', ...new Set(allRows.map((r) => r.projectName))], [allRows]);
  const filtered = useMemo(() => allRows.filter((r) => (proj === 'All' || r.projectName === proj) && (statusF === 'All' || r.status === statusF)), [allRows, proj, statusF]);
  const activeRow = useMemo(() => allRows.find((r) => r.id === activeId) || null, [allRows, activeId]);

  const addSrs = (v) => {
    const p = PROJECTS.find((x) => x.code === v.projectCode);
    const points = Number(v.srsPoints) || 0;
    const depts = Array.isArray(v.dept) ? v.dept : v.dept ? [v.dept] : [];
    const rows = depts.map((dept, i) => ({
      id: `SRS-${String(baseRows.length + 1 + i).padStart(3, '0')}`, projectCode: v.projectCode, projectName: p ? p.name.split(' — ')[0] : v.projectCode,
      dept, phase: v.phase || '—', consultant: v.consultant, planned: v.planned, actual: null, status: 'Scheduled',
      completedAt: v.completedAt || null, attendees: Number(v.attendees) || 0, srsPoints: points,
      requirements: points || Number(v.requirements) || 0, gaps: 0, crs: 0, signoff: '—', docs: [],
    }));
    setExtra((prev) => [...rows, ...prev]);
    toast.success('SRS scheduled', `${depts.length} department${depts.length > 1 ? 's' : ''} · ${p ? p.name.split(' — ')[0] : ''}`);
    setShow(false);
  };

  // Bulk schedule — one SRS session per selected department, optional schedule mail
  const scheduleBulk = ({ projectCode, consultant, planned, points, depts, sendMail, attach }) => {
    const p = PROJECTS.find((x) => x.code === projectCode);
    const name = p ? p.name.split(' — ')[0] : projectCode;
    const pts = Number(points) || 0;
    const docs = attach || [];
    const created = depts.map((dept, i) => ({
      id: `SRS-B${String(baseRows.length + i + 1).padStart(3, '0')}`, projectCode, projectName: name,
      dept, consultant, planned, actual: null, status: 'Scheduled', completedAt: null,
      attendees: 0, srsPoints: pts, requirements: pts, gaps: 0, crs: 0, signoff: '—', docs: [...docs],
    }));
    setExtra((prev) => [...created, ...prev]);
    setBulk(false);
    const n = created.length;
    if (sendMail) toast.success(`${n} session${n > 1 ? 's' : ''} scheduled & invite emailed`, `${name} · sent to ${consultant} + department attendees`);
    else toast.success(`${n} SRS session${n > 1 ? 's' : ''} scheduled`, `${name} · ${n} department${n > 1 ? 's' : ''}`);
  };

  // Send a schedule/invite mail for a single scheduled session
  const sendSchedule = () => {
    toast.success('Schedule mail sent', `${activeRow.dept} SRS invite emailed to ${activeRow.consultant} · ${fmtDate(activeRow.planned)}`);
  };

  const sendBulk = () => {
    toast.success('Emails sent', `SRS summary emailed for ${selected.length} session${selected.length > 1 ? 's' : ''}`);
    setSelected([]);
  };

  // apply an uploaded sign-off bundle to the active session
  const uploadSignoff = (files) => {
    const prevDocs = overrides[activeId]?.docs ?? activeRow?.docs ?? [];
    setOverrides((o) => ({ ...o, [activeId]: { signoff: 'Signed', status: 'Signed Off', docs: [...prevDocs, ...files] } }));
    toast.success('Sign-off uploaded', `${files.length} file${files.length > 1 ? 's' : ''} attached · ${activeRow?.dept}`);
  };
  const removeDoc = (idx) => {
    const docs = (overrides[activeId]?.docs ?? activeRow?.docs ?? []).filter((_, i) => i !== idx);
    setOverrides((o) => ({ ...o, [activeId]: { ...(o[activeId] || { signoff: activeRow.signoff, status: activeRow.status }), docs } }));
  };

  const columns = [
    { key: 'id', header: 'SRS ID', width: 90, render: (r) => <span className="mono t-xs ink-3">{r.id}</span> },
    { key: 'project', header: 'Project', minWidth: 150, render: (r) => <div><div className="fw-6 t-sm">{r.projectName}</div><div className="t-xs ink-3 mono">{r.projectCode}</div></div> },
    { key: 'dept', header: 'Department', render: (r) => <Badge tone="info">{r.dept}</Badge> },
    { key: 'consultant', header: 'Consultant' },
    { key: 'planned', header: 'Planned', accessor: (r) => r.planned, nowrap: true, render: (r) => fmtDate(r.planned) },
    { key: 'points', header: 'Points', align: 'right', accessor: (r) => r.srsPoints ?? r.requirements ?? 0, render: (r) => <b className="tabular">{r.srsPoints ?? r.requirements ?? 0}</b> },
    { key: 'attendees', header: 'Attendees', align: 'right', accessor: (r) => r.attendees ?? 0, render: (r) => r.attendees ? r.attendees : <span className="ink-3">—</span> },
    { key: 'docs', header: 'Files', align: 'center', accessor: (r) => (r.docs?.length ?? 0), render: (r) => r.docs?.length ? <Badge tone="neutral"><FileText size={11} /> {r.docs.length}</Badge> : <span className="ink-3">—</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'signoff', header: 'Sign-off', render: (r) => r.signoff === 'Signed' ? <Badge tone="success"><CheckCircle2 size={11} /> Signed</Badge> : r.signoff === 'Pending' ? <Badge tone="pending">Pending</Badge> : <span className="ink-3">—</span> },
  ];

  const STATUSES = ['All', 'Signed Off', 'Completed', 'In Progress', 'Scheduled'];

  return (
    <div className="page">
      <PageHeader icon={<FileSignature size={22} />} tint="mint" title="SRS Management" desc="Department-wise SRS planning, discussion & sign-off — linked to Smart SRS"
        crumbs={[{ label: 'Delivery' }, { label: 'SRS' }]}
        actions={<>
          <button className="btn btn-ghost" onClick={() => setBulk(true)}><CalendarPlus size={15} /> Bulk Schedule</button>
          <button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> Schedule SRS</button>
        </>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Sessions Scheduled" value={kpis?.scheduled ?? '—'} tint="mint" icon={<ClipboardList size={19} />} footer="Across active projects" />
        <MetricCard label="Completed / Signed" value={kpis?.completed ?? '—'} tint="green" icon={<FileCheck2 size={19} />} footer={`${kpis?.signed ?? 0} sign-offs received`} />
        <MetricCard label="Gaps Identified" value={kpis?.gaps ?? '—'} tint="peach" icon={<GitBranch size={19} />} footer="Requiring resolution" />
        <MetricCard label="Change Requests" value={kpis?.crs ?? '—'} tint="lavender" icon={<GitBranch size={19} />} footer={kpis ? `₹${(kpis.crValue/1e5).toFixed(1)}L value` : '—'} />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Project</span>
          {projOptions.map((p) => <Chip key={p} active={proj === p} onClick={() => setProj(p)}>{p}</Chip>)}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Status</span>
          {STATUSES.map((s) => <Chip key={s} active={statusF === s} onClick={() => setStatusF(s)}>{s}</Chip>)}
        </div>
      </div>

      <DataTable
        columns={columns} rows={filtered} loading={loading}
        selectable selected={selected} onSelect={setSelected}
        onRowClick={(r) => setActiveId(r.id)}
        exportName="srs-schedule.csv" searchPlaceholder="Search departments, consultants…" pageSize={15}
        toolbarLeft={selected.length > 0 && (
          <div className="flex items-center gap-2" style={{ background: 'var(--primary-soft)', borderRadius: 10, padding: '4px 6px 4px 12px' }}>
            <span className="t-sm fw-6" style={{ color: 'var(--primary-700)' }}>{selected.length} selected</span>
            <button className="btn btn-primary btn-sm" onClick={sendBulk}><Mail size={14} /> Send Email</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>Clear</button>
          </div>
        )}
      />

      {/* Row slider — single SRS detail, sign-off upload & send email */}
      <Drawer open={!!activeRow} onClose={() => setActiveId(null)} size="md"
        title={activeRow ? `${activeRow.dept} — SRS Session` : ''} subtitle={activeRow ? `${activeRow.id} · ${activeRow.projectName}` : ''}
        headerExtra={activeRow && <StatusBadge status={activeRow.status} />}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setActiveId(null)}>Close</button>
          {activeRow?.status === 'Scheduled' && (
            <button className="btn btn-ghost" onClick={sendSchedule}><CalendarClock size={14} /> Send Schedule Mail</button>
          )}
          <button className="btn btn-primary" onClick={() => { toast.success('Email sent', `SRS summary emailed to ${activeRow.consultant} & client`); setActiveId(null); }}>
            <Mail size={14} /> Send Email
          </button>
        </>}>
        {activeRow && (
          <div className="flex-col gap-4">
            <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
              <div className="detail-list">
                <DetailRow label="Project">{activeRow.projectName} <span className="mono t-xs ink-3">({activeRow.projectCode})</span></DetailRow>
                <DetailRow label="Department"><Badge tone="info">{activeRow.dept}</Badge></DetailRow>
                <DetailRow label="Phase">{activeRow.phase || '—'}</DetailRow>
                <DetailRow label="Consultant">{activeRow.consultant}</DetailRow>
                <DetailRow label="Planned Date">{fmtDate(activeRow.planned)}</DetailRow>
                <DetailRow label="Completion Date & Time">{fmtDateTime(activeRow.completedAt)}</DetailRow>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                ['SRS Points', 'srsPoints', activeRow.srsPoints ?? activeRow.requirements ?? 0, <ListChecks key="i" size={16} />, 'lavender'],
                ['Attendees', 'attendees', activeRow.attendees ?? 0, <Users key="i" size={16} />, 'blue'],
                ['Gaps', 'gaps', activeRow.gaps ?? 0, <GitBranch key="i" size={16} />, 'peach'],
              ].map(([label, field, val, icon, tint]) => (
                <div key={label} className="card card-pad text-center">
                  <span className="metric-icon" style={{ width: 34, height: 34, borderRadius: 9, margin: '0 auto 6px', background: `var(--tint-${tint})`, color: `var(--tint-${tint}-ink)` }}>{icon}</span>
                  <input type="number" min="0" className="t-2xl fw-8 tile-edit" value={val}
                    onChange={(e) => setOverrides((o) => ({ ...o, [activeId]: { ...(o[activeId] || {}), [field]: e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)) } }))}
                    onFocus={(e) => e.target.select()}
                    style={{ width: '100%', textAlign: 'center', border: 'none', background: 'transparent', outline: 'none', font: 'inherit', color: 'inherit', padding: 0 }} />
                  <div className="t-xs ink-3">{label}</div>
                </div>
              ))}
            </div>

            {/* Sign-off upload section */}
            <SignoffUpload docs={activeRow.docs || []} signed={activeRow.signoff === 'Signed'} onUpload={uploadSignoff} onRemove={removeDoc} />

            <div className="card card-pad">
              <div className="detail-list">
                <DetailRow label="Requirements">{activeRow.requirements}</DetailRow>
                <DetailRow label="Change Requests">{activeRow.crs}</DetailRow>
                <DetailRow label="Status"><StatusBadge status={activeRow.status} /></DetailRow>
                <DetailRow label="Sign-off">{activeRow.signoff === 'Signed' ? <Badge tone="success">Signed</Badge> : activeRow.signoff === 'Pending' ? <Badge tone="pending">Pending</Badge> : '—'}</DetailRow>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <FormDrawer open={show} onClose={() => setShow(false)} title="Schedule SRS Session" subtitle="Plan a department-wise SRS discussion"
        submitLabel="Schedule" onSubmit={addSrs}
        fields={[
          { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: PROJECTS.filter((p) => p.status !== 'Completed').map((p) => ({ value: p.code, label: p.name })) },
          { name: 'phase', label: 'Phase', type: 'select', required: true, options: ['Kick-off', 'Discovery', 'Requirement Gathering', 'Gap Review', 'Final Sign-off'] },
          { name: 'dept', label: 'Department', type: 'multiselect', required: true, options: HOSPITAL_DEPTS, placeholder: 'Select one or more…' },
          { name: 'consultant', label: 'Consultant', type: 'select', required: true, options: ['Neha Patel', 'Amit Verma', 'Meera Krishnan'] },
          { name: 'planned', label: 'Planned Date', type: 'date', required: true },
          { name: 'completedAt', label: 'Completion Date & Time', type: 'datetime-local' },
          { name: 'attendees', label: 'No. of Attendees', type: 'number', placeholder: '0' },
          { name: 'srsPoints', label: 'No. of SRS Points', type: 'number', placeholder: '0' },
        ]} />

      <BulkSchedule open={bulk} onClose={() => setBulk(false)} onSchedule={scheduleBulk} />
    </div>
  );
}

// ---- Bulk sign-off upload (drag & drop, multi-file) ----
function SignoffUpload({ docs, signed, onUpload, onRemove }) {
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

      {/* already-attached docs */}
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

      {/* dropzone */}
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

      {/* staged (not yet uploaded) */}
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

// ---- Bulk schedule (multi-department) + schedule mail ----
const CONSULTANTS = ['Neha Patel', 'Amit Verma', 'Meera Krishnan'];

function BulkSchedule({ open, onClose, onSchedule }) {
  const [projectCode, setProjectCode] = useState('');
  const [consultant, setConsultant] = useState('Neha Patel');
  const [planned, setPlanned] = useState('');
  const [points, setPoints] = useState('');
  const [depts, setDepts] = useState([]);
  const [sendMail, setSendMail] = useState(true);
  const [attach, setAttach] = useState([]);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef(null);

  // reset each time the drawer opens
  useEffect(() => {
    if (open) { setProjectCode(''); setConsultant('Neha Patel'); setPlanned(''); setPoints(''); setDepts([]); setSendMail(true); setAttach([]); }
  }, [open]);

  const projOptions = useMemo(() => PROJECTS.filter((p) => p.status !== 'Completed').map((p) => ({ value: p.code, label: p.name })), []);
  const allSel = depts.length === HOSPITAL_DEPTS.length;
  const toggleDept = (d) => setDepts((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));
  const addFiles = (fl) => {
    const arr = Array.from(fl).map((f) => ({ name: f.name, size: f.size }));
    if (arr.length) setAttach((p) => [...p, ...arr]);
  };
  const valid = projectCode && planned && depts.length > 0;
  const n = depts.length;

  return (
    <Drawer open={open} onClose={onClose} size="md" title="Bulk Schedule SRS"
      subtitle="Schedule multiple departments at once & email the schedule"
      headerExtra={n > 0 && <Badge tone="info">{n} selected</Badge>}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!valid} onClick={() => onSchedule({ projectCode, consultant, planned, points, depts, sendMail, attach })}>
          <CalendarPlus size={14} /> Schedule {n || ''} session{n === 1 ? '' : 's'}
        </button>
      </>}>
      <div className="flex-col gap-4">
        {/* shared session details */}
        <div className="card card-pad">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Project" required>
                <SearchSelect value={projectCode} onChange={setProjectCode} options={projOptions} placeholder="Search & select project…" />
              </Field>
            </div>
            <Field label="Consultant" required>
              <Select value={consultant} onChange={(e) => setConsultant(e.target.value)} options={CONSULTANTS} />
            </Field>
            <Field label="Planned Date" required>
              <Input type="date" value={planned} onChange={(e) => setPlanned(e.target.value)} />
            </Field>
            <Field label="SRS Points / session" help="Optional — applied to each">
              <Input type="number" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="0" />
            </Field>
          </div>
        </div>

        {/* department multi-select — the bulk part */}
        <div className="card card-pad">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 card-title"><Building2 size={15} /> Departments</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setDepts(allSel ? [] : [...HOSPITAL_DEPTS])}>{allSel ? 'Clear all' : 'Select all'}</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {HOSPITAL_DEPTS.map((d) => (
              <Chip key={d} active={depts.includes(d)} onClick={() => toggleDept(d)}>
                {depts.includes(d) && <Check size={12} />} {d}
              </Chip>
            ))}
          </div>
          <div className="t-xs ink-3 mt-2">{n} department{n === 1 ? '' : 's'} → {n} SRS session{n === 1 ? '' : 's'} will be created</div>
        </div>

        {/* schedule sheet / agenda attach — bulk upload like sign-off */}
        <div className="card card-pad">
          <div className="flex items-center gap-2 card-title mb-3"><Paperclip size={15} /> Schedule Sheet / Agenda <span className="t-xs ink-3 fw-4">(optional)</span></div>
          {attach.length > 0 && (
            <div className="flex-col gap-2 mb-3">
              {attach.map((f, i) => (
                <div key={i} className="flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px' }}>
                  <span className="metric-icon" style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--tint-mint)', color: 'var(--tint-mint-ink)' }}><FileText size={14} /></span>
                  <div className="flex-1" style={{ minWidth: 0 }}><div className="t-sm fw-6 truncate">{f.name}</div><div className="t-xs ink-3">{fmtSize(f.size)}</div></div>
                  <button className="icon-btn" style={{ width: 28, height: 28 }} title="Remove" onClick={() => setAttach((p) => p.filter((_, x) => x !== i))}><X size={14} /></button>
                </div>
              ))}
            </div>
          )}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
            style={{
              border: `1.5px dashed ${drag ? 'var(--primary)' : 'var(--border-strong)'}`, borderRadius: 12, padding: '16px',
              textAlign: 'center', cursor: 'pointer', background: drag ? 'var(--primary-softer)' : 'var(--surface-2)', transition: 'all var(--dur) var(--ease)',
            }}
          >
            <UploadCloud size={22} color={drag ? 'var(--primary)' : 'var(--text-3)'} style={{ margin: '0 auto 4px' }} />
            <div className="t-sm fw-6 ink-1">Drag & drop schedule sheet, or <span style={{ color: 'var(--primary-700)' }}>browse</span></div>
            <div className="t-xs ink-3 mt-1">Attached to every session & emailed with the invite.</div>
            <input ref={fileRef} type="file" multiple hidden accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.doc,.docx" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
          </div>
        </div>

        {/* send schedule mail */}
        <div className="card card-pad">
          <SwitchField checked={sendMail} onChange={setSendMail} label="Send schedule invite email"
            desc="Email the schedule to the consultant & department attendees on creation" />
        </div>
      </div>
    </Drawer>
  );
}
