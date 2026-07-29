// ============================================================
// Smart Feature Repository (SFR) — UI enums only.
// (Features now come from the API; only UI enum lists remain here.)
// ============================================================

export const FEATURE_MODULES = ['Billing', 'Clinical / EMR', 'Patient Engagement', 'Insurance / TPA', 'Pharmacy', 'Laboratory', 'Radiology', 'OPD', 'IPD', 'Administration', 'Integration', 'AI / Automation', 'Mobile / Portal'];
export const FEATURE_CATEGORIES = ['Revenue', 'Efficiency', 'Compliance', 'Patient Experience', 'Automation', 'Analytics', 'Integration'];
export const FEATURE_STATUSES = ['New Request', 'Under Review', 'Approved', 'In Development', 'Testing', 'Deployed', 'Available for All'];
export const PRIORITIES = ['High', 'Medium', 'Low'];
export const APPLICABLE_SEGMENTS = ['All Hospitals', 'Insurance Clients', 'Diagnostic Centers', 'Government Hospitals'];

export const STATUS_TINT = {
  'New Request': 'lavender', 'Under Review': 'sky', Approved: 'cyan',
  'In Development': 'peach', Testing: 'lemon', Deployed: 'blue', 'Available for All': 'green',
};

// 8-step feature workflow (from the reference dashboard workflow strip)
export const WORKFLOW_STEPS = [
  { step: 1, key: 'request', label: 'Feature Request', desc: 'Raised by client / team', icon: 'request' },
  { step: 2, key: 'review', label: 'Review & Analysis', desc: 'Evaluate requirement', icon: 'review' },
  { step: 3, key: 'approval', label: 'Approval', desc: 'Approved by head', icon: 'approve' },
  { step: 4, key: 'development', label: 'Development', desc: 'Build the feature', icon: 'dev' },
  { step: 5, key: 'testing', label: 'Testing', desc: 'QA & UAT', icon: 'test' },
  { step: 6, key: 'deployment', label: 'Deployment', desc: 'Deployed to requester', icon: 'deploy' },
  { step: 7, key: 'impact', label: 'Evaluate Impact', desc: 'ROI & usage analysis', icon: 'impact' },
  { step: 8, key: 'share', label: 'Share with All', desc: 'Make available to all clients', icon: 'share' },
];

// Map a status to a workflow step (for progress bars)
export const STATUS_STAGE = {
  'New Request': 1, 'Under Review': 2, Approved: 3, 'In Development': 4,
  Testing: 5, Deployed: 6, 'Available for All': 8,
};
