// Hospital Users & Access — department-wise HIMS user roster with a filter
// bar (search + dropdowns) driving a full-column table, plus full CRUD.
import { useState, useMemo, useEffect } from 'react';
import {
  Contact, Users, Building2, ShieldCheck, BadgeCheck, RotateCcw,
  Plus, PenLine, Trash2, Mail, Phone,
} from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import {
  PageHeader, MetricCard, DataTable, Badge, Field,
  Drawer, DetailRow, FormDrawer, ConfirmDialog, useToast,
} from '../components/ui';
import {
  USER_DEPARTMENTS, USER_TYPES, USER_MODULES,
} from '../data/users';

const typeTone = (t = '') => {
  const s = t.toLowerCase();
  if (s.includes('hod')) return 'warning';
  if (s.includes('manager')) return 'success';
  if (s.includes('super')) return 'info';
  return 'neutral';
};

const EMPTY = [];
const BLANK = { q: '', department: 'All', userType: 'All', modules: 'All' };

export default function HospitalUsers() {
  const { data: rows, loading } = useApi(() => api.getHospitalUsers());
  const toast = useToast();

  // local editable copy — seeded from the API once, then CRUD mutates it
  const [items, setItems] = useState(null);
  useEffect(() => { if (rows && items === null) setItems(rows); }, [rows, items]);
  const list = items || EMPTY;

  const [f, setF] = useState(BLANK);
  const [formOpen, setFormOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [delRow, setDelRow] = useState(null);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const filtered = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return list.filter((r) =>
      (!q || `${r.employee} ${r.email} ${r.designation}`.toLowerCase().includes(q)) &&
      (f.department === 'All' || r.department === f.department) &&
      (f.userType === 'All' || r.userType === f.userType) &&
      (f.modules === 'All' || r.modules === f.modules)
    );
  }, [list, f]);

  const kpis = useMemo(() => ({
    total: list.length,
    departments: new Set(list.map((r) => r.department)).size,
    superUsers: list.filter((r) => /super user/i.test(r.userType)).length,
    hods: list.filter((r) => /hod/i.test(r.userType)).length,
  }), [list]);

  const dirty = JSON.stringify(f) !== JSON.stringify(BLANK);
  const viewRow = useMemo(() => list.find((r) => r.id === viewId) || null, [list, viewId]);

  // ---- CRUD ----
  const openAdd = () => { setEditRow(null); setFormOpen(true); };
  const openEdit = (row) => { setEditRow(row); setFormOpen(true); };

  const normalize = (v) => ({
    department: v.department, employee: v.employee.trim(), designation: v.designation.trim(),
    userType: v.userType || '', email: v.email.trim(), mobile: v.mobile.trim(), modules: v.modules || '',
  });

  const submitForm = async (v) => {
    const data = normalize(v);
    if (editRow) {
      setItems((prev) => prev.map((r) => (r.id === editRow.id ? { ...r, ...data } : r)));
      toast.success('User updated', data.employee);
      setFormOpen(false); setEditRow(null);
      return;
    }
    const nextSr = list.reduce((m, r) => Math.max(m, r.srNo || 0), 0) + 1;
    try {
      await api.createHospitalUser({
        srNo: nextSr, department: data.department, employee: data.employee, designation: data.designation,
        userType: data.userType, email: data.email, mobile: data.mobile, modules: data.modules,
      });
      const nextNum = list.reduce((m, r) => Math.max(m, +String(r.id).split('-')[1] || 0), 0) + 1;
      setItems((prev) => [...prev, { id: `USR-${String(nextNum).padStart(3, '0')}`, srNo: nextSr, ...data }]);
      toast.success('User added', data.employee);
      setFormOpen(false); setEditRow(null);
    } catch (e) {
      toast.error('Could not save', e?.message || 'Request failed');
    }
  };

  const confirmDelete = () => {
    if (!delRow) return;
    setItems((prev) => prev.filter((r) => r.id !== delRow.id));
    toast.success('User deleted', delRow.employee);
    if (viewId === delRow.id) setViewId(null);
    setDelRow(null);
  };

  const columns = [
    { key: 'srNo', header: 'Sr. No.', width: 70, align: 'right', render: (r) => <span className="tabular ink-3">{r.srNo}</span> },
    { key: 'department', header: 'Department', minWidth: 170, render: (r) => <span className="fw-6 t-sm">{r.department}</span> },
    { key: 'employee', header: 'Employee Name', minWidth: 180 },
    { key: 'designation', header: 'Designation', minWidth: 150 },
    { key: 'userType', header: 'User Type', render: (r) => r.userType ? <Badge tone={typeTone(r.userType)}>{r.userType}</Badge> : <span className="ink-3">—</span> },
    { key: 'email', header: 'Email ID', minWidth: 210, render: (r) => r.email ? <a href={`mailto:${r.email}`} className="t-sm" style={{ color: 'var(--primary-700)' }} onClick={(e) => e.stopPropagation()}>{r.email}</a> : <span className="ink-3">—</span> },
    { key: 'mobile', header: 'Mobile', nowrap: true, render: (r) => r.mobile ? <span className="mono t-sm">{r.mobile}</span> : <span className="ink-3">—</span> },
    { key: 'modules', header: 'Modules Belongs To', render: (r) => r.modules ? <Badge tone="neutral">{r.modules}</Badge> : <span className="ink-3">—</span> },
    { key: '_act', header: '', sortable: false, width: 84, render: (r) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn" style={{ width: 28, height: 28 }} title="Edit" onClick={() => openEdit(r)}><PenLine size={13} /></button>
        <button className="icon-btn" style={{ width: 28, height: 28 }} title="Delete" onClick={() => setDelRow(r)}><Trash2 size={13} /></button>
      </div>
    ) },
  ];

  const formFields = [
    { name: 'employee', label: 'Employee Name', required: true, placeholder: 'e.g. NAYIGA RUTH' },
    { name: 'department', label: 'Department', type: 'select', required: true, default: USER_DEPARTMENTS[0], options: USER_DEPARTMENTS },
    { name: 'designation', label: 'Designation', required: true, placeholder: 'e.g. INCHARGE' },
    { name: 'userType', label: 'User Type', type: 'select', options: USER_TYPES, placeholder: '— None —' },
    { name: 'email', label: 'Email ID', required: true, full: true, placeholder: 'name@mengohospital.org' },
    { name: 'mobile', label: 'Mobile', placeholder: '7xxxxxxxx' },
    { name: 'modules', label: 'Modules Belongs To', type: 'select', options: USER_MODULES, placeholder: '— None —' },
  ];

  return (
    <div className="page">
      <PageHeader icon={<Contact size={22} />} tint="cyan" title="Department Contacts"
        desc="Department-wise HIMS user roster — designation, access type & modules"
        crumbs={[{ label: 'Overview' }, { label: 'Department Contacts' }]}
        actions={<button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add User</button>} />

      <div className="kpi-grid stagger">
        <MetricCard label="Total Users" value={kpis.total} tint="cyan" icon={<Users size={19} />} footer="Across all departments" />
        <MetricCard label="Departments" value={kpis.departments} tint="indigo" icon={<Building2 size={19} />} footer="Distinct units" />
        <MetricCard label="Super Users" value={kpis.superUsers} tint="green" icon={<ShieldCheck size={19} />} footer="Elevated access" />
        <MetricCard label="HODs" value={kpis.hods} tint="peach" icon={<BadgeCheck size={19} />} footer="Head of department" />
      </div>

      {/* Filter bar — search input + dropdowns */}
      <div className="card card-pad">
        <div className="filter-grid">
          <Field label="Search">
            <input className="input" value={f.q} onChange={set('q')} placeholder="Name, email or designation…" />
          </Field>
          <Field label="Department">
            <select className="select" value={f.department} onChange={set('department')}>
              <option value="All">All Departments</option>
              {USER_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="User Type">
            <select className="select" value={f.userType} onChange={set('userType')}>
              <option value="All">All Types</option>
              {USER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Modules">
            <select className="select" value={f.modules} onChange={set('modules')}>
              <option value="All">All Modules</option>
              {USER_MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <div className="flex items-end">
            <button className="btn btn-outline w-full" disabled={!dirty} onClick={() => setF(BLANK)}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
      </div>

      <DataTable columns={columns} rows={filtered} loading={loading || items === null} searchable={false}
        onRowClick={(r) => setViewId(r.id)}
        exportName="hospital-users.csv" pageSize={20}
        emptyTitle="No users match" emptyDesc="Adjust the filters or clear the search." />

      {/* Read — detail drawer */}
      <Drawer open={!!viewRow} onClose={() => setViewId(null)} size="md"
        title={viewRow ? viewRow.employee : ''} subtitle={viewRow ? `${viewRow.id} · ${viewRow.department}` : ''}
        headerExtra={viewRow?.userType && <Badge tone={typeTone(viewRow.userType)}>{viewRow.userType}</Badge>}
        footer={viewRow && <>
          <button className="btn btn-ghost" onClick={() => setDelRow(viewRow)}><Trash2 size={14} /> Delete</button>
          <button className="btn btn-primary" onClick={() => { openEdit(viewRow); setViewId(null); }}><PenLine size={14} /> Edit</button>
        </>}>
        {viewRow && (
          <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
            <div className="detail-list">
              <DetailRow label="Sr. No.">{viewRow.srNo}</DetailRow>
              <DetailRow label="Department">{viewRow.department}</DetailRow>
              <DetailRow label="Employee Name">{viewRow.employee}</DetailRow>
              <DetailRow label="Designation">{viewRow.designation}</DetailRow>
              <DetailRow label="User Type">{viewRow.userType ? <Badge tone={typeTone(viewRow.userType)}>{viewRow.userType}</Badge> : '—'}</DetailRow>
              <DetailRow label="Email ID">{viewRow.email ? <a href={`mailto:${viewRow.email}`} className="flex items-center gap-1" style={{ color: 'var(--primary-700)' }}><Mail size={13} /> {viewRow.email}</a> : '—'}</DetailRow>
              <DetailRow label="Mobile">{viewRow.mobile ? <span className="flex items-center gap-1"><Phone size={13} /> {viewRow.mobile}</span> : '—'}</DetailRow>
              <DetailRow label="Modules Belongs To">{viewRow.modules || '—'}</DetailRow>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create / Update — form drawer (distinct key so edit values don't leak) */}
      <FormDrawer key={editRow?.id || 'new'} open={formOpen} onClose={() => { setFormOpen(false); setEditRow(null); }}
        title={editRow ? 'Edit User' : 'Add User'}
        subtitle={editRow ? editRow.id : 'New hospital user'}
        submitLabel={editRow ? 'Save Changes' : 'Add User'}
        initial={editRow || undefined} fields={formFields} onSubmit={submitForm} />

      {/* Delete — confirm */}
      <ConfirmDialog open={!!delRow} onClose={() => setDelRow(null)} onConfirm={confirmDelete}
        danger title="Delete user?"
        desc={delRow ? `“${delRow.employee}” will be removed from the roster. This cannot be undone.` : ''}
        confirmText="Delete" />
    </div>
  );
}
