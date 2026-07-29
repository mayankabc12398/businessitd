// Sign-off & Documents — merged Governance page.
//  • Sign-off tab: milestone digital sign-offs across the portfolio.
//  • Documents tab: versioned document repository (PO, contracts, MOM, SRS…).
// Shared page shell + header are single; KPIs, filters, table and add-form
// swap with the active tab.
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BadgeCheck, CheckCircle2, Clock, PenTool, FileSignature,
  FolderOpen, Upload, FileText, FileSpreadsheet, File, Download, Share2, Eye,
} from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Tabs, Modal, Badge, Chip, Dropdown, Field, Input, Select, Textarea, FormDrawer, useToast } from '../components/ui';
import { fmtDate } from '../utils/format';
import { SIGNOFF_MILESTONES, DOC_CATEGORIES } from '../data/masters';

const extIcon = (ext) => ext === 'xlsx' ? <FileSpreadsheet size={16} color="var(--success)" /> : ext === 'docx' ? <FileText size={16} color="var(--info)" /> : <File size={16} color="var(--danger)" />;
const fmtSize = (kb) => kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;

export default function SignoffDocs() {
  const toast = useToast();
  const { data: projects } = useApi(() => api.getProjects());
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState('signoff');

  // ── Sign-off state ──
  const { data: signoffs, loading: sigLoading } = useApi(() => api.getSignoffs());
  const [statusF, setStatusF] = useState('Pending');
  const [showSignoff, setShowSignoff] = useState(false);

  // ── Documents state ──
  const { data: docs, loading: docLoading } = useApi(() => api.getDocuments());
  const [catF, setCatF] = useState('All');
  const [proj, setProj] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [extra, setExtra] = useState([]);

  // Deep link: /signoff?new=1 → open the sign-off recorder.
  useEffect(() => { if (params.get('new') === '1') { setTab('signoff'); setShowSignoff(true); setParams({}, { replace: true }); } }, [params, setParams]);

  // ── Sign-off derived ──
  const sigFiltered = useMemo(() => (signoffs || []).filter((r) => r.status !== 'Not Reached' && (statusF === 'All' || r.status === statusF)), [signoffs, statusF]);
  const reached = (signoffs || []).filter((r) => r.status !== 'Not Reached').length;
  const signed = (signoffs || []).filter((r) => r.status === 'Signed').length;
  const pending = (signoffs || []).filter((r) => r.status === 'Pending').length;

  // ── Documents derived ──
  const allDocs = useMemo(() => [...extra, ...(docs || [])], [extra, docs]);
  const projOptions = useMemo(() => ['All', ...new Set(allDocs.map((r) => r.projectName))], [allDocs]);
  const docFiltered = useMemo(() => allDocs.filter((r) => (catF === 'All' || r.category === catF) && (proj === 'All' || r.projectName === proj)), [allDocs, catF, proj]);
  const totalSize = allDocs.reduce((s, r) => s + r.sizeKB, 0);

  const addDoc = (v) => {
    const p = (projects || []).find((x) => x.code === v.projectCode);
    const ext = (v.name.includes('.') ? v.name.split('.').pop() : 'pdf').toLowerCase();
    setExtra((prev) => [{
      id: `DOC-${String(allDocs.length + 1).padStart(3, '0')}`, projectCode: v.projectCode, projectName: p ? p.name.split(' — ')[0] : v.projectCode,
      name: v.name.includes('.') ? v.name : `${v.name}.${ext}`, category: v.category, ext,
      version: v.version || 'v1.0', sizeKB: Number(v.sizeKB) || 256, uploadedBy: v.uploadedBy || 'PMO',
      uploadedOn: '2026-07-24', shared: v.access === 'Shared',
    }, ...prev]);
    toast.success('Document uploaded', v.name);
    setShowUpload(false);
  };

  const sigColumns = [
    { key: 'milestone', header: 'Milestone', minWidth: 180, render: (r) => <div><div className="fw-6 t-sm">{r.milestone}</div><div className="t-xs ink-3">{r.projectName}</div></div> },
    { key: 'status', header: 'Status', render: (r) => r.status === 'Signed' ? <Badge tone="success"><CheckCircle2 size={11} /> Signed</Badge> : <Badge tone="pending"><Clock size={11} /> Pending</Badge> },
    { key: 'signedBy', header: 'Signed By', render: (r) => r.signedBy !== '—' ? <div><div className="fw-6 t-sm">{r.signedBy}</div><div className="t-xs ink-3">{r.designation}</div></div> : <span className="ink-3">—</span> },
    { key: 'method', header: 'Method', render: (r) => r.method !== '—' ? <Badge tone="info">{r.method}</Badge> : <span className="ink-3">—</span> },
    { key: 'date', header: 'Date', accessor: (r) => r.date, nowrap: true, render: (r) => r.date ? fmtDate(r.date) : '—' },
    { key: 'remarks', header: 'Remarks', minWidth: 200, render: (r) => <span className="t-sm ink-2">{r.remarks}</span> },
  ];

  const docColumns = [
    { key: 'name', header: 'Document', minWidth: 260, render: (r) => <div className="flex items-center gap-3"><span className="metric-icon" style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--surface-3)' }}>{extIcon(r.ext)}</span><div style={{ minWidth: 0 }}><div className="fw-6 t-sm truncate">{r.name}</div><div className="t-xs ink-3">{r.projectName} · {r.version}</div></div></div> },
    { key: 'category', header: 'Category', render: (r) => <Badge tone="info">{r.category}</Badge> },
    { key: 'size', header: 'Size', align: 'right', accessor: (r) => r.sizeKB, render: (r) => fmtSize(r.sizeKB) },
    { key: 'uploadedBy', header: 'Uploaded By' },
    { key: 'uploadedOn', header: 'Uploaded', accessor: (r) => r.uploadedOn, nowrap: true, render: (r) => fmtDate(r.uploadedOn) },
    { key: 'shared', header: 'Access', render: (r) => r.shared ? <Badge tone="success"><Share2 size={11} /> Shared</Badge> : <Badge tone="neutral">Private</Badge> },
    { key: 'act', header: '', sortable: false, width: 44, render: (r) => <Dropdown align="right" trigger={<button className="icon-btn" style={{ width: 30, height: 30 }}><Download size={15} /></button>} items={[{ icon: <Eye size={14} />, label: 'Preview', onClick: () => toast.info('Preview', r.name) }, { icon: <Download size={14} />, label: 'Download', onClick: () => toast.success('Downloading', r.name) }, { icon: <Share2 size={14} />, label: 'Share link', onClick: () => toast.info('Share', r.name) }]} /> },
  ];

  const isSignoff = tab === 'signoff';

  return (
    <div className="page">
      <PageHeader icon={isSignoff ? <BadgeCheck size={22} /> : <FolderOpen size={22} />} tint={isSignoff ? 'mint' : 'blue'}
        title="Sign-off & Documents" desc="Milestone digital sign-offs and the versioned document repository"
        crumbs={[{ label: 'Governance' }, { label: isSignoff ? 'Sign-off' : 'Documents' }]}
        actions={isSignoff
          ? <button className="btn btn-primary" onClick={() => setShowSignoff(true)}><PenTool size={15} /> Record Sign-off</button>
          : <button className="btn btn-primary" onClick={() => setShowUpload(true)}><Upload size={15} /> Upload</button>} />

      {isSignoff ? (
        <div className="kpi-grid stagger">
          <MetricCard label="Total Milestones" value={reached} tint="mint" icon={<FileSignature size={19} />} footer="Reached across projects" />
          <MetricCard label="Signed" value={signed} tint="green" icon={<CheckCircle2 size={19} />} footer="Digitally approved" />
          <MetricCard label="Pending" value={pending} tint="peach" icon={<Clock size={19} />} footer="Awaiting client" />
          <MetricCard label="Completion" value={`${signed + pending ? Math.round(signed / (signed + pending) * 100) : 0}%`} tint="cyan" icon={<BadgeCheck size={19} />} footer="Sign-off rate" />
        </div>
      ) : (
        <div className="kpi-grid stagger">
          <MetricCard label="Total Documents" value={docs?.length ?? '—'} tint="blue" icon={<FolderOpen size={19} />} footer={`${DOC_CATEGORIES.length} categories`} />
          <MetricCard label="Storage Used" value={fmtSize(totalSize)} tint="lavender" icon={<File size={19} />} footer="Across all projects" />
          <MetricCard label="Shared" value={(docs||[]).filter(r=>r.shared).length} tint="mint" icon={<Share2 size={19} />} footer="With client / team" />
          <MetricCard label="Sign-off Docs" value={(docs||[]).filter(r=>r.category==='Sign-off').length} tint="green" icon={<FileText size={19} />} footer="Signed artifacts" />
        </div>
      )}

      <Tabs active={tab} onChange={setTab} tabs={[
        { key: 'signoff', label: 'Sign-off Center', count: reached },
        { key: 'documents', label: 'Documents', count: allDocs.length },
      ]} />

      {isSignoff ? (
        <>
          <div className="card card-pad" style={{ paddingBottom: 12 }}>
            <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Status</span>{['Pending', 'Signed', 'All'].map((s) => <Chip key={s} active={statusF === s} onClick={() => setStatusF(s)}>{s}</Chip>)}</div>
          </div>
          <DataTable columns={sigColumns} rows={sigFiltered} loading={sigLoading} exportName="signoffs.csv" searchPlaceholder="Search milestones, projects…" pageSize={15} />
        </>
      ) : (
        <>
          <div className="card card-pad" style={{ paddingBottom: 12 }}>
            <div className="flex items-center gap-2 flex-wrap mb-1"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Category</span>{['All', ...DOC_CATEGORIES].map((c) => <Chip key={c} active={catF === c} onClick={() => setCatF(c)}>{c}</Chip>)}</div>
            <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Project</span>{projOptions.map((p) => <Chip key={p} active={proj === p} onClick={() => setProj(p)}>{p}</Chip>)}</div>
          </div>
          <DataTable columns={docColumns} rows={docFiltered} loading={docLoading} exportName="documents.csv" searchPlaceholder="Search documents…" pageSize={15} />
        </>
      )}

      <RecordSignoffModal open={showSignoff} onClose={() => setShowSignoff(false)} projects={projects} onSaved={(m) => { toast.success('Sign-off recorded', m); setShowSignoff(false); }} />

      <FormDrawer open={showUpload} onClose={() => setShowUpload(false)} title="Upload Document" subtitle="Add a project document to the repository"
        submitLabel="Upload" submitIcon={<Upload size={14} />} onSubmit={addDoc}
        intro="Drag & drop a file or fill the details below. Documents are versioned automatically."
        fields={[
          { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: (projects || []).map((p) => ({ value: p.code, label: p.name })) },
          { name: 'name', label: 'File Name', required: true, full: true, placeholder: 'e.g. SRS_OPD_v2.docx' },
          { name: 'category', label: 'Category', type: 'select', required: true, options: DOC_CATEGORIES },
          { name: 'version', label: 'Version', placeholder: 'v1.0' },
          { name: 'access', label: 'Access', type: 'select', default: 'Private', options: ['Private', 'Shared'] },
          { name: 'uploadedBy', label: 'Uploaded By', placeholder: 'Your name' },
        ]} />
    </div>
  );
}

function RecordSignoffModal({ open, onClose, onSaved, projects }) {
  const [f, setF] = useState({ project: '', milestone: '', signedBy: '', designation: '', method: 'Digital Signature', remarks: '' });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  return (
    <Modal open={open} onClose={onClose} title="Record Milestone Sign-off" subtitle="Capture a digital sign-off from the client"
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!f.milestone || !f.signedBy} onClick={() => onSaved(f.milestone)}><CheckCircle2 size={14} /> Record Sign-off</button></>}>
      <div className="flex-col gap-3">
        <Field label="Project" required><Select value={f.project} onChange={(e) => set('project', e.target.value)} options={(projects || []).map((p) => ({ value: p.code, label: p.name }))} placeholder="Select project…" /></Field>
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
