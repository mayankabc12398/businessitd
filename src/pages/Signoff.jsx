// Sign-off Center — milestone digital sign-offs across the portfolio.
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BadgeCheck, CheckCircle2, Clock, PenTool, FileSignature } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Modal, Badge, Chip, Field, Input, Select, Textarea, useToast } from '../components/ui';
import { fmtDate } from '../utils/format';
import { SIGNOFF_MILESTONES } from '../data/masters';
import { PROJECTS } from '../data/projects';

export default function Signoff() {
  const { data: rows, loading } = useApi(() => api.getSignoffs());
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [statusF, setStatusF] = useState('Pending');
  const [show, setShow] = useState(false);

  useEffect(() => { if (params.get('new') === '1') { setShow(true); setParams({}, { replace: true }); } }, [params, setParams]);

  const filtered = useMemo(() => (rows || []).filter((r) => r.status !== 'Not Reached' && (statusF === 'All' || r.status === statusF)), [rows, statusF]);
  const signed = (rows || []).filter((r) => r.status === 'Signed').length;
  const pending = (rows || []).filter((r) => r.status === 'Pending').length;

  const columns = [
    { key: 'milestone', header: 'Milestone', minWidth: 180, render: (r) => <div><div className="fw-6 t-sm">{r.milestone}</div><div className="t-xs ink-3">{r.projectName}</div></div> },
    { key: 'status', header: 'Status', render: (r) => r.status === 'Signed' ? <Badge tone="success"><CheckCircle2 size={11} /> Signed</Badge> : <Badge tone="pending"><Clock size={11} /> Pending</Badge> },
    { key: 'signedBy', header: 'Signed By', render: (r) => r.signedBy !== '—' ? <div><div className="fw-6 t-sm">{r.signedBy}</div><div className="t-xs ink-3">{r.designation}</div></div> : <span className="ink-3">—</span> },
    { key: 'method', header: 'Method', render: (r) => r.method !== '—' ? <Badge tone="info">{r.method}</Badge> : <span className="ink-3">—</span> },
    { key: 'date', header: 'Date', accessor: (r) => r.date, nowrap: true, render: (r) => r.date ? fmtDate(r.date) : '—' },
    { key: 'remarks', header: 'Remarks', minWidth: 200, render: (r) => <span className="t-sm ink-2">{r.remarks}</span> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<BadgeCheck size={22} />} tint="mint" title="Sign-off Center" desc="Digital sign-off for every implementation milestone"
        crumbs={[{ label: 'Governance' }, { label: 'Sign-off' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><PenTool size={15} /> Record Sign-off</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Total Milestones" value={(rows||[]).filter(r=>r.status!=='Not Reached').length} tint="mint" icon={<FileSignature size={19} />} footer="Reached across projects" />
        <MetricCard label="Signed" value={signed} tint="green" icon={<CheckCircle2 size={19} />} footer="Digitally approved" />
        <MetricCard label="Pending" value={pending} tint="peach" icon={<Clock size={19} />} footer="Awaiting client" />
        <MetricCard label="Completion" value={`${signed + pending ? Math.round(signed / (signed + pending) * 100) : 0}%`} tint="cyan" icon={<BadgeCheck size={19} />} footer="Sign-off rate" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Status</span>{['Pending', 'Signed', 'All'].map((s) => <Chip key={s} active={statusF === s} onClick={() => setStatusF(s)}>{s}</Chip>)}</div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="signoffs.csv" searchPlaceholder="Search milestones, projects…" pageSize={15} />

      <RecordSignoffModal open={show} onClose={() => setShow(false)} onSaved={(m) => { toast.success('Sign-off recorded', m); setShow(false); }} />
    </div>
  );
}

function RecordSignoffModal({ open, onClose, onSaved }) {
  const [f, setF] = useState({ project: '', milestone: '', signedBy: '', designation: '', method: 'Digital Signature', remarks: '' });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  return (
    <Modal open={open} onClose={onClose} title="Record Milestone Sign-off" subtitle="Capture a digital sign-off from the client"
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!f.milestone || !f.signedBy} onClick={() => onSaved(f.milestone)}><CheckCircle2 size={14} /> Record Sign-off</button></>}>
      <div className="flex-col gap-3">
        <Field label="Project" required><Select value={f.project} onChange={(e) => set('project', e.target.value)} options={PROJECTS.map((p) => ({ value: p.code, label: p.name }))} placeholder="Select project…" /></Field>
        <Field label="Milestone" required><Select value={f.milestone} onChange={(e) => set('milestone', e.target.value)} options={SIGNOFF_MILESTONES} placeholder="Select milestone…" /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Signed By" required><Input value={f.signedBy} onChange={(e) => set('signedBy', e.target.value)} placeholder="Client authorised name" /></Field>
          <Field label="Designation"><Input value={f.designation} onChange={(e) => set('designation', e.target.value)} placeholder="e.g. Medical Director" /></Field>
        </div>
        <Field label="Sign-off Method"><Select value={f.method} onChange={(e) => set('method', e.target.value)} options={['Digital Signature', 'e-Sign (OTP)', 'Scanned PDF']} /></Field>
        <Field label="Remarks"><Textarea rows={3} value={f.remarks} onChange={(e) => set('remarks', e.target.value)} placeholder="Any exceptions or notes…" /></Field>
      </div>
    </Modal>
  );
}
