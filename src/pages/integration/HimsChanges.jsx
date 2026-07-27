// Module 5 · HIMS Changes + Module 6 · Database Changes.
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Database, Plus, Code2, TableProperties } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, Tabs, FormDrawer, useToast } from '../../components/ui';
import { INTEGRATIONS } from '../../data/integration';
import { HOSPITAL_DEPTS } from '../../data/masters';
import { CodeBlock } from './_shared';

export default function HimsChanges() {
  const { data: hims, loading: l1 } = useApi(() => api.getHimsChanges());
  const { data: db, loading: l2 } = useApi(() => api.getDbChanges());
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState('screens');
  const [show, setShow] = useState(false);
  const [extra, setExtra] = useState([]);

  const himsRows = useMemo(() => [...extra, ...(hims || [])], [extra, hims]);

  useEffect(() => {
    if (params.get('new') === '1') { setShow(true); params.delete('new'); setParams(params, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const addChange = (v) => {
    const parent = INTEGRATIONS.find((i) => i.id === v.integrationId);
    setExtra((prev) => [{
      id: `HC-${String(himsRows.length + 1).padStart(2, '0')}`, integrationId: v.integrationId, integrationName: parent?.name || v.integrationId,
      module: v.module, screen: v.screen, screenPath: v.screenPath || '', control: v.control || '', button: v.button || '',
      storedProc: v.storedProc || '', apiCalled: v.apiCalled || '', tableChanged: v.tableChanged || '', logic: v.logic || '',
    }, ...prev]);
    toast.success('HIMS change recorded', `${v.module} · ${v.screen}`);
    setShow(false);
  };

  const himsCols = [
    { key: 'module', header: 'Module', render: (r) => <Badge tone="peach">{r.module}</Badge> },
    { key: 'screen', header: 'Screen', minWidth: 170, render: (r) => <div><div className="fw-6 t-sm">{r.screen}</div><div className="t-xs ink-3">{r.screenPath}</div></div> },
    { key: 'integrationName', header: 'Integration', minWidth: 160 },
    { key: 'button', header: 'Button / Control', render: (r) => <div className="t-sm">{r.button}<div className="t-xs ink-3">{r.control}</div></div> },
    { key: 'storedProc', header: 'Stored Proc', render: (r) => <code style={{ fontSize: 11.5 }}>{r.storedProc}</code> },
    { key: 'apiCalled', header: 'API Called', render: (r) => <span className="t-sm">{r.apiCalled}</span> },
    { key: 'tableChanged', header: 'Tables', render: (r) => <span className="t-xs ink-2">{r.tableChanged}</span> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Database size={22} />} tint="peach" title="HIMS & Database Changes" desc="Every screen, logic and database change made for an integration (Modules 5 & 6)"
        crumbs={[{ label: 'Integration' }, { label: 'HIMS & DB Changes' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> Add HIMS Change</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="HIMS Changes" value={himsRows.length} tint="peach" icon={<Code2 size={19} />} footer="Screen & logic changes" />
        <MetricCard label="Database Changes" value={(db || []).length} tint="lemon" icon={<TableProperties size={19} />} footer="Tables, SPs, triggers" />
        <MetricCard label="Modules Touched" value={new Set(himsRows.map((r) => r.module)).size} tint="blue" icon={<Database size={19} />} footer="HIMS modules affected" />
        <MetricCard label="Integrations" value={new Set(himsRows.map((r) => r.integrationId)).size} tint="cyan" icon={<Code2 size={19} />} footer="With documented changes" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 0 }}>
        <Tabs tabs={[{ key: 'screens', label: 'Screen & Logic Changes', count: himsRows.length }, { key: 'db', label: 'Database Changes', count: (db || []).length }]} active={tab} onChange={setTab} />
      </div>

      {tab === 'screens' && (
        <DataTable columns={himsCols} rows={himsRows} loading={l1} exportName="hims-changes.csv" searchPlaceholder="Search screens, modules, SPs…" pageSize={15} />
      )}

      {tab === 'db' && (
        l2 ? null : (
          <div className="flex-col gap-3">
            {(db || []).map((d) => (
              <div key={d.id} className="card card-pad anim-fade-up">
                <div className="flex items-center gap-2 mb-2"><Badge tone="lemon">{d.tableName}</Badge><span className="fw-6 t-sm">{d.integrationName}</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="db-grid">
                  <div><div className="t-xs ink-3 fw-6 mb-1">New Columns</div><div className="t-sm ink-2">{d.newColumns}</div></div>
                  <div><div className="t-xs ink-3 fw-6 mb-1">New Stored Procedures</div><div className="t-sm ink-2">{d.newSP}</div></div>
                  <div><div className="t-xs ink-3 fw-6 mb-1">Modified SP</div><div className="t-sm ink-2">{d.modifiedSP}</div></div>
                  <div><div className="t-xs ink-3 fw-6 mb-1">Trigger / Scheduler</div><div className="t-sm ink-2">{d.trigger} · {d.scheduler}</div></div>
                </div>
                <div className="mt-3"><CodeBlock label="Alter Script">{d.alterScript}</CodeBlock></div>
              </div>
            ))}
          </div>
        )
      )}

      <FormDrawer open={show} onClose={() => setShow(false)} title="Record HIMS Change" subtitle="Document a screen / logic change (Module 5)"
        submitLabel="Save Change" onSubmit={addChange}
        fields={[
          { name: 'integrationId', label: 'Integration', type: 'search', required: true, full: true, options: INTEGRATIONS.map((i) => ({ value: i.id, label: i.name })) },
          { name: 'module', label: 'Module', type: 'select', required: true, options: ['Billing', 'Registration', 'Radiology', 'Laboratory', 'Pharmacy', 'IPD', 'OPD', 'Insurance', ...HOSPITAL_DEPTS].filter((v, i, a) => a.indexOf(v) === i) },
          { name: 'screen', label: 'Screen Name', required: true, placeholder: 'e.g. Payment Screen' },
          { name: 'screenPath', label: 'Screen Path', full: true, placeholder: 'Billing > Payments > Collect' },
          { name: 'control', label: 'Control Name', placeholder: 'e.g. Payment Mode dropdown' },
          { name: 'button', label: 'Button Name', placeholder: 'e.g. Pay with M-Pesa' },
          { name: 'storedProc', label: 'Stored Procedure', placeholder: 'usp_CreatePayment' },
          { name: 'apiCalled', label: 'API Called', placeholder: 'STK Push' },
          { name: 'tableChanged', label: 'Tables Changed', full: true, placeholder: 'PaymentTransaction, MpesaLog' },
          { name: 'logic', label: 'Logic Description', type: 'textarea', full: true, rows: 3 },
        ]} />
    </div>
  );
}
