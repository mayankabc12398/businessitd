// Module 4 · Payload Repository — request / response / error samples.
import { useState, useMemo, useEffect } from 'react';
import { FileCode2, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Info } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, Chip, Badge, Skeleton, EmptyState } from '../../components/ui';
import { getUserApis, subscribeUserApis } from '../../data/userApis';
import { CodeBlock } from './_shared';

export default function Payloads() {
  const { data: rows, loading } = useApi(() => api.getPayloads());
  const { data: apis } = useApi(() => api.getApis());
  const [integration, setIntegration] = useState('All');
  const [userApis, setUserApis] = useState(getUserApis);
  useEffect(() => subscribeUserApis(setUserApis), []);

  // Purpose (summary) for each API — seeded catalogue + APIs added via "Add API".
  const purposeByApiId = useMemo(() => {
    const m = {};
    [...(apis || []), ...userApis].forEach((a) => { if (a.purpose) m[a.id] = a.purpose; });
    return m;
  }, [apis, userApis]);

  // APIs added via the Add API form that carry payload/response samples.
  const userCards = useMemo(() => userApis
    .filter((a) => a.requestPayload || a.successResponse || a.errorResponse)
    .map((a) => ({
      id: a.id, apiId: a.id, apiName: a.name, integrationName: a.integrationName, purpose: a.purpose,
      request: a.requestPayload, response: a.successResponse, errors: a.errorResponse, custom: true,
    })), [userApis]);

  const allRows = useMemo(
    () => [...userCards, ...(rows || [])].map((r) => ({ ...r, purpose: r.purpose || purposeByApiId[r.apiId] || '' })),
    [userCards, rows, purposeByApiId],
  );
  const options = useMemo(() => ['All', ...new Set(allRows.map((r) => r.integrationName))], [allRows]);
  const filtered = useMemo(() => allRows.filter((r) => integration === 'All' || r.integrationName === integration), [allRows, integration]);

  return (
    <div className="page">
      <PageHeader icon={<FileCode2 size={22} />} tint="lavender" title="Payloads & Responses" desc="Request, response and error payload samples for every API (Module 4)"
        crumbs={[{ label: 'Integration' }, { label: 'Payloads' }]} />

      <div className="kpi-grid stagger">
        <MetricCard label="Payload Samples" value={allRows.length} tint="lavender" icon={<FileCode2 size={19} />} footer="Stored request/response sets" />
        <MetricCard label="Request Samples" value={allRows.filter((r) => r.request).length} tint="cyan" icon={<ArrowUpFromLine size={19} />} footer="Outbound payloads" />
        <MetricCard label="Response Samples" value={allRows.filter((r) => r.response).length} tint="green" icon={<ArrowDownToLine size={19} />} footer="Success payloads" />
        <MetricCard label="Error Catalogues" value={allRows.filter((r) => r.errors).length} tint="rose" icon={<AlertTriangle size={19} />} footer="Documented failure modes" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Integration</span>{options.map((o) => <Chip key={o} active={integration === o} onClick={() => setIntegration(o)}>{o}</Chip>)}</div>
      </div>

      {loading ? <Skeleton h={300} /> : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={<FileCode2 size={26} />} title="No payloads found" /></div>
      ) : (
        <div className="flex-col gap-4">
          {filtered.map((p) => {
            const errIsBlock = p.errors && (p.errors.includes('{') || p.errors.includes('\n'));
            return (
            <div key={p.id} className="card card-pad anim-fade-up">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div><div className="card-title flex items-center gap-2">{p.apiName}{p.custom && <Badge tone="primary">New</Badge>}</div><div className="card-sub">{p.integrationName} · {p.id}</div></div>
              </div>
              {p.purpose && (
                <div className="flex items-start gap-2 mb-3 t-sm ink-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px' }}>
                  <Info size={15} style={{ color: 'var(--primary-600)', flexShrink: 0, marginTop: 1 }} />
                  <span><b className="ink-1">Summary:</b> {p.purpose}</span>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="payload-grid">
                <CodeBlock label="Request Payload">{p.request || '—'}</CodeBlock>
                <CodeBlock label="Response Payload">{p.response || '—'}</CodeBlock>
              </div>
              {p.errors && (
                <div className="mt-3">
                  <div className="t-xs fw-6 ink-3 mb-1" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>Error Responses</div>
                  {errIsBlock ? (
                    <CodeBlock label="">{p.errors}</CodeBlock>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.errors.split(' · ').map((e) => <span key={e} className="badge badge-danger">{e}</span>)}
                    </div>
                  )}
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
      <style>{`@media (max-width:820px){ .payload-grid{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}
