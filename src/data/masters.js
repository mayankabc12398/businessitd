// ============================================================
// Static master catalogues for the HIMS PMO suite.
// ============================================================

// 20-stage implementation lifecycle (from Lead → Closure)
export const LIFECYCLE = [
  { key: 'lead', label: 'Lead Converted', tint: 'indigo' },
  { key: 'registration', label: 'Project Registration', tint: 'blue' },
  { key: 'po', label: 'Purchase Order', tint: 'blue' },
  { key: 'scope', label: 'Scope Confirmation', tint: 'cyan' },
  { key: 'kickoff', label: 'Kick-off Meeting', tint: 'cyan' },
  { key: 'srs', label: 'Department-wise SRS', tint: 'mint' },
  { key: 'gap', label: 'Gap Analysis & CR', tint: 'mint' },
  { key: 'masterdata', label: 'Master Data Collection', tint: 'lemon' },
  { key: 'development', label: 'Development', tint: 'peach' },
  { key: 'configuration', label: 'Configuration', tint: 'peach' },
  { key: 'testing', label: 'Internal Testing', tint: 'lavender' },
  { key: 'deployment', label: 'UAT Deployment', tint: 'lavender' },
  { key: 'uat', label: 'Client UAT', tint: 'lavender' },
  { key: 'training', label: 'Training', tint: 'pink' },
  { key: 'migration', label: 'Data Migration', tint: 'orange' },
  { key: 'parallel', label: 'Parallel Go-Live', tint: 'sky' },
  { key: 'golive', label: 'Final Go-Live', tint: 'green' },
  { key: 'support', label: 'Hypercare Support', tint: 'sky' },
  { key: 'closure', label: 'Project Closure', tint: 'green' },
];
export const stageIndex = (key) => LIFECYCLE.findIndex((s) => s.key === key);
export const stageLabel = (key) => LIFECYCLE.find((s) => s.key === key)?.label ?? key;

export const PROJECT_STATUS = ['Planning', 'In Progress', 'UAT', 'Training', 'Go-Live', 'Hypercare', 'On Hold', 'Completed'];
export const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
export const RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
export const HEALTH = ['On Track', 'At Risk', 'Delayed', 'Blocked'];

export const IMPLEMENTATION_TYPES = ['New Implementation', 'Migration', 'Upgrade', 'Add-on Module', 'Re-implementation'];
export const INTEGRATION_TYPES = ['None', 'HL7', 'FHIR / ABDM', 'REST API', 'DICOM / PACS', 'Payment Gateway', 'Lab Analyzer', 'Custom'];
export const HOSPITAL_TYPES = ['Multi-Specialty', 'Super-Specialty', 'Single-Specialty', 'Clinic Chain', 'Government', 'Trust / NGO', 'Diagnostic Center'];
export const PROJECT_CATEGORY = ['Enterprise', 'Mid-Market', 'SMB', 'Government'];

export const COUNTRIES = [
  { code: 'IN', label: 'India', currency: 'INR' },
  { code: 'AE', label: 'United Arab Emirates', currency: 'AED' },
  { code: 'SA', label: 'Saudi Arabia', currency: 'SAR' },
  { code: 'KE', label: 'Kenya', currency: 'KES' },
  { code: 'NG', label: 'Nigeria', currency: 'NGN' },
  { code: 'BD', label: 'Bangladesh', currency: 'BDT' },
  { code: 'PH', label: 'Philippines', currency: 'PHP' },
  { code: 'UK', label: 'United Kingdom', currency: 'GBP' },
];

// HIMS product modules that get purchased / implemented
export const HIMS_MODULES = [
  { id: 'M-OPD', name: 'OPD Management', tint: 'blue' },
  { id: 'M-IPD', name: 'IPD Management', tint: 'cyan' },
  { id: 'M-EMR', name: 'EMR / Clinicals', tint: 'lavender' },
  { id: 'M-PHARM', name: 'Pharmacy', tint: 'mint' },
  { id: 'M-LAB', name: 'Laboratory (LIS)', tint: 'lemon' },
  { id: 'M-RAD', name: 'Radiology (RIS/PACS)', tint: 'peach' },
  { id: 'M-BILL', name: 'Billing & Revenue', tint: 'orange' },
  { id: 'M-INV', name: 'Inventory & Stores', tint: 'sky' },
  { id: 'M-OT', name: 'Operation Theatre', tint: 'pink' },
  { id: 'M-BB', name: 'Blood Bank', tint: 'rose' },
  { id: 'M-INS', name: 'Insurance / TPA', tint: 'green' },
  { id: 'M-HR', name: 'HR & Payroll', tint: 'indigo' },
  { id: 'M-ACC', name: 'Accounts & Finance', tint: 'blue' },
  { id: 'M-DIET', name: 'Dietary', tint: 'mint' },
  { id: 'M-APP', name: 'Patient App / Portal', tint: 'cyan' },
  { id: 'M-QMS', name: 'Queue Management', tint: 'peach' },
];

// hospital departments used for SRS / training scheduling
export const HOSPITAL_DEPTS = ['OPD', 'IPD', 'Emergency', 'Pharmacy', 'Laboratory', 'Radiology', 'Billing', 'Front Office', 'Inventory', 'OT', 'Nursing', 'Insurance', 'HR', 'Accounts'];

export const INTERFACES = ['HL7 ADT', 'HL7 ORU (Lab)', 'DICOM Modality Worklist', 'ABDM / ABHA', 'Payment Gateway', 'SMS Gateway', 'WhatsApp Business', 'Insurance TPA API', 'Biometric Devices', 'Analyzer Interface'];

export const ISSUE_TYPES = ['Bug', 'Configuration', 'Data', 'Enhancement', 'Query', 'Interface', 'Performance', 'Training Gap'];
export const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];
export const RISK_TYPES = ['Schedule', 'Scope', 'Resource', 'Technical', 'Data Quality', 'Client Readiness', 'Financial', 'Compliance'];
export const TRAINING_TYPES = ['Classroom', 'Virtual', 'Hands-on / Sandbox', 'Train-the-Trainer', 'Floor Walk'];
export const DOC_CATEGORIES = ['Purchase Order', 'Contract', 'MOM', 'SRS', 'Master Excel', 'Training Manual', 'UAT Report', 'Go-Live Checklist', 'Sign-off', 'Closure Report'];

export const SIGNOFF_MILESTONES = [
  'Kick-off Meeting', 'Scope Confirmation', 'SRS Completed', 'Gap / CR Approved',
  'Master Data Received', 'UAT Completed', 'Training Completed', 'Go-Live Readiness', 'Final Go-Live', 'Project Closure',
];
