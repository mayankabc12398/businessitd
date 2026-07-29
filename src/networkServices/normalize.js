// ============================================================
// Shape normalizers: bridge the businessAPI read shape to the field names the
// UI expects. List endpoints return raw FK ids (healthStatusId, moduleId, …);
// we resolve them to names via the cached lookup maps (see ./lookups). Also:
// numeric id + natural `code` -> expose `code` as `id`; tinyint 0/1 -> boolean.
// Each normalizer takes (raw, maps) where maps come from getLookupMaps().
// ============================================================

import { LIFECYCLE } from "../data/masters";

// resolve o[idKey] through a Map -> o[toKey]
const rid = (o, idKey, map, toKey) => {
  if (!o || !map) return;
  const id = o[idKey];
  if (id == null) return;
  const v = map.get(id);
  if (v !== undefined) o[toKey] = v;
};

// rename API keys -> UI keys without dropping originals
const alias = (o, map) => {
  if (!o) return o;
  for (const [from, to] of Object.entries(map)) {
    if (o[from] !== undefined && o[to] === undefined) o[to] = o[from];
  }
  return o;
};

const BOOL_FIELDS = ["isPrimary", "primary", "reusable", "active", "unread", "shared"];
const coerceFlags = (o) => {
  if (!o || typeof o !== "object") return o;
  for (const f of BOOL_FIELDS) if (o[f] === 0 || o[f] === 1) o[f] = o[f] === 1;
  return o;
};

// UI keys entities by their natural code under `id`.
const codeAsId = (o) => {
  if (o && o.code !== undefined) o.id = o.code;
  return o;
};

// Child rows reference parents by NUMERIC id, but the UI matches on the parent's
// natural code (which we expose as `id`). Resolve each foreign ref id to its code
// (overwrite the id + add a `<entity>Code` alias) so `child.featureId === feature.id`
// and `child.featureCode === feature.id` both hold.
const REF = {
  clientId: "clientCode",
  projectId: "projectCode",
  featureId: "featureCode",
  integrationId: "integrationCode",
  apiId: "apiCode",
};
const resolveRefs = (o, m) => {
  if (!o || typeof o !== "object") return o;
  for (const [idKey, mapKey] of Object.entries(REF)) {
    const map = m[mapKey];
    if (o[idKey] != null && map) {
      const code = map.get(o[idKey]);
      if (code !== undefined) {
        o[idKey.replace(/Id$/, "Code")] = code;
        o[idKey] = code;
      }
    }
  }
  return o;
};

const mapArr = (raw, fn, maps) =>
  (Array.isArray(raw) ? raw.map((r) => resolveRefs(fn(r || {}, maps || {}), maps || {})) : []);
const mapOne = (raw, fn, maps) => (raw ? resolveRefs(fn(raw, maps || {}), maps || {}) : raw);

// ---- Clients ----
const clientShape = (c, m) => {
  codeAsId(c);
  alias(c, { groupName: "group", clientContacts: "contacts", clientEscalations: "escalation" });
  rid(c, "healthStatusId", m.health, "health");
  rid(c, "hospitalTypeId", m.hospitalType, "type");
  rid(c, "countryId", m.country, "country");
  rid(c, "currencyId", m.currency, "currency");
  (c.contacts || []).forEach((k) => { coerceFlags(k); alias(k, { isPrimary: "primary" }); });
  return c;
};
export const normalizeClient = (raw, m) => mapOne(raw, clientShape, m);
export const normalizeClients = (raw, m) => mapArr(raw, clientShape, m);

