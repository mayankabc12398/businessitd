// Navigation config — groups, routes, lucide icons and per-module pastel tints.
import {
  LayoutDashboard, FolderKanban, Building2, Handshake, FileSignature,
  GitPullRequestArrow, Database, Code2, FlaskConical,
  GraduationCap, Rocket, ShieldAlert, TriangleAlert, BadgeCheck,
  FolderOpen, BarChart3, Settings2, Users,
} from 'lucide-react';

export const MENU = [
  {
    group: 'Overview',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard, tint: 'indigo', desc: 'Portfolio-wide implementation overview' },
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

export const FLAT_MENU = MENU.flatMap((g) => g.items);
export const findMenu = (path) => FLAT_MENU.find((m) => m.path === path);
