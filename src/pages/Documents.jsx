// Document Repository — all project documents in one searchable place.
import { useState, useMemo } from 'react';
import { FolderOpen, Upload, FileText, FileSpreadsheet, File, Download, Share2, Eye } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, Chip, Dropdown, useToast } from '../components/ui';
import { fmtDate } from '../utils/format';
import { DOC_CATEGORIES } from '../data/masters';

const extIcon = (ext) => ext === 'xlsx' ? <FileSpreadsheet size={16} color="var(--success)" /> : ext === 'docx' ? <FileText size={16} color="var(--info)" /> : <File size={16} color="var(--danger)" />;
const fmtSize = (kb) => kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;

export default function Documents() {
  const { data: rows, loading } = useApi(() => api.getDocuments());
  const toast = useToast();
  const [catF, setCatF] = useState('All');
  const [proj, setProj] = useState('All');

  const projOptions = useMemo(() => ['All', ...new Set((rows || []).map((r) => r.projectName))], [rows]);
  const filtered = useMemo(() => (rows || []).filter((r) => (catF === 'All' || r.category === catF) && (proj === 'All' || r.projectName === proj)), [rows, catF, proj]);
  const totalSize = (rows || []).reduce((s, r) => s + r.sizeKB, 0);

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
        actions={<button className="btn btn-primary" onClick={() => toast.info('Upload document')}><Upload size={15} /> Upload</button>} />

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
    </div>
  );
}
