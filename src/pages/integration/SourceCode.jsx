// Module 7 · Source Code Repository + Module 8 · Screen Repository.
import { useState } from 'react';
import { Code2, FileCode2, MonitorSmartphone, FolderTree } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, Tabs } from '../../components/ui';

export default function SourceCode() {
  const { data: code, loading: l1 } = useApi(() => api.getSourceCode());
  const { data: screens, loading: l2 } = useApi(() => api.getScreens());
  const [tab, setTab] = useState('code');

  const codeRows = code || [];
  const screenRows = screens || [];

  const codeCols = [
    { key: 'integrationName', header: 'Integration', minWidth: 170, render: (r) => <div><div className="fw-6 t-sm">{r.integrationName}</div><div className="t-xs ink-3">{r.id}</div></div> },
    { key: 'project', header: 'Project', render: (r) => <Badge tone="sky">{r.project}</Badge> },
    { key: 'layer', header: 'Layer', render: (r) => <Badge tone="neutral">{r.layer}</Badge> },
    { key: 'path', header: 'Location', minWidth: 260, sortable: false, render: (r) => <code style={{ background: 'var(--surface-3)', padding: '2px 7px', borderRadius: 6, fontSize: 11.5 }}>{r.folder} / {r.className}</code> },
    { key: 'methodName', header: 'Method', render: (r) => <code style={{ fontSize: 11.5 }}>{r.methodName}</code> },
    { key: 'apiServiceFile', header: 'Service File', render: (r) => <span className="t-sm ink-2">{r.apiServiceFile}</span> },
  ];

  const screenCols = [
    { key: 'screenName', header: 'Screen', minWidth: 160, render: (r) => <div><div className="fw-6 t-sm">{r.screenName}</div><div className="t-xs ink-3">{r.integrationName}</div></div> },
    { key: 'changedControls', header: 'Changed Controls', minWidth: 180, render: (r) => <span className="t-sm ink-2">{r.changedControls}</span> },
    { key: 'validation', header: 'Validation', minWidth: 160, render: (r) => <span className="t-sm ink-2">{r.validation}</span> },
    { key: 'buttons', header: 'Buttons', render: (r) => <span className="t-sm">{r.buttons}</span> },
    { key: 'dropdowns', header: 'Dropdowns', render: (r) => <span className="t-sm ink-2">{r.dropdowns}</span> },
    { key: 'newFields', header: 'New Fields', render: (r) => <span className="t-sm ink-2">{r.newFields}</span> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Code2 size={22} />} tint="sky" title="Source Code & Screens" desc="Locate integration code and screen changes instantly (Modules 7 & 8)"
        crumbs={[{ label: 'Integration' }, { label: 'Source Code' }]} />

      <div className="kpi-grid stagger">
        <MetricCard label="Code References" value={codeRows.length} tint="sky" icon={<FileCode2 size={19} />} footer="Classes & methods mapped" />
        <MetricCard label="Screens Documented" value={screenRows.length} tint="lavender" icon={<MonitorSmartphone size={19} />} footer="With controls & validation" />
        <MetricCard label="Projects" value={new Set(codeRows.map((r) => r.project)).size} tint="blue" icon={<FolderTree size={19} />} footer="Across the solution" />
        <MetricCard label="Integrations" value={new Set([...codeRows, ...screenRows].map((r) => r.integrationName)).size} tint="cyan" icon={<Code2 size={19} />} footer="With code mapped" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 0 }}>
        <Tabs tabs={[{ key: 'code', label: 'Code Repository', count: codeRows.length }, { key: 'screens', label: 'Screen Repository', count: screenRows.length }]} active={tab} onChange={setTab} />
      </div>

      {tab === 'code'
        ? <DataTable columns={codeCols} rows={codeRows} loading={l1} exportName="source-code.csv" searchPlaceholder="Search classes, methods, projects…" pageSize={15} />
        : <DataTable columns={screenCols} rows={screenRows} loading={l2} exportName="screens.csv" searchPlaceholder="Search screens, controls…" pageSize={15} />}
    </div>
  );
}
