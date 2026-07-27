// Module 10 · Testing — test cases, results & bug tracking.
import { useState, useMemo } from 'react';
import { FlaskConical, Plus, CheckCircle2, XCircle, Bug } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, StatusBadge, Chip, FormDrawer, useToast } from '../../components/ui';
import { fmtDate } from '../../utils/format';
import { INTEGRATIONS } from '../../data/integration';
import { INT_STATUS_TONE } from './_shared';

export default function Testing() {
  const { data: rows, loading } = useApi(() => api.getTestCases());
  const toast = useToast();
  const [result, setResult] = useState('All');
  const [show, setShow] = useState(false);
  const [extra, setExtra] = useState([]);

  const allRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const results = ['All', 'Pass', 'Fail', 'In Progress'];
  const filtered = useMemo(() => allRows.filter((r) => result === 'All' || r.result === result), [allRows, result]);
  const bugsOpen = allRows.reduce((s, r) => s + (r.bugFound - r.bugFixed), 0);

  const addTest = (v) => {
    const parent = INTEGRATIONS.find((i) => i.id === v.integrationId);
    setExtra((prev) => [{
      id: `TC-${String(allRows.length + 1).padStart(2, '0')}`, integrationId: v.integrationId, integrationName: parent?.name || v.integrationId,
      testCase: v.testCase, apiTested: v.apiTested || '', tester: v.tester || '—', testDate: v.testDate || '2026-07-27',
      result: v.result || 'In Progress', bugFound: Number(v.bugFound) || 0, bugFixed: Number(v.bugFixed) || 0,
    }, ...prev]);
    toast.success('Test case logged', v.testCase);
    setShow(false);
  };

  const columns = [
    { key: 'testCase', header: 'Test Case', minWidth: 220, render: (r) => <div><div className="fw-6 t-sm">{r.testCase}</div><div className="t-xs ink-3">{r.integrationName}</div></div> },
    { key: 'apiTested', header: 'API Tested', minWidth: 150 },
    { key: 'tester', header: 'Tester' },
    { key: 'testDate', header: 'Date', nowrap: true, accessor: (r) => r.testDate, render: (r) => fmtDate(r.testDate) },
    { key: 'bugFound', header: 'Bugs', align: 'center', accessor: (r) => r.bugFound, render: (r) => r.bugFound ? <Badge tone={r.bugFound > r.bugFixed ? 'danger' : 'success'}><Bug size={11} /> {r.bugFixed}/{r.bugFound}</Badge> : <span className="ink-3">—</span> },
    { key: 'result', header: 'Result', render: (r) => <StatusBadge status={r.result} tone={INT_STATUS_TONE[r.result]} /> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<FlaskConical size={22} />} tint="rose" title="Testing & UAT" desc="Test cases, results and bug tracking per integration (Module 10)"
        crumbs={[{ label: 'Integration' }, { label: 'Testing & UAT' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> Log Test Case</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Test Cases" value={allRows.length} tint="rose" icon={<FlaskConical size={19} />} footer="Executed & logged" />
        <MetricCard label="Passed" value={allRows.filter((r) => r.result === 'Pass').length} tint="green" icon={<CheckCircle2 size={19} />} footer="Cases passing" onClick={() => setResult('Pass')} />
        <MetricCard label="Failed / WIP" value={allRows.filter((r) => r.result !== 'Pass').length} tint="peach" icon={<XCircle size={19} />} footer="Need attention" onClick={() => setResult('Fail')} />
        <MetricCard label="Open Bugs" value={bugsOpen} tint="lemon" icon={<Bug size={19} />} footer="Found − fixed" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Result</span>{results.map((s) => <Chip key={s} active={result === s} onClick={() => setResult(s)}>{s}</Chip>)}</div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="testing.csv" searchPlaceholder="Search test cases, testers…" pageSize={15} />

      <FormDrawer open={show} onClose={() => setShow(false)} title="Log Test Case" subtitle="Record a test execution (Module 10)"
        submitLabel="Save Test" onSubmit={addTest}
        fields={[
          { name: 'integrationId', label: 'Integration', type: 'search', required: true, full: true, options: INTEGRATIONS.map((i) => ({ value: i.id, label: i.name })) },
          { name: 'testCase', label: 'Test Case', required: true, full: true, placeholder: 'e.g. Successful STK push & callback' },
          { name: 'apiTested', label: 'API Tested', placeholder: 'STK Push' },
          { name: 'tester', label: 'Tester', placeholder: 'Name' },
          { name: 'testDate', label: 'Test Date', type: 'date' },
          { name: 'result', label: 'Result', type: 'select', default: 'In Progress', options: ['Pass', 'Fail', 'In Progress'] },
          { name: 'bugFound', label: 'Bugs Found', type: 'number', placeholder: '0' },
          { name: 'bugFixed', label: 'Bugs Fixed', type: 'number', placeholder: '0' },
        ]} />
    </div>
  );
}
