// Module 1 · Feature Registration — master list + full 360° detail drawer
// (Modules 1-10 captured per feature).
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Lightbulb, Plus, Eye, CheckCircle2, Recycle, Building2, TrendingUp,
  GitBranch, Code2, FlaskConical, Rocket, Users, CircleDollarSign, ArrowRight, PenLine,
} from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { getFeatures, subscribeFeatures, addFeature as storeAddFeature, advanceFeature, ADVANCE_LABEL, setFeatureData } from '../../data/featuresStore';
import {
  PageHeader, MetricCard, DataTable, Badge, Chip, FormDrawer, useToast,
  Drawer, Tabs, DetailRow, EmptyState,
} from '../../components/ui';
import { fmtINR, fmtDate, fmtNum } from '../../utils/format';
import {
  FEATURE_MODULES, FEATURE_CATEGORIES, FEATURE_STATUSES, PRIORITIES, WORKFLOW_STEPS,
  STATUS_STAGE,
} from '../../data/revenue';
import { StatusChip, PRIO_TONE, ImpactBar, ADOPT_TONE, UAT_TONE } from './_shared';

function FeatureDetail({ feature: f, onClose, onAdvance }) {
  const [tab, setTab] = useState('overview');
  const [form, setForm] = useState(null); // 'ba' | 'ta' | 'dev'
  const toast = useToast();
  const { data: baList } = useApi(() => api.getBusinessAnalysis());
  const { data: taList } = useApi(() => api.getTechnicalAnalysis());
  const { data: wfList } = useApi(() => api.getFeatureWorkflows());
  const { data: devList } = useApi(() => api.getDevDetails());
  const { data: impactList } = useApi(() => api.getFeatureImpact());
  const { data: screenList } = useApi(() => api.getScreenChanges());
  const { data: testList } = useApi(() => api.getFeatureTests());
  const { data: adoptionList } = useApi(() => api.getClientAdoption());
  const belongs = (x) => x.featureId === f.id || x.featureCode === f.id;
  const ba = (baList || []).find(belongs) || f.ba || null;
  const ta = (taList || []).find(belongs) || f.ta || null;
  const wf = (wfList || []).find(belongs) || null;
  const dev = (devList || []).find(belongs) || f.dev || null;
  const impact = (impactList || []).find(belongs) || null;
  const screens = (screenList || []).filter(belongs);
  const tests = (testList || []).filter(belongs);
  const adoption = (adoptionList || []).filter(belongs);
  const stage = STATUS_STAGE[f.status] || 1;

  const tabs = [
    { key: 'overview', label: 'Registration' },
    { key: 'business', label: 'Business Analysis' },
    { key: 'technical', label: 'Technical' },
    { key: 'screens', label: 'Screens', count: screens.length },
    { key: 'workflow', label: 'Workflow' },
    { key: 'dev', label: 'Development' },
    { key: 'testing', label: 'Testing', count: tests.length },
    { key: 'impact', label: 'Impact' },
    { key: 'adoption', label: 'Adoption', count: adoption.length },
  ];

  return (
    <Drawer open onClose={onClose} size="lg" title={f.name} subtitle={`${f.id} · ${f.module} · ${f.client}`}
      headerExtra={<StatusChip status={f.status} />}>
      <div className="mb-3"><Tabs tabs={tabs} active={tab} onChange={setTab} /></div>

      {tab === 'overview' && (
        <div className="flex-col gap-4">
          <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
            <div className="flex items-center justify-between mb-2"><span className="t-sm fw-7">Workflow · Step {stage} of 8</span><Badge tone={PRIO_TONE[f.priority]}>{f.priority} priority</Badge></div>
            <div className="flex items-center gap-1 flex-wrap">
              {WORKFLOW_STEPS.map((s) => <span key={s.key} title={s.label} style={{ flex: 1, minWidth: 20, height: 7, borderRadius: 4, background: s.step <= stage ? 'var(--primary)' : 'var(--surface-3)' }} />)}
            </div>
            <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
              <div className="t-xs ink-3">{WORKFLOW_STEPS[stage - 1]?.label} — {WORKFLOW_STEPS[stage - 1]?.desc}</div>
              {ADVANCE_LABEL[f.status]
                ? <button className="btn btn-primary btn-sm" onClick={onAdvance}>{ADVANCE_LABEL[f.status]} <ArrowRight size={14} /></button>
                : <Badge tone="success"><CheckCircle2 size={11} /> Shared with all clients</Badge>}
            </div>
          </div>
          <div className="card"><div style={{ padding: 4 }}>
            <DetailRow label="Feature ID">{f.id}</DetailRow>
            <DetailRow label="Module"><Badge tone="info">{f.module}</Badge></DetailRow>
            <DetailRow label="Category"><Badge tone="lavender">{f.category}</Badge></DetailRow>
            <DetailRow label="Requested By (Client)">{f.client}</DetailRow>
            <DetailRow label="Requested By (Person)">{f.requestedBy}</DetailRow>
            <DetailRow label="Request Date">{fmtDate(f.requestDate)}</DetailRow>
            <DetailRow label="Priority"><Badge tone={PRIO_TONE[f.priority]}>{f.priority}</Badge></DetailRow>
            <DetailRow label="Est. Development Time">{f.estDevTime}</DetailRow>
            <DetailRow label="Functional Consultant">{f.functionalConsultant}</DetailRow>
            <DetailRow label="Project Manager">{f.projectManager}</DetailRow>
            <DetailRow label="Developer Assigned">{f.developer}</DetailRow>
            <DetailRow label="Impact Score"><ImpactBar score={f.impactScore} /></DetailRow>
            <DetailRow label="Reusable">{f.reusable ? <Badge tone="success"><CheckCircle2 size={11} /> Yes</Badge> : <Badge tone="neutral">No</Badge>}</DetailRow>
          </div></div>
          <div className="card card-pad"><div className="t-sm fw-7 mb-1">Business Problem</div><div className="t-sm ink-2" style={{ lineHeight: 1.6 }}>{f.businessProblem}</div></div>
          <div className="card card-pad"><div className="t-sm fw-7 mb-1">Proposed Solution</div><div className="t-sm ink-2" style={{ lineHeight: 1.6 }}>{f.proposedSolution}</div></div>
        </div>
      )}

      {tab === 'business' && (
        <div className="flex-col gap-3">
          <div className="flex justify-end"><button className="btn btn-outline btn-sm" onClick={() => setForm('ba')}><PenLine size={13} /> {ba ? 'Edit' : 'Add'} Business Analysis</button></div>
          {ba ? (
            <div className="card"><div style={{ padding: 4 }}>
              <DetailRow label="Objective">{ba.objective}</DetailRow>
              <DetailRow label="Existing Workflow">{ba.existingWorkflow}</DetailRow>
              <DetailRow label="New Workflow">{ba.newWorkflow}</DetailRow>
              <DetailRow label="Benefits">{ba.benefits}</DetailRow>
              <DetailRow label="Functional Requirements">{ba.functionalReq}</DetailRow>
              <DetailRow label="Non-Functional Requirements">{ba.nonFunctionalReq}</DetailRow>
              <DetailRow label="Dependencies">{ba.dependencies}</DetailRow>
              <DetailRow label="Assumptions">{ba.assumptions}</DetailRow>
            </div></div>
          ) : <EmptyState title="Business analysis not documented yet" desc="Click “Add Business Analysis” to document it." />}
        </div>
      )}

      {tab === 'technical' && (
        <div className="flex-col gap-3">
          <div className="flex justify-end"><button className="btn btn-outline btn-sm" onClick={() => setForm('ta')}><PenLine size={13} /> {ta ? 'Edit' : 'Add'} Technical</button></div>
          {ta ? (
            <div className="card"><div style={{ padding: 4 }}>
              <DetailRow label="Database Changes">{ta.dbChanges}</DetailRow>
              <DetailRow label="Tables">{ta.tables}</DetailRow>
              <DetailRow label="Stored Procedures">{ta.storedProcs}</DetailRow>
              <DetailRow label="APIs">{ta.apis}</DetailRow>
              <DetailRow label="Background Jobs">{ta.backgroundJobs}</DetailRow>
              <DetailRow label="Reports">{ta.reports}</DetailRow>
              <DetailRow label="Mobile App Changes">{ta.mobileChanges}</DetailRow>
              <DetailRow label="Portal Changes">{ta.portalChanges}</DetailRow>
            </div></div>
          ) : <EmptyState title="Technical analysis not documented yet" desc="Click “Add Technical” to document it." />}
        </div>
      )}

      {tab === 'screens' && (screens.length ? (
        <div className="flex-col gap-2">
          {screens.map((s) => (
            <div key={s.id} className="card card-pad">
              <div className="flex items-center gap-2 mb-1"><Badge tone="peach">{s.module}</Badge><span className="fw-6 t-sm">{s.screen}</span></div>
              <div className="t-xs ink-3 mb-2">{s.menuPath}</div>
              <DetailRow label="Button Added">{s.buttonAdded}</DetailRow>
              <DetailRow label="Control">{s.control}</DetailRow>
              <DetailRow label="Validation">{s.validation}</DetailRow>
              <DetailRow label="User Rights">{s.userRights}</DetailRow>
            </div>
          ))}
        </div>
      ) : <EmptyState title="No screen changes recorded" />)}

      {tab === 'workflow' && (wf ? (
        <div className="flex-col gap-4">
          <div className="card card-pad">
            <div className="t-sm fw-7 mb-3">Business Workflow</div>
            <div className="flex-col gap-2">
              {wf.steps.map((s, i) => (
                <div key={i} className="flex items-center gap-3"><span className="metric-icon" style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--tint-sky)', color: 'var(--tint-sky-ink)', fontSize: 11, fontWeight: 800 }}>{i + 1}</span><span className="t-sm fw-5">{s}</span></div>
              ))}
            </div>
          </div>
          <div className="card card-pad"><div className="t-sm fw-7 mb-1">Decision Points</div><div className="t-sm ink-2">{wf.decisionPoints}</div></div>
          <div className="card card-pad"><div className="t-sm fw-7 mb-1">Alternate Flows</div><div className="t-sm ink-2">{wf.alternateFlows}</div></div>
          <div className="card card-pad"><div className="t-sm fw-7 mb-1">Exception Handling</div><div className="t-sm ink-2">{wf.exceptionHandling}</div></div>
        </div>
      ) : <EmptyState icon={<GitBranch size={24} />} title="Workflow not documented yet" />)}

      {tab === 'dev' && (
        <div className="flex-col gap-3">
          <div className="flex justify-end"><button className="btn btn-outline btn-sm" onClick={() => setForm('dev')}><PenLine size={13} /> {dev ? 'Edit' : 'Add'} Development</button></div>
          {dev ? (
            <div className="card"><div style={{ padding: 4 }}>
              <DetailRow label="Project">{dev.project}</DetailRow>
              <DetailRow label="Branch"><code style={{ fontSize: 11.5 }}>{dev.branch}</code></DetailRow>
              <DetailRow label="Developer">{dev.developer}</DetailRow>
              <DetailRow label="Start Date">{dev.startDate}</DetailRow>
              <DetailRow label="Completion Date">{dev.completionDate}</DetailRow>
              <DetailRow label="Code Location"><code style={{ fontSize: 11.5 }}>{dev.codeLocation}</code></DetailRow>
              <DetailRow label="Files Modified">{dev.filesModified}</DetailRow>
              <DetailRow label="Classes Modified">{dev.classesModified}</DetailRow>
              <DetailRow label="APIs Created">{dev.apisCreated}</DetailRow>
              <DetailRow label="SQL Scripts">{dev.sqlScripts}</DetailRow>
            </div></div>
          ) : <EmptyState icon={<Code2 size={24} />} title="Development details not captured yet" desc="Click “Add Development” to capture it." />}
        </div>
      )}

      {tab === 'testing' && (tests.length ? (
        <div className="flex-col gap-2">
          {tests.map((t) => (
            <div key={t.id} className="card card-pad">
              <div className="flex items-center justify-between gap-2 mb-1"><span className="fw-6 t-sm">{t.testCase}</span><Badge tone={UAT_TONE[t.uatStatus]}>{t.uatStatus}</Badge></div>
              <DetailRow label="Tester">{t.tester}</DetailRow>
              <DetailRow label="Bugs (fixed/found)">{t.bugFixes}/{t.bugs}</DetailRow>
              <DetailRow label="QA Approval"><Badge tone={UAT_TONE[t.qaApproval] || 'pending'}>{t.qaApproval}</Badge></DetailRow>
              <DetailRow label="Client UAT"><Badge tone={UAT_TONE[t.clientUat] || 'pending'}>{t.clientUat}</Badge></DetailRow>
            </div>
          ))}
        </div>
      ) : <EmptyState icon={<FlaskConical size={24} />} title="No test cases recorded" />)}

      {tab === 'impact' && (impact ? (
        <div className="flex-col gap-4">
          <div className="kpi-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <MetricCard label="Revenue Generated" value={fmtINR(impact.revenueGenerated, true)} tint="green" icon={<CircleDollarSign size={18} />} />
            <MetricCard label="Time Saved" value={impact.timeSaved} tint="cyan" icon={<TrendingUp size={18} />} />
          </div>
          <div className="card card-pad">
            <div className="t-sm fw-7 mb-2">Business Impact</div>
            <DetailRow label="Manual Work Reduced">{impact.manualWorkReduced}</DetailRow>
            <DetailRow label="Compliance">{impact.compliance}</DetailRow>
            <DetailRow label="Patient Experience">{impact.patientExperience}</DetailRow>
          </div>
          <div className="card card-pad">
            <div className="t-sm fw-7 mb-2">Technical Impact</div>
            <DetailRow label="Modules Affected">{impact.modulesAffected}</DetailRow>
            <DetailRow label="APIs Changed">{impact.apisChanged}</DetailRow>
            <DetailRow label="Reports Changed">{impact.reportsChanged}</DetailRow>
            <DetailRow label="Database Changes">{impact.dbChanges}</DetailRow>
          </div>
        </div>
      ) : <EmptyState icon={<TrendingUp size={24} />} title="Impact analysis pending" desc="Available once the feature is deployed." />)}

      {tab === 'adoption' && (adoption.length ? (
        <div className="flex-col gap-2">
          {adoption.map((a) => (
            <div key={a.id} className="flex items-center justify-between" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px' }}>
              <span className="flex items-center gap-2 fw-6 t-sm"><Building2 size={15} className="ink-3" /> {a.client}</span>
              <span className="flex items-center gap-3"><Badge tone="neutral">{a.version}</Badge><span className="t-xs ink-3">{a.goLive ? fmtDate(a.goLive) : 'Pending'}</span><Badge tone={ADOPT_TONE[a.status]}>{a.status}</Badge></span>
            </div>
          ))}
        </div>
      ) : <EmptyState icon={<Users size={24} />} title="Not adopted by any client yet" />)}

      {/* Fill / edit documentation blocks — bind to the feature via the store */}
      <FormDrawer key={`ba-${f.id}`} open={form === 'ba'} onClose={() => setForm(null)} title="Business Analysis" subtitle={f.name}
        submitLabel="Save" initial={ba || undefined}
        onSubmit={(v) => { setFeatureData(f.id, 'ba', v); toast.success('Business analysis saved', f.name); setForm(null); }}
        fields={[
          { name: 'objective', label: 'Objective', type: 'textarea', full: true, rows: 2 },
          { name: 'existingWorkflow', label: 'Existing Workflow', type: 'textarea', full: true, rows: 2 },
          { name: 'newWorkflow', label: 'New Workflow', type: 'textarea', full: true, rows: 2 },
          { name: 'benefits', label: 'Benefits', type: 'textarea', full: true, rows: 2 },
          { name: 'functionalReq', label: 'Functional Requirements', type: 'textarea', full: true, rows: 2 },
          { name: 'nonFunctionalReq', label: 'Non-Functional Requirements', type: 'textarea', full: true, rows: 2 },
          { name: 'dependencies', label: 'Dependencies', full: true },
          { name: 'assumptions', label: 'Assumptions', full: true },
        ]} />

      <FormDrawer key={`ta-${f.id}`} open={form === 'ta'} onClose={() => setForm(null)} title="Technical Analysis" subtitle={f.name}
        submitLabel="Save" initial={ta || undefined}
        onSubmit={(v) => { setFeatureData(f.id, 'ta', v); toast.success('Technical analysis saved', f.name); setForm(null); }}
        fields={[
          { name: 'dbChanges', label: 'Database Changes', type: 'textarea', full: true, rows: 2 },
          { name: 'tables', label: 'Tables', full: true },
          { name: 'storedProcs', label: 'Stored Procedures', full: true },
          { name: 'apis', label: 'APIs', full: true },
          { name: 'backgroundJobs', label: 'Background Jobs', full: true },
          { name: 'reports', label: 'Reports', full: true },
          { name: 'mobileChanges', label: 'Mobile App Changes', full: true },
          { name: 'portalChanges', label: 'Portal Changes', full: true },
        ]} />

      <FormDrawer key={`dev-${f.id}`} open={form === 'dev'} onClose={() => setForm(null)} title="Development Details" subtitle={f.name}
        submitLabel="Save" initial={dev || undefined}
        onSubmit={(v) => { setFeatureData(f.id, 'dev', v); toast.success('Development details saved', f.name); setForm(null); }}
        fields={[
          { name: 'project', label: 'Project', full: true },
          { name: 'branch', label: 'Branch' },
          { name: 'developer', label: 'Developer' },
          { name: 'startDate', label: 'Start Date', type: 'date' },
          { name: 'completionDate', label: 'Completion Date', type: 'date' },
          { name: 'codeLocation', label: 'Code Location', full: true },
          { name: 'filesModified', label: 'Files Modified', full: true },
          { name: 'classesModified', label: 'Classes Modified', full: true },
          { name: 'apisCreated', label: 'APIs Created', full: true },
          { name: 'sqlScripts', label: 'SQL Scripts', full: true },
        ]} />
    </Drawer>
  );
}

