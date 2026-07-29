// Module 11 · Documents — API PDFs, Swagger, BRD, Postman, SQL, images.
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FolderOpen, UploadCloud, FileText, Download } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, Chip, FormDrawer, useToast } from '../../components/ui';
import { fmtDate } from '../../utils/format';
import { DOC_TYPES } from '../../data/integration';

const DOC_TONE = { 'API PDF': 'rose', Swagger: 'green', BRD: 'blue', SRS: 'cyan', MOM: 'lavender', 'Postman Collection': 'peach', 'Excel Mapping': 'mint', 'SQL Script': 'lemon', Image: 'indigo' };

export default function Documents() {
  const { data: rows, loading } = useApi(() => api.getIntegrationDocuments());
  const { data: integrations } = useApi(() => api.getIntegrations());
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [type, setType] = useState('All');
  const [show, setShow] = useState(false);
  const [extra, setExtra] = useState([]);

  const allRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const typeOptions = ['All', ...DOC_TYPES];
  const filtered = useMemo(() => allRows.filter((r) => type === 'All' || r.type === type), [allRows, type]);

  useEffect(() => {
    if (params.get('new') === '1') { setShow(true); params.delete('new'); setParams(params, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const addDoc = (v) => {
    const parent = (integrations || []).find((i) => i.id === v.integrationId);
    setExtra((prev) => [{
      id: `DOC-${String(allRows.length + 1).padStart(2, '0')}`, integrationId: v.integrationId, integrationName: parent?.name || v.integrationId,
      name: v.name, type: v.type, size: v.size || '—', uploadedBy: v.uploadedBy || 'Devendra Singh', uploadedOn: '2026-07-27',
    }, ...prev]);
    toast.success('Document uploaded', v.name);
    setShow(false);
  };

  const columns = [
    { key: 'name', header: 'Document', minWidth: 220, render: (r) => <div className="flex items-center gap-2"><span className="metric-icon" style={{ width: 30, height: 30, borderRadius: 8, background: `var(--tint-${DOC_TONE[r.type] || 'blue'})`, color: `var(--tint-${DOC_TONE[r.type] || 'blue'}-ink)` }}><FileText size={14} /></span><div><div className="fw-6 t-sm">{r.name}</div><div className="t-xs ink-3">{r.integrationName}</div></div></div> },
    { key: 'type', header: 'Type', render: (r) => <Badge tone={DOC_TONE[r.type] || 'neutral'}>{r.type}</Badge> },
    { key: 'size', header: 'Size', align: 'right' },
    { key: 'uploadedBy', header: 'Uploaded By' },
    { key: 'uploadedOn', header: 'Date', nowrap: true, accessor: (r) => r.uploadedOn, render: (r) => fmtDate(r.uploadedOn) },
    { key: 'action', header: '', sortable: false, align: 'center', render: () => <button className="btn btn-outline btn-sm btn-icon" onClick={(e) => e.stopPropagation()} title="Download"><Download size={14} /></button> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<FolderOpen size={22} />} tint="blue" title="Documents" desc="API PDFs, Swagger, BRD, SRS, Postman collections, SQL scripts & images (Module 11)"
        crumbs={[{ label: 'Integration' }, { label: 'Documents' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><UploadCloud size={15} /> Upload Document</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Total Documents" value={allRows.length} tint="blue" icon={<FolderOpen size={19} />} footer="Archived in repository" />
        <MetricCard label="API Specs" value={allRows.filter((r) => ['API PDF', 'Swagger', 'Postman Collection'].includes(r.type)).length} tint="green" icon={<FileText size={19} />} footer="PDF / Swagger / Postman" />
        <MetricCard label="SQL Scripts" value={allRows.filter((r) => r.type === 'SQL Script').length} tint="lemon" icon={<FileText size={19} />} footer="Database scripts" />
        <MetricCard label="Integrations Covered" value={new Set(allRows.map((r) => r.integrationId)).size} tint="cyan" icon={<FolderOpen size={19} />} footer="With attachments" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Type</span>{typeOptions.map((t) => <Chip key={t} active={type === t} onClick={() => setType(t)}>{t}</Chip>)}</div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="documents.csv" searchPlaceholder="Search documents…" pageSize={15} />

      <FormDrawer open={show} onClose={() => setShow(false)} title="Upload Document" subtitle="Attach a document to an integration (Module 11)"
        submitLabel="Upload" submitIcon={<UploadCloud size={14} />} onSubmit={addDoc}
        fields={[
          { name: 'integrationId', label: 'Integration', type: 'search', required: true, full: true, options: (integrations || []).map((i) => ({ value: i.id, label: i.name })) },
          { name: 'name', label: 'Document Name', required: true, full: true, placeholder: 'e.g. Daraja API Reference.pdf' },
          { name: 'type', label: 'Type', type: 'select', required: true, options: DOC_TYPES },
          { name: 'size', label: 'Size', placeholder: 'e.g. 2.4 MB' },
          { name: 'uploadedBy', label: 'Uploaded By', placeholder: 'Name' },
        ]} />
    </div>
  );
}
