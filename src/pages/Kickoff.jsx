// Scope & Kick-off — purchase order, purchased scope and kick-off meetings.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Handshake, FileText, CheckCircle2, Users, Layers, Plus, Eye, ListChecks, Clock, Building2, CalendarClock, CalendarRange, ArrowRight, ChevronDown } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Drawer, Modal, Badge, Avatar, DetailRow, ProgressBar, FormDrawer, useToast } from '../components/ui';
import { fmtDate } from '../utils/format';
import { HIMS_MODULES } from '../data/masters';
import { getActivities, subscribeActivities, loadActivities } from '../data/activitiesStore';

const money = (n, cur = 'INR') => { try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur, maximumFractionDigits: 0, notation: n >= 1e7 ? 'compact' : 'standard' }).format(n); } catch { return `${cur} ${n}`; } };
const modName = (id) => HIMS_MODULES.find((m) => m.id === id)?.name ?? id;
const koStatus = (p) => { const m = p.milestones.find((x) => x.key === 'kickoff'); return m?.status === 'Completed' ? 'Done' : m?.status === 'In Progress' ? 'Scheduled' : 'Pending'; };

export default function Kickoff() {
  const navigate = useNavigate();
  const { data: projects, loading } = useApi(() => api.getProjects());
  const { data: clients } = useApi(() => api.getClients());
  const { data: team } = useApi(() => api.getTeam());
  const findClient = (id) => (clients || []).find((c) => c.id === id || c.code === id);
  const findUser = (id) => (team || []).find((u) => u.id === id);
  const toast = useToast();
  const [active, setActive] = useState(null);
  // list rows don't carry the module/interface nav arrays — fetch them for the open project
  const { data: activeModules } = useApi(() => (active ? api.getProjectModules(active.code) : Promise.resolve([])), [active?.code]);
  const { data: activeInterfaces } = useApi(() => (active ? api.getProjectInterfaces(active.code) : Promise.resolve([])), [active?.code]);
  const [preview, setPreview] = useState(null);
  const [show, setShow] = useState(false);
  const [activities, setActivities] = useState(getActivities);
  useEffect(() => subscribeActivities(setActivities), []);

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
    { key: 'view', header: '', width: 46, align: 'center', sortable: false, render: (p) => (
      <button className="btn btn-icon btn-ghost btn-sm" title="View kick-off details" onClick={(e) => { e.stopPropagation(); setPreview(p); }}><Eye size={15} /></button>
    ) },
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

      <Drawer open={!!active} onClose={() => setActive(null)} size="md" title={active?.name} subtitle={active ? [active.code, findClient(active.clientId)?.name].filter(Boolean).join(' · ') : ''}
        footer={<><button className="btn btn-ghost" onClick={() => setActive(null)}>Close</button><button className="btn btn-primary" onClick={() => { navigate(`/signoff?code=${active.code}`); setActive(null); }}><CheckCircle2 size={14} /> Confirm Scope Sign-off</button></>}>
        {active && (() => {
          const mods = (activeModules && activeModules.length ? activeModules : active.modules) || [];
          const ifaces = (activeInterfaces && activeInterfaces.length ? activeInterfaces : active.interfaces) || [];
          const attendees = [active.pm, active.fc, active.tc].map((id) => findUser(id)).filter(Boolean);
          const spoc = findClient(active.clientId)?.contacts?.find((c) => c.primary);
          return (
          <div className="flex-col gap-4">
            <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
              <div className="detail-list">
                <DetailRow label="PO Number">{active.poNumber || '—'}</DetailRow>
                <DetailRow label="PO Date">{fmtDate(active.poDate)}</DetailRow>
                <DetailRow label="Contract Value">{money(active.contractValue, active.currency)}</DetailRow>
                <DetailRow label="No. of Users">{active.users ?? '—'}</DetailRow>
                <DetailRow label="Implementation Type">{active.implType || '—'}</DetailRow>
                <DetailRow label="Kick-off Status"><Badge tone={koStatus(active) === 'Done' ? 'success' : 'pending'}>{koStatus(active)}</Badge></DetailRow>
              </div>
            </div>
            <div className="card card-pad">
              <div className="card-title mb-1">Purchased Modules <Badge tone="primary">{mods.length}</Badge></div>
              <div className="flex flex-wrap gap-2 mt-3">{mods.length ? mods.map((m) => <Badge key={m} tone="info">{modName(m)}</Badge>) : <span className="ink-3 t-sm">None</span>}</div>
              <div className="card-title mb-1 mt-4">Interfaces & Third-party Integrations</div>
              <div className="flex flex-wrap gap-2 mt-2">{ifaces.length ? ifaces.map((i) => <Badge key={i} tone="neutral">{i}</Badge>) : <span className="ink-3 t-sm">None</span>}</div>
            </div>
            <div className="card card-pad">
              <div className="card-title mb-3 flex items-center gap-2"><Users size={15} /> Kick-off Attendees</div>
              <div className="flex flex-wrap gap-2">
                {attendees.map((u) => <div key={u.id} className="flex items-center gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 999, padding: '4px 10px 4px 4px' }}><Avatar name={u.name} hue={u.avatarHue} size="sm" /><span className="t-sm fw-6">{u.name}</span></div>)}
                {spoc && <div className="flex items-center gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 999, padding: '4px 10px 4px 4px' }}><Avatar name={spoc.name} hue={6} size="sm" /><span className="t-sm fw-6">{spoc.name} (Client)</span></div>}
                {!attendees.length && !spoc && <span className="ink-3 t-sm">No attendees assigned</span>}
              </div>
              {active.remarks && <div className="t-sm ink-2 mt-3" style={{ borderTop: '1px dashed var(--border)', paddingTop: 10 }}><b>MOM:</b> {active.remarks}</div>}
            </div>
          </div>
          );
        })()}
      </Drawer>

      <FormDrawer open={show} onClose={() => setShow(false)} title="Schedule Kick-off Meeting" subtitle="Capture kick-off meeting details"
        submitLabel="Schedule" onSubmit={async (v) => {
          const p = (projects || []).find((x) => x.code === v.projectCode);
          try {
            await api.createActivity({
              activity: 'Kick-off Meeting',
              groupName: 'Kick-off',
              phase: '1',
              status: 'Scheduled',
              mode: v.mode || 'On-site',
              startDate: v.meetingDate,
              projectCode: v.projectCode,
              clinic: p ? findClient(p.clientId)?.name : undefined,
              agenda: v.agenda,
              participants: v.participants,
              nextMeeting: v.nextMeeting,
            });
            await loadActivities();
            toast.success('Kick-off scheduled', p ? p.name.split(' — ')[0] : v.projectCode);
            setShow(false);
          } catch (e) { toast.error('Could not schedule', e?.message || 'Request failed'); }
        }}
        fields={[
          { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: (projects || []).filter((p) => p.status !== 'Completed').map((p) => ({ value: p.code, label: p.name })) },
          { name: 'meetingDate', label: 'Meeting Date', type: 'date', required: true },
          { name: 'mode', label: 'Mode', type: 'select', default: 'On-site', options: ['On-site', 'Virtual', 'Hybrid'] },
          { name: 'participants', label: 'Participants', type: 'tags', full: true, placeholder: 'Add attendees and press Enter…' },
          { name: 'agenda', label: 'Agenda', type: 'textarea', full: true, rows: 3, placeholder: 'Meeting agenda…' },
          { name: 'nextMeeting', label: 'Next Meeting', type: 'date' },
        ]} />

      <KickoffModal project={preview} activities={activities} onClose={() => setPreview(null)} />
    </div>
  );
}

// ---------------- Kick-off 360° detail modal ----------------
const actTone = (s) => (s === 'Done' || s === 'Completed' ? 'success' : s === 'In Progress' || s === 'Ongoing' ? 'primary' : s === 'Pending' ? 'pending' : 'neutral');
const isDone = (s) => s === 'Done' || s === 'Completed';

function KickoffModal({ project: p, activities = [], onClose }) {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(null);
  const { data: clients } = useApi(() => api.getClients());
  const { data: team } = useApi(() => api.getTeam());
  const findClient = (id) => (clients || []).find((c) => c.id === id || c.code === id);
  const findUser = (id) => (team || []).find((u) => u.id === id);
  if (!p) return null;
  const client = findClient(p.clientId);
  const spoc = client?.contacts?.find((c) => c.primary);
  // activities created on the Activity Schedule page for this same project / client
  const acts = activities.filter((a) =>
    a.projectCode === p.code ||
    (client?.name && a.clinic && a.clinic.toLowerCase().includes(client.name.toLowerCase())),
  );
  const total = acts.length;
  const done = acts.filter((a) => isDone(a.status)).length;
  const pending = acts.filter((a) => a.status === 'Pending').length;
  const days = acts.reduce((s, a) => s + (Number(a.days) || 0), 0);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const ko = koStatus(p);
  const tiles = [
    ['Total Activities', total, <ListChecks key="i" size={17} />, 'indigo'],
    ['Completed', done, <CheckCircle2 key="i" size={17} />, 'green'],
    ['Pending', pending, <Clock key="i" size={17} />, 'peach'],
    ['Planned Effort', `${days}d`, <Layers key="i" size={17} />, 'lavender'],
  ];
  const roleAssignments = [['PM', p.pm], ['FC', p.fc], ['TC', p.tc]];

  return (
    <Modal open={!!p} onClose={onClose} size="full" title={p.name} subtitle={`${p.code} · ${client?.name || ''}`}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn btn-primary"><FileText size={14} /> Export Kick-off Pack</button></>}>
      <div className="flex-col gap-4">
        {/* Stat tiles */}
        <div className="ko-tiles stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {tiles.map(([label, val, icon, tint]) => (
            <div key={label} className="card card-pad anim-fade-up" style={{ background: `var(--tint-${tint})`, border: 'none' }}>
              <span className="metric-icon" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.55)', color: `var(--tint-${tint}-ink)` }}>{icon}</span>
              <div className="t-2xl fw-8 mt-2" style={{ color: `var(--tint-${tint}-ink)` }}>{val}</div>
              <div className="t-xs fw-6" style={{ color: `var(--tint-${tint}-ink)`, opacity: .8 }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="ko-cols" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 14 }}>
          {/* Activity details — from the Activity Schedule page for this project/client */}
          <div className="card card-pad anim-fade-up">
            <div className="flex items-center justify-between mb-1">
              <div className="card-title flex items-center gap-2"><CalendarRange size={15} /> Activity Details</div>
              {total > 0 && <Badge tone="primary">{pct}% done</Badge>}
            </div>
            <div className="t-xs ink-3 mb-2">Activities scheduled for this project on the Activity Schedule page</div>
            {total > 0 ? (
              <>
                <ProgressBar value={pct} color="var(--primary)" />
                <div className="t-xs ink-3 mt-2" style={{ textAlign: 'right' }}>Click an activity for full details</div>
                <div className="mt-1" style={{ maxHeight: 340, overflowY: 'auto', paddingRight: 4 }}>
                  {acts.map((a) => {
                    const open = openId === a.id;
                    return (
                    <div key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <div className="flex items-center gap-3" style={{ padding: '9px 2px', cursor: 'pointer' }} onClick={() => setOpenId(open ? null : a.id)}>
                        <span style={{ width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700, background: isDone(a.status) ? 'var(--tint-green)' : a.status === 'Pending' ? 'var(--tint-peach)' : 'var(--primary-soft)', color: isDone(a.status) ? 'var(--tint-green-ink)' : a.status === 'Pending' ? 'var(--tint-peach-ink)' : 'var(--primary-700)' }}>{isDone(a.status) ? '✓' : (a.phase || '·')}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="fw-6 t-sm truncate">{a.activity}</div>
                          <div className="t-xs ink-3">{a.group}{a.days ? ` · ${a.days}d` : ''}{a.startDate ? ` · ${fmtDate(a.startDate)}` : ''}{a.mode ? ` · ${a.mode}` : ''}</div>
                        </div>
                        <Badge tone={actTone(a.status)}>{a.status}</Badge>
                        <ChevronDown size={15} className="ink-3" style={{ flexShrink: 0, transition: 'transform var(--dur) var(--ease)', transform: open ? 'rotate(180deg)' : 'none' }} />
                      </div>
                      {open && (
                        <div className="card card-pad anim-fade-up" style={{ background: 'var(--surface-2)', margin: '2px 2px 12px' }}>
                          <div className="detail-list">
                            <DetailRow label="Activity">{a.activity}</DetailRow>
                            <DetailRow label="Project">{a.projectName ? <>{a.projectName} <span className="mono t-xs ink-3">({a.projectCode})</span></> : <span className="ink-3">—</span>}</DetailRow>
                            <DetailRow label="Phase"><Badge tone="info">Phase {a.phase}</Badge></DetailRow>
                            <DetailRow label="Hospital Name">{a.clinic || '—'}</DetailRow>
                            <DetailRow label="Status"><Badge tone={actTone(a.status)}>{a.status}</Badge></DetailRow>
                            <DetailRow label="Onsite / Offsite">{a.mode || '—'}</DetailRow>
                            <DetailRow label="Days Required">{a.days ?? '—'}</DetailRow>
                            <DetailRow label="Start Date">{fmtDate(a.startDate)}</DetailRow>
                            <DetailRow label="End Date">{fmtDate(a.endDate)}</DetailRow>
                            <DetailRow label="Actual Start Date">{a.actualStart ? fmtDate(a.actualStart) : '—'}</DetailRow>
                            <DetailRow label="Actual End Date">{a.actualEnd ? fmtDate(a.actualEnd) : '—'}</DetailRow>
                            {a.participants && <DetailRow label="Participants">{a.participants}</DetailRow>}
                            {a.nextMeeting && <DetailRow label="Next Meeting">{fmtDate(a.nextMeeting)}</DetailRow>}
                            {a.agenda && <DetailRow label="Agenda">{a.agenda}</DetailRow>}
                          </div>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex-col items-center text-center gap-2" style={{ padding: '28px 12px', border: '1px dashed var(--border-strong)', borderRadius: 12, background: 'var(--surface-2)' }}>
                <CalendarRange size={26} className="ink-3" />
                <div className="fw-6 t-sm">No activities scheduled yet</div>
                <div className="t-xs ink-3" style={{ maxWidth: 260 }}>Add activities for this project on the Activity Schedule page and link them to <b>{client?.name || p.name}</b>.</div>
                <button className="btn btn-outline btn-sm mt-1" onClick={() => { onClose(); navigate('/schedule'); }}>Open Activity Schedule <ArrowRight size={13} /></button>
              </div>
            )}
          </div>

          <div className="flex-col gap-4">
            {/* Department & scope content */}
            <div className="card card-pad anim-fade-up">
              <div className="card-title mb-2 flex items-center gap-2"><Building2 size={15} /> Department & Scope Content</div>
              <div className="flex items-center gap-4 mb-3">
                {[['Modules', p.modules.length], ['Interfaces', p.interfaces.length], ['Users', p.users]].map(([l, v]) => (
                  <div key={l}><div className="t-xl fw-8">{v}</div><div className="t-xs ink-3">{l}</div></div>
                ))}
              </div>
              <div className="t-xs fw-6 ink-3 mb-1" style={{ textTransform: 'uppercase', letterSpacing: '.04em' }}>Purchased Modules</div>
              <div className="flex flex-wrap gap-2 mb-3">{p.modules.map((m) => <Badge key={m} tone="info">{modName(m)}</Badge>)}</div>
              <div className="t-xs fw-6 ink-3 mb-1" style={{ textTransform: 'uppercase', letterSpacing: '.04em' }}>Interfaces</div>
              <div className="flex flex-wrap gap-2">{p.interfaces.length ? p.interfaces.map((i) => <Badge key={i} tone="neutral">{i}</Badge>) : <span className="ink-3 t-sm">None</span>}</div>
            </div>

            {/* Kick-off details */}
            <div className="card card-pad anim-fade-up">
              <div className="flex items-center justify-between mb-2">
                <div className="card-title flex items-center gap-2"><Handshake size={15} /> Kick-off Details</div>
                <Badge tone={ko === 'Done' ? 'success' : ko === 'Scheduled' ? 'pending' : 'neutral'}>{ko}</Badge>
              </div>
              <div className="detail-list">
                <DetailRow label="PO Number"><span className="mono">{p.poNumber}</span></DetailRow>
                <DetailRow label="PO Date">{fmtDate(p.poDate)}</DetailRow>
                <DetailRow label="Contract">{money(p.contractValue, p.currency)}</DetailRow>
                <DetailRow label="Target Go-Live"><span className="flex items-center gap-1"><CalendarClock size={12} /> {fmtDate(p.targetGoLive)}</span></DetailRow>
              </div>
              <div className="t-xs fw-6 ink-3 mt-3 mb-2" style={{ textTransform: 'uppercase', letterSpacing: '.04em' }}>Attendees</div>
              <div className="flex flex-wrap gap-2">
                {roleAssignments.map(([role, id]) => { const u = findUser(id); return (
                  <div key={role} className="flex items-center gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 999, padding: '3px 10px 3px 3px' }}>
                    <Avatar name={u?.name} hue={u?.avatarHue} size="sm" /><span className="t-xs fw-6">{u?.name} <span className="ink-3">· {role}</span></span>
                  </div>
                ); })}
                {spoc && (
                  <div className="flex items-center gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 999, padding: '3px 10px 3px 3px' }}>
                    <Avatar name={spoc.name} hue={6} size="sm" /><span className="t-xs fw-6">{spoc.name} <span className="ink-3">· Client</span></span>
                  </div>
                )}
              </div>
              {p.remarks && <div className="t-sm ink-2 mt-3" style={{ borderTop: '1px dashed var(--border)', paddingTop: 10 }}><b>MOM:</b> {p.remarks}</div>}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:820px){ .ko-cols{ grid-template-columns:1fr !important; } .ko-tiles{ grid-template-columns:repeat(2,1fr) !important; } }`}</style>
    </Modal>
  );
}
