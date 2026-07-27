// Module 12 · Client Adoption Tracker (also Module 8 · Deployment).
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hospital, Building2, CheckCircle2, FlaskConical, CalendarClock, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, Chip } from '../../components/ui';
import { fmtDate } from '../../utils/format';
import { ADOPT_TONE } from './_shared';

export default function ClientAdoption() {
  const { data: rows, loading } = useApi(() => api.getClientAdoption());
  const navigate = useNavigate();
  const [status, setStatus] = useState('All');

  const allRows = useMemo(() => rows || [], [rows]);
  const statuses = ['All', 'Live', 'UAT', 'Planned'];
  const filtered = useMemo(() => allRows.filter((r) => status === 'All' || r.status === status), [allRows, status]);

  const columns = [
    { key: 'client', header: 'Client / Hospital', minWidth: 170, render: (r) => <div className="flex items-center gap-2"><Building2 size={15} className="ink-3" /><span className="fw-6 t-sm">{r.client}</span></div> },
    { key: 'featureName', header: 'Feature', minWidth: 200, render: (r) => <span className="t-sm">{r.featureName}</span> },
    { key: 'version', header: 'Version', render: (r) => <Badge tone="neutral">{r.version}</Badge> },
    { key: 'environment', header: 'Environment', render: (r) => <Badge tone={r.environment === 'Live' ? 'success' : r.environment === 'UAT' ? 'warning' : 'neutral'}>{r.environment}</Badge> },
    { key: 'goLive', header: 'Go-Live', nowrap: true, accessor: (r) => r.goLive || '', render: (r) => r.goLive ? fmtDate(r.goLive) : <span className="ink-3">Pending</span> },
    { key: 'deployedBy', header: 'Deployed By' },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={ADOPT_TONE[r.status]}>{r.status}</Badge> },
    { key: 'action', header: '', sortable: false, align: 'center', render: (r) => <button className="btn btn-outline btn-sm btn-icon" onClick={(e) => { e.stopPropagation(); navigate(`/revenue/features?id=${r.featureId}`); }} title="Open feature"><Eye size={14} /></button> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Hospital size={22} />} tint="cyan" title="Client Adoption" desc="Which clients have adopted each feature — deployment & go-live tracker (Modules 8 & 12)"
        crumbs={[{ label: 'Feature Intelligence' }, { label: 'Client Adoption' }]} />

      <div className="kpi-grid stagger">
        <MetricCard label="Total Adoptions" value={allRows.length} tint="cyan" icon={<Hospital size={19} />} footer="Feature roll-outs" />
        <MetricCard label="Live" value={allRows.filter((r) => r.status === 'Live').length} tint="green" icon={<CheckCircle2 size={19} />} footer="In production" onClick={() => setStatus('Live')} />
        <MetricCard label="In UAT" value={allRows.filter((r) => r.status === 'UAT').length} tint="lemon" icon={<FlaskConical size={19} />} footer="Under acceptance" onClick={() => setStatus('UAT')} />
        <MetricCard label="Planned" value={allRows.filter((r) => r.status === 'Planned').length} tint="lavender" icon={<CalendarClock size={19} />} footer="Scheduled" onClick={() => setStatus('Planned')} />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Status</span>{statuses.map((s) => <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{s}</Chip>)}</div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="client-adoption.csv" searchPlaceholder="Search clients, features…" pageSize={15} onRowClick={(r) => navigate(`/revenue/features?id=${r.featureId}`)} />
    </div>
  );
}
