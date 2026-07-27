// Vendors & Partners — integration vendor directory.
import { useState, useMemo } from 'react';
import { Handshake, Plus, Mail, Phone, Globe } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, Chip, FormDrawer, useToast } from '../../components/ui';
import { INTEGRATION_TYPES } from '../../data/integration';

export default function Vendors() {
  const { data: rows, loading } = useApi(() => api.getVendors());
  const toast = useToast();
  const [type, setType] = useState('All');
  const [show, setShow] = useState(false);
  const [extra, setExtra] = useState([]);

  const allRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const typeOptions = useMemo(() => ['All', ...new Set(allRows.map((r) => r.type))], [allRows]);
  const filtered = useMemo(() => allRows.filter((r) => type === 'All' || r.type === type), [allRows, type]);

  const addVendor = (v) => {
    setExtra((prev) => [{
      id: `VN-${String(allRows.length + 1).padStart(2, '0')}`, name: v.name, company: v.company || v.name,
      contact: v.contact || '—', email: v.email || '—', phone: v.phone || '—', website: v.website || '—',
      type: v.type, integrations: 0,
    }, ...prev]);
    toast.success('Vendor added', v.name);
    setShow(false);
  };

  const columns = [
    { key: 'name', header: 'Vendor', minWidth: 170, render: (r) => <div><div className="fw-6 t-sm">{r.name}</div><div className="t-xs ink-3">{r.company}</div></div> },
    { key: 'type', header: 'Type', render: (r) => <Badge tone="info">{r.type}</Badge> },
    { key: 'contact', header: 'Contact Person' },
    { key: 'email', header: 'Email', render: (r) => <span className="flex items-center gap-1 t-sm"><Mail size={12} className="ink-3" /> {r.email}</span> },
    { key: 'phone', header: 'Phone', render: (r) => <span className="flex items-center gap-1 t-sm"><Phone size={12} className="ink-3" /> {r.phone}</span> },
    { key: 'website', header: 'Website', render: (r) => <span className="flex items-center gap-1 t-sm" style={{ color: 'var(--primary)' }}><Globe size={12} /> {r.website}</span> },
    { key: 'integrations', header: 'Integrations', align: 'center', accessor: (r) => r.integrations, render: (r) => <Badge tone="neutral">{r.integrations}</Badge> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Handshake size={22} />} tint="lemon" title="Vendors & Partners" desc="Directory of integration vendors, partners & their contacts"
        crumbs={[{ label: 'Integration' }, { label: 'Vendors & Partners' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> Add Vendor</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Total Vendors" value={allRows.length} tint="lemon" icon={<Handshake size={19} />} footer="Registered partners" />
        <MetricCard label="Vendor Types" value={new Set(allRows.map((r) => r.type)).size} tint="blue" icon={<Handshake size={19} />} footer="Categories" />
        <MetricCard label="Payment Partners" value={allRows.filter((r) => r.type === 'Payment Gateway').length} tint="green" icon={<Handshake size={19} />} footer="Gateways" />
        <MetricCard label="Insurance / Bank" value={allRows.filter((r) => ['Insurance', 'Bank'].includes(r.type)).length} tint="cyan" icon={<Handshake size={19} />} footer="Financial partners" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Type</span>{typeOptions.map((t) => <Chip key={t} active={type === t} onClick={() => setType(t)}>{t}</Chip>)}</div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="vendors.csv" searchPlaceholder="Search vendors, contacts…" pageSize={15} />

      <FormDrawer open={show} onClose={() => setShow(false)} title="Add Vendor" subtitle="Register an integration vendor / partner"
        submitLabel="Add Vendor" onSubmit={addVendor}
        fields={[
          { name: 'name', label: 'Vendor Name', required: true, placeholder: 'e.g. Safaricom' },
          { name: 'type', label: 'Type', type: 'select', required: true, options: INTEGRATION_TYPES },
          { name: 'company', label: 'Company Name' },
          { name: 'contact', label: 'Contact Person' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'phone', label: 'Phone' },
          { name: 'website', label: 'Website', full: true, placeholder: 'https://' },
        ]} />
    </div>
  );
}
