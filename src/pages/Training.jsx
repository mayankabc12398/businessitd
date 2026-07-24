// Training Management — department-wise training sessions & attendance.
import { useState, useMemo } from 'react';
import { GraduationCap, Plus, CheckCircle2, Users, Star, CalendarClock } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, StatusBadge, ProgressBar, Chip, FormDrawer, useToast } from '../components/ui';
import { fmtDate } from '../utils/format';
import { PROJECTS } from '../data/projects';
import { HOSPITAL_DEPTS, TRAINING_TYPES } from '../data/masters';

export default function Training() {
  const { data: rows, loading } = useApi(() => api.getTraining());
  const { data: kpis } = useApi(() => api.getDeliveryKpis());
  const toast = useToast();
  const [proj, setProj] = useState('All');
  const [show, setShow] = useState(false);
  const [extra, setExtra] = useState([]);

  const allRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const projOptions = useMemo(() => ['All', ...new Set(allRows.map((r) => r.projectName))], [allRows]);
  const filtered = useMemo(() => allRows.filter((r) => proj === 'All' || r.projectName === proj), [allRows, proj]);
  const avgFeedback = useMemo(() => { const f = allRows.filter((r) => r.feedback); return f.length ? (f.reduce((s, r) => s + r.feedback, 0) / f.length).toFixed(1) : '—'; }, [allRows]);

  const addTraining = (v) => {
    const p = PROJECTS.find((x) => x.code === v.projectCode);
    setExtra((prev) => [{
      id: `TRN-${String(allRows.length + 1).padStart(3, '0')}`, projectCode: v.projectCode, projectName: p ? p.name.split(' — ')[0] : v.projectCode,
      dept: v.dept, type: v.type, trainer: v.trainer || 'Ananya Iyer', date: v.date, durationHrs: Number(v.durationHrs) || 2,
      plannedAttendees: Number(v.plannedAttendees) || 0, attendance: 0, status: 'Scheduled', feedback: null, signoff: '—',
    }, ...prev]);
    toast.success('Training scheduled', `${v.dept} · ${p ? p.name.split(' — ')[0] : ''}`);
    setShow(false);
  };

  const columns = [
    { key: 'dept', header: 'Department', minWidth: 150, render: (r) => <div><div className="fw-6 t-sm">{r.dept}</div><div className="t-xs ink-3">{r.projectName}</div></div> },
    { key: 'type', header: 'Type', render: (r) => <Badge tone="info">{r.type}</Badge> },
    { key: 'trainer', header: 'Trainer' },
    { key: 'date', header: 'Date', accessor: (r) => r.date, nowrap: true, render: (r) => fmtDate(r.date) },
    { key: 'dur', header: 'Duration', align: 'right', accessor: (r) => r.durationHrs, render: (r) => `${r.durationHrs}h` },
    { key: 'att', header: 'Attendance', minWidth: 140, accessor: (r) => r.plannedAttendees ? r.attendance / r.plannedAttendees : 0, render: (r) => { const pct = r.plannedAttendees ? Math.round(r.attendance / r.plannedAttendees * 100) : 0; return r.status === 'Completed' ? <div style={{ minWidth: 110 }}><div className="flex justify-between t-xs mb-1"><span className="ink-3">{r.attendance}/{r.plannedAttendees}</span><b>{pct}%</b></div><ProgressBar value={pct} color="var(--success)" /></div> : <span className="ink-3 t-sm">{r.plannedAttendees} planned</span>; } },
    { key: 'feedback', header: 'Rating', align: 'center', accessor: (r) => r.feedback || 0, render: (r) => r.feedback ? <Badge tone="warning"><Star size={11} /> {r.feedback}</Badge> : <span className="ink-3">—</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'signoff', header: 'Sign-off', render: (r) => r.signoff === 'Signed' ? <Badge tone="success"><CheckCircle2 size={11} /> Signed</Badge> : r.signoff === 'Pending' ? <Badge tone="pending">Pending</Badge> : <span className="ink-3">—</span> },
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

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="training.csv" searchPlaceholder="Search departments, trainers…" pageSize={15} />

      <FormDrawer open={show} onClose={() => setShow(false)} title="Schedule Training" subtitle="Plan a department-wise training session"
        submitLabel="Schedule" onSubmit={addTraining}
        fields={[
          { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: PROJECTS.filter((p) => p.status !== 'Completed').map((p) => ({ value: p.code, label: p.name })) },
          { name: 'dept', label: 'Department', type: 'select', required: true, options: HOSPITAL_DEPTS },
          { name: 'type', label: 'Training Type', type: 'select', required: true, default: 'Classroom', options: TRAINING_TYPES },
          { name: 'trainer', label: 'Trainer', type: 'select', default: 'Ananya Iyer', options: ['Ananya Iyer', 'Neha Patel', 'Amit Verma'] },
          { name: 'date', label: 'Date', type: 'date', required: true },
          { name: 'durationHrs', label: 'Duration (hrs)', type: 'number', placeholder: '4' },
          { name: 'plannedAttendees', label: 'Planned Attendees', type: 'number', placeholder: '0' },
        ]} />
    </div>
  );
}
