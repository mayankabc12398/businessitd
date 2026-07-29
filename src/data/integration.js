// ============================================================
// Smart Integration Records (SIR) — UI enums only.
// (Records now come from the API; only UI enum lists remain here.)
// ============================================================

export const INTEGRATION_TYPES = ['Payment Gateway', 'Insurance', 'Bank', 'Government', 'PACS', 'LIS', 'SMS Gateway', 'Email Gateway', 'ERP', 'Other'];
export const INTEGRATION_STATUS = ['Active', 'Under Testing', 'In Development', 'Deprecated'];
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
export const AUTH_TYPES = ['Basic', 'Bearer Token', 'OAuth 2.0', 'API Key', 'JWT'];
export const DOC_TYPES = ['API PDF', 'Swagger', 'BRD', 'SRS', 'MOM', 'Postman Collection', 'Excel Mapping', 'SQL Script', 'Image'];

// 6-step integration lifecycle (from the reference dashboard workflow strip)
export const WORKFLOW_STEPS = [
  { step: 1, key: 'created', label: 'Integration Created', desc: 'Basic information & process flow created', icon: 'file' },
  { step: 2, key: 'captured', label: 'API & Data Captured', desc: 'APIs, payloads & responses documented', icon: 'database' },
  { step: 3, key: 'hims', label: 'HIMS Changes Defined', desc: 'Changes in HIMS screens & logic documented', icon: 'code' },
  { step: 4, key: 'dev', label: 'Development & Testing', desc: 'Code implemented and tested for integration', icon: 'check' },
  { step: 5, key: 'client', label: 'Implemented for Client', desc: 'Integrated with client HIMS code and live', icon: 'users' },
  { step: 6, key: 'archived', label: 'Documentation Archived', desc: 'Complete details available for future reuse', icon: 'archive' },
];
