// Scope & Kick-off — purchase order, purchased scope and kick-off meetings.
import { useState } from 'react';
import { Handshake, FileText, CheckCircle2, Users, Layers, Plus } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Drawer, Badge, Avatar, DetailRow, FormDrawer, useToast } from '../components/ui';
import { fmtDate } from '../utils/format';
import { HIMS_MODULES } from '../data/masters';
import { PROJECTS } from '../data/projects';
import { findClient } from '../data/clients';
import { findUser } from '../data/team';

const money = (n, cur = 'INR') => { try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur, maximumFractionDigits: 0, notation: n >= 1e7 ? 'compact' : 'standard' }).format(n); } catch { return `${cur} ${n}`; } };
const modName = (id) => HIMS_MODULES.find((m) => m.id === id)?.name ?? id;
const koStatus = (p) => { const m = p.milestones.find((x) => x.key === 'kickoff'); return m?.status === 'Completed' ? 'Done' : m?.status === 'In Progress' ? 'Scheduled' : 'Pending'; };

export default function Kickoff() {
  const { data: projects, loading } = useApi(() => api.getProjects());
  const toast = useToast();
  const [active, setActive] = useState(null);
  const [show, setShow] = useState(false);

  const rows = (projects || []).filter((p) => p.status !== 'Completed');
  const koDone = rows.filter((p) => koStatus(p) === 'Done').length;
  const scopeValue = rows.reduce((s, p) => s + p.contractValue, 0);

  const columns = [
    { key: 'name', header: 'Project', minWidth: 220, render: (p) => <div className="flex items-center gap-3"><Avatar name={findClient(p.clientId)?.name} hue={8} size="md" /><div><div className="fw-6 t-sm">{p.name}</div><div className="t-xs ink-3 mono">{p.code}</div></div></div> },
    { key: 'po', header: 'PO Number', render: (p) => <div><div className="fw-6 t-sm mono">{p.poNumber}</div><div className="t-xs ink-3">{fmtDate(p.poDate)}</div></div> },
    { key: 'value', header: 'Contract', align: 'right', accessor: (p) => p.contractValue, render: (p) => <b className="tabular">{money(p.contractValue, p.currency)}</b> },
    { key: 'modules', header: 'Modules', align: 'center', accessor: (p) => p.modules.length, render: (p) => <Badge tone="info">{p.modules.length}</Badge> },
    { key: 'interfaces', header: 'Interfaces', align: 'center', accessor: (p) => p.interfaces.length, render: (p) => <Badge tone="neutral">{p.interfaces.length}</Badge> },
    { key: 'users', header: 'Users', align: 'right', accessor: (p) => p.users },
    { key: 'ko', header: 'Kick-off', render: (p) => { const s = koStatus(p); return <Badge tone={s === 'Done' ? 'success' : s === 'Scheduled' ? 'pending' : 'neutral'}>{s === 'Done' ? <><CheckCircle2 size={11} /> Done</> : s}</Badge>; } },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Handshake size={22} />} tint="sky" title="Scope & Kick-off" desc="Purchase orders, purchased scope confirmation and kick-off meetings"
        crumbs={[{ label: 'Delivery' }, { label: 'Scope & Kick-off' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> Schedule Kick-off</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Active Scopes" value={rows.length} tint="sky" icon={<Layers size={19} />} footer="Confirmed & in delivery" />
        <MetricCard label="Kick-offs Done" value={koDone} tint="green" icon={<CheckCircle2 size={19} />} footer={`${rows.length - koDone} pending`} />
        <MetricCard label="Scope Value" value={money(scopeValue)} tint="mint" icon={<FileText size={19} />} footer="Contracted" />
        <MetricCard label="Avg Modules / Deal" value={rows.length ? Math.round(rows.reduce((s, p) => s + p.modules.length, 0) / rows.length) : 0} tint="lavender" icon={<Layers size={19} />} footer="Purchased modules" />
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} onRowClick={setActive} exportName="scope-kickoff.csv" searchPlaceholder="Search projects, PO numbers…" />

      <Drawer open={!!active} onClose={() => setActive(null)} size="md" title={active?.name} subtitle={active ? `${active.code} · ${findClient(active.clientId)?.name}` : ''}
        footer={<><button className="btn btn-ghost" onClick={() => setActive(null)}>Close</button><button className="btn btn-primary"><CheckCircle2 size={14} /> Confirm Scope Sign-off</button></>}>
        {active && (
          <div className="flex-col gap-4">
            <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
              <div className="detail-list">
                <DetailRow label="PO Number">{active.poNumber}</DetailRow>
                <DetailRow label="PO Date">{fmtDate(active.poDate)}</DetailRow>
                <DetailRow label="Contract Value">{money(active.contractValue, active.currency)}</DetailRow>
                <DetailRow label="No. of Users">{active.users}</DetailRow>
                <DetailRow label="Implementation Type">{active.implType}</DetailRow>
                <DetailRow label="Kick-off Status"><Badge tone={koStatus(active) === 'Done' ? 'success' : 'pending'}>{koStatus(active)}</Badge></DetailRow>
              </div>
            </div>
            <div className="card card-pad">
              <div className="card-title mb-1">Purchased Modules <Badge tone="primary">{active.modules.length}</Badge></div>
              <div className="flex flex-wrap gap-2 mt-3">{active.modules.map((m) => <Badge key={m} tone="info">{modName(m)}</Badge>)}</div>
              <div className="card-title mb-1 mt-4">Interfaces & Third-party Integrations</div>
              <div className="flex flex-wrap gap-2 mt-2">{active.interfaces.length ? active.interfaces.map((i) => <Badge key={i} tone="neutral">{i}</Badge>) : <span className="ink-3 t-sm">None</span>}</div>
            </div>
            <div className="card card-pad">
              <div className="card-title mb-3 flex items-center gap-2"><Users size={15} /> Kick-off Attendees</div>
              <div className="flex flex-wrap gap-2">
                {[active.pm, active.fc, active.tc].map((id) => { const u = findUser(id); return <div key={id} className="flex items-center gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 999, padding: '4px 10px 4px 4px' }}><Avatar name={u?.name} hue={u?.avatarHue} size="sm" /><span className="t-sm fw-6">{u?.name}</span></div>; })}
                <div className="flex items-center gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 999, padding: '4px 10px 4px 4px' }}><Avatar name={findClient(active.clientId)?.contacts.find((c) => c.primary)?.name} hue={6} size="sm" /><span className="t-sm fw-6">{findClient(active.clientId)?.contacts.find((c) => c.primary)?.name} (Client)</span></div>
              </div>
              <div className="t-sm ink-2 mt-3" style={{ borderTop: '1px dashed var(--border)', paddingTop: 10 }}><b>MOM:</b> {active.remarks}</div>
            </div>
          </div>
        )}
      </Drawer>

      <FormDrawer open={show} onClose={() => setShow(false)} title="Schedule Kick-off Meeting" subtitle="Capture kick-off meeting details"
        submitLabel="Schedule" onSubmit={(v) => { const p = PROJECTS.find((x) => x.code === v.projectCode); toast.success('Kick-off scheduled', p ? p.name.split(' — ')[0] : v.projectCode); setShow(false); }}
        fields={[
          { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: PROJECTS.filter((p) => p.status !== 'Completed').map((p) => ({ value: p.code, label: p.name })) },
          { name: 'meetingDate', label: 'Meeting Date', type: 'date', required: true },
          { name: 'mode', label: 'Mode', type: 'select', default: 'On-site', options: ['On-site', 'Virtual', 'Hybrid'] },
          { name: 'participants', label: 'Participants', type: 'tags', full: true, placeholder: 'Add attendees and press Enter…' },
          { name: 'agenda', label: 'Agenda', type: 'textarea', full: true, rows: 3, placeholder: 'Meeting agenda…' },
          { name: 'nextMeeting', label: 'Next Meeting', type: 'date' },
        ]} />
    </div>
  );
}
