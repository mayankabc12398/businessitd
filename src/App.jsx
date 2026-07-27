import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import { ToastProvider, Skeleton } from './components/ui';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const Clients = lazy(() => import('./pages/Clients'));
const Kickoff = lazy(() => import('./pages/Kickoff'));
const Srs = lazy(() => import('./pages/Srs'));
const Requirements = lazy(() => import('./pages/Requirements'));
const MasterData = lazy(() => import('./pages/MasterData'));
const Development = lazy(() => import('./pages/Development'));
const Uat = lazy(() => import('./pages/Uat'));
const Training = lazy(() => import('./pages/Training'));
const GoLive = lazy(() => import('./pages/GoLive'));
const Issues = lazy(() => import('./pages/Issues'));
const Risks = lazy(() => import('./pages/Risks'));
const Signoff = lazy(() => import('./pages/Signoff'));
const Documents = lazy(() => import('./pages/Documents'));
const Reports = lazy(() => import('./pages/Reports'));
const Team = lazy(() => import('./pages/Team'));
const Masters = lazy(() => import('./pages/Masters'));

// Workspace 2 · Smart Integration Records (SIR)
const SirDashboard = lazy(() => import('./pages/integration/Dashboard'));
const AllIntegrations = lazy(() => import('./pages/integration/AllIntegrations'));
const IntegrationWorkflow = lazy(() => import('./pages/integration/Workflow'));
const ApiCatalogue = lazy(() => import('./pages/integration/ApiCatalogue'));
const Payloads = lazy(() => import('./pages/integration/Payloads'));
const HimsChanges = lazy(() => import('./pages/integration/HimsChanges'));
const SourceCode = lazy(() => import('./pages/integration/SourceCode'));
const ClientImplementations = lazy(() => import('./pages/integration/ClientImplementations'));
const IntegrationTesting = lazy(() => import('./pages/integration/Testing'));
const VersionHistory = lazy(() => import('./pages/integration/VersionHistory'));
const IntegrationDocuments = lazy(() => import('./pages/integration/Documents'));
const Reuse = lazy(() => import('./pages/integration/Reuse'));
const Vendors = lazy(() => import('./pages/integration/Vendors'));
const IntegrationReports = lazy(() => import('./pages/integration/Reports'));

// Workspace 3 · Feature Management & Revenue Generation
const GrowthDashboard = lazy(() => import('./pages/revenue/GrowthDashboard'));
const Features = lazy(() => import('./pages/revenue/Features'));
const Roadmap = lazy(() => import('./pages/revenue/Roadmap'));
const Plans = lazy(() => import('./pages/revenue/Plans'));
const RevenueStreams = lazy(() => import('./pages/revenue/RevenueStreams'));

function PageFallback() {
  return (
    <div className="flex-col gap-4">
      <Skeleton w={280} h={30} />
      <div className="kpi-grid">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} h={110} r={16} />)}
      </div>
      <Skeleton h={420} r={16} />
    </div>
  );
}

const page = (el) => <Suspense fallback={<PageFallback />}>{el}</Suspense>;

export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={page(<Dashboard />)} />
            <Route path="projects" element={page(<Projects />)} />
            <Route path="clients" element={page(<Clients />)} />
            <Route path="kickoff" element={page(<Kickoff />)} />
            <Route path="srs" element={page(<Srs />)} />
            <Route path="requirements" element={page(<Requirements />)} />
            <Route path="master-data" element={page(<MasterData />)} />
            <Route path="development" element={page(<Development />)} />
            <Route path="uat" element={page(<Uat />)} />
            <Route path="training" element={page(<Training />)} />
            <Route path="go-live" element={page(<GoLive />)} />
            <Route path="issues" element={page(<Issues />)} />
            <Route path="risks" element={page(<Risks />)} />
            <Route path="signoff" element={page(<Signoff />)} />
            <Route path="documents" element={page(<Documents />)} />
            <Route path="reports" element={page(<Reports />)} />
            <Route path="team" element={page(<Team />)} />
            <Route path="masters" element={page(<Masters />)} />

            {/* Smart Integration Records (SIR) workspace */}
            <Route path="integration" element={page(<SirDashboard />)} />
            <Route path="integration/all" element={page(<AllIntegrations />)} />
            <Route path="integration/workflow" element={page(<IntegrationWorkflow />)} />
            <Route path="integration/apis" element={page(<ApiCatalogue />)} />
            <Route path="integration/payloads" element={page(<Payloads />)} />
            <Route path="integration/hims-changes" element={page(<HimsChanges />)} />
            <Route path="integration/source-code" element={page(<SourceCode />)} />
            <Route path="integration/clients" element={page(<ClientImplementations />)} />
            <Route path="integration/testing" element={page(<IntegrationTesting />)} />
            <Route path="integration/versions" element={page(<VersionHistory />)} />
            <Route path="integration/documents" element={page(<IntegrationDocuments />)} />
            <Route path="integration/reuse" element={page(<Reuse />)} />
            <Route path="integration/vendors" element={page(<Vendors />)} />
            <Route path="integration/reports" element={page(<IntegrationReports />)} />

            {/* Feature Management & Revenue Generation workspace */}
            <Route path="revenue" element={page(<GrowthDashboard />)} />
            <Route path="revenue/features" element={page(<Features />)} />
            <Route path="revenue/roadmap" element={page(<Roadmap />)} />
            <Route path="revenue/plans" element={page(<Plans />)} />
            <Route path="revenue/streams" element={page(<RevenueStreams />)} />
          </Route>
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
}
