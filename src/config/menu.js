// Navigation config — three workspaces, each with its own sidebar menu.
// A workspace is chosen from the header switcher; the active one is derived
// from the current route prefix so deep links keep the right menu.
import {
  LayoutDashboard, FolderKanban, Building2, Handshake, FileSignature,
  GitPullRequestArrow, Database, Code2, FlaskConical,
  GraduationCap, Rocket, ShieldAlert, TriangleAlert, BadgeCheck,
  FolderOpen, BarChart3, Settings2, Users,
  Boxes, Workflow, Braces, FileCode2, Hospital, History, Recycle, Share2,
  Lightbulb, Map, Tags, CircleDollarSign, TrendingUp,
} from 'lucide-react';

// ── Workspace 1 · existing HIMS Implementation PMO ──────────────────────────
const PMO_MENU = [
  {
    group: 'Overview',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard, tint: 'indigo', end: true, desc: 'Portfolio-wide implementation overview' },
    ],
  },
  {
    group: 'Delivery',
    items: [
      { path: '/projects', label: 'Projects', icon: FolderKanban, tint: 'blue', desc: 'Registration, lifecycle & implementation tracking' },
      { path: '/clients', label: 'Clients & Hospitals', icon: Building2, tint: 'cyan', desc: 'Hospital groups, contacts & escalation matrix' },
      { path: '/kickoff', label: 'Scope & Kick-off', icon: Handshake, tint: 'sky', desc: 'PO, purchased scope & kick-off meetings' },
      { path: '/srs', label: 'SRS Management', icon: FileSignature, tint: 'mint', desc: 'Department-wise SRS planning & sign-off' },
      { path: '/requirements', label: 'Requirements & CR', icon: GitPullRequestArrow, tint: 'lavender', desc: 'Gap analysis & change-request register' },
      { path: '/master-data', label: 'Master Data', icon: Database, tint: 'lemon', desc: 'Request, receive, validate & import masters' },
    ],
  },
  {
    group: 'Build & Validate',
    items: [
      { path: '/development', label: 'Development & Config', icon: Code2, tint: 'peach', desc: 'Feature build, configuration & deployment' },
      { path: '/uat', label: 'Testing & UAT', icon: FlaskConical, tint: 'lavender', desc: 'Test cases, bug tracker & UAT sign-off' },
      { path: '/training', label: 'Training', icon: GraduationCap, tint: 'pink', desc: 'Department-wise training & attendance' },
      { path: '/go-live', label: 'Go-Live', icon: Rocket, tint: 'green', desc: 'Readiness, data migration & cutover' },
    ],
  },
  {
    group: 'Governance',
    items: [
      { path: '/issues', label: 'Issue Tracker', icon: ShieldAlert, tint: 'rose', badge: 'inbox', desc: 'Cross-project issues & resolution SLA' },
      { path: '/risks', label: 'Risk Register', icon: TriangleAlert, tint: 'orange', desc: 'Probability × impact heatmap & mitigation' },
      { path: '/signoff', label: 'Sign-off Center', icon: BadgeCheck, tint: 'mint', desc: 'Milestone digital sign-offs' },
      { path: '/documents', label: 'Documents', icon: FolderOpen, tint: 'blue', desc: 'PO, contracts, SRS, manuals & reports' },
    ],
  },
  {
    group: 'Insights & Admin',
    items: [
      { path: '/reports', label: 'Reports & Analytics', icon: BarChart3, tint: 'cyan', desc: 'One-click Excel & PDF status reports' },
      { path: '/team', label: 'Team & Roles', icon: Users, tint: 'indigo', desc: 'Consultants, workload & role management' },
      { path: '/masters', label: 'Masters & Settings', icon: Settings2, tint: 'sky', desc: 'Modules, lifecycle, countries & templates' },
    ],
  },
];

