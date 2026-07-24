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
          </Route>
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
}
