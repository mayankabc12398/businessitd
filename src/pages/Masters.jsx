// Masters & Settings — modules, lifecycle, countries, roles & templates.
import { useState } from 'react';
import { Settings2, Plus, Layers, GitBranch, Globe, ShieldCheck, Mail, Boxes } from 'lucide-react';
import { PageHeader, MetricCard, Tabs, Badge, DataTable, SwitchField, useToast } from '../components/ui';
import { HIMS_MODULES, LIFECYCLE, COUNTRIES } from '../data/masters';
import { ROLES } from '../data/team';

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

  const moduleCols = [
    { key: 'id', header: 'Code', render: (r) => <span className="mono t-xs ink-3">{r.id}</span> },
    { key: 'name', header: 'Module', render: (r) => <div className="flex items-center gap-2"><span style={{ width: 10, height: 10, borderRadius: 3, background: `var(--tint-${r.tint}-ink)` }} /><span className="fw-6">{r.name}</span></div> },
    { key: 'status', header: 'Status', render: () => <Badge tone="success">Active</Badge> },
  ];
  const lifecycleCols = [
    { key: 'seq', header: '#', width: 50, render: (r) => <span className="mono ink-3">{LIFECYCLE.indexOf(r) + 1}</span> },
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
    { key: 'modules', label: 'HIMS Modules', count: HIMS_MODULES.length },
    { key: 'lifecycle', label: 'Lifecycle Stages', count: LIFECYCLE.length },
    { key: 'countries', label: 'Countries', count: COUNTRIES.length },
    { key: 'roles', label: 'Roles', count: ROLES.length },
    { key: 'templates', label: 'Notification Templates', count: templates.length },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Settings2 size={22} />} tint="sky" title="Masters & Settings" desc="Modules, implementation lifecycle, countries, roles and templates"
        crumbs={[{ label: 'Insights & Admin' }, { label: 'Masters' }]}
        actions={<button className="btn btn-primary" onClick={() => toast.info('Add master')}><Plus size={15} /> Add</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="HIMS Modules" value={HIMS_MODULES.length} tint="blue" icon={<Boxes size={19} />} footer="Product catalogue" />
        <MetricCard label="Lifecycle Stages" value={LIFECYCLE.length} tint="mint" icon={<Layers size={19} />} footer="Standard workflow" />
        <MetricCard label="Countries" value={COUNTRIES.length} tint="lavender" icon={<Globe size={19} />} footer="Multi-currency" />
        <MetricCard label="Notification Templates" value={templates.length} tint="peach" icon={<Mail size={19} />} footer={`${templates.filter(t=>t.active).length} active`} />
      </div>

      <Tabs active={tab} onChange={setTab} tabs={TABS} />

      {tab === 'modules' && <DataTable columns={moduleCols} rows={HIMS_MODULES} exportName="modules.csv" searchPlaceholder="Search modules…" pageSize={20} />}
      {tab === 'lifecycle' && <DataTable columns={lifecycleCols} rows={LIFECYCLE} searchable={false} exportName="lifecycle.csv" pageSize={20} />}
      {tab === 'countries' && <DataTable columns={countryCols} rows={COUNTRIES} searchable={false} exportName="countries.csv" pageSize={20} />}
      {tab === 'roles' && <DataTable columns={roleCols} rows={ROLES} searchable={false} exportName="roles.csv" pageSize={20} />}
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
    </div>
  );
}
