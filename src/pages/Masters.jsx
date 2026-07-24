// Masters & Settings — modules, lifecycle, countries, roles & templates.
import { useState } from 'react';
import { Settings2, Plus, Layers, GitBranch, Globe, ShieldCheck, Mail, Boxes } from 'lucide-react';
import { PageHeader, MetricCard, Tabs, Badge, DataTable, SwitchField, FormDrawer, useToast } from '../components/ui';
import { HIMS_MODULES, LIFECYCLE, COUNTRIES } from '../data/masters';
import { ROLES } from '../data/team';

const TINTS = ['blue', 'cyan', 'mint', 'lavender', 'peach', 'pink', 'lemon', 'indigo', 'green', 'orange', 'sky', 'rose'];

const TEMPLATES = [
  { id: 'T-01', name: 'Kick-off Invitation', channel: 'Email', trigger: 'On kick-off scheduled', active: true },
  { id: 'T-02', name: 'SRS Sign-off Reminder', channel: 'Email + WhatsApp', trigger: 'SRS pending 3 days', active: true },
  { id: 'T-03', name: 'Master Data Request', channel: 'Email', trigger: 'On master requested', active: true },
  { id: 'T-04', name: 'UAT Ready Notification', channel: 'Email + SMS', trigger: 'On UAT deploy', active: true },
  { id: 'T-05', name: 'Go-Live Countdown', channel: 'WhatsApp', trigger: '7 days before go-live', active: false },
  { id: 'T-06', name: 'Issue Escalation (L2)', channel: 'Email + SMS', trigger: 'SLA breach', active: true },
];

