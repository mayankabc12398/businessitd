// Reports & Analytics — one-click Excel/PDF status reports + portfolio charts.
import {
  BarChart3, FileSpreadsheet, FileText, FolderKanban, FileSignature,
  Database, FlaskConical, GraduationCap, ShieldAlert, TriangleAlert, Rocket, GitPullRequestArrow,
} from 'lucide-react';
import { PageHeader, MetricCard, DonutChart, BarChart, Skeleton, useToast } from '../components/ui';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { exportCSV } from '../utils/format';
import { PROJECTS } from '../data/projects';
import { SRS_SCHEDULE, REQUIREMENTS } from '../data/srs';
import { MASTER_DATA } from '../data/masterdata';
import { UAT_CASES, TRAINING, GOLIVE_READINESS } from '../data/delivery';
import { ISSUES, RISKS, SIGNOFFS } from '../data/governance';

const REPORTS = [
  { key: 'status', title: 'Project Status Report', desc: 'Complete portfolio status with stage, health & progress', icon: FolderKanban, tint: 'blue',
    rows: PROJECTS, file: 'project-status.csv', cols: [
      { header: 'Code', accessor: 'code' }, { header: 'Project', accessor: 'name' }, { header: 'Status', accessor: 'status' },
      { header: 'Stage', accessor: 'currentStage' }, { header: 'Progress %', accessor: 'progress' }, { header: 'Health', accessor: 'health' },
      { header: 'Target Go-Live', accessor: 'targetGoLive' }, { header: 'Contract', accessor: 'contractValue' },
    ] },
  { key: 'srs', title: 'SRS Schedule Report', desc: 'Department-wise SRS plan, status & sign-off', icon: FileSignature, tint: 'mint',
    rows: SRS_SCHEDULE, file: 'srs-schedule.csv', cols: [
      { header: 'ID', accessor: 'id' }, { header: 'Project', accessor: 'projectName' }, { header: 'Department', accessor: 'dept' },
      { header: 'Consultant', accessor: 'consultant' }, { header: 'Planned', accessor: 'planned' }, { header: 'Status', accessor: 'status' }, { header: 'Sign-off', accessor: 'signoff' },
    ] },
  { key: 'master', title: 'Master Data Status', desc: 'Requested / received / imported per master', icon: Database, tint: 'lemon',
    rows: MASTER_DATA, file: 'master-data.csv', cols: [
      { header: 'Project', accessor: 'projectName' }, { header: 'Master', accessor: 'master' }, { header: 'Received', accessor: (r) => r.received ? 'Yes' : 'No' },
      { header: 'Imported', accessor: (r) => r.imported ? 'Yes' : 'No' }, { header: 'Records', accessor: 'records' }, { header: 'Validation', accessor: 'validation' },
    ] },
  { key: 'uat', title: 'UAT Status Report', desc: 'Module coverage, pass/fail & sign-off', icon: FlaskConical, tint: 'lavender',
    rows: UAT_CASES, file: 'uat-status.csv', cols: [
      { header: 'Project', accessor: 'projectName' }, { header: 'Module', accessor: 'module' }, { header: 'Total', accessor: 'total' },
      { header: 'Passed', accessor: 'passed' }, { header: 'Failed', accessor: 'failed' }, { header: 'Status', accessor: 'status' }, { header: 'Sign-off', accessor: 'signoff' },
    ] },
  { key: 'training', title: 'Training Tracker', desc: 'Department-wise sessions, attendance & feedback', icon: GraduationCap, tint: 'pink',
    rows: TRAINING, file: 'training.csv', cols: [
      { header: 'Project', accessor: 'projectName' }, { header: 'Department', accessor: 'dept' }, { header: 'Trainer', accessor: 'trainer' },
      { header: 'Date', accessor: 'date' }, { header: 'Attendance', accessor: 'attendance' }, { header: 'Status', accessor: 'status' },
    ] },
  { key: 'signoff', title: 'Sign-off Tracker', desc: 'Milestone digital sign-off log', icon: FileSignature, tint: 'green',
    rows: SIGNOFFS.filter((s) => s.status !== 'Not Reached'), file: 'signoffs.csv', cols: [
      { header: 'Project', accessor: 'projectName' }, { header: 'Milestone', accessor: 'milestone' }, { header: 'Status', accessor: 'status' },
      { header: 'Signed By', accessor: 'signedBy' }, { header: 'Method', accessor: 'method' }, { header: 'Date', accessor: 'date' },
    ] },
  { key: 'issues', title: 'Open Issues Report', desc: 'Cross-project issues with severity & SLA', icon: ShieldAlert, tint: 'rose',
    rows: ISSUES, file: 'issues.csv', cols: [
      { header: 'ID', accessor: 'id' }, { header: 'Project', accessor: 'projectName' }, { header: 'Issue', accessor: 'title' },
      { header: 'Severity', accessor: 'severity' }, { header: 'Status', accessor: 'status' }, { header: 'Assigned', accessor: 'assignedTo' },
    ] },
  { key: 'risks', title: 'Risk Register', desc: 'Probability × impact scoring & mitigation', icon: TriangleAlert, tint: 'orange',
    rows: RISKS, file: 'risks.csv', cols: [
      { header: 'ID', accessor: 'id' }, { header: 'Project', accessor: 'projectName' }, { header: 'Risk', accessor: 'title' },
      { header: 'Score', accessor: 'score' }, { header: 'Level', accessor: 'level' }, { header: 'Owner', accessor: 'owner' }, { header: 'Status', accessor: 'status' },
    ] },
  { key: 'golive', title: 'Go-Live Readiness', desc: 'Readiness % & checklist per project', icon: Rocket, tint: 'cyan',
    rows: GOLIVE_READINESS, file: 'go-live-readiness.csv', cols: [
      { header: 'Project', accessor: 'projectName' }, { header: 'Target Go-Live', accessor: 'targetGoLive' }, { header: 'Readiness %', accessor: 'readiness' }, { header: 'Status', accessor: 'status' },
    ] },
  { key: 'reqs', title: 'Requirements & CR', desc: 'Gap analysis and change-request register', icon: GitPullRequestArrow, tint: 'lavender',
    rows: REQUIREMENTS, file: 'requirements.csv', cols: [
      { header: 'ID', accessor: 'id' }, { header: 'Project', accessor: 'projectName' }, { header: 'Requirement', accessor: 'title' },
      { header: 'Type', accessor: 'type' }, { header: 'Priority', accessor: 'priority' }, { header: 'Status', accessor: 'status' }, { header: 'CR Value', accessor: 'crValue' },
    ] },
];

