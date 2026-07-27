// Module 1 · Integration Master — list + full 360° detail drawer.
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Boxes, Plus, Eye, Building2, Braces, Users, History as HistoryIcon,
  FolderOpen, GitBranch, ExternalLink, Mail, Phone, Globe, CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import {
  PageHeader, MetricCard, DataTable, Badge, StatusBadge, Chip, FormDrawer, useToast,
  Drawer, Tabs, DetailRow, Timeline, EmptyState,
} from '../../components/ui';
import { fmtDate } from '../../utils/format';
import {
  INTEGRATION_TYPES, INTEGRATION_STATUS, WORKFLOW_STEPS, PROCESS_FLOWS,
  integrationApis, integrationClients, integrationVersions, integrationDocs, integrationHimsChanges,
} from '../../data/integration';
import { INT_STATUS_TONE, MethodBadge } from './_shared';

function IntegrationDetail({ integration: it, onClose }) {
  const [tab, setTab] = useState('overview');
  const apis = integrationApis(it.id);
  const clients = integrationClients(it.id);
  const versions = integrationVersions(it.id);
  const docs = integrationDocs(it.id);
  const changes = integrationHimsChanges(it.id);
  const flow = PROCESS_FLOWS[it.id];

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'flow', label: 'Process Flow' },
    { key: 'apis', label: 'APIs', count: apis.length },
    { key: 'hims', label: 'HIMS Changes', count: changes.length },
    { key: 'clients', label: 'Clients', count: clients.length },
    { key: 'versions', label: 'Versions', count: versions.length },
    { key: 'docs', label: 'Documents', count: docs.length },
  ];

  return (
    <Drawer open onClose={onClose} size="lg"
      title={it.name}
      subtitle={`${it.id} · ${it.type} · ${it.vendor}`}
      headerExtra={<StatusBadge status={it.status} tone={INT_STATUS_TONE[it.status]} />}>
      <div className="mb-3"><Tabs tabs={tabs} active={tab} onChange={setTab} /></div>

      {tab === 'overview' && (
        <div className="flex-col gap-4">
          {/* workflow progress */}
          <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
            <div className="t-sm fw-7 mb-2">Workflow Stage · Step {it.stage} of 6</div>
            <div className="flex items-center gap-1 flex-wrap">
              {WORKFLOW_STEPS.map((s) => (
                <span key={s.key} title={s.label} style={{ flex: 1, minWidth: 30, height: 7, borderRadius: 4, background: s.step <= it.stage ? 'var(--primary)' : 'var(--surface-3)' }} />
              ))}
            </div>
            <div className="t-xs ink-3 mt-2">{WORKFLOW_STEPS[it.stage - 1]?.label} — {WORKFLOW_STEPS[it.stage - 1]?.desc}</div>
          </div>
          <div className="card"><div style={{ padding: '4px 4px' }}>
            <DetailRow label="Integration Name">{it.name}</DetailRow>
            <DetailRow label="Type"><Badge tone="info">{it.type}</Badge></DetailRow>
            <DetailRow label="Status"><StatusBadge status={it.status} tone={INT_STATUS_TONE[it.status]} /></DetailRow>
            <DetailRow label="Reusable">{it.reusable ? <Badge tone="success"><CheckCircle2 size={11} /> Yes</Badge> : <Badge tone="neutral">No</Badge>}</DetailRow>
            <DetailRow label="Vendor">{it.vendor}</DetailRow>
            <DetailRow label="Company">{it.company}</DetailRow>
            <DetailRow label="Contact Person">{it.contact}</DetailRow>
            <DetailRow label="Email"><span className="flex items-center gap-1"><Mail size={12} className="ink-3" /> {it.email}</span></DetailRow>
            <DetailRow label="Phone"><span className="flex items-center gap-1"><Phone size={12} className="ink-3" /> {it.phone}</span></DetailRow>
            <DetailRow label="Website"><a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-1" style={{ color: 'var(--primary)' }}><Globe size={12} /> {it.website}</a></DetailRow>
            <DetailRow label="Documentation"><a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-1" style={{ color: 'var(--primary)' }}><ExternalLink size={12} /> API Docs</a></DetailRow>
            <DetailRow label="Created On">{fmtDate(it.createdOn)}</DetailRow>
            <DetailRow label="Last Updated">{fmtDate(it.lastUpdated)}</DetailRow>
          </div></div>
          <div className="card card-pad">
            <div className="t-sm fw-7 mb-1">Description</div>
            <div className="t-sm ink-2" style={{ lineHeight: 1.6 }}>{it.description}</div>
          </div>
        </div>
      )}

      {tab === 'flow' && (
        flow ? (
          <div className="flex-col gap-4">
            <div className="card card-pad">
              <div className="t-sm fw-7 mb-3">{flow.processName}</div>
              <div className="flex-col gap-2">
                {flow.steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="metric-icon" style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--tint-cyan)', color: 'var(--tint-cyan-ink)', fontSize: 12, fontWeight: 800 }}>{i + 1}</span>
                    <span className="t-sm fw-5">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card card-pad">
              <div className="t-sm fw-7 mb-1">Business Rules</div>
              <div className="t-sm ink-2" style={{ lineHeight: 1.6 }}>{flow.businessRules}</div>
            </div>
            <div className="card card-pad">
              <div className="t-sm fw-7 mb-1">Exception Cases</div>
              <div className="t-sm ink-2" style={{ lineHeight: 1.6 }}>{flow.exceptionCases}</div>
            </div>
          </div>
        ) : <EmptyState icon={<GitBranch size={24} />} title="No process flow documented" desc="Add a business process flow for this integration." />
      )}

      {tab === 'apis' && (
        apis.length ? (
          <div className="flex-col gap-2">
            {apis.map((a) => (
              <div key={a.id} className="card card-pad">
                <div className="flex items-center gap-2 mb-1"><MethodBadge method={a.method} /><span className="fw-6 t-sm">{a.name}</span><Badge tone="neutral" >{a.authType}</Badge></div>
                <div className="t-xs ink-3 mb-2">{a.purpose}</div>
                <code style={{ display: 'block', background: 'var(--surface-3)', padding: '6px 9px', borderRadius: 7, fontSize: 11.5, wordBreak: 'break-all' }}>{a.url}</code>
                <div className="t-xs ink-3 mt-2">Headers: {a.headers}</div>
              </div>
            ))}
          </div>
        ) : <EmptyState icon={<Braces size={24} />} title="No APIs documented yet" />
      )}

      {tab === 'hims' && (
        changes.length ? (
          <div className="flex-col gap-2">
            {changes.map((h) => (
              <div key={h.id} className="card card-pad">
                <div className="flex items-center gap-2 mb-1"><Badge tone="peach">{h.module}</Badge><span className="fw-6 t-sm">{h.screen}</span></div>
                <div className="t-xs ink-3 mb-2">{h.screenPath}</div>
                <DetailRow label="Button / Control">{h.button} · {h.control}</DetailRow>
                <DetailRow label="Stored Procedure">{h.storedProc}</DetailRow>
                <DetailRow label="API Called">{h.apiCalled}</DetailRow>
                <DetailRow label="Tables Changed">{h.tableChanged}</DetailRow>
                <div className="t-xs ink-2 mt-2" style={{ lineHeight: 1.5 }}>{h.logic}</div>
              </div>
            ))}
          </div>
        ) : <EmptyState title="No HIMS changes recorded" />
      )}

      {tab === 'clients' && (
        clients.length ? (
          <div className="flex-col gap-2">
            {clients.map((c) => (
              <div key={c.id} className="flex items-center justify-between" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px' }}>
                <span className="flex items-center gap-2 fw-6 t-sm"><Building2 size={15} className="ink-3" /> {c.client}</span>
                <span className="flex items-center gap-3">
                  <Badge tone="neutral">{c.version}</Badge>
                  <span className="t-xs ink-3">{c.liveDate ? fmtDate(c.liveDate) : 'Pending'}</span>
                  <StatusBadge status={c.status} tone={INT_STATUS_TONE[c.status]} />
                </span>
              </div>
            ))}
          </div>
        ) : <EmptyState icon={<Users size={24} />} title="Not implemented for any client yet" />
      )}

      {tab === 'versions' && (
        versions.length ? (
          <Timeline items={versions.slice().reverse().map((v) => ({ title: <span><b>{v.version}</b> — {v.changes}</span>, time: `${fmtDate(v.date)} · ${v.modifiedBy}`, color: 'var(--primary)' }))} />
        ) : <EmptyState icon={<HistoryIcon size={24} />} title="No version history" />
      )}

      {tab === 'docs' && (
        docs.length ? (
          <div className="flex-col gap-2">
            {docs.map((d) => (
              <div key={d.id} className="flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px' }}>
                <span className="metric-icon" style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--tint-blue)', color: 'var(--tint-blue-ink)' }}><FolderOpen size={15} /></span>
                <div className="flex-1" style={{ minWidth: 0 }}><div className="fw-6 t-sm truncate">{d.name}</div><div className="t-xs ink-3">{d.type} · {d.size} · {d.uploadedBy}</div></div>
                <Badge tone="info">{d.type}</Badge>
              </div>
            ))}
          </div>
        ) : <EmptyState icon={<FolderOpen size={24} />} title="No documents uploaded" />
      )}
    </Drawer>
  );
}