export default function Masters() {
  const toast = useToast();
  const [tab, setTab] = useState('modules');
  const [templates, setTemplates] = useState(TEMPLATES);
  const [show, setShow] = useState(false);
  const [xModules, setXModules] = useState([]);
  const [xLifecycle, setXLifecycle] = useState([]);
  const [xCountries, setXCountries] = useState([]);
  const [xRoles, setXRoles] = useState([]);

  const modules = [...xModules, ...HIMS_MODULES];
  const lifecycle = [...LIFECYCLE, ...xLifecycle];
  const countries = [...xCountries, ...COUNTRIES];
  const roles = [...xRoles, ...ROLES];

  const TAB_META = {
    modules: { title: 'Add HIMS Module', fields: [
      { name: 'name', label: 'Module Name', required: true, full: true, placeholder: 'e.g. Physiotherapy' },
      { name: 'id', label: 'Code', placeholder: 'M-XXX' },
      { name: 'tint', label: 'Colour', type: 'select', default: 'blue', options: TINTS },
    ] },
    lifecycle: { title: 'Add Lifecycle Stage', fields: [
      { name: 'label', label: 'Stage Name', required: true, full: true, placeholder: 'e.g. Hypercare Review' },
      { name: 'key', label: 'Key', required: true, placeholder: 'lowercase-key' },
      { name: 'tint', label: 'Colour', type: 'select', default: 'blue', options: TINTS },
    ] },
    countries: { title: 'Add Country', fields: [
      { name: 'label', label: 'Country', required: true, full: true, placeholder: 'e.g. Oman' },
      { name: 'code', label: 'Code', required: true, placeholder: 'OM' },
      { name: 'currency', label: 'Currency', required: true, placeholder: 'OMR' },
    ] },
    roles: { title: 'Add Role', fields: [
      { name: 'label', label: 'Role Name', required: true, full: true, placeholder: 'e.g. Data Migration Lead' },
      { name: 'id', label: 'Key', placeholder: 'lowercase_key' },
      { name: 'tint', label: 'Colour', type: 'select', default: 'blue', options: TINTS },
    ] },
    templates: { title: 'Add Notification Template', fields: [
      { name: 'name', label: 'Template Name', required: true, full: true, placeholder: 'e.g. UAT Reminder' },
      { name: 'channel', label: 'Channel', type: 'select', required: true, default: 'Email', options: ['Email', 'SMS', 'WhatsApp', 'Email + SMS', 'Email + WhatsApp'] },
      { name: 'trigger', label: 'Trigger', full: true, placeholder: 'When does it fire?' },
    ] },
  };

  const addEntry = (v) => {
    if (tab === 'modules') setXModules((p) => [{ id: v.id || `M-${(modules.length + 1)}`, name: v.name, tint: v.tint }, ...p]);
    else if (tab === 'lifecycle') setXLifecycle((p) => [...p, { key: v.key, label: v.label, tint: v.tint }]);
    else if (tab === 'countries') setXCountries((p) => [{ code: v.code, label: v.label, currency: v.currency }, ...p]);
    else if (tab === 'roles') setXRoles((p) => [{ id: v.id || v.label.toLowerCase().replace(/\s+/g, '_'), label: v.label, tint: v.tint }, ...p]);
    else if (tab === 'templates') setTemplates((p) => [{ id: `T-${String(p.length + 1).padStart(2, '0')}`, name: v.name, channel: v.channel, trigger: v.trigger || '—', active: true }, ...p]);
    toast.success('Added', v.name || v.label);
    setShow(false);
  };

  const moduleCols = [
    { key: 'id', header: 'Code', render: (r) => <span className="mono t-xs ink-3">{r.id}</span> },
    { key: 'name', header: 'Module', render: (r) => <div className="flex items-center gap-2"><span style={{ width: 10, height: 10, borderRadius: 3, background: `var(--tint-${r.tint}-ink)` }} /><span className="fw-6">{r.name}</span></div> },
    { key: 'status', header: 'Status', render: () => <Badge tone="success">Active</Badge> },
  ];
  const lifecycleCols = [
    { key: 'seq', header: '#', width: 50, render: (r) => <span className="mono ink-3">{lifecycle.indexOf(r) + 1}</span> },
    { key: 'label', header: 'Stage', render: (r) => <div className="flex items-center gap-2"><span className="metric-icon" style={{ width: 26, height: 26, borderRadius: 7, background: `var(--tint-${r.tint})`, color: `var(--tint-${r.tint}-ink)` }}><GitBranch size={12} /></span><span className="fw-6">{r.label}</span></div> },
    { key: 'key', header: 'Key', render: (r) => <span className="mono t-xs ink-3">{r.key}</span> },
  ];
  const countryCols = [
    { key: 'code', header: 'Code', render: (r) => <Badge tone="neutral">{r.code}</Badge> },
    { key: 'label', header: 'Country', render: (r) => <span className="fw-6">{r.label}</span> },
    { key: 'currency', header: 'Currency', render: (r) => <Badge tone="info">{r.currency}</Badge> },
  ];
  const roleCols = [
    { key: 'label', header: 'Role', render: (r) => <div className="flex items-center gap-2"><span className="metric-icon" style={{ width: 26, height: 26, borderRadius: 7, background: `var(--tint-${r.tint})`, color: `var(--tint-${r.tint}-ink)` }}><ShieldCheck size={12} /></span><span className="fw-6">{r.label}</span></div> },
    { key: 'id', header: 'Key', render: (r) => <span className="mono t-xs ink-3">{r.id}</span> },
  ];

  const TABS = [
    { key: 'modules', label: 'HIMS Modules', count: modules.length },
    { key: 'lifecycle', label: 'Lifecycle Stages', count: lifecycle.length },
    { key: 'countries', label: 'Countries', count: countries.length },
    { key: 'roles', label: 'Roles', count: roles.length },
    { key: 'templates', label: 'Notification Templates', count: templates.length },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Settings2 size={22} />} tint="sky" title="Masters & Settings" desc="Modules, implementation lifecycle, countries, roles and templates"
        crumbs={[{ label: 'Insights & Admin' }, { label: 'Masters' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> Add</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="HIMS Modules" value={modules.length} tint="blue" icon={<Boxes size={19} />} footer="Product catalogue" />
        <MetricCard label="Lifecycle Stages" value={lifecycle.length} tint="mint" icon={<Layers size={19} />} footer="Standard workflow" />
        <MetricCard label="Countries" value={countries.length} tint="lavender" icon={<Globe size={19} />} footer="Multi-currency" />
        <MetricCard label="Notification Templates" value={templates.length} tint="peach" icon={<Mail size={19} />} footer={`${templates.filter(t=>t.active).length} active`} />
      </div>

      <Tabs active={tab} onChange={setTab} tabs={TABS} />

      {tab === 'modules' && <DataTable columns={moduleCols} rows={modules} exportName="modules.csv" searchPlaceholder="Search modules…" pageSize={20} />}
      {tab === 'lifecycle' && <DataTable columns={lifecycleCols} rows={lifecycle} searchable={false} exportName="lifecycle.csv" pageSize={20} />}
      {tab === 'countries' && <DataTable columns={countryCols} rows={countries} searchable={false} exportName="countries.csv" pageSize={20} />}
      {tab === 'roles' && <DataTable columns={roleCols} rows={roles} searchable={false} exportName="roles.csv" pageSize={20} />}
      {tab === 'templates' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead><tr><th>Template</th><th>Channel</th><th>Trigger</th><th>Active</th></tr></thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id}>
                  <td className="fw-6">{t.name}</td>
                  <td><Badge tone="info">{t.channel}</Badge></td>
                  <td className="t-sm ink-2">{t.trigger}</td>
                  <td><SwitchField checked={t.active} onChange={(v) => setTemplates((x) => x.map((y) => y.id === t.id ? { ...y, active: v } : y))} label="" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormDrawer open={show} onClose={() => setShow(false)} title={TAB_META[tab].title} subtitle="Add a new master entry"
        submitLabel="Add" onSubmit={addEntry} fields={TAB_META[tab].fields} />
    </div>
  );
}
