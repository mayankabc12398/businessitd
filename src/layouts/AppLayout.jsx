// App shell — collapsible sidebar, glass header with global search,
// notifications, quick actions and profile menu.
import { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Bell, PanelLeftClose, PanelLeftOpen, Menu as MenuIcon, Plus,
  LogOut, User, Settings, HelpCircle, ChevronDown, Sparkles, CheckCheck,
  AlertTriangle, Info, ClipboardList, X, Activity, Sun, Moon, Check, LayoutGrid,
} from 'lucide-react';
import { WORKSPACES, activeWorkspace, FLAT_MENU } from '../config/menu';
import { api } from '../services/api';
import { Avatar, Badge } from '../components/ui';
import { useApi, useClickOutside, useDebounce } from '../hooks/useApi';

const NOTIF_ICON = {
  approval: <CheckCheck size={15} color="var(--success)" />,
  task: <ClipboardList size={15} color="var(--pending)" />,
  system: <Info size={15} color="var(--info)" />,
  alert: <AlertTriangle size={15} color="var(--danger)" />,
  info: <Info size={15} color="var(--info)" />,
};

function GlobalSearch() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const dq = useDebounce(q, 180);
  const ref = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { data: projects } = useApi(() => api.getProjects());
  const { data: clients } = useApi(() => api.getClients());
  useClickOutside(ref, () => setOpen(false));

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    if (!dq.trim()) return { pages: [], projects: [], clients: [] };
    const n = dq.toLowerCase();
    return {
      pages: FLAT_MENU.filter((m) => m.label.toLowerCase().includes(n) || m.desc.toLowerCase().includes(n)).slice(0, 3),
      projects: (projects || []).filter((p) => p.name.toLowerCase().includes(n) || p.code.toLowerCase().includes(n)).slice(0, 4),
      clients: (clients || []).filter((c) => c.name.toLowerCase().includes(n) || (c.city || '').toLowerCase().includes(n)).slice(0, 3),
    };
  }, [dq, projects, clients]);

  const hasResults = results.pages.length + results.projects.length + results.clients.length > 0;

  return (
    <div className="global-search" ref={ref}>
      <Search size={15} />
      <input
        ref={inputRef}
        className="gs-input"
        placeholder="Search projects, clients, modules…"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      <span className="kbd hide-mobile">Ctrl K</span>
      {open && dq.trim() && (
        <div className="gs-results">
          {!hasResults && <div className="t-sm ink-3 text-center" style={{ padding: 18 }}>No results for “{dq}”</div>}
          {results.projects.length > 0 && <div className="menu-label">Projects</div>}
          {results.projects.map((p) => (
            <button key={p.code} className="menu-item" onClick={() => { navigate(`/projects?code=${p.code}`); setOpen(false); setQ(''); }}>
              <span className="metric-icon" style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--tint-blue)', color: 'var(--tint-blue-ink)' }}>
                <ClipboardList size={14} />
              </span>
              <span>
                <span className="fw-6">{p.name}</span>
                <div className="t-xs ink-3">{p.code} · {p.status}</div>
              </span>
            </button>
          ))}
          {results.clients.length > 0 && <div className="menu-label">Clients</div>}
          {results.clients.map((c) => (
            <button key={c.id} className="menu-item" onClick={() => { navigate(`/clients?id=${c.id}`); setOpen(false); setQ(''); }}>
              <Avatar name={c.name} hue={3} size="sm" />
              <span>
                <span className="fw-6">{c.name}</span>
                <div className="t-xs ink-3">{c.city}, {c.country}</div>
              </span>
            </button>
          ))}
          {results.pages.length > 0 && <div className="menu-label">Modules</div>}
          {results.pages.map((m) => (
            <button key={m.path} className="menu-item" onClick={() => { navigate(m.path); setOpen(false); setQ(''); }}>
              <span className="metric-icon" style={{ width: 28, height: 28, borderRadius: 8, background: `var(--tint-${m.tint})`, color: `var(--tint-${m.tint}-ink)` }}>
                <m.icon size={14} />
              </span>
              <span>
                <span className="fw-6">{m.label}</span>
                <div className="t-xs ink-3">{m.desc}</div>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem('hims-theme');
    const isDark = saved === 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    setDark(isDark);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    localStorage.setItem('hims-theme', next ? 'dark' : 'light');
  };
  return (
    <button className="icon-btn" onClick={toggle} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function NotificationsPop() {
  const [open, setOpen] = useState(false);
  const { data: notifs } = useApi(() => api.getNotifications());
  const [items, setItems] = useState([]);
  useEffect(() => { setItems(notifs || []); }, [notifs]);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  const unread = items.filter((n) => n.unread).length;
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="icon-btn" onClick={() => setOpen((o) => !o)} title="Notifications">
        <Bell size={18} />
        {unread > 0 && <span className="notif-dot" />}
      </button>
      {open && (
        <div className="header-pop">
          <div className="flex items-center justify-between" style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <span className="fw-7 t-md">Notifications</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setItems((x) => x.map((n) => ({ ...n, unread: false })))}>
              Mark all read
            </button>
          </div>
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {items.map((n) => (
              <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`} onClick={() => setItems((x) => x.map((y) => (y.id === n.id ? { ...y, unread: false } : y)))}>
                <span className="metric-icon" style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--surface-3)' }}>
                  {NOTIF_ICON[n.type]}
                </span>
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <div className="t-base fw-6 ink-1">{n.title}</div>
                  <div className="t-sm ink-2" style={{ marginTop: 1 }}>{n.desc}</div>
                  <div className="t-xs ink-3 mt-1">{n.time}</div>
                </div>
                {n.unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', marginTop: 6, flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickActions() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  useClickOutside(ref, () => setOpen(false));
  const ACTIONS = [
    { label: 'New Project', to: '/projects?new=1', tint: 'blue' },
    { label: 'Add Client', to: '/clients?new=1', tint: 'cyan' },
    { label: 'Schedule SRS', to: '/srs?new=1', tint: 'mint' },
    { label: 'Raise Change Request', to: '/requirements?new=1', tint: 'lavender' },
    { label: 'Log an Issue', to: '/issues?new=1', tint: 'rose' },
    { label: 'Record Sign-off', to: '/signoff?new=1', tint: 'green' },
  ];
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="btn btn-primary btn-sm hide-mobile" onClick={() => setOpen((o) => !o)}>
        <Plus size={15} /> Quick Action <ChevronDown size={13} />
      </button>
      <button className="icon-btn hide-sm" style={{ display: 'none' }} onClick={() => setOpen((o) => !o)}><Plus size={18} /></button>
      {open && (
        <div className="header-pop" style={{ width: 250 }}>
          <div className="menu-label" style={{ padding: '10px 14px 4px' }}>Quick actions</div>
          <div style={{ padding: 6 }}>
            {ACTIONS.map((a) => (
              <button key={a.label} className="menu-item" onClick={() => { navigate(a.to); setOpen(false); }}>
                <span style={{ width: 8, height: 8, borderRadius: 3, background: `var(--tint-${a.tint}-ink)` }} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Workspace switcher — swaps the entire sidebar menu + page set. Lives in the
// header between search and quick actions. Active workspace is derived from the
// current route so deep links / refreshes stay in the right workspace.
function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const ws = activeWorkspace(location.pathname);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} style={{ position: 'relative' }} className="ws-switcher">
      <button className="ws-trigger" onClick={() => setOpen((o) => !o)} title="Switch workspace">
        <span className="metric-icon" style={{ width: 28, height: 28, borderRadius: 8, background: `var(--tint-${ws.tint})`, color: `var(--tint-${ws.tint}-ink)`, flexShrink: 0 }}>
          <ws.icon size={16} />
        </span>
        <span className="hide-mobile ws-trigger-text" style={{ textAlign: 'left', minWidth: 0, overflow: 'hidden' }}>
          <span className="t-sm fw-7 ink-1 truncate" style={{ display: 'block', lineHeight: 1.2 }}>{ws.name}</span>
          <span className="t-xs ink-3 truncate" style={{ display: 'block', lineHeight: 1.2 }}>{ws.tag}</span>
        </span>
        <ChevronDown size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
      </button>
      {open && (
        <div className="header-pop" style={{ width: 300, left: 0 }}>
          <div className="menu-label" style={{ padding: '10px 14px 4px', display: 'flex', alignItems: 'center', gap: 6 }}><LayoutGrid size={12} /> Workspaces</div>
          <div style={{ padding: 6 }}>
            {WORKSPACES.map((w) => {
              const active = w.id === ws.id;
              return (
                <button key={w.id} className={`menu-item ${active ? 'active' : ''}`} onClick={() => { navigate(w.home); setOpen(false); }}>
                  <span className="metric-icon" style={{ width: 32, height: 32, borderRadius: 9, background: `var(--tint-${w.tint})`, color: `var(--tint-${w.tint}-ink)`, flexShrink: 0 }}>
                    <w.icon size={16} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="fw-6 t-sm" style={{ display: 'block' }}>{w.name}</span>
                    <span className="t-xs ink-3">{w.tag}</span>
                  </span>
                  {active && <Check size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <style>{`
        .ws-trigger { display:flex; align-items:center; gap:9px; width:240px; max-width:240px; background:var(--surface-2); border:1px solid var(--border); border-radius:12px; padding:5px 10px 5px 6px; cursor:pointer; overflow:hidden; transition:border-color var(--dur) var(--ease), background var(--dur) var(--ease); }
        .ws-trigger:hover { border-color:var(--primary-soft); background:var(--surface-3); }
        .ws-trigger-text { flex:1 1 auto; min-width:0; overflow:hidden; }
        @media (max-width: 900px){ .ws-trigger { width:auto; max-width:none; padding:5px; } }
      `}</style>
    </div>
  );
}

function ProfilePop() {
  const [open, setOpen] = useState(false);
  const { data: user } = useApi(() => api.getCurrentUser());
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  const u = user || { name: '', role: '', email: '' };
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="flex items-center gap-2" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 10 }} onClick={() => setOpen((o) => !o)}>
        <Avatar name={u.name} hue={0} size="md" ring />
        <span className="hide-mobile" style={{ textAlign: 'left' }}>
          <span className="t-base fw-7 ink-1" style={{ display: 'block', lineHeight: 1.2 }}>{u.name}</span>
          <span className="t-xs ink-3">{u.role}</span>
        </span>
        <ChevronDown size={14} className="hide-mobile" style={{ color: 'var(--text-3)' }} />
      </button>
      {open && (
        <div className="header-pop" style={{ width: 260 }}>
          <div className="flex items-center gap-3" style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
            <Avatar name={u.name} hue={0} size="lg" />
            <div style={{ minWidth: 0 }}>
              <div className="fw-7 t-md truncate">{u.name}</div>
              <div className="t-sm ink-3 truncate">{u.email}</div>
              <Badge tone="primary">{u.role}</Badge>
            </div>
          </div>
          <div style={{ padding: 6 }}>
            <button className="menu-item"><User size={15} /> My Profile</button>
            <button className="menu-item"><Settings size={15} /> Preferences</button>
            <button className="menu-item"><HelpCircle size={15} /> Help & Support</button>
            <div className="menu-sep" />
            <button className="menu-item danger"><LogOut size={15} /> Sign out</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const contentRef = useRef(null);
  const ws = activeWorkspace(location.pathname);

  useEffect(() => {
    setMobileOpen(false);
    contentRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="app-shell">
      {mobileOpen && <div className="mobile-sidebar-overlay" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-logo"><Activity size={18} /></span>
          {!collapsed && (
            <span>
              <span className="brand-name" style={{ display: 'block' }}>Smart HIMS</span>
              <span className="brand-tag">{ws.tag}</span>
            </span>
          )}
          <button className="icon-btn hide-mobile" style={{ marginLeft: 'auto', display: mobileOpen ? 'inline-flex' : undefined }} onClick={() => setMobileOpen(false)}>
            {mobileOpen && <X size={16} />}
          </button>
        </div>
        <nav className="sidebar-nav">
          {ws.menu.map((g) => (
            <div key={g.group}>
              <div className="nav-group-label">{g.group}</div>
              {g.items.map((m) => (
                <NavLink key={m.path} to={m.path} end={m.end || m.path === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? m.label : undefined}>
                  <span className="nav-ico"><m.icon size={17} /></span>
                  <span className="nav-text">{m.label}</span>
                  {m.badge === 'inbox' && <span className="nav-badge">14</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="nav-item" style={{ cursor: 'default' }}>
            <span className="nav-ico"><Sparkles size={16} color="var(--primary)" /></span>
            {!collapsed && (
              <span className="nav-text">
                <span className="t-sm fw-6 ink-1" style={{ display: 'block' }}>HIMS Copilot</span>
                <span className="t-xs ink-3">AI project summary — soon</span>
              </span>
            )}
          </div>
        </div>
      </aside>

      <div className="main-col">
        <header className="app-header">
          <button className="icon-btn mobile-menu-btn" onClick={() => setMobileOpen(true)} style={{ display: 'var(--mobile-menu-display, none)' }}>
            <MenuIcon size={18} />
          </button>
          <button className="icon-btn hide-sm" onClick={() => setCollapsed((c) => !c)} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <GlobalSearch />
          <WorkspaceSwitcher />
          <div style={{ flex: 1 }} />
          <QuickActions />
          <ThemeToggle />
          <NotificationsPop />
          <div style={{ width: 1, height: 26, background: 'var(--border)' }} className="hide-mobile" />
          <ProfilePop />
        </header>
        <main className="app-content" ref={contentRef}>
          <Outlet />
        </main>
      </div>
      <style>{`@media (max-width: 900px) { .mobile-menu-btn { display: inline-flex !important; } }`}</style>
    </div>
  );
}
