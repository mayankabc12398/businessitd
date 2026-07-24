// Clients & Hospitals — group directory with contacts & escalation matrix.
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Plus, Bed, MapPin, Phone, Mail, Users, ShieldAlert, Globe, Layers } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Drawer, Badge, StatusBadge, Avatar, DetailRow, Chip, FormDrawer, useToast } from '../components/ui';
import { PROJECTS } from '../data/projects';
import { HOSPITAL_TYPES, COUNTRIES } from '../data/masters';

const healthTone = (h) => ({ 'On Track': 'success', 'At Risk': 'warning', Delayed: 'danger', Planning: 'info' }[h] || 'neutral');

export default function Clients() {
  const { data: clients, loading } = useApi(() => api.getClients());
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [typeF, setTypeF] = useState('All');
  const [active, setActive] = useState(null);
  const [show, setShow] = useState(false);
  const [extra, setExtra] = useState([]);

  useEffect(() => {
    if (params.get('new') === '1') { setShow(true); setParams({}, { replace: true }); }
    const id = params.get('id');
    if (id && clients) { const c = clients.find((x) => x.id === id); if (c) setActive(c); setParams({}, { replace: true }); }
  }, [params, clients, setParams]);

  const allClients = useMemo(() => [...extra, ...(clients || [])], [extra, clients]);
  const filtered = useMemo(() => allClients.filter((c) => typeF === 'All' || c.type === typeF), [allClients, typeF]);

  const addClient = (v) => {
    const id = `CL-${String(allClients.length + 1).padStart(3, '0')}`;
    setExtra((prev) => [{
      id, name: v.name, group: v.group || v.name, type: v.type, country: v.country, state: v.state || '—', city: v.city || '—',
      beds: Number(v.beds) || 0, branches: Number(v.branches) || 1, gst: v.gst || '—', timezone: '—', currency: (COUNTRIES.find((c) => c.label === v.country)?.currency) || 'INR',
      since: '2026-07-24', activeProjects: 0, health: 'On Track',
      contacts: [{ name: v.contactName || 'TBD', title: v.contactTitle || 'Client SPOC', phone: v.phone || '—', email: v.email || '—', primary: true }],
      escalation: [{ level: 'L1', role: 'Project Manager', name: 'Rahul Sharma', sla: '4 hrs' }],
    }, ...prev]);
    toast.success('Client added', `${v.name} · ${id}`);
    setShow(false);
  };

  const columns = [
    { key: 'name', header: 'Hospital / Group', minWidth: 240, render: (c) => (
      <div className="flex items-center gap-3"><Avatar name={c.name} hue={3} size="md" /><div><div className="fw-6 ink-1">{c.name}</div><div className="t-xs ink-3">{c.group} · {c.id}</div></div></div>
    ) },
    { key: 'type', header: 'Type', render: (c) => <Badge tone="info">{c.type}</Badge> },
    { key: 'loc', header: 'Location', render: (c) => <span className="t-sm"><MapPin size={12} style={{ verticalAlign: -1 }} /> {c.city}, {c.country}</span> },
    { key: 'beds', header: 'Beds', align: 'right', accessor: (c) => c.beds, render: (c) => <b className="tabular">{c.beds || '—'}</b> },
    { key: 'branches', header: 'Branches', align: 'right', accessor: (c) => c.branches },
    { key: 'proj', header: 'Projects', align: 'center', accessor: (c) => PROJECTS.filter((p) => p.clientId === c.id).length, render: (c) => <Badge tone="primary">{PROJECTS.filter((p) => p.clientId === c.id).length}</Badge> },
    { key: 'health', header: 'Health', render: (c) => <StatusBadge status={c.health} tone={healthTone(c.health)} /> },
  ];

  const totalBeds = allClients.reduce((s, c) => s + c.beds, 0);

  return (
    <div className="page">
      <PageHeader icon={<Building2 size={22} />} tint="cyan" title="Clients & Hospitals" desc="Hospital groups, contacts, escalation matrix and licensing"
        crumbs={[{ label: 'Delivery' }, { label: 'Clients' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> Add Client</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Total Clients" value={allClients.length || '—'} tint="cyan" icon={<Building2 size={19} />} footer={`${new Set(allClients.map(c=>c.country)).size} countries`} />
        <MetricCard label="Total Beds Served" value={totalBeds.toLocaleString()} tint="blue" icon={<Bed size={19} />} footer="Across all facilities" />
        <MetricCard label="Countries" value={new Set(allClients.map(c=>c.country)).size} tint="mint" icon={<Globe size={19} />} footer="India, UAE, KSA, Kenya, BD" />
        <MetricCard label="Multi-branch Groups" value={allClients.filter(c=>c.branches>1).length} tint="lavender" icon={<Layers size={19} />} footer="Chains & networks" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Type</span>
          {['All', ...HOSPITAL_TYPES].map((t) => <Chip key={t} active={typeF === t} onClick={() => setTypeF(t)}>{t}</Chip>)}
        </div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} onRowClick={setActive} exportName="clients.csv" searchPlaceholder="Search hospitals, groups, cities…" />

      <ClientDrawer client={active} onClose={() => setActive(null)} />

      <FormDrawer open={show} onClose={() => setShow(false)} title="Add Client / Hospital" subtitle="Register a new hospital or group"
        submitLabel="Add Client" onSubmit={addClient}
        fields={[
          { name: 'name', label: 'Hospital / Client Name', required: true, full: true, placeholder: 'e.g. City Care Hospital' },
          { name: 'group', label: 'Group Name', placeholder: 'Parent group' },
          { name: 'type', label: 'Hospital Type', type: 'select', required: true, options: HOSPITAL_TYPES },
          { name: 'country', label: 'Country', type: 'select', required: true, options: COUNTRIES.map((c) => c.label) },
          { name: 'state', label: 'State / Region', placeholder: 'State' },
          { name: 'city', label: 'City', placeholder: 'City' },
          { name: 'beds', label: 'No. of Beds', type: 'number', placeholder: '0' },
          { name: 'branches', label: 'Branches', type: 'number', placeholder: '1' },
          { name: 'gst', label: 'Tax / Registration No.', full: true, placeholder: 'GST / TRN / VAT / PIN' },
          { name: 'contactName', label: 'Primary Contact (SPOC)', placeholder: 'Full name' },
          { name: 'contactTitle', label: 'Designation', placeholder: 'e.g. Medical Director' },
          { name: 'phone', label: 'Phone', placeholder: '+91 …' },
          { name: 'email', label: 'Email', type: 'email', placeholder: 'name@hospital.com' },
        ]} />
    </div>
  );
}

function ClientDrawer({ client, onClose }) {
  if (!client) return null;
  const c = client;
  const projects = PROJECTS.filter((p) => p.clientId === c.id);
  return (
    <Drawer open={!!client} onClose={onClose} size="md" title={c.name} subtitle={`${c.group} · ${c.type}`}
      headerExtra={<Badge tone={healthTone(c.health)}>{c.health}</Badge>}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn btn-primary"><Plus size={14} /> New Project</button></>}>
      <div className="flex-col gap-4">
        <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
          <div className="detail-list">
            <DetailRow label="Location">{c.city}, {c.state}, {c.country}</DetailRow>
            <DetailRow label="Beds / Branches">{c.beds || '—'} beds · {c.branches} branches</DetailRow>
            <DetailRow label="Tax / Reg">{c.gst}</DetailRow>
            <DetailRow label="Currency">{c.currency}</DetailRow>
            <DetailRow label="Timezone">{c.timezone}</DetailRow>
            <DetailRow label="Client since">{c.since}</DetailRow>
          </div>
        </div>

        <div className="card card-pad">
          <div className="card-title mb-3 flex items-center gap-2"><Users size={15} /> Key Contacts</div>
          <div className="flex-col gap-2">
            {c.contacts.map((ct) => (
              <div key={ct.email} className="flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}>
                <Avatar name={ct.name} hue={6} size="md" />
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <div className="fw-6 t-sm">{ct.name} {ct.primary && <Badge tone="primary">SPOC</Badge>}</div>
                  <div className="t-xs ink-3">{ct.title}</div>
                </div>
                <div className="t-xs ink-2 text-right hide-sm"><div><Phone size={11} /> {ct.phone}</div><div><Mail size={11} /> {ct.email}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad">
          <div className="card-title mb-3 flex items-center gap-2"><ShieldAlert size={15} /> Escalation Matrix</div>
          <table className="data-table"><thead><tr><th>Level</th><th>Role</th><th>Name</th><th>SLA</th></tr></thead>
            <tbody>{c.escalation.map((e) => <tr key={e.level}><td><Badge tone="neutral">{e.level}</Badge></td><td className="fw-6">{e.role}</td><td>{e.name}</td><td><Badge tone="warning">{e.sla}</Badge></td></tr>)}</tbody>
          </table>
        </div>

        <div className="card card-pad">
          <div className="card-title mb-3">Projects ({projects.length})</div>
          <div className="flex-col gap-2">
            {projects.map((p) => (
              <div key={p.code} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div><div className="fw-6 t-sm">{p.name.split(' — ')[1] || p.name}</div><div className="t-xs ink-3">{p.code}</div></div>
                <Badge tone={healthTone(p.health)}>{p.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
