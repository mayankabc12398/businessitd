// Plans & Pricing — subscription tiers and add-on modules.
import { useState, useMemo } from 'react';
import { Tags, Plus, Repeat, Users, Layers } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, StatusBadge, Chip, FormDrawer, useToast } from '../../components/ui';
import { fmtINR } from '../../utils/format';

const PLAN_TONE = { Active: 'success', Beta: 'pending', Retired: 'danger' };
const TIERS = ['Starter', 'Standard', 'Enterprise', 'Add-on'];

export default function Plans() {
  const { data: rows, loading } = useApi(() => api.getPlans());
  const toast = useToast();
  const [tier, setTier] = useState('All');
  const [show, setShow] = useState(false);
  const [extra, setExtra] = useState([]);

  const allRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const tierOptions = ['All', ...TIERS];
  const filtered = useMemo(() => allRows.filter((r) => tier === 'All' || r.tier === tier), [allRows, tier]);
  const totalMrr = allRows.reduce((s, r) => s + r.mrr, 0);
  const totalClients = allRows.reduce((s, r) => s + r.activeClients, 0);

  const addPlan = (v) => {
    const pm = Number(v.priceMonthly) || 0;
    const clients = Number(v.activeClients) || 0;
    setExtra((prev) => [{
      id: `PL-${String(allRows.length + 1).padStart(2, '0')}`, name: v.name, tier: v.tier,
      priceMonthly: pm, priceAnnual: pm * 12 * 0.9, modules: v.modules || '—',
      activeClients: clients, mrr: pm * clients, status: v.status || 'Active',
    }, ...prev]);
    toast.success('Plan created', `${v.name} · ${fmtINR(pm)}/mo`);
    setShow(false);
  };

  const columns = [
    { key: 'name', header: 'Plan', minWidth: 200, render: (r) => <div><div className="fw-6 t-sm">{r.name}</div><div className="t-xs ink-3">{r.modules}</div></div> },
    { key: 'tier', header: 'Tier', render: (r) => <Badge tone={r.tier === 'Enterprise' ? 'lavender' : r.tier === 'Add-on' ? 'info' : 'neutral'}>{r.tier}</Badge> },
    { key: 'priceMonthly', header: 'Monthly', align: 'right', accessor: (r) => r.priceMonthly, render: (r) => fmtINR(r.priceMonthly) },
    { key: 'priceAnnual', header: 'Annual', align: 'right', accessor: (r) => r.priceAnnual, render: (r) => <span className="t-sm ink-2">{fmtINR(r.priceAnnual)}</span> },
    { key: 'activeClients', header: 'Clients', align: 'right', accessor: (r) => r.activeClients },
    { key: 'mrr', header: 'MRR', align: 'right', accessor: (r) => r.mrr, render: (r) => <span className="fw-6" style={{ color: 'var(--success-ink)' }}>{fmtINR(r.mrr, true)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} tone={PLAN_TONE[r.status]} /> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Tags size={22} />} tint="mint" title="Plans & Pricing" desc="Subscription tiers, add-on modules & their recurring revenue"
        crumbs={[{ label: 'Revenue' }, { label: 'Plans' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> New Plan</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Total Plans" value={allRows.length} tint="mint" icon={<Layers size={19} />} footer={`${allRows.filter((r) => r.tier === 'Add-on').length} add-ons`} />
        <MetricCard label="Combined MRR" value={fmtINR(totalMrr, true)} tint="green" icon={<Repeat size={19} />} footer={`${fmtINR(totalMrr * 12, true)} ARR`} />
        <MetricCard label="Subscriptions" value={totalClients} tint="cyan" icon={<Users size={19} />} footer="Active across plans" />
        <MetricCard label="Avg Revenue / Client" value={totalClients ? fmtINR(Math.round(totalMrr / totalClients)) : '—'} tint="lavender" icon={<Tags size={19} />} footer="Blended ARPA / mo" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Tier</span>{tierOptions.map((t) => <Chip key={t} active={tier === t} onClick={() => setTier(t)}>{t}</Chip>)}</div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="plans.csv" searchPlaceholder="Search plans, modules…" pageSize={15} />

      <FormDrawer open={show} onClose={() => setShow(false)} title="New Plan" subtitle="Define a subscription tier or add-on module"
        submitLabel="Create Plan" onSubmit={addPlan}
        fields={[
          { name: 'name', label: 'Plan Name', required: true, full: true, placeholder: 'e.g. Hospital Premium' },
          { name: 'tier', label: 'Tier', type: 'select', required: true, options: TIERS },
          { name: 'status', label: 'Status', type: 'select', default: 'Active', options: ['Active', 'Beta', 'Retired'] },
          { name: 'priceMonthly', label: 'Monthly Price (₹)', type: 'number', required: true, placeholder: '65000' },
          { name: 'activeClients', label: 'Active Clients', type: 'number', placeholder: '0' },
          { name: 'modules', label: 'Included Modules', type: 'textarea', full: true, rows: 2, placeholder: 'OPD, IPD, EMR, Pharmacy…' },
        ]} />
    </div>
  );
}