export default function Reports() {
  const toast = useToast();
  const { data: phase } = useApi(() => api.getPhaseDistribution());
  const { data: health } = useApi(() => api.getHealthMix());
  const { data: category } = useApi(() => api.getCategoryMix());

  const doExcel = (r) => { exportCSV(r.rows, r.cols, r.file); toast.success('Excel generated', `${r.title} · ${r.rows.length} rows`); };
  const doPdf = (r) => toast.info('Generating PDF…', r.title);

  return (
    <div className="page">
      <PageHeader icon={<BarChart3 size={22} />} tint="cyan" title="Reports & Analytics" desc="One-click structured Excel & PDF reports — preserving dates, owners, status & links"
        crumbs={[{ label: 'Insights' }, { label: 'Reports' }]} />

      <div className="kpi-grid stagger">
        <MetricCard label="Report Types" value={REPORTS.length} tint="cyan" icon={<FileSpreadsheet size={19} />} footer="One-click export" />
        <MetricCard label="Projects Covered" value={PROJECTS.length} tint="blue" icon={<FolderKanban size={19} />} footer="Full portfolio" />
        <MetricCard label="Data Rows" value={REPORTS.reduce((s, r) => s + r.rows.length, 0)} tint="mint" icon={<Database size={19} />} footer="Exportable records" />
        <MetricCard label="Formats" value="Excel · PDF" tint="lavender" icon={<FileText size={19} />} footer="Print-ready" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }} className="dashboard-three">
        <div className="card card-pad"><div className="card-title mb-1">Projects by Phase</div><div className="card-sub mb-4">Portfolio distribution</div>{phase ? <BarChart height={200} data={phase} series={[{ key: 'value', label: 'Projects' }]} showLegend={false} /> : <Skeleton h={200} />}</div>
        <div className="card card-pad"><div className="card-title mb-1">Health Mix</div><div className="card-sub mb-4">By status</div>{health ? <DonutChart data={health} centerLabel="PROJECTS" centerValue={PROJECTS.length} /> : <Skeleton h={200} />}</div>
        <div className="card card-pad"><div className="card-title mb-1">Deal Category</div><div className="card-sub mb-4">Segment split</div>{category ? <DonutChart data={category} centerLabel="DEALS" centerValue={PROJECTS.length} /> : <Skeleton h={200} />}</div>
      </div>

      <div className="section-title mt-2">One-click Reports</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }} className="stagger">
        {REPORTS.map((r) => (
          <div key={r.key} className="card card-pad card-hover">
            <div className="flex items-start gap-3 mb-3">
              <span className="metric-icon" style={{ background: `var(--tint-${r.tint})`, color: `var(--tint-${r.tint}-ink)` }}><r.icon size={19} /></span>
              <div style={{ minWidth: 0 }}><div className="fw-7 t-md">{r.title}</div><div className="t-sm ink-3">{r.rows.length} records</div></div>
            </div>
            <p className="t-sm ink-2" style={{ minHeight: 34 }}>{r.desc}</p>
            <div className="flex items-center gap-2 mt-3">
              <button className="btn btn-primary btn-sm flex-1" onClick={() => doExcel(r)}><FileSpreadsheet size={14} /> Excel</button>
              <button className="btn btn-outline btn-sm flex-1" onClick={() => doPdf(r)}><FileText size={14} /> PDF</button>
            </div>
          </div>
        ))}
      </div>
      <style>{`@media (max-width: 1100px){ .dashboard-three{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}