export default function AllIntegrations() {
  const { data: rows, loading } = useApi(() => api.getIntegrations());
  const { data: kpis } = useApi(() => api.getSirKpis());
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [type, setType] = useState('All');
  const [show, setShow] = useState(false);
  const [extra, setExtra] = useState([]);
  const [detail, setDetail] = useState(null);

  const allRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const typeOptions = useMemo(() => ['All', ...new Set(allRows.map((r) => r.type))], [allRows]);
  const filtered = useMemo(() => allRows.filter((r) => type === 'All' || r.type === type), [allRows, type]);

  // deep-link ?new=1 opens add form; ?id=INT-xx opens detail
  useEffect(() => {
    if (params.get('new') === '1') { setShow(true); params.delete('new'); setParams(params, { replace: true }); }
    const id = params.get('id');
    if (id && allRows.length) {
      const found = allRows.find((r) => r.id === id);
      if (found) { setDetail(found); params.delete('id'); setParams(params, { replace: true }); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, allRows]);

  const addIntegration = (v) => {
    setExtra((prev) => [{
      id: `INT-${String(allRows.length + 1).padStart(2, '0')}`, name: v.name, type: v.type, vendor: v.vendor || '—',
      company: v.company || '—', contact: v.contact || '—', email: v.email || '—', phone: v.phone || '—',
      website: v.website || '—', docLink: v.docLink || '#', status: v.status || 'In Development', stage: 1,
      reusable: false, totalApis: 0, createdOn: '2026-07-27', lastUpdated: '2026-07-27', description: v.description || '',
    }, ...prev]);
    toast.success('Integration created', `${v.name} · ${v.type}`);
    setShow(false);
  };

  const columns = [
    { key: 'name', header: 'Integration Name', minWidth: 210, render: (r) => <div><div className="fw-6 t-sm">{r.name}</div><div className="t-xs ink-3">{r.id} · {r.company}</div></div> },
    { key: 'type', header: 'Type', render: (r) => <Badge tone="info">{r.type}</Badge> },
    { key: 'vendor', header: 'Vendor / Partner' },
    { key: 'totalApis', header: 'Total APIs', align: 'right', accessor: (r) => r.totalApis },
    { key: 'clients', header: 'Clients', align: 'right', accessor: (r) => integrationClients(r.id).length, render: (r) => integrationClients(r.id).length },
    { key: 'lastUpdated', header: 'Last Updated', nowrap: true, accessor: (r) => r.lastUpdated, render: (r) => fmtDate(r.lastUpdated) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} tone={INT_STATUS_TONE[r.status]} /> },
    { key: 'action', header: 'Action', sortable: false, align: 'center', render: (r) => <button className="btn btn-outline btn-sm btn-icon" onClick={(e) => { e.stopPropagation(); setDetail(r); }} title="View details"><Eye size={14} /></button> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Boxes size={22} />} tint="blue" title="All Integrations" desc="Master repository of every integration — click a row for the full 360° record"
        crumbs={[{ label: 'Integration' }, { label: 'All Integrations' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> New Integration</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Total" value={kpis?.totalIntegrations ?? allRows.length} tint="blue" icon={<Boxes size={19} />} footer={`${kpis?.reusable ?? 0} reusable`} />
        <MetricCard label="Active" value={kpis?.activeIntegrations ?? '—'} tint="green" icon={<CheckCircle2 size={19} />} footer="In production" />
        <MetricCard label="Total APIs" value={kpis?.totalApis ?? '—'} tint="mint" icon={<Braces size={19} />} footer="Documented" />
        <MetricCard label="Clients" value={kpis?.totalClients ?? '—'} tint="cyan" icon={<Building2 size={19} />} footer="Using integrations" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Type</span>{typeOptions.map((t) => <Chip key={t} active={type === t} onClick={() => setType(t)}>{t}</Chip>)}</div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="integrations.csv" searchPlaceholder="Search integrations, vendors…" pageSize={15} onRowClick={(r) => setDetail(r)} />

      <FormDrawer open={show} onClose={() => setShow(false)} title="New Integration" subtitle="Register an integration in the repository (Module 1)"
        submitLabel="Create Integration" onSubmit={addIntegration}
        fields={[
          { name: 'name', label: 'Integration Name', required: true, full: true, placeholder: 'e.g. M-Pesa Payment Gateway' },
          { name: 'type', label: 'Integration Type', type: 'select', required: true, options: INTEGRATION_TYPES },
          { name: 'status', label: 'Status', type: 'select', default: 'In Development', options: INTEGRATION_STATUS },
          { name: 'vendor', label: 'Vendor Name', placeholder: 'e.g. Safaricom' },
          { name: 'company', label: 'Company Name', placeholder: 'Legal entity' },
          { name: 'contact', label: 'Contact Person' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'phone', label: 'Phone' },
          { name: 'website', label: 'Website', full: true, placeholder: 'https://' },
          { name: 'docLink', label: 'Documentation Link', full: true, placeholder: 'https://' },
          { name: 'description', label: 'Description', type: 'textarea', full: true, rows: 3 },
        ]} />

      {detail && <IntegrationDetail integration={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
