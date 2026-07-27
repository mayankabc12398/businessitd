// Feature Backlog — product ideas → shipped, with revenue impact.
import { useState, useMemo } from 'react';
import { Lightbulb, Plus, ThumbsUp, Rocket, Code2, Target } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, Chip, FormDrawer, useToast } from '../../components/ui';
import { fmtINR } from '../../utils/format';
import { FEATURE_STATUSES, FEATURE_STATUS_TINT } from '../../data/revenue';
import { HIMS_MODULES, PRIORITIES } from '../../data/masters';

const PRIO_TONE = { Critical: 'danger', High: 'warning', Medium: 'info', Low: 'neutral' };

export default function Features() {
  const { data: rows, loading } = useApi(() => api.getFeatures());
  const toast = useToast();
  const [status, setStatus] = useState('All');
  const [show, setShow] = useState(false);
  const [extra, setExtra] = useState([]);

  const allRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const statuses = ['All', ...FEATURE_STATUSES];
  const filtered = useMemo(() => allRows.filter((r) => status === 'All' || r.status === status), [allRows, status]);
  const count = (s) => allRows.filter((r) => r.status === s).length;
  const pipelineValue = allRows.filter((r) => r.status !== 'Shipped').reduce((s, r) => s + r.revenueImpact, 0);

  const addFeature = (v) => {
    setExtra((prev) => [{
      id: `FT-${allRows.length + 101}`, title: v.title, module: v.module, status: v.status || 'Idea',
      priority: v.priority || 'Medium', effort: Number(v.effort) || 8, revenueImpact: Number(v.revenueImpact) || 0,
      requestedBy: v.requestedBy || 'Internal', targetQtr: v.targetQtr || 'Q1 2027', votes: 0,
    }, ...prev]);
    toast.success('Feature added to backlog', v.title);
    setShow(false);
  };

  const columns = [
    { key: 'title', header: 'Feature', minWidth: 220, render: (r) => <div><div className="fw-6 t-sm">{r.title}</div><div className="t-xs ink-3">{r.id} · {r.module}</div></div> },
    { key: 'status', header: 'Stage', render: (r) => <Badge tone="neutral"><span style={{ width: 7, height: 7, borderRadius: '50%', background: `var(--tint-${FEATURE_STATUS_TINT[r.status]}-ink)`, display: 'inline-block' }} /> {r.status}</Badge> },
    { key: 'priority', header: 'Priority', render: (r) => <Badge tone={PRIO_TONE[r.priority]}>{r.priority}</Badge> },
    { key: 'effort', header: 'Effort', align: 'right', accessor: (r) => r.effort, render: (r) => <span className="t-sm">{r.effort} pts</span> },
    { key: 'revenueImpact', header: 'Revenue Impact', align: 'right', accessor: (r) => r.revenueImpact, render: (r) => <span className="fw-6" style={{ color: 'var(--success-ink)' }}>{fmtINR(r.revenueImpact, true)}</span> },
    { key: 'votes', header: 'Votes', align: 'center', accessor: (r) => r.votes, render: (r) => <span className="flex items-center gap-1 t-sm" style={{ justifyContent: 'center' }}><ThumbsUp size={12} className="ink-3" /> {r.votes}</span> },
    { key: 'requestedBy', header: 'Requested By' },
    { key: 'targetQtr', header: 'Target', nowrap: true, render: (r) => <Badge tone="info">{r.targetQtr}</Badge> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Lightbulb size={22} />} tint="lavender" title="Feature Backlog" desc="Prioritise ideas by revenue impact, effort & customer votes"
        crumbs={[{ label: 'Revenue' }, { label: 'Features' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> New Feature</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Backlog Size" value={allRows.length} tint="lavender" icon={<Lightbulb size={19} />} footer={`${count('Idea')} raw ideas`} />
        <MetricCard label="In Development" value={count('In Dev') + count('Beta')} tint="peach" icon={<Code2 size={19} />} footer={`${count('Beta')} in beta`} onClick={() => setStatus('In Dev')} />
        <MetricCard label="Shipped" value={count('Shipped')} tint="green" icon={<Rocket size={19} />} footer="Live in product" onClick={() => setStatus('Shipped')} />
        <MetricCard label="Pipeline Value" value={fmtINR(pipelineValue, true)} tint="mint" icon={<Target size={19} />} footer="Unshipped revenue impact" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Stage</span>
          {statuses.map((s) => <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{s}{s !== 'All' && <Badge tone="neutral">{count(s)}</Badge>}</Chip>)}
        </div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="features.csv" searchPlaceholder="Search features, modules…" pageSize={15} />

      <FormDrawer open={show} onClose={() => setShow(false)} title="New Feature Request" subtitle="Add an idea to the product backlog"
        submitLabel="Add to Backlog" onSubmit={addFeature}
        fields={[
          { name: 'title', label: 'Feature Title', required: true, full: true, placeholder: 'e.g. AI Discharge Summary' },
          { name: 'module', label: 'Module', type: 'select', required: true, options: HIMS_MODULES.map((m) => m.name) },
          { name: 'status', label: 'Stage', type: 'select', default: 'Idea', options: FEATURE_STATUSES },
          { name: 'priority', label: 'Priority', type: 'select', default: 'Medium', options: PRIORITIES },
          { name: 'effort', label: 'Effort (story pts)', type: 'number', placeholder: '8' },
          { name: 'revenueImpact', label: 'Revenue Impact (₹)', type: 'number', placeholder: '2000000' },
          { name: 'requestedBy', label: 'Requested By', placeholder: 'Client / internal' },
          { name: 'targetQtr', label: 'Target Quarter', type: 'select', default: 'Q1 2027', options: ['Q3 2026', 'Q4 2026', 'Q1 2027', 'Q2 2027'] },
        ]} />
    </div>
  );
}
