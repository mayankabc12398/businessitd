// ============================================================
// Write-DTO builders. Generic entity inserts require numeric FK ids, but forms
// collect display values (lookup NAMES, a parent project CODE, a lifecycle
// stageKey). These async builders resolve those to ids via getWriteMaps().
// Each takes a plain object `v` whose keys are documented per builder; FK keys
// hold the display value, scalar keys pass through untouched. Undefined-valued
// keys are dropped so the server keeps its defaults.
// ============================================================
import { getWriteMaps } from "./lookups";

const pick = (map, key) => (key == null || key === "" ? undefined : map.get(key));
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, x]) => x !== undefined));

// v: { project(code), title, severity(name), module(name), category(name),
//      status, details, reportedBy, assignedTo, reported }
export async function bugDto(v) {
  const w = await getWriteMaps();
  return clean({
    title: v.title, status: v.status || "Open", details: v.details,
    reportedBy: v.reportedBy, assignedTo: v.assignedTo, reported: v.reported,
    projectId: pick(w.project, v.project), severityId: pick(w.severity, v.severity),
    moduleId: pick(w.himsModule, v.module), categoryId: pick(w.bugCategory, v.category),
  });
}

// v: { project, title, issueType(name), module(name), severity(name),
//      status, reportedBy, assignedTo, raised, due }
export async function issueDto(v) {
  const w = await getWriteMaps();
  return clean({
    title: v.title, status: v.status || "Open", reportedBy: v.reportedBy,
    assignedTo: v.assignedTo, raised: v.raised, due: v.due,
    projectId: pick(w.project, v.project), issueTypeId: pick(w.issueType, v.issueType),
    moduleId: pick(w.himsModule, v.module), severityId: pick(w.severity, v.severity),
  });
}

// v: { project, title, riskType(name), level(name), probability, impact, score,
//      owner, status, mitigation, target }
export async function riskDto(v) {
  const w = await getWriteMaps();
  return clean({
    title: v.title, probability: v.probability, impact: v.impact, score: v.score,
    owner: v.owner, status: v.status || "Open", mitigation: v.mitigation, target: v.target,
    projectId: pick(w.project, v.project), riskTypeId: pick(w.riskType, v.riskType),
    levelId: pick(w.severity, v.level),
  });
}

// v: { project, milestone(name), status, signedBy, designation, date, method, remarks }
export async function signoffDto(v) {
  const w = await getWriteMaps();
  return clean({
    status: v.status || "Pending", signedBy: v.signedBy, designation: v.designation,
    date: v.date, method: v.method, remarks: v.remarks,
    projectId: pick(w.project, v.project), milestoneId: pick(w.signoffMilestone, v.milestone),
  });
}

// v: { project, name, category(name), ext, version, sizeKb, uploadedBy, uploadedOn, shared }
export async function documentDto(v) {
  const w = await getWriteMaps();
  return clean({
    name: v.name, ext: v.ext, version: v.version, sizeKb: v.sizeKb,
    uploadedBy: v.uploadedBy, uploadedOn: v.uploadedOn, shared: v.shared ? 1 : 0,
    projectId: pick(w.project, v.project), categoryId: pick(w.docCategory, v.category),
  });
}

// v: { project, title, department(name), type, priority(name), status,
//      effortDays, raisedBy, approvedBy, crValue }
export async function requirementDto(v) {
  const w = await getWriteMaps();
  return clean({
    title: v.title, type: v.type, status: v.status || "Open", effortDays: v.effortDays,
    raisedBy: v.raisedBy, approvedBy: v.approvedBy, crValue: v.crValue,
    projectId: pick(w.project, v.project), departmentId: pick(w.hospitalDepartment, v.department),
    priorityId: pick(w.severity, v.priority),
  });
}

