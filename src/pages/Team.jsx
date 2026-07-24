// Team & Roles — consultants, workload and role management.
import { useState } from 'react';
import { Users, Plus, Phone, Mail, Activity, ShieldCheck, Briefcase } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, Tabs, Badge, Avatar, ProgressBar, DataTable, Skeleton, useToast } from '../components/ui';
import { ROLES } from '../data/team';
import { PROJECTS } from '../data/projects';

const utilTone = (u) => u >= 90 ? 'danger' : u >= 75 ? 'warning' : 'success';

export default function Team() {
  const { data: team, loading } = useApi(() => api.getTeam());
  const toast = useToast();
  const [tab, setTab] = useState('people');

  const projectsFor = (id) => PROJECTS.filter((p) => [p.pm, p.fc, p.tc, p.engineer, p.support].includes(id)).length;

  const roleCols = [
    { key: 'label', header: 'Role', render: (r) => <div className="flex items-center gap-2"><span className="metric-icon" style={{ width: 30, height: 30, borderRadius: 8, background: `var(--tint-${r.tint})`, color: `var(--tint-${r.tint}-ink)` }}><ShieldCheck size={14} /></span><span className="fw-6">{r.label}</span></div> },
    { key: 'members', header: 'Members', align: 'center', accessor: (r) => (team || []).filter((t) => t.roleId === r.id).length, render: (r) => <Badge tone="primary">{(team || []).filter((t) => t.roleId === r.id).length}</Badge> },
    { key: 'perms', header: 'Access Scope', render: () => <span className="t-sm ink-2">Module-scoped RBAC</span> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Users size={22} />} tint="indigo" title="Team & Roles" desc="Implementation consultants, utilisation and role management"
        crumbs={[{ label: 'Insights & Admin' }, { label: 'Team' }]}
        actions={<button className="btn btn-primary" onClick={() => toast.info('Add member')}><Plus size={15} /> Add Member</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Team Members" value={team?.length ?? '—'} tint="indigo" icon={<Users size={19} />} footer={`${ROLES.length} roles`} />
        <MetricCard label="Avg Utilisation" value={team ? `${Math.round(team.reduce((s, t) => s + t.util, 0) / team.length)}%` : '—'} tint="peach" icon={<Activity size={19} />} footer="Across delivery" />
        <MetricCard label="Fully Loaded" value={(team||[]).filter(t=>t.util>=90).length} tint="rose" icon={<Activity size={19} />} footer="≥ 90% utilised" />
        <MetricCard label="Roles Defined" value={ROLES.length} tint="mint" icon={<ShieldCheck size={19} />} footer="RBAC scopes" />
      </div>

      <Tabs active={tab} onChange={setTab} tabs={[{ key: 'people', label: 'People', count: team?.length }, { key: 'roles', label: 'Roles', count: ROLES.length }]} />

      {tab === 'people' ? (
        loading ? <div className="kpi-grid">{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={150} r={16} />)}</div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }} className="stagger">
            {team.map((t) => (
              <div key={t.id} className="card card-pad card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={t.name} hue={t.avatarHue} size="lg" ring />
                  <div style={{ minWidth: 0 }}><div className="fw-7 t-md truncate">{t.name}</div><div className="t-sm ink-3">{t.role}</div></div>
                </div>
                <div className="flex items-center gap-2 mb-2"><Badge tone="neutral">{t.dept}</Badge><Badge tone="primary">{projectsFor(t.id)} projects</Badge></div>
                <div className="t-xs ink-3 mb-1 flex items-center justify-between"><span>Utilisation</span><b className="ink-1">{t.util}%</b></div>
                <ProgressBar value={t.util} color={`var(--${utilTone(t.util)})`} />
                <div className="t-xs ink-2 mt-3" style={{ borderTop: '1px dashed var(--border)', paddingTop: 8 }}>
                  <div className="flex items-center gap-1 truncate"><Mail size={11} /> {t.email}</div>
                  <div className="flex items-center gap-1 mt-1"><Phone size={11} /> {t.phone}</div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <DataTable columns={roleCols} rows={ROLES} searchable={false} exportName="roles.csv" pageSize={20} toolbarLeft={<span className="t-sm ink-3 flex items-center gap-1"><Briefcase size={14} /> Role-based access control</span>} />
      )}
    </div>
  );
}