export default function AllFeatures() {
  const { data: kpis } = useApi(() => api.getSfrKpis());
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = useState('All');
  const [show, setShow] = useState(false);
  const [rows, setRows] = useState(getFeatures);
  useEffect(() => subscribeFeatures(setRows), []);
  const [detailId, setDetailId] = useState(null);
  const loading = false;

  const allRows = rows;
  const detail = useMemo(() => allRows.find((r) => r.id === detailId) || null, [allRows, detailId]);
  const statuses = ['All', ...FEATURE_STATUSES];
  const filtered = useMemo(() => allRows.filter((r) => status === 'All' || r.status === status), [allRows, status]);

  useEffect(() => {
    if (params.get('new') === '1') { setShow(true); params.delete('new'); setParams(params, { replace: true }); }
    const id = params.get('id');
    if (id && allRows.some((r) => r.id === id)) { setDetailId(id); params.delete('id'); setParams(params, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, allRows]);

  const advance = (id) => { const nx = advanceFeature(id); if (nx) toast.success('Feature advanced', nx); };

  const addFeature = (v) => {
    storeAddFeature({
      id: `FEA-${1001 + allRows.length}`, name: v.name, module: v.module, category: v.category, client: v.client,
      requestDate: '2026-07-28', priority: v.priority || 'Medium', estDevTime: v.estDevTime || '—', status: 'New Request',
      impactScore: 0, reusable: false, applicableTo: [], revenueGenerated: 0, devCost: 0, clientsUsing: 0, totalImpl: 0,
      supportTickets: 0, satisfaction: 0, roiScore: 0, adoptionRate: 0, functionalConsultant: v.functionalConsultant || '—',
      projectManager: v.projectManager || '—', developer: v.developer || 'TBD', requestedBy: v.requestedBy || '—',
      businessProblem: v.businessProblem || '', proposedSolution: v.proposedSolution || '',
    });
    toast.success('Feature registered', v.name);
    setShow(false);
  };

  const columns = [
    { key: 'name', header: 'Feature', minWidth: 220, render: (r) => <div><div className="fw-6 t-sm">{r.name}</div><div className="t-xs ink-3">{r.id} · {r.module}</div></div> },
    { key: 'client', header: 'Client', minWidth: 130 },
    { key: 'category', header: 'Category', render: (r) => <Badge tone="lavender">{r.category}</Badge> },
    { key: 'priority', header: 'Priority', render: (r) => <Badge tone={PRIO_TONE[r.priority]}>{r.priority}</Badge> },
    { key: 'impactScore', header: 'Impact', minWidth: 130, accessor: (r) => r.impactScore, render: (r) => r.impactScore ? <ImpactBar score={r.impactScore} /> : <span className="ink-3">—</span> },
    { key: 'reusable', header: 'Reusable', align: 'center', accessor: (r) => (r.reusable ? 1 : 0), render: (r) => r.reusable ? <Recycle size={15} color="var(--success)" /> : <span className="ink-3">—</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusChip status={r.status} /> },
    { key: 'action', header: 'Action', sortable: false, align: 'center', render: (r) => <button className="btn btn-outline btn-sm btn-icon" onClick={(e) => { e.stopPropagation(); setDetailId(r.id); }} title="View details"><Eye size={14} /></button> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Lightbulb size={22} />} tint="lavender" title="All Features" desc="Master register of every feature — click a row for the full 360° record (Modules 1-10)"
        crumbs={[{ label: 'Feature Intelligence' }, { label: 'All Features' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> Register Feature</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Total (all time)" value={kpis ? fmtNum(kpis.totalFeatures) : '—'} tint="lavender" icon={<Lightbulb size={19} />} footer={`${allRows.length} in view`} />
        <MetricCard label="Reusable" value={allRows.filter((r) => r.reusable).length} tint="green" icon={<Recycle size={19} />} footer="Publishable" />
        <MetricCard label="Deployed / Live" value={allRows.filter((r) => ['Deployed', 'Available for All'].includes(r.status)).length} tint="mint" icon={<Rocket size={19} />} footer="In production" />
        <MetricCard label="Revenue Generated" value={fmtINR(allRows.reduce((s, r) => s + r.revenueGenerated, 0), true)} tint="cyan" icon={<CircleDollarSign size={19} />} footer="From these features" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Status</span>{statuses.map((s) => <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{s}</Chip>)}</div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="features.csv" searchPlaceholder="Search features, clients, modules…" pageSize={15} onRowClick={(r) => setDetailId(r.id)} />

      <FormDrawer open={show} onClose={() => setShow(false)} title="Register Feature" subtitle="Register a new feature request (Module 1)"
        submitLabel="Register Feature" onSubmit={addFeature}
        fields={[
          { name: 'name', label: 'Feature Name', type: 'search', required: true, full: true,
            placeholder: 'Select a feature request…',
            options: allRows.filter((r) => ['New Request', 'Under Review', 'Approved'].includes(r.status)).map((r) => ({ value: r.name, label: `${r.name} — ${r.client}` })),
            onChange: (name) => { const src = allRows.find((r) => r.name === name); return src ? {
              module: src.module, category: src.category, client: src.client, requestedBy: src.requestedBy,
              priority: src.priority, estDevTime: src.estDevTime, functionalConsultant: src.functionalConsultant,
              projectManager: src.projectManager, developer: src.developer, businessProblem: src.businessProblem, proposedSolution: src.proposedSolution || '',
            } : null; } },
          { name: 'module', label: 'Module', type: 'select', required: true, options: FEATURE_MODULES },
          { name: 'category', label: 'Category', type: 'select', required: true, options: FEATURE_CATEGORIES },
          { name: 'client', label: 'Requested By (Client)', required: true, placeholder: 'Hospital name' },
          { name: 'requestedBy', label: 'Requested By (Person)', placeholder: 'Name / role' },
          { name: 'priority', label: 'Priority', type: 'select', default: 'Medium', options: PRIORITIES },
          { name: 'estDevTime', label: 'Est. Development Time', placeholder: 'e.g. 12 days' },
          { name: 'functionalConsultant', label: 'Functional Consultant' },
          { name: 'projectManager', label: 'Project Manager' },
          { name: 'developer', label: 'Developer Assigned' },
          { name: 'businessProblem', label: 'Business Problem', type: 'textarea', full: true, rows: 2 },
          { name: 'proposedSolution', label: 'Proposed Solution', type: 'textarea', full: true, rows: 2 },
        ]} />

      {detail && <FeatureDetail feature={detail} onClose={() => setDetailId(null)} onAdvance={() => advance(detail.id)} />}
    </div>
  );
}
