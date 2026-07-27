// Module 1 · Feature Requests — incoming client requests awaiting the pipeline.
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Inbox, Plus, Eye, Clock, ClipboardCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, Chip, FormDrawer, useToast } from '../../components/ui';
import { fmtDate } from '../../utils/format';
import { FEATURE_MODULES, FEATURE_CATEGORIES, PRIORITIES } from '../../data/revenue';
import { StatusChip, PRIO_TONE, ImpactBar } from './_shared';

const EARLY = ['New Request', 'Under Review', 'Approved'];

export default function FeatureRequests() {
  const { data: rows, loading } = useApi(() => api.getFeatures());
  const toast = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [priority, setPriority] = useState('All');
  const [show, setShow] = useState(false);
  const [extra, setExtra] = useState([]);

  const requests = useMemo(() => [...extra, ...(rows || []).filter((r) => EARLY.includes(r.status))], [extra, rows]);
  const priorities = ['All', ...PRIORITIES];
  const filtered = useMemo(() => requests.filter((r) => priority === 'All' || r.priority === priority), [requests, priority]);

  useEffect(() => {
    if (params.get('new') === '1') { setShow(true); params.delete('new'); setParams(params, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const addRequest = (v) => {
    setExtra((prev) => [{
      id: `FEA-${2001 + prev.length}`, name: v.name, module: v.module, category: v.category, client: v.client,
      requestDate: '2026-07-27', priority: v.priority || 'Medium', estDevTime: v.estDevTime || '—', status: 'New Request',
      impactScore: 0, reusable: false, requestedBy: v.requestedBy || '—', businessProblem: v.businessProblem || '', proposedSolution: '',
      functionalConsultant: '—', projectManager: 'Devendra Singh', developer: 'TBD',
    }, ...prev]);
    toast.success('Feature request logged', v.name);
    setShow(false);
  };

  const columns = [
    { key: 'name', header: 'Feature Request', minWidth: 210, render: (r) => <div><div className="fw-6 t-sm">{r.name}</div><div className="t-xs ink-3">{r.id} · {r.module}</div></div> },
    { key: 'client', header: 'Client', minWidth: 130 },
    { key: 'requestedBy', header: 'Requested By' },
    { key: 'requestDate', header: 'Request Date', nowrap: true, accessor: (r) => r.requestDate, render: (r) => fmtDate(r.requestDate) },
    { key: 'priority', header: 'Priority', render: (r) => <Badge tone={PRIO_TONE[r.priority]}>{r.priority}</Badge> },
    { key: 'impactScore', header: 'Impact', minWidth: 120, accessor: (r) => r.impactScore, render: (r) => r.impactScore ? <ImpactBar score={r.impactScore} /> : <span className="ink-3">—</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusChip status={r.status} /> },
    { key: 'action', header: '', sortable: false, align: 'center', render: (r) => <button className="btn btn-outline btn-sm btn-icon" onClick={(e) => { e.stopPropagation(); navigate(`/revenue/features?id=${r.id}`); }} title="Open"><Eye size={14} /></button> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Inbox size={22} />} tint="blue" title="Feature Requests" desc="Incoming client requests awaiting analysis, approval & development (Module 1)"
        crumbs={[{ label: 'Feature Intelligence' }, { label: 'Feature Requests' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> New Request</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Open Requests" value={requests.length} tint="blue" icon={<Inbox size={19} />} footer="In early stages" />
        <MetricCard label="New (unreviewed)" value={requests.filter((r) => r.status === 'New Request').length} tint="lavender" icon={<Clock size={19} />} footer="Awaiting review" onClick={() => setPriority('All')} />
        <MetricCard label="Under Review" value={requests.filter((r) => r.status === 'Under Review').length} tint="sky" icon={<ClipboardCheck size={19} />} footer="Being analysed" />
        <MetricCard label="High Priority" value={requests.filter((r) => r.priority === 'High').length} tint="rose" icon={<Inbox size={19} />} footer="Need fast-track" onClick={() => setPriority('High')} />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Priority</span>{priorities.map((p) => <Chip key={p} active={priority === p} onClick={() => setPriority(p)}>{p}</Chip>)}</div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="feature-requests.csv" searchPlaceholder="Search requests, clients…" pageSize={15} onRowClick={(r) => navigate(`/revenue/features?id=${r.id}`)} />

      <FormDrawer open={show} onClose={() => setShow(false)} title="New Feature Request" subtitle="Register a client feature request (Module 1)"
        submitLabel="Log Request" onSubmit={addRequest}
        fields={[
          { name: 'name', label: 'Feature Name', required: true, full: true, placeholder: 'e.g. AI-Based OPD Queue Prediction' },
          { name: 'module', label: 'Module', type: 'select', required: true, options: FEATURE_MODULES },
          { name: 'category', label: 'Category', type: 'select', required: true, options: FEATURE_CATEGORIES },
          { name: 'client', label: 'Requested By (Client)', required: true, placeholder: 'Hospital name' },
          { name: 'requestedBy', label: 'Requested By (Person)' },
          { name: 'priority', label: 'Priority', type: 'select', default: 'Medium', options: PRIORITIES },
          { name: 'estDevTime', label: 'Est. Development Time', placeholder: 'e.g. 15 days' },
          { name: 'businessProblem', label: 'Business Problem', type: 'textarea', full: true, rows: 3 },
        ]} />
    </div>
  );
}
