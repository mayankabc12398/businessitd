// Module 3 · API Repository — every documented API endpoint.
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Braces, Plus, Lock, Globe, FlaskConical, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, StatusBadge, Chip, Select, Drawer, DetailRow, FormDrawer, useToast } from '../../components/ui';
import { INTEGRATIONS, HTTP_METHODS, AUTH_TYPES, PAYLOADS } from '../../data/integration';
import { getUserApis, addUserApi, subscribeUserApis } from '../../data/userApis';
import { INT_STATUS_TONE, MethodBadge, CodeBlock } from './_shared';

export default function ApiCatalogue() {
  const { data: rows, loading } = useApi(() => api.getApis());
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [method, setMethod] = useState('All');
  const [integration, setIntegration] = useState('All');
  const [show, setShow] = useState(false);
  const [detail, setDetail] = useState(null);
  const [extra, setExtra] = useState(getUserApis);
  useEffect(() => subscribeUserApis(setExtra), []);

  const allRows = useMemo(() => [...extra, ...(rows || [])], [extra, rows]);
  const methods = ['All', ...HTTP_METHODS];
  const integrationOpts = useMemo(() => ['All', ...Array.from(new Set(allRows.map((r) => r.integrationName))).sort()], [allRows]);
  const filtered = useMemo(
    () => allRows.filter((r) => (method === 'All' || r.method === method) && (integration === 'All' || r.integrationName === integration)),
    [allRows, method, integration],
  );

  useEffect(() => {
    if (params.get('new') === '1') { setShow(true); params.delete('new'); setParams(params, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const addApi = (v) => {
    const parent = INTEGRATIONS.find((i) => i.id === v.integrationId);
    addUserApi({
      id: `API-${2000 + allRows.length}`, integrationId: v.integrationId, integrationName: parent?.name || v.integrationId,
      name: v.name, purpose: v.purpose || '', method: v.method, url: v.url, sandboxUrl: v.sandboxUrl || '', liveUrl: v.liveUrl || '',
      authType: v.authType, headers: v.headers || '', status: 'In Development',
      requestPayload: v.requestPayload || '', successResponse: v.successResponse || '', errorResponse: v.errorResponse || '',
    });
    toast.success('API documented', `${v.method} ${v.name}`);
    setShow(false);
  };

  const columns = [
    { key: 'method', header: 'Method', render: (r) => <MethodBadge method={r.method} /> },
    { key: 'name', header: 'API', minWidth: 190, render: (r) => <div><div className="fw-6 t-sm">{r.name}</div><div className="t-xs ink-3">{r.purpose}</div></div> },
    { key: 'integrationName', header: 'Integration', minWidth: 160, render: (r) => <span className="t-sm">{r.integrationName}</span> },
    { key: 'url', header: 'Endpoint', minWidth: 240, sortable: false, render: (r) => <code style={{ background: 'var(--surface-3)', padding: '2px 7px', borderRadius: 6, fontSize: 11.5, wordBreak: 'break-all' }}>{r.url}</code> },
    { key: 'authType', header: 'Auth', render: (r) => <Badge tone="lavender"><Lock size={10} /> {r.authType}</Badge> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} tone={INT_STATUS_TONE[r.status]} /> },
    { key: 'action', header: '', width: 46, align: 'center', sortable: false, render: (r) => <button className="btn btn-icon btn-ghost btn-sm" title="View details" onClick={(e) => { e.stopPropagation(); setDetail(r); }}><Eye size={15} /></button> },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Braces size={22} />} tint="mint" title="API Catalogue" desc="Central repository of every API — method, URL, auth & headers (Module 3)"
        crumbs={[{ label: 'Integration' }, { label: 'API Catalogue' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> Add API</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Total APIs" value={allRows.length} tint="mint" icon={<Braces size={19} />} footer="Documented endpoints" />
        <MetricCard label="Live Endpoints" value={allRows.filter((r) => r.status === 'Active').length} tint="green" icon={<Globe size={19} />} footer="In production" />
        <MetricCard label="In Testing / Dev" value={allRows.filter((r) => r.status !== 'Active').length} tint="lemon" icon={<FlaskConical size={19} />} footer="Not yet live" />
        <MetricCard label="Integrations Covered" value={new Set(allRows.map((r) => r.integrationId)).size} tint="cyan" icon={<Lock size={19} />} footer="With documented APIs" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Method</span>{methods.map((m) => <Chip key={m} active={method === m} onClick={() => setMethod(m)}>{m}</Chip>)}</div>
          <div className="flex items-center gap-2" style={{ minWidth: 220 }}>
            <span className="t-sm fw-6 ink-2" style={{ whiteSpace: 'nowrap' }}>Integration</span>
            <Select value={integration} onChange={(e) => setIntegration(e.target.value)} options={integrationOpts} />
          </div>
        </div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading} exportName="api-catalogue.csv" searchPlaceholder="Search APIs, endpoints, integrations…" pageSize={15} onRowClick={setDetail} />

      <Drawer open={!!detail} onClose={() => setDetail(null)} size="md"
        title={detail?.name} subtitle={detail ? `${detail.id} · ${detail.integrationName}` : ''}
        headerExtra={detail && <StatusBadge status={detail.status} tone={INT_STATUS_TONE[detail.status]} />}>
        {detail && (
          <div className="flex-col gap-4">
            <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
              <div className="detail-list">
                <DetailRow label="Method"><MethodBadge method={detail.method} /></DetailRow>
                <DetailRow label="Purpose">{detail.purpose || '—'}</DetailRow>
                <DetailRow label="Integration">{detail.integrationName}</DetailRow>
                <DetailRow label="Endpoint URL"><code style={{ background: 'var(--surface-3)', padding: '2px 7px', borderRadius: 6, fontSize: 11.5, wordBreak: 'break-all' }}>{detail.url}</code></DetailRow>
                <DetailRow label="Sandbox Base URL">{detail.sandboxUrl || '—'}</DetailRow>
                <DetailRow label="Live Base URL">{detail.liveUrl || '—'}</DetailRow>
                <DetailRow label="Authentication"><Badge tone="lavender"><Lock size={10} /> {detail.authType}</Badge></DetailRow>
                <DetailRow label="Headers">{detail.headers || '—'}</DetailRow>
                <DetailRow label="Status"><StatusBadge status={detail.status} tone={INT_STATUS_TONE[detail.status]} /></DetailRow>
              </div>
            </div>
            {(() => {
              const pay = PAYLOADS.find((p) => p.apiId === detail.id);
              const request = detail.requestPayload || pay?.request;
              const success = detail.successResponse || pay?.response;
              const error = detail.errorResponse || pay?.errors;
              return (request || success || error) ? (
                <>
                  {request && <CodeBlock label="Request Payload">{request}</CodeBlock>}
                  {success && <CodeBlock label="Success Response">{success}</CodeBlock>}
                  {error && <CodeBlock label="Error Response">{error}</CodeBlock>}
                </>
              ) : (
                <div className="t-xs ink-3 text-center" style={{ padding: '10px', border: '1px dashed var(--border-strong)', borderRadius: 10 }}>No payload samples captured for this API.</div>
              );
            })()}
          </div>
        )}
      </Drawer>

      <FormDrawer open={show} onClose={() => setShow(false)} title="Add API" subtitle="Document an API endpoint (Module 3)"
        submitLabel="Save API" onSubmit={addApi}
        fields={[
          { name: 'integrationId', label: 'Integration', type: 'search', required: true, full: true, options: INTEGRATIONS.map((i) => ({ value: i.id, label: i.name })) },
          { name: 'name', label: 'API Name', required: true, placeholder: 'e.g. STK Push' },
          { name: 'method', label: 'HTTP Method', type: 'select', required: true, default: 'POST', options: HTTP_METHODS },
          { name: 'purpose', label: 'Purpose', full: true, placeholder: 'What this API does' },
          { name: 'url', label: 'Endpoint URL', required: true, full: true, placeholder: '/mpesa/stkpush/v1/processrequest' },
          { name: 'sandboxUrl', label: 'Sandbox Base URL', placeholder: 'https://sandbox…' },
          { name: 'liveUrl', label: 'Live Base URL', placeholder: 'https://api…' },
          { name: 'authType', label: 'Authentication', type: 'select', required: true, default: 'Bearer Token', options: AUTH_TYPES },
          { name: 'headers', label: 'Headers', full: true, placeholder: 'Authorization, Content-Type, Client-ID' },
          { name: 'requestPayload', label: 'Request Payload', type: 'textarea', full: true, rows: 5, placeholder: '{\n  "BusinessShortCode": 174379,\n  "Amount": 1,\n  "PhoneNumber": 2547XXXXXXXX\n}' },
          { name: 'successResponse', label: 'Success Response', type: 'textarea', full: true, rows: 5, placeholder: '{\n  "ResponseCode": "0",\n  "ResponseDescription": "Success. Request accepted for processing",\n  "CheckoutRequestID": "ws_CO_..."\n}' },
          { name: 'errorResponse', label: 'Error Response', type: 'textarea', full: true, rows: 4, placeholder: '{\n  "errorCode": "400.002.02",\n  "errorMessage": "Bad Request - Invalid PhoneNumber"\n}' },
        ]} />
    </div>
  );
}
