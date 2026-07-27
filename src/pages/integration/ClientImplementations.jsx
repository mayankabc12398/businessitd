// Module 9 · Client Implementation — which hospital runs which integration.
import { useState, useMemo } from 'react';
import { Hospital, Plus, Building2, CheckCircle2, FlaskConical } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, StatusBadge, Chip, FormDrawer, useToast } from '../../components/ui';
import { fmtDate } from '../../utils/format';
import { INTEGRATIONS } from '../../data/integration';
import { INT_STATUS_TONE } from './_shared';

export default function ClientImplementations() {
  const { data: rows, loading } = useApi(() => api.getClientImplementations());
  const toast = useToast();
  const [status, setStatus] = useState('All');
  const [show, setShow] = useState(false);
  const [extra, setExtra] = useState([]);

  const allRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const statuses = ['All', 'Live', 'UAT', 'Pending'];
  const filtered = useMemo(() => allRows.filter((r) => status === 'All' || r.status === status), [allRows, status]);
  const live = allRows.filter((r) => r.status === 'Live').length;

  const addImpl = (v) => {
    const parent = INTEGRATIONS.find((i) => i.id === v.integrationId);
    setExtra((prev) => [{
      id: `CI-${String(allRows.length + 1).padStart(2, '0')}`, integrationId: v.integrationId, integrationName: parent?.name || v.integrationId,
      client: v.client, status: v.status || 'UAT', liveDate: v.liveDate || null, version: v.version || 'V1.0',
    }, ...prev]);
    toast.success('Client implementation added', `${v.client}`);
    setShow(false);
  };

  const columns = [
    { key: 'client', header: 'Client / Hospital', minWidth: 180, render: (r) => <div className="flex items-center gap-2"><Building2 size={15} className="ink-3" /><span className="fw-6 t-sm">{r.client}</span></div> },
    { key: 'integrationName', header: 'Integration', minWidth: 190 },
    { key: 'version', header: 'Version', render: (r) => <Badge tone="neutral">{r.version}</Badge> },
    { key: 'liveDate', header: 'Live Date', nowrap: true, accessor: (r) => r.liveDate || '', render: (r) => r.liveDate ? fmtDate(r.liveDate) : <span className="ink-3">Pending</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} tone={INT_STATUS_TONE[r.status]} /> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Hospital size={22} />} tint="cyan" title="Client Implementations" desc="Track which hospital runs which integration — instantly know where it already exists (Module 9)"
        crumbs={[{ label: 'Integration' }, { label: 'Client Implementations' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> Add Implementation</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Implementations" value={allRows.length} tint="cyan" icon={<Hospital size={19} />} footer="Total client roll-outs" />
        <MetricCard label="Live" value={live} tint="green" icon={<CheckCircle2 size={19} />} footer="In production" onClick={() => setStatus('Live')} />
        <MetricCard label="In UAT" value={allRows.filter((r) => r.status === 'UAT').length} tint="lemon" icon={<FlaskConical size={19} />} footer="Under acceptance" onClick={() => setStatus('UAT')} />
        <MetricCard label="Hospitals" value={new Set(allRows.map((r) => r.client)).size} tint="blue" icon={<Building2 size={19} />} footer="Distinct clients" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Status</span>{statuses.map((s) => <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{s}</Chip>)}</div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="client-implementations.csv" searchPlaceholder="Search clients, integrations…" pageSize={15} />

      <FormDrawer open={show} onClose={() => setShow(false)} title="Add Client Implementation" subtitle="Record where an integration is deployed (Module 9)"
        submitLabel="Save" onSubmit={addImpl}
        fields={[
          { name: 'integrationId', label: 'Integration', type: 'search', required: true, full: true, options: INTEGRATIONS.map((i) => ({ value: i.id, label: i.name })) },
          { name: 'client', label: 'Client / Hospital', required: true, placeholder: 'e.g. Lumumba Hospital' },
          { name: 'status', label: 'Status', type: 'select', default: 'UAT', options: ['Live', 'UAT', 'Pending'] },
          { name: 'version', label: 'Version', placeholder: 'V1.0' },
          { name: 'liveDate', label: 'Live Date', type: 'date' },
        ]} />
    </div>
  );
}
