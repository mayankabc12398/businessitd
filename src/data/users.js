// ============================================================
// Hospital Users & Access list — department-wise HIMS user roster
// captured from the client onboarding sheet: department · employee ·
// designation · user type · email · mobile · modules they belong to.
// ============================================================

// raw rows straight from the access sheet
const RAW = [
  ['THEATRES', 'MOSES HARRY KABONGE', 'THEATRE MANAGER', '', 'moses.kabonge@mengohospital.org', '775236808', 'THEATRES'],
  ['KATHERINE AND ENDOSCOPY', 'NIMUSIIMA DOREEN', 'MANAGER', 'Super User', 'doreen.nimusiima@mengohospital.org', '773355356', 'OPD/IPD'],
  ['SURGERY', 'DR. LUWEESI HENRY', 'CONSULTANT SURGEON', 'HOD', 'henry.luweesi@mengohospital.org', '', 'OPD/IPD'],
  ['INTERNAL MEDICINE', 'DR. MUYANJA DAVID', 'CONSULTANT PHYSICIAN', 'HOD', 'david.muyanja@mengohospital.org', '', 'OPD/IPD'],
  ['KATHERINE WARD', 'NAYIGA RUTH', 'INCHARGE', '', 'ruth.nayiga@mengohospital.org', '', 'OPD/IPD'],
  ['LUKE WARD', 'NANTALE RUTH', 'INCHARGE', '', 'ruth.nantale@mengohospital.org', '', 'OPD/IPD'],
  ['ENDOSCOPY', 'NAMBUUSI JUDITH', 'TEAM LEADER', '', 'judith.nambuusi@mengohospital.org', '', 'OPD'],
  ['SURGERY', 'DR. BLICK BENJAMEN', 'SHO', 'Super User', 'blick.benjamen@mengohospital.org', '', 'OPD/IPD'],
  ['INTERNAL MEDICINE', 'DR. MUTEBI BRIAN', 'SHO', 'Super User', 'brian.mutebi@mengohospital.org', '', 'OPD/IPD'],
  ['MPEREZA COMPLEX', 'KIGGUNDU CHRISTINE', 'MANAGER', 'Super User', 'christine.kiggundu@mengohospital.org', '703048296', 'obs/gyn dept'],
  ['DENTAL', 'DR. NEVIS AGIREMBABAZI', 'HOD', 'HOD', 'nevis.agirembabazi@mengohospital.org', '782398686', 'Dental'],
  ['DENTAL', 'ALONE MUSANA', 'ADMINISTRATOR', '', 'alone.musana@mengohospital.org', '701798503', ''],
  ['MPEREZA COMPLEX', 'KAYAGA HERON', 'D. MANAGER', 'Super User/Manager', 'heron.kayaga@mengohospital.org', '702787656', 'obs/gyn dept'],
  ['MPEREZA COMPLEX', 'BUKIRWA LYDIA', 'INCHARGE', '', 'lydiabukirwa10', '773931939', ''],
];

export const HOSPITAL_USERS = RAW.map((c, i) => ({
  id: `USR-${String(i + 1).padStart(3, '0')}`,
  srNo: i + 1,
  department: c[0],
  employee: c[1],
  designation: c[2],
  userType: c[3],
  email: c[4],
  mobile: c[5],
  modules: c[6],
}));

// distinct filter option lists (derived so dropdowns stay in sync with data)
export const USER_DEPARTMENTS = [...new Set(HOSPITAL_USERS.map((r) => r.department))].sort();
export const USER_TYPES = [...new Set(HOSPITAL_USERS.map((r) => r.userType).filter(Boolean))];
export const USER_MODULES = [...new Set(HOSPITAL_USERS.map((r) => r.modules).filter(Boolean))];

export const USERS_KPIS = {
  total: HOSPITAL_USERS.length,
  departments: USER_DEPARTMENTS.length,
  superUsers: HOSPITAL_USERS.filter((r) => /super user/i.test(r.userType)).length,
  hods: HOSPITAL_USERS.filter((r) => /hod/i.test(r.userType)).length,
};
