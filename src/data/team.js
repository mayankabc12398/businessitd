// ============================================================
// Smart HIMS PMO — People: UI enums (roles, avatar hues).
// Team roster comes from the API (api.getTeam); only presentation
// metadata lives here.
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
