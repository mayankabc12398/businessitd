// Approvals — review & approval queue for feature requests.
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Eye, Check, X, ClipboardCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, Chip, useToast } from '../../components/ui';
import { fmtDate } from '../../utils/format';
import { PRIO_TONE, ImpactBar } from './_shared';

const STAGE_TONE = { 'Business Review': 'lavender', 'Technical Review': 'sky', 'Head Approval': 'cyan' };

export default function Approvals() {
  const { data: rows, loading } = useApi(() => api.getApprovals());
  const toast = useToast();
  const navigate = useNavigate();
  const [decision, setDecision] = useState('All');
  const [acted, setActed] = useState({});

  const allRows = useMemo(() => (rows || []).map((r) => ({ ...r, decision: acted[r.id] || r.decision })), [rows, acted]);
  const decisions = ['All', 'Pending', 'Approved', 'Rejected'];
  const filtered = useMemo(() => allRows.filter((r) => decision === 'All' || r.decision === decision), [allRows, decision]);

  const act = (id, name, verdict) => {
    setActed((prev) => ({ ...prev, [id]: verdict }));
    toast[verdict === 'Approved' ? 'success' : 'info'](`Feature ${verdict.toLowerCase()}`, name);
  };

  const columns = [
    { key: 'featureName', header: 'Feature', minWidth: 210, render: (r) => <div><div className="fw-6 t-sm">{r.featureName}</div><div className="t-xs ink-3">{r.featureId} · {r.module}</div></div> },
    { key: 'stage', header: 'Review Stage', render: (r) => <Badge tone={STAGE_TONE[r.stage] || 'neutral'}>{r.stage}</Badge> },
    { key: 'requestedBy', header: 'Requested By' },
    { key: 'requestDate', header: 'Requested', nowrap: true, accessor: (r) => r.requestDate, render: (r) => fmtDate(r.requestDate) },
    { key: 'priority', header: 'Priority', render: (r) => <Badge tone={PRIO_TONE[r.priority]}>{r.priority}</Badge> },
    { key: 'impactScore', header: 'Impact', minWidth: 120, accessor: (r) => r.impactScore, render: (r) => r.impactScore ? <ImpactBar score={r.impactScore} /> : <span className="ink-3">—</span> },
    { key: 'decision', header: 'Decision', render: (r) => <Badge tone={r.decision === 'Approved' ? 'success' : r.decision === 'Rejected' ? 'danger' : 'pending'}>{r.decision}</Badge> },
    { key: 'action', header: 'Action', sortable: false, align: 'right', minWidth: 150, render: (r) => (
      <div className="flex items-center gap-1" style={{ justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
        <button className="btn btn-outline btn-sm btn-icon" title="View" onClick={() => navigate(`/revenue/features?id=${r.featureId}`)}><Eye size={13} /></button>
        {r.decision === 'Pending' && <>
          <button className="btn btn-sm btn-icon" style={{ background: 'var(--success-soft)', color: 'var(--success-ink)', border: '1px solid var(--success-soft)' }} title="Approve" onClick={() => act(r.id, r.featureName, 'Approved')}><Check size={13} /></button>
          <button className="btn btn-sm btn-icon" style={{ background: 'var(--danger-soft)', color: 'var(--danger-ink)', border: '1px solid var(--danger-soft)' }} title="Reject" onClick={() => act(r.id, r.featureName, 'Rejected')}><X size={13} /></button>
        </>}
      </div>
    ) },
  ];

  return (
    <div className="page">
      <PageHeader icon={<BadgeCheck size={22} />} tint="cyan" title="Approvals" desc="Business review, technical review & head approval gate before development"
        crumbs={[{ label: 'Feature Intelligence' }, { label: 'Approvals' }]} />

      <div className="kpi-grid stagger">
        <MetricCard label="In Queue" value={allRows.length} tint="cyan" icon={<ClipboardCheck size={19} />} footer="Awaiting decision" />
        <MetricCard label="Pending" value={allRows.filter((r) => r.decision === 'Pending').length} tint="lemon" icon={<ClipboardCheck size={19} />} footer="Action needed" onClick={() => setDecision('Pending')} />
        <MetricCard label="Approved" value={allRows.filter((r) => r.decision === 'Approved').length} tint="green" icon={<Check size={19} />} footer="Cleared for dev" onClick={() => setDecision('Approved')} />
        <MetricCard label="High Priority" value={allRows.filter((r) => r.priority === 'High').length} tint="rose" icon={<BadgeCheck size={19} />} footer="Fast-track" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Decision</span>{decisions.map((d) => <Chip key={d} active={decision === d} onClick={() => setDecision(d)}>{d}</Chip>)}</div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="approvals.csv" searchPlaceholder="Search features…" pageSize={15} />
    </div>
  );
}
