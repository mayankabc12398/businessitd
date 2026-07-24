// App shell — collapsible sidebar, glass header with global search,
// notifications, quick actions and profile menu.
import { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Bell, PanelLeftClose, PanelLeftOpen, Menu as MenuIcon, Plus,
  LogOut, User, Settings, HelpCircle, ChevronDown, Sparkles, CheckCheck,
  AlertTriangle, Info, ClipboardList, X, Activity, Sun, Moon,
} from 'lucide-react';
import { MENU, FLAT_MENU } from '../config/menu';
import { PROJECTS } from '../data/projects';
import { CLIENTS } from '../data/clients';
import { CURRENT_USER } from '../data/team';
import { NOTIFICATIONS } from '../data/misc';
import { Avatar, Badge } from '../components/ui';
import { useClickOutside, useDebounce } from '../hooks/useApi';

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
      projects: PROJECTS.filter((p) => p.name.toLowerCase().includes(n) || p.code.toLowerCase().includes(n)).slice(0, 4),
      clients: CLIENTS.filter((c) => c.name.toLowerCase().includes(n) || c.city.toLowerCase().includes(n)).slice(0, 3),
    };
  }, [dq]);

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
  const [items, setItems] = useState(NOTIFICATIONS);
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

function ProfilePop() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="flex items-center gap-2" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 10 }} onClick={() => setOpen((o) => !o)}>
        <Avatar name={CURRENT_USER.name} hue={0} size="md" ring />
        <span className="hide-mobile" style={{ textAlign: 'left' }}>
          <span className="t-base fw-7 ink-1" style={{ display: 'block', lineHeight: 1.2 }}>{CURRENT_USER.name}</span>
          <span className="t-xs ink-3">{CURRENT_USER.role}</span>
        </span>
        <ChevronDown size={14} className="hide-mobile" style={{ color: 'var(--text-3)' }} />
      </button>
      {open && (
        <div className="header-pop" style={{ width: 260 }}>
          <div className="flex items-center gap-3" style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
            <Avatar name={CURRENT_USER.name} hue={0} size="lg" />
            <div style={{ minWidth: 0 }}>
              <div className="fw-7 t-md truncate">{CURRENT_USER.name}</div>
              <div className="t-sm ink-3 truncate">{CURRENT_USER.email}</div>
              <Badge tone="primary">{CURRENT_USER.role}</Badge>
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
              <span className="brand-tag">PMO · Implementation Suite</span>
            </span>
          )}
          <button className="icon-btn hide-mobile" style={{ marginLeft: 'auto', display: mobileOpen ? 'inline-flex' : undefined }} onClick={() => setMobileOpen(false)}>
            {mobileOpen && <X size={16} />}
          </button>
        </div>
        <nav className="sidebar-nav">
          {MENU.map((g) => (
            <div key={g.group}>
              <div className="nav-group-label">{g.group}</div>
              {g.items.map((m) => (
                <NavLink key={m.path} to={m.path} end={m.path === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={collapsed ? m.label : undefined}>
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