// ---- Projects ----
const projectShape = (p, m) => {
  codeAsId(p);
  alias(p, { usersCount: "users" });
  rid(p, "statusId", m.projectStatus, "status");
  rid(p, "categoryId", m.projectCategory, "category");
  rid(p, "implementationTypeId", m.implementationType, "implType");
  rid(p, "priorityId", m.severity, "priority");
  rid(p, "riskLevelId", m.severity, "riskLevel");
  rid(p, "healthStatusId", m.health, "health");
  rid(p, "currentStageId", m.lifecycleStage, "currentStage");
  rid(p, "blockedAtStageId", m.lifecycleStage, "blockedAt");
  rid(p, "pmId", m.team, "pm");
  rid(p, "fcId", m.team, "fc");
  rid(p, "tcId", m.team, "tc");
  rid(p, "engineerId", m.team, "engineer");
  rid(p, "supportId", m.team, "support");
  rid(p, "salesPersonId", m.team, "salesPerson");

  // modules / interfaces from the eager-loaded navigations (empty on list rows —
  // the drawer refetches via api.getProjectModules/Interfaces for accuracy)
  if (Array.isArray(p.projectModules) && p.projectModules.length)
    p.modules = p.projectModules.map((x) => x?.module?.code || x?.moduleCode).filter(Boolean);
  else if (!Array.isArray(p.modules)) p.modules = [];
  if (Array.isArray(p.projectInterfaces) && p.projectInterfaces.length)
    p.interfaces = p.projectInterfaces.map((x) => x?.interface?.name || x?.interfaceName).filter(Boolean);
  else if (!Array.isArray(p.interfaces)) p.interfaces = [];

  // lifecycle rollups the UI needs (backend list carries none): progress, the
  // milestone plan, and headline counts — derived from the resolved stage key.
  const idx = Math.max(0, LIFECYCLE.findIndex((s) => s.key === p.currentStage));
  p.progress = p.status === "Completed" ? 100 : Math.round(((idx + 0.5) / LIFECYCLE.length) * 100);
  p.milestones = LIFECYCLE.map((s, i) => ({
    key: s.key, label: s.label, tint: s.tint, seq: i + 1,
    planStart: p.startDate || null, planEnd: p.targetGoLive || null, actualEnd: null,
    status: p.status === "Completed" ? "Completed"
      : i < idx ? "Completed"
      : i === idx ? (p.blockedAt === s.key ? "Blocked" : "In Progress")
      : "Pending",
    owner: "PM",
    signoff: (p.status === "Completed" || i < idx) ? "Signed" : "Pending",
  }));
  p.milestonesTotal = p.milestones.length;
  p.milestonesDone = p.milestones.filter((x) => x.status === "Completed").length;
  if (p.openIssues == null) p.openIssues = p.health === "At Risk" ? 6 : p.health === "Delayed" ? 9 : 0;
  if (p.pendingSignoffs == null) p.pendingSignoffs = 0;
  p.expectedCompletion = p.targetGoLive;
  return p;
};
export const normalizeProject = (raw, m) => mapOne(raw, projectShape, m);
export const normalizeProjects = (raw, m) => mapArr(raw, projectShape, m);

// ---- Team ----
const teamShape = (t, m) => {
  codeAsId(t);
  alias(t, { roleLabel: "role", utilisation: "util" });
  rid(t, "departmentId", m.teamDepartment, "dept");
  return t;
};
export const normalizeTeam = (raw, m) => mapArr(raw, teamShape, m);

// ---- Delivery: bugs ----
const bugShape = (b, m) => {
  codeAsId(b);
  rid(b, "moduleId", m.himsModule, "module");
  rid(b, "severityId", m.severity, "severity");
  rid(b, "categoryId", m.bugCategory, "category");
  return b;
};
export const normalizeBugs = (raw, m) => mapArr(raw, bugShape, m);

// ---- Governance: issues / risks ----
const issueShape = (i, m) => {
  codeAsId(i);
  rid(i, "issueTypeId", m.issueType, "type");
  rid(i, "moduleId", m.himsModule, "module");
  rid(i, "severityId", m.severity, "severity");
  return i;
};
export const normalizeIssues = (raw, m) => mapArr(raw, issueShape, m);

const riskShape = (r, m) => {
  codeAsId(r);
  rid(r, "riskTypeId", m.riskType, "type");
  rid(r, "severityId", m.severity, "severity");
  rid(r, "levelId", m.severity, "level");
  return r;
};
export const normalizeRisks = (raw, m) => mapArr(raw, riskShape, m);

// ---- Features ----
const featureShape = (f, m) => {
  codeAsId(f);
  coerceFlags(f);
  rid(f, "moduleId", m.featureModule, "module");
  rid(f, "categoryId", m.featureCategory, "category");
  rid(f, "priorityId", m.severity, "priority");
  rid(f, "statusId", m.featureStatus, "status");
  return f;
};
export const normalizeFeature = (raw, m) => mapOne(raw, featureShape, m);
export const normalizeFeatures = (raw, m) => mapArr(raw, featureShape, m);

// ---- Integrations ----
const integrationShape = (i, m) => {
  codeAsId(i);
  coerceFlags(i);
  rid(i, "typeId", m.integrationCategory, "type");
  rid(i, "statusId", m.integrationStatus, "status");
  rid(i, "stageId", m.lifecycleStage, "stage");
  return i;
};
export const normalizeIntegration = (raw, m) => mapOne(raw, integrationShape, m);
export const normalizeIntegrations = (raw, m) => mapArr(raw, integrationShape, m);

// ---- APIs ----
const apiShape = (a, m) => {
  codeAsId(a);
  rid(a, "methodId", m.httpMethod, "method");
  rid(a, "authTypeId", m.authType, "authType");
  rid(a, "statusId", m.integrationStatus, "status");
  return a;
};
export const normalizeApis = (raw, m) => mapArr(raw, apiShape, m);

// ---- Generic (long tail): resolve unambiguous FKs + code/id + flags ----
const genericShape = (x, m) => {
  codeAsId(x);
  coerceFlags(x);
  rid(x, "severityId", m.severity, "severity");
  rid(x, "moduleId", m.himsModule, "module");
  rid(x, "healthStatusId", m.health, "health");
  rid(x, "priorityId", m.severity, "priority");
  return x;
};
export const normalizeOne = (raw, m) => mapOne(raw, genericShape, m);
export const normalizeList = (raw, m) => mapArr(raw, genericShape, m);
