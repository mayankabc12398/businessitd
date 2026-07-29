// Risk Register — probability × impact heatmap and mitigation tracking.
import { useState, useMemo, Fragment } from 'react';
import { TriangleAlert, Plus, ShieldAlert, Activity } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { PageHeader, MetricCard, DataTable, Badge, StatusBadge, Chip, Skeleton, FormDrawer, useToast } from '../components/ui';
import { fmtDate } from '../utils/format';
import { RISK_TYPES } from '../data/masters';

const levelTone = { Critical: 'danger', High: 'warning', Medium: 'info', Low: 'neutral' };
const cellColor = (score) => score >= 16 ? 'var(--danger)' : score >= 10 ? 'var(--warning)' : score >= 5 ? 'var(--info)' : 'var(--success)';

export default function Risks() {
  const { data: rows, loading, reload } = useApi(() => api.getRisks());
  const { data: projects } = useApi(() => api.getProjects());
  const toast = useToast();
  const [levelF, setLevelF] = useState('All');
  const [show, setShow] = useState(false);

  const allRows = useMemo(() => rows || [], [rows]);
  const filtered = useMemo(() => allRows.filter((r) => levelF === 'All' || r.level === levelF), [allRows, levelF]);
  const open = allRows.filter((r) => r.status !== 'Closed');
  const high = open.filter((r) => ['High', 'Critical'].includes(r.level)).length;

  // build 5x5 heatmap counts (probability rows 5→1, impact cols 1→5)
  const heat = useMemo(() => {
    const grid = {};
    allRows.forEach((r) => { const k = `${r.probability}-${r.impact}`; grid[k] = (grid[k] || 0) + 1; });
    return grid;
  }, [allRows]);

  const addRisk = async (v) => {
    const prob = Number(v.probability); const impact = Number(v.impact); const score = prob * impact;
    const level = score >= 16 ? 'Critical' : score >= 10 ? 'High' : score >= 5 ? 'Medium' : 'Low';
    try {
      await api.createRisk({
        project: v.projectCode, title: v.title, riskType: v.category, level,
        probability: prob, impact, score, owner: v.owner, status: 'Open',
        mitigation: v.mitigation, target: v.target,
      });
      toast.success('Risk added', `${v.title} · ${level}`);
      setShow(false);
      reload();
    } catch (e) { toast.error('Could not save', e?.message || 'Request failed'); }
  };

  const columns = [
    { key: 'id', header: 'ID', width: 90, render: (r) => <span className="mono t-xs ink-3">{r.id}</span> },
    { key: 'title', header: 'Risk', minWidth: 260, render: (r) => <div><div className="fw-6 t-sm">{r.title}</div><div className="t-xs ink-3">{r.projectName} · {r.category}</div></div> },
    { key: 'prob', header: 'P', align: 'center', accessor: (r) => r.probability },
    { key: 'impact', header: 'I', align: 'center', accessor: (r) => r.impact },
    { key: 'score', header: 'Score', align: 'center', accessor: (r) => r.score, render: (r) => <span className="badge" style={{ background: cellColor(r.score), color: '#fff' }}>{r.score}</span> },
    { key: 'level', header: 'Level', render: (r) => <Badge tone={levelTone[r.level]}>{r.level}</Badge> },
    { key: 'owner', header: 'Owner' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'target', header: 'Target', accessor: (r) => r.target, nowrap: true, render: (r) => fmtDate(r.target) },
  ];

  return (
    <div className="page">
      <PageHeader icon={<TriangleAlert size={22} />} tint="orange" title="Risk Register" desc="Probability × impact scoring, heatmap and mitigation plans"
        crumbs={[{ label: 'Governance' }, { label: 'Risks' }]}
        actions={<button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={15} /> Add Risk</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Open Risks" value={open.length} tint="orange" icon={<TriangleAlert size={19} />} footer={`${(rows||[]).length} total`} />
        <MetricCard label="High / Critical" value={high} tint="rose" icon={<ShieldAlert size={19} />} footer="Priority mitigation" />
        <MetricCard label="Mitigating" value={(rows||[]).filter(r=>r.status==='Mitigating').length} tint="lemon" icon={<Activity size={19} />} footer="Active plans" />
        <MetricCard label="Closed" value={(rows||[]).filter(r=>r.status==='Closed').length} tint="green" icon={<ShieldAlert size={19} />} footer="Retired risks" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, alignItems: 'start' }} className="risk-two">
        <div className="card card-pad">
          <div className="card-title mb-1">Risk Heatmap</div>
          <div className="card-sub mb-3">Probability (rows) × Impact (cols)</div>
          {loading ? <Skeleton h={260} /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(5, 1fr)', gap: 4 }}>
              <div />
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="t-xs ink-3 text-center fw-6">{i}</div>)}
              {[5, 4, 3, 2, 1].map((p) => (
                <Fragment key={`p${p}`}>
                  <div className="t-xs ink-3 fw-6 flex items-center" style={{ justifyContent: 'flex-end', paddingRight: 4 }}>{p}</div>
                  {[1, 2, 3, 4, 5].map((im) => {
                    const score = p * im; const n = heat[`${p}-${im}`] || 0;
                    return <div key={`${p}-${im}`} title={`P${p} × I${im} = ${score}`} style={{ aspectRatio: '1', borderRadius: 8, background: cellColor(score), opacity: n ? 1 : 0.22, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}>{n || ''}</div>;
                  })}
                </Fragment>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 mt-3 flex-wrap t-xs">
            {[['Low', 'var(--success)'], ['Medium', 'var(--info)'], ['High', 'var(--warning)'], ['Critical', 'var(--danger)']].map(([l, c]) => <span key={l} className="flex items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: 3, background: c }} />{l}</span>)}
          </div>
        </div>

        <DataTable columns={columns} rows={filtered} loading={loading} exportName="risks.csv" searchPlaceholder="Search risks…" pageSize={10}
          toolbarLeft={<div className="flex items-center gap-2 flex-wrap">{['All', 'Critical', 'High', 'Medium', 'Low'].map((l) => <Chip key={l} active={levelF === l} onClick={() => setLevelF(l)}>{l}</Chip>)}</div>} />
      </div>

      <FormDrawer open={show} onClose={() => setShow(false)} title="Add Risk" subtitle="Score a risk on probability × impact"
        submitLabel="Add Risk" onSubmit={addRisk}
        fields={[
          { name: 'projectCode', label: 'Project', type: 'search', required: true, full: true, options: (projects || []).filter((p) => p.status !== 'Completed').map((p) => ({ value: p.code, label: p.name })) },
          { name: 'title', label: 'Risk', required: true, full: true, placeholder: 'Describe the risk…' },
          { name: 'category', label: 'Category', type: 'select', required: true, options: RISK_TYPES },
          { name: 'owner', label: 'Owner', type: 'select', required: true, options: ['Rahul Sharma', 'Priya Nair', 'Amit Verma', 'Karthik Rao', 'Sana Qureshi', 'Farhan Shaikh'] },
          { name: 'probability', label: 'Probability (1–5)', type: 'select', required: true, default: '3', options: ['1', '2', '3', '4', '5'] },
          { name: 'impact', label: 'Impact (1–5)', type: 'select', required: true, default: '3', options: ['1', '2', '3', '4', '5'] },
          { name: 'target', label: 'Target Date', type: 'date' },
          { name: 'mitigation', label: 'Mitigation Plan', type: 'textarea', full: true, rows: 3, placeholder: 'How will this be mitigated?' },
        ]} />
      <style>{`@media (max-width: 900px){ .risk-two{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}
