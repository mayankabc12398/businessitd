// Module 12 · Version History — every change, every version.
import { useState, useMemo } from 'react';
import { History as HistoryIcon, GitCommitVertical } from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { PageHeader, MetricCard, Badge, Chip, Skeleton, EmptyState } from '../../components/ui';
import { fmtDate } from '../../utils/format';

export default function VersionHistory() {
  const { data: rows, loading } = useApi(() => api.getVersionHistory());
  const [integration, setIntegration] = useState('All');

  const allRows = useMemo(() => rows || [], [rows]);
  const options = useMemo(() => ['All', ...new Set(allRows.map((r) => r.integrationName))], [allRows]);
  const filtered = useMemo(() =>
    [...allRows].filter((r) => integration === 'All' || r.integrationName === integration).sort((a, b) => b.date.localeCompare(a.date)),
  [allRows, integration]);

  return (
    <div className="page">
      <PageHeader icon={<HistoryIcon size={22} />} tint="orange" title="Version History" desc="Track every update to every integration (Module 12)"
        crumbs={[{ label: 'Integration' }, { label: 'Version History' }]} />

      <div className="kpi-grid stagger">
        <MetricCard label="Total Versions" value={allRows.length} tint="orange" icon={<GitCommitVertical size={19} />} footer="Logged changes" />
        <MetricCard label="Integrations Tracked" value={new Set(allRows.map((r) => r.integrationName)).size} tint="blue" icon={<HistoryIcon size={19} />} footer="With history" />
        <MetricCard label="Contributors" value={new Set(allRows.map((r) => r.modifiedBy)).size} tint="cyan" icon={<GitCommitVertical size={19} />} footer="Developers" />
        <MetricCard label="Latest Update" value={allRows.length ? fmtDate([...allRows].sort((a, b) => b.date.localeCompare(a.date))[0].date) : '—'} tint="mint" icon={<HistoryIcon size={19} />} footer="Most recent change" />
      </div>

      <div className="card card-pad" style={{ paddingBottom: 12 }}>
        <div className="flex items-center gap-2 flex-wrap"><span className="t-sm fw-6 ink-2" style={{ marginRight: 4 }}>Integration</span>{options.map((o) => <Chip key={o} active={integration === o} onClick={() => setIntegration(o)}>{o}</Chip>)}</div>
      </div>

      {loading ? <Skeleton h={280} /> : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={<HistoryIcon size={26} />} title="No version history" /></div>
      ) : (
        <div className="card card-pad">
          <div className="timeline">
            {filtered.map((v, i) => (
              <div key={v.id} className="timeline-item" style={{ animationDelay: `${i * 40}ms` }}>
                <span className="timeline-dot" style={{ background: 'var(--tint-orange-ink)' }} />
                <div className="timeline-title flex items-center gap-2 flex-wrap"><Badge tone="warning">{v.version}</Badge><b>{v.integrationName}</b></div>
                <div className="timeline-time">{fmtDate(v.date)} · {v.modifiedBy}</div>
                <div className="timeline-desc">{v.changes}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
