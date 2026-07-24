// ============================================================
// Smart HIMS PMO — People: consultants, engineers, managers.
// Deterministic (seeded) so data is identical on every load.
// ============================================================

export const AVATAR_HUES = [
  ['#6672f1', '#818cf8'], ['#0ea5b7', '#38bdf8'], ['#10a56b', '#34d399'],
  ['#8455e0', '#a78bfa'], ['#d97706', '#fbbf24'], ['#dc4a6b', '#fb7185'],
  ['#c03579', '#f472b6'], ['#4f46e5', '#8b9cf8'], ['#0b6fae', '#7dd3fc'],
  ['#b26205', '#fdba74'], ['#197a2c', '#86efac'], ['#6d3fd1', '#c4b5fd'],
];

// role catalogue for the PMO suite
export const ROLES = [
  { id: 'admin', label: 'System Admin', tint: 'indigo' },
  { id: 'pmo', label: 'PMO Head', tint: 'blue' },
  { id: 'pm', label: 'Project Manager', tint: 'blue' },
  { id: 'im', label: 'Implementation Manager', tint: 'cyan' },
  { id: 'fc', label: 'Functional Consultant', tint: 'mint' },
  { id: 'tc', label: 'Technical Consultant', tint: 'lavender' },
  { id: 'dev', label: 'Developer', tint: 'peach' },
  { id: 'qa', label: 'Tester / QA', tint: 'lemon' },
  { id: 'trainer', label: 'Trainer', tint: 'pink' },
  { id: 'support', label: 'Support Engineer', tint: 'sky' },
  { id: 'client_admin', label: 'Client Admin', tint: 'orange' },
  { id: 'hospital_user', label: 'Hospital User', tint: 'green' },
];

export const TEAM = [
  { id: 'U-01', name: 'Rahul Sharma', role: 'Project Manager', roleId: 'pm', email: 'rahul.sharma@smarthims.com', phone: '+91 98104 21210', avatarHue: 0, dept: 'Delivery', util: 86, active: 7 },
  { id: 'U-02', name: 'Neha Patel', role: 'Functional Consultant', roleId: 'fc', email: 'neha.patel@smarthims.com', phone: '+91 99887 66550', avatarHue: 2, dept: 'Functional', util: 78, active: 5 },
  { id: 'U-03', name: 'Amit Verma', role: 'Functional Consultant', roleId: 'fc', email: 'amit.verma@smarthims.com', phone: '+91 90035 11882', avatarHue: 4, dept: 'Functional', util: 91, active: 6 },
  { id: 'U-04', name: 'Priya Nair', role: 'Implementation Manager', roleId: 'im', email: 'priya.nair@smarthims.com', phone: '+91 98450 33221', avatarHue: 3, dept: 'Delivery', util: 72, active: 9 },
  { id: 'U-05', name: 'Karthik Rao', role: 'Technical Lead', roleId: 'tc', email: 'karthik.rao@smarthims.com', phone: '+91 91234 55678', avatarHue: 7, dept: 'Engineering', util: 88, active: 4 },
  { id: 'U-06', name: 'Sana Qureshi', role: 'Developer', roleId: 'dev', email: 'sana.qureshi@smarthims.com', phone: '+91 98765 12340', avatarHue: 5, dept: 'Engineering', util: 94, active: 3 },
  { id: 'U-07', name: 'Daniel Joseph', role: 'QA Engineer', roleId: 'qa', email: 'daniel.joseph@smarthims.com', phone: '+91 90908 77665', avatarHue: 8, dept: 'Quality', util: 69, active: 5 },
  { id: 'U-08', name: 'Ananya Iyer', role: 'Trainer', roleId: 'trainer', email: 'ananya.iyer@smarthims.com', phone: '+91 93456 22110', avatarHue: 6, dept: 'Training', util: 64, active: 4 },
  { id: 'U-09', name: 'Farhan Shaikh', role: 'Support Engineer', roleId: 'support', email: 'farhan.shaikh@smarthims.com', phone: '+91 97001 45632', avatarHue: 9, dept: 'Support', util: 58, active: 8 },
  { id: 'U-10', name: 'Meera Krishnan', role: 'Functional Consultant', roleId: 'fc', email: 'meera.krishnan@smarthims.com', phone: '+91 98220 66445', avatarHue: 10, dept: 'Functional', util: 81, active: 5 },
  { id: 'U-11', name: 'Vikram Menon', role: 'Technical Consultant', roleId: 'tc', email: 'vikram.menon@smarthims.com', phone: '+91 99000 12321', avatarHue: 11, dept: 'Engineering', util: 76, active: 4 },
  { id: 'U-12', name: 'Grace Fernandes', role: 'Account Manager', roleId: 'pmo', email: 'grace.fernandes@smarthims.com', phone: '+91 98333 90011', avatarHue: 1, dept: 'Sales', util: 55, active: 12 },
];

export const findUser = (id) => TEAM.find((u) => u.id === id);
export const userName = (id) => findUser(id)?.name ?? '—';

export const CURRENT_USER = {
  id: 'U-00',
  name: 'Devendra Singh',
  firstName: 'Devendra',
  role: 'PMO Head',
  roleId: 'pmo',
  email: 'singhdevendra025@gmail.com',
  avatarHue: 0,
  permissions: ['manage_projects', 'approve_signoff', 'manage_masters', 'export_reports'],
};
