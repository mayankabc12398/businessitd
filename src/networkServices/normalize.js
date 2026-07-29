// ============================================================
// Shape normalizers: bridge the businessAPI read shape (camelCase, numeric
// `id` + natural `code`, nested lookup objects { id, name }, tinyint 0/1)
// to the field names the existing UI expects. Kept in the network layer so
// pages and the api seam stay clean.
// ============================================================

// A lookup join serializes as { id, name } (sometimes + code/currency). The UI
// wants the plain name string. Detect a "lookup-ish" object and collapse it.
const isLookupObject = (v) =>
  v &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  typeof v.name === "string" &&
  Object.keys(v).length <= 5 &&
  Object.keys(v).every((k) => ["id", "name", "code", "currency", "active"].includes(k));

// Deep-walk: collapse nested lookup objects to their name, recurse arrays/objects.
export const flattenLookups = (input) => {
  if (Array.isArray(input)) return input.map(flattenLookups);
  if (input && typeof input === "object") {
    if (isLookupObject(input)) return input.name;
    const out = {};
    for (const [k, v] of Object.entries(input)) out[k] = flattenLookups(v);
    return out;
  }
  return input;
};

// tinyint 0/1 -> boolean for a set of known flag fields.
const BOOL_FIELDS = ["isPrimary", "primary", "reusable", "active", "unread", "shared"];
const coerceFlags = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  for (const f of BOOL_FIELDS) {
    if (obj[f] === 0 || obj[f] === 1) obj[f] = obj[f] === 1;
  }
  return obj;
};

// Rename API keys -> UI keys without dropping the originals (so both work).
const alias = (obj, map) => {
  if (!obj || typeof obj !== "object") return obj;
  for (const [from, to] of Object.entries(map)) {
    if (obj[from] !== undefined && obj[to] === undefined) obj[to] = obj[from];
  }
  return obj;
};

// The UI keys entities by their natural code (CL-001, PRJ-…) under `id`.
// The API returns numeric `id` + string `code`; expose `code` as `id` too.
const codeAsId = (obj) => {
  if (obj && typeof obj === "object" && obj.code !== undefined) obj.id = obj.code;
  return obj;
};

const one = (raw, fn) => (raw ? fn(flattenLookups(raw)) : raw);
const many = (raw, fn) => (Array.isArray(raw) ? raw.map((r) => fn(flattenLookups(r))) : []);

// ---- Clients ----
const clientShape = (c) => {
  codeAsId(c);
  alias(c, {
    groupName: "group",
    hospitalType: "type",
    countryName: "country",
    currencyCode: "currency",
    healthStatus: "health",
    clientContacts: "contacts",
    clientEscalations: "escalation",
  });
  (c.contacts || []).forEach(coerceFlags);
  return c;
};
export const normalizeClient = (raw) => one(raw, clientShape);
export const normalizeClients = (raw) => many(raw, clientShape);

// ---- Projects ----
const projectShape = (p) => {
  codeAsId(p);
  alias(p, {
    implementationType: "implType",
    healthStatus: "health",
    riskLevel: "riskLevel",
    projectStatus: "status",
    currentStage: "currentStage",
    usersCount: "users",
  });
  return p;
};
export const normalizeProject = (raw) => one(raw, projectShape);
export const normalizeProjects = (raw) => many(raw, projectShape);

// ---- Generic (flatten + code->id + flag coercion) for the long tail ----
const genericShape = (r) => coerceFlags(codeAsId(r));
export const normalizeOne = (raw) => one(raw, genericShape);
export const normalizeList = (raw) => many(raw, genericShape);
