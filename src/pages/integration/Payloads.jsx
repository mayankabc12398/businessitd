// Module 4 · Payload Repository — request / response / error samples.
import { useState, useMemo } from 'react';
import { FileCode2, ArrowDownToLine, ArrowUpFromLine, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, Chip, Skeleton, EmptyState } from '../../components/ui';
import { CodeBlock } from './_shared';

export default function Payloads() {
  const { data: rows, loading } = useApi(() => api.getPayloads());
  const [integration, setIntegration] = useState('All');

  const allRows = useMemo(() => rows || [], [rows]);
  const options = useMemo(() => ['All', ...new Set(allRows.map((r) => r.integrationName))], [allRows]);
  const filtered = useMemo(() => allRows.filter((r) => integration === 'All' || r.integrationName === integration), [allRows, integration]);

  return (
    <div className="page">
      <PageHeader icon={<FileCode2 size={22} />} tint="lavender" title="Payloads & Responses" desc="Request, response and error payload samples for every API (Module 4)"
        crumbs={[{ label: 'Integration' }, { label: 'Payloads' }]} />

      <div className="kpi-grid stagger">
        <MetricCard label="Payload Samples" value={allRows.length} tint="lavender" icon={<FileCode2 size={19} />} footer="Stored request/response sets" />
        <MetricCard label="Request Samples" value={allRows.length} tint="cyan" icon={<ArrowUpFromLine size={19} />} footer="Outbound payloads" />
        <MetricCard label="Response Samples" value={allRows.length} tint="green" icon={<ArrowDownToLine size={19} />} footer="Success payloads" />
        <MetricCard label="Error Catalogues" value={allRows.length} tint="rose" icon={<AlertTriangle size={19} />} footer="Documented failure modes" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Integration</span>{options.map((o) => <Chip key={o} active={integration === o} onClick={() => setIntegration(o)}>{o}</Chip>)}</div>
      </div>

      {loading ? <Skeleton h={300} /> : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={<FileCode2 size={26} />} title="No payloads found" /></div>
      ) : (
        <div className="flex-col gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="card card-pad anim-fade-up">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div><div className="card-title">{p.apiName}</div><div className="card-sub">{p.integrationName} · {p.id}</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="payload-grid">
                <CodeBlock label="Request Payload">{p.request}</CodeBlock>
                <CodeBlock label="Response Payload">{p.response}</CodeBlock>
              </div>
              <div className="mt-3">
                <div className="t-xs fw-6 ink-3 mb-1" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>Error Responses</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {p.errors.split(' · ').map((e) => <span key={e} className="badge badge-danger">{e}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`@media (max-width:820px){ .payload-grid{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}
