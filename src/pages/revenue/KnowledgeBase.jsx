// Module 14 · Knowledge Base — SRS, BRD, videos, release notes, FAQs.
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, UploadCloud, FileText, Video, Download } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, Chip, FormDrawer, useToast } from '../../components/ui';
import { fmtDate } from '../../utils/format';
const KB_TYPES = ['SRS', 'BRD', 'Screenshot', 'Training Video', 'SQL Script', 'Release Notes', 'User Manual', 'FAQ'];
const KB_TONE = { SRS: 'blue', BRD: 'cyan', Screenshot: 'indigo', 'Training Video': 'rose', 'SQL Script': 'lemon', 'Release Notes': 'green', 'User Manual': 'lavender', FAQ: 'peach' };

export default function KnowledgeBase() {
  const { data: rows, loading } = useApi(() => api.getKbDocs());
  const { data: features } = useApi(() => api.getFeatures());
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [type, setType] = useState('All');
  const [show, setShow] = useState(false);
  const [extra, setExtra] = useState([]);

  const allRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const typeOptions = ['All', ...KB_TYPES];
  const filtered = useMemo(() => allRows.filter((r) => type === 'All' || r.type === type), [allRows, type]);

  useEffect(() => {
    if (params.get('new') === '1') { setShow(true); params.delete('new'); setParams(params, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const addDoc = (v) => {
    const parent = (features || []).find((f) => f.id === v.featureId || f.code === v.featureId);
    setExtra((prev) => [{
      id: `KB-${String(allRows.length + 1).padStart(2, '0')}`, featureId: v.featureId, featureName: parent?.name || v.featureId,
      name: v.name, type: v.type, size: v.size || '—', uploadedBy: v.uploadedBy || 'Devendra Singh', uploadedOn: '2026-07-27',
    }, ...prev]);
    toast.success('Attached to knowledge base', v.name);
    setShow(false);
  };

  const columns = [
    { key: 'name', header: 'Document', minWidth: 230, render: (r) => <div className="flex items-center gap-2"><span className="metric-icon" style={{ width: 30, height: 30, borderRadius: 8, background: `var(--tint-${KB_TONE[r.type] || 'blue'})`, color: `var(--tint-${KB_TONE[r.type] || 'blue'}-ink)` }}>{r.type === 'Training Video' ? <Video size={14} /> : <FileText size={14} />}</span><div><div className="fw-6 t-sm">{r.name}</div><div className="t-xs ink-3">{r.featureName}</div></div></div> },
    { key: 'type', header: 'Type', render: (r) => <Badge tone={KB_TONE[r.type] || 'neutral'}>{r.type}</Badge> },
    { key: 'size', header: 'Size', align: 'right' },
    { key: 'uploadedBy', header: 'Uploaded By' },
    { key: 'uploadedOn', header: 'Date', nowrap: true, accessor: (r) => r.uploadedOn, render: (r) => fmtDate(r.uploadedOn) },
    { key: 'action', header: '', sortable: false, align: 'center', render: () => <button className="btn btn-outline btn-sm btn-icon" onClick={(e) => e.stopPropagation()} title="Download"><Download size={14} /></button> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<BookOpen size={22} />} tint="lavender" title="Knowledge Base" desc="SRS, BRD, screenshots, training videos, SQL scripts, release notes, manuals & FAQs (Module 14)"
        crumbs={[{ label: 'Feature Intelligence' }, { label: 'Knowledge Base' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><UploadCloud size={15} /> Attach Document</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Total Documents" value={allRows.length} tint="lavender" icon={<BookOpen size={19} />} footer="Attached artifacts" />
        <MetricCard label="Specs (SRS/BRD)" value={allRows.filter((r) => ['SRS', 'BRD'].includes(r.type)).length} tint="blue" icon={<FileText size={19} />} footer="Requirement docs" />
        <MetricCard label="Training Videos" value={allRows.filter((r) => r.type === 'Training Video').length} tint="rose" icon={<Video size={19} />} footer="For onboarding" />
        <MetricCard label="Features Covered" value={new Set(allRows.map((r) => r.featureId)).size} tint="cyan" icon={<BookOpen size={19} />} footer="With docs" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Type</span>{typeOptions.map((t) => <Chip key={t} active={type === t} onClick={() => setType(t)}>{t}</Chip>)}</div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="knowledge-base.csv" searchPlaceholder="Search documents…" pageSize={15} />

      <FormDrawer open={show} onClose={() => setShow(false)} title="Attach Document" subtitle="Add an artifact to a feature (Module 14)"
        submitLabel="Attach" submitIcon={<UploadCloud size={14} />} onSubmit={addDoc}
        fields={[
          { name: 'featureId', label: 'Feature', type: 'search', required: true, full: true, options: (features || []).map((f) => ({ value: f.id, label: f.name })) },
          { name: 'name', label: 'Document Name', required: true, full: true, placeholder: 'e.g. Feature SRS.pdf' },
          { name: 'type', label: 'Type', type: 'select', required: true, options: KB_TYPES },
          { name: 'size', label: 'Size', placeholder: 'e.g. 1.2 MB' },
          { name: 'uploadedBy', label: 'Uploaded By', placeholder: 'Name' },
        ]} />
    </div>
  );
}
