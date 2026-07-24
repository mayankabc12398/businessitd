// Document Repository — all project documents in one searchable place.
import { useState, useMemo } from 'react';
import { FolderOpen, Upload, FileText, FileSpreadsheet, File, Download, Share2, Eye } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, Chip, Dropdown, FormDrawer, useToast } from '../components/ui';
import { fmtDate } from '../utils/format';
import { DOC_CATEGORIES } from '../data/masters';
import { PROJECTS } from '../data/projects';

const extIcon = (ext) => ext === 'xlsx' ? <FileSpreadsheet size={16} color="var(--success)" /> : ext === 'docx' ? <FileText size={16} color="var(--info)" /> : <File size={16} color="var(--danger)" />;
const fmtSize = (kb) => kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;

export default function Documents() {
  const { data: rows, loading } = useApi(() => api.getDocuments());
  const toast = useToast();
  const [catF, setCatF] = useState('All');
  const [proj, setProj] = useState('All');
  const [show, setShow] = useState(false);
  const [extra, setExtra] = useState([]);

  const allRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const projOptions = useMemo(() => ['All', ...new Set(allRows.map((r) => r.projectName))], [allRows]);
  const filtered = useMemo(() => allRows.filter((r) => (catF === 'All' || r.category === catF) && (proj === 'All' || r.projectName === proj)), [allRows, catF, proj]);
  const totalSize = allRows.reduce((s, r) => s + r.sizeKB, 0);

  const addDoc = (v) => {
    const p = PROJECTS.find((x) => x.code === v.projectCode);
    const ext = (v.name.includes('.') ? v.name.split('.').pop() : 'pdf').toLowerCase();
    setExtra((prev) => [{
      id: `DOC-${String(allRows.length + 1).padStart(3, '0')}`, projectCode: v.projectCode, projectName: p ? p.name.split(' — ')[0] : v.projectCode,
      name: v.name.includes('.') ? v.name : `${v.name}.${ext}`, category: v.category, ext,
      version: v.version || 'v1.0', sizeKB: Number(v.sizeKB) || 256, uploadedBy: v.uploadedBy || 'PMO',
      uploadedOn: '2026-07-24', shared: v.access === 'Shared',
    }, ...prev]);
    toast.success('Document uploaded', v.name);
    setShow(false);
  };

  const columns = [
    { key: 'name', header: 'Document', minWidth: 260, render: (r) => <div className="flex items-center gap-3"><span className="metric-icon" style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--surface-3)' }}>{extIcon(r.ext)}</span><div style={{ minWidth: 0 }}><div className="fw-6 t-sm truncate">{r.name}</div><div className="t-xs ink-3">{r.projectName} · {r.version}</div></div></div> },
    { key: 'category', header: 'Category', render: (r) => <Badge tone="info">{r.category}</Badge> },
    { key: 'size', header: 'Size', align: 'right', accessor: (r) => r.sizeKB, render: (r) => fmtSize(r.sizeKB) },
    { key: 'uploadedBy', header: 'Uploaded By' },
    { key: 'uploadedOn', header: 'Uploaded', accessor: (r) => r.uploadedOn, nowrap: true, render: (r) => fmtDate(r.uploadedOn) },
    { key: 'shared', header: 'Access', render: (r) => r.shared ? <Badge tone="success"><Share2 size={11} /> Shared</Badge> : <Badge tone="neutral">Private</Badge> },
    { key: 'act', header: '', sortable: false, width: 44, render: (r) => <Dropdown align="right" trigger={<button className="icon-btn" style={{ width: 30, height: 30 }}><Download size={15} /></button>} items={[{ icon: <Eye size={14} />, label: 'Preview', onClick: () => toast.info('Preview', r.name) }, { icon: <Download size={14} />, label: 'Download', onClick: () => toast.success('Downloading', r.name) }, { icon: <Share2 size={14} />, label: 'Share link', onClick: () => toast.info('Share', r.name) }]} /> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<FolderOpen size={22} />} tint="blue" title="Document Repository" desc="PO, contracts, MOM, SRS, manuals, UAT reports & sign-offs — versioned"
        crumbs={[{ label: 'Governance' }, { label: 'Documents' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Upload size={15} /> Upload</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Total Documents" value={rows?.length ?? '—'} tint="blue" icon={<FolderOpen size={19} />} footer={`${DOC_CATEGORIES.length} categories`} />
        <MetricCard label="Storage Used" value={fmtSize(totalSize)} tint="lavender" icon={<File size={19} />} footer="Across all projects" />
        <MetricCard label="Shared" value={(rows||[]).filter(r=>r.shared).length} tint="mint" icon={<Share2 size={19} />} footer="With client / team" />
        <MetricCard label="Sign-off Docs" value={(rows||[]).filter(r=>r.category==='Sign-off').length} tint="green" icon={<FileText size={19} />} footer="Signed artifacts" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap mb-1"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Category</span>{['All', ...DOC_CATEGORIES].map((c) => <Chip key={c} active={catF === c} onClick={() => setCatF(c)}>{c}</Chip>)}</div>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Project</span>{projOptions.map((p) => <Chip key={p} active={proj === p} onClick={() => setProj(p)}>{p}</Chip>)}</div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="documents.csv" searchPlaceholder="Search documents…" pageSize={15} />

      <FormDrawer open={show} onClose={() => setShow(false)} title="Upload Document" subtitle="Add a project document to the repository"
        submitLabel="Upload" submitIcon={<Upload size={14} />} onSubmit={addDoc}
        intro="Drag & drop a file or fill the details below. Documents are versioned automatically."
        fields={[
          { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: PROJECTS.map((p) => ({ value: p.code, label: p.name })) },
          { name: 'name', label: 'File Name', required: true, full: true, placeholder: 'e.g. SRS_OPD_v2.docx' },
          { name: 'category', label: 'Category', type: 'select', required: true, options: DOC_CATEGORIES },
          { name: 'version', label: 'Version', placeholder: 'v1.0' },
          { name: 'access', label: 'Access', type: 'select', default: 'Private', options: ['Private', 'Shared'] },
          { name: 'uploadedBy', label: 'Uploaded By', placeholder: 'Your name' },
        ]} />
    </div>
  );
}