// v: { project, department(name), consultant, planned, actual, status, requirements, gaps, crs, signoff }
export async function srsSessionDto(v) {
  const w = await getWriteMaps();
  return clean({
    consultant: v.consultant, planned: v.planned, actual: v.actual, status: v.status || "Scheduled",
    requirements: v.requirements, gaps: v.gaps, crs: v.crs, signoff: v.signoff,
    projectId: pick(w.project, v.project), departmentId: pick(w.hospitalDepartment, v.department),
  });
}

// v: { project, masterItem(name), requested, received, imported, requestedOn, receivedOn,
//      records, failed, validation, owner, status }
export async function masterDataDto(v) {
  const w = await getWriteMaps();
  return clean({
    requested: v.requested, received: v.received, imported: v.imported,
    requestedOn: v.requestedOn, receivedOn: v.receivedOn, records: v.records, failed: v.failed,
    validation: v.validation, owner: v.owner, status: v.status || "Pending",
    projectId: pick(w.project, v.project), masterItemId: pick(w.masterDataItem, v.masterItem),
  });
}

// v: { project, feature, module(name), type, developer, status, effortDays, devDate, progress }
export async function devItemDto(v) {
  const w = await getWriteMaps();
  return clean({
    feature: v.feature, type: v.type, developer: v.developer, status: v.status || "Not Started",
    effortDays: v.effortDays, devDate: v.devDate, progress: v.progress,
    projectId: pick(w.project, v.project), moduleId: pick(w.himsModule, v.module),
  });
}

// v: { project, module(name), total, passed, failed, pending, status, tester, uatDate, signoff }
export async function uatCaseDto(v) {
  const w = await getWriteMaps();
  return clean({
    total: v.total, passed: v.passed, failed: v.failed, pending: v.pending,
    status: v.status || "Pending", tester: v.tester, uatDate: v.uatDate, signoff: v.signoff,
    projectId: pick(w.project, v.project), moduleId: pick(w.himsModule, v.module),
  });
}

// v: { project, department(name), trainingType(name), trainer, date, durationHrs,
//      plannedAttendees, attendance, status, feedback, signoff }
export async function trainingDto(v) {
  const w = await getWriteMaps();
  return clean({
    trainer: v.trainer, date: v.date, durationHrs: v.durationHrs, plannedAttendees: v.plannedAttendees,
    attendance: v.attendance, status: v.status || "Scheduled", feedback: v.feedback, signoff: v.signoff,
    projectId: pick(w.project, v.project), departmentId: pick(w.hospitalDepartment, v.department),
    trainingTypeId: pick(w.trainingType, v.trainingType),
  });
}

// v: { activity, phase, clinic, status, mode, days, startDate, endDate, groupName,
//      projectCode, agenda, participants, nextMeeting }
export async function activityDto(v) {
  const w = await getWriteMaps();
  return clean({
    code: v.code, activity: v.activity, phase: v.phase, clinic: v.clinic,
    status: v.status || "Pending", mode: v.mode, days: v.days,
    startDate: v.startDate, endDate: v.endDate, groupName: v.groupName,
    // kick-off extras (participants may arrive as an array of tags → store CSV)
    agenda: v.agenda,
    participants: Array.isArray(v.participants) ? v.participants.join(", ") : v.participants,
    nextMeeting: v.nextMeeting,
    projectId: v.projectId ?? pick(w.project, v.projectCode || v.project),
  });
}

// v: { name, role(label), email, phone, dept(name), util }
export async function teamMemberDto(v) {
  const w = await getWriteMaps();
  return clean({
    name: v.name, email: v.email, phone: v.phone, utilisation: v.util,
    roleId: pick(w.role, v.role), departmentId: pick(w.teamDepartment, v.dept),
  });
}

// v: { srNo, department, employee, designation, userType, email, mobile, modules }
export async function hospitalUserDto(v) {
  return clean({
    srNo: v.srNo, department: v.department, employee: v.employee, designation: v.designation,
    userType: v.userType, email: v.email, mobile: v.mobile, modules: v.modules,
  });
}