// ── Workspace 2 · Smart Integration Records (SIR) ───────────────────────────
const INTEGRATION_MENU = [
  {
    group: 'Overview',
    items: [
      { path: '/integration', label: 'Dashboard', icon: LayoutDashboard, tint: 'cyan', end: true, desc: 'Integration repository summary' },
    ],
  },
  {
    group: 'Integration Management',
    items: [
      { path: '/integration/all', label: 'All Integrations', icon: Boxes, tint: 'blue', desc: 'Master list, details & workflow' },
      { path: '/integration/workflow', label: 'Integration Workflow', icon: Workflow, tint: 'indigo', desc: '6-step integration lifecycle board' },
      { path: '/integration/apis', label: 'API Catalogue', icon: Braces, tint: 'mint', desc: 'Every documented API endpoint' },
      { path: '/integration/payloads', label: 'Payloads & Responses', icon: FileCode2, tint: 'lavender', desc: 'Request, response & error samples' },
      { path: '/integration/hims-changes', label: 'HIMS & DB Changes', icon: Database, tint: 'peach', desc: 'Screen, logic & database changes' },
      { path: '/integration/source-code', label: 'Source Code', icon: Code2, tint: 'sky', desc: 'Code & screen repository' },
    ],
  },
  {
    group: 'Delivery & Tracking',
    items: [
      { path: '/integration/clients', label: 'Client Implementations', icon: Hospital, tint: 'cyan', desc: 'Which hospital runs which integration' },
      { path: '/integration/testing', label: 'Testing & UAT', icon: FlaskConical, tint: 'rose', badge: 'inbox', desc: 'Test cases, results & bugs' },
      { path: '/integration/versions', label: 'Version History', icon: History, tint: 'orange', desc: 'Every change, every version' },
    ],
  },
  {
    group: 'Knowledge Base',
    items: [
      { path: '/integration/documents', label: 'Documents', icon: FolderOpen, tint: 'blue', desc: 'API PDFs, Swagger, BRD, Postman' },
      { path: '/integration/reuse', label: 'Reusable Repository', icon: Recycle, tint: 'green', desc: 'Find & reuse existing integrations' },
      { path: '/integration/vendors', label: 'Vendors & Partners', icon: Handshake, tint: 'lemon', desc: 'Integration vendors & contacts' },
      { path: '/integration/reports', label: 'Reports', icon: BarChart3, tint: 'indigo', desc: 'Repository analytics & exports' },
    ],
  },
];

// ── Workspace 3 · New Feature Management & Revenue Generation ────────────────
const REVENUE_MENU = [
  {
    group: 'Overview',
    items: [
      { path: '/revenue', label: 'Growth Dashboard', icon: LayoutDashboard, tint: 'green', end: true, desc: 'Revenue, MRR/ARR & feature pipeline' },
    ],
  },
  {
    group: 'Product',
    items: [
      { path: '/revenue/features', label: 'Feature Backlog', icon: Lightbulb, tint: 'lavender', desc: 'Ideas → shipped with revenue impact' },
      { path: '/revenue/roadmap', label: 'Roadmap', icon: Map, tint: 'blue', desc: 'Delivery pipeline by stage & quarter' },
    ],
  },
  {
    group: 'Monetization',
    items: [
      { path: '/revenue/plans', label: 'Plans & Pricing', icon: Tags, tint: 'mint', desc: 'Subscription tiers & add-on modules' },
      { path: '/revenue/streams', label: 'Revenue Streams', icon: CircleDollarSign, tint: 'green', desc: 'Recurring & one-time revenue sources' },
    ],
  },
];

export const WORKSPACES = [
  {
    id: 'pmo',
    name: 'HIMS Implementation',
    tag: 'Implementation PMO',
    icon: FolderKanban,
    tint: 'indigo',
    home: '/',
    prefixes: [],
    menu: PMO_MENU,
  },
  {
    id: 'integration',
    name: 'Smart Integration Records',
    tag: 'Integration Repository',
    icon: Share2,
    tint: 'cyan',
    home: '/integration',
    prefixes: ['/integration'],
    menu: INTEGRATION_MENU,
  },
  {
    id: 'revenue',
    name: 'Feature & Revenue',
    tag: 'Product & Growth',
    icon: TrendingUp,
    tint: 'green',
    home: '/revenue',
    prefixes: ['/revenue'],
    menu: REVENUE_MENU,
  },
];

// Which workspace owns a given route (default = PMO / existing).
export const activeWorkspace = (pathname = '/') =>
  WORKSPACES.find((w) => w.prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))) || WORKSPACES[0];

// Backward-compatible exports (PMO is the primary/legacy workspace).
export const MENU = PMO_MENU;

// Flat list across ALL workspaces — powers the global search.
export const FLAT_MENU = WORKSPACES.flatMap((w) => w.menu.flatMap((g) => g.items));
export const findMenu = (path) => FLAT_MENU.find((m) => m.path === path);
