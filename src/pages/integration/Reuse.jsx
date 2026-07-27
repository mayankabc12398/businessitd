// Module 14 · Reuse Information + Module 13 · Developer Notes.
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Recycle, CheckCircle2, Braces, FileCode2, Database, MonitorSmartphone,
  Building2, BookOpen, Bug, Rocket, Search,
} from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, Badge, Chip, Accordion, Skeleton, DetailRow } from '../../components/ui';
import {
  INTEGRATION_TYPES, integrationApis, integrationClients, integrationDocs, integrationHimsChanges,
} from '../../data/integration';

export default function Reuse() {
  const navigate = useNavigate();
  const { data: integrations, loading } = useApi(() => api.getIntegrations());
  const { data: notes } = useApi(() => api.getDeveloperNotes());
  const [type, setType] = useState('All');

  const reusable = useMemo(() => (integrations || []).filter((i) => i.reusable), [integrations]);
  const filtered = useMemo(() => reusable.filter((i) => type === 'All' || i.type === type), [reusable, type]);
  const typeChips = ['All', ...INTEGRATION_TYPES.filter((t) => reusable.some((i) => i.type === t))];

  return (
    <div className="page">
      <PageHeader icon={<Recycle size={22} />} tint="green" title="Reusable Repository" desc="Find an existing integration and reuse its APIs, payloads, SQL, screens & code (Modules 13 & 14)"
        crumbs={[{ label: 'Integration' }, { label: 'Reusable Repository' }]} />

      <div className="kpi-grid stagger">
        <MetricCard label="Reusable Integrations" value={reusable.length} tint="green" icon={<Recycle size={19} />} footer="Ready to clone" />
        <MetricCard label="APIs Reusable" value={reusable.reduce((s, i) => s + integrationApis(i.id).length, 0)} tint="mint" icon={<Braces size={19} />} footer="Documented & tested" />
        <MetricCard label="Client Roll-outs" value={reusable.reduce((s, i) => s + integrationClients(i.id).length, 0)} tint="cyan" icon={<Building2 size={19} />} footer="Proven in production" />
        <MetricCard label="Developer Notes" value={(notes || []).length} tint="lavender" icon={<BookOpen size={19} />} footer="Gotchas & deployment tips" />
      </div>

      <div className="card card-pad" style={{ background: 'var(--primary-softer)', border: '1px solid var(--primary-soft)' }}>
        <div className="flex items-center gap-2 t-sm ink-2"><Search size={15} color="var(--primary)" /> <b>Starting a new integration?</b> Filter by type below to find similar ones already built — clone their APIs, payloads and code to cut implementation time.</div>
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Integration Type</span>{typeChips.map((t) => <Chip key={t} active={type === t} onClick={() => setType(t)}>{t}</Chip>)}</div>
      </div>

      {loading ? <Skeleton h={240} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map((it) => {
            const inside = [
              { icon: <Braces size={13} />, label: `${integrationApis(it.id).length} APIs` },
              { icon: <Database size={13} />, label: `${integrationHimsChanges(it.id).length} HIMS changes` },
              { icon: <FileCode2 size={13} />, label: 'Payloads' },
              { icon: <MonitorSmartphone size={13} />, label: 'Screens' },
              { icon: <Building2 size={13} />, label: `${integrationClients(it.id).length} clients` },
              { icon: <FileCode2 size={13} />, label: `${integrationDocs(it.id).length} docs` },
            ];
            return (
              <div key={it.id} className="card card-pad card-hover anim-fade-up" style={{ cursor: 'pointer' }} onClick={() => navigate(`/integration/all?id=${it.id}`)}>
                <div className="flex items-center justify-between mb-2">
                  <Badge tone="success"><CheckCircle2 size={11} /> Reusable</Badge>
                  <Badge tone="info">{it.type}</Badge>
                </div>
                <div className="fw-7 t-md">{it.name}</div>
                <div className="t-xs ink-3 mb-3">{it.vendor} · Live at {integrationClients(it.id).length} hospitals</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {inside.map((x, i) => (
                    <span key={i} className="flex items-center gap-1 t-xs fw-5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px', color: 'var(--text-2)' }}>{x.icon} {x.label}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card card-pad">
        <div className="flex items-center gap-2 mb-3"><BookOpen size={17} color="var(--primary)" /><div className="card-title">Developer Notes</div></div>
        <div className="flex-col gap-2">
          {(notes || []).map((n) => (
            <Accordion key={n.id} title={<span className="fw-6 t-sm">{n.integrationName}</span>} badge={<Badge tone="neutral">Notes</Badge>}>
              <DetailRow label="Code Location"><code style={{ fontSize: 11.5 }}>{n.codeLocation}</code></DetailRow>
              <DetailRow label="Important Notes">{n.importantNotes}</DetailRow>
              <DetailRow label={<span className="flex items-center gap-1"><Bug size={12} /> Common Errors</span>}>{n.commonErrors}</DetailRow>
              <DetailRow label="Debugging Steps">{n.debuggingSteps}</DetailRow>
              <DetailRow label={<span className="flex items-center gap-1"><Rocket size={12} /> Deployment Steps</span>}>{n.deploymentSteps}</DetailRow>
            </Accordion>
          ))}
        </div>
      </div>
    </div>
  );
}
