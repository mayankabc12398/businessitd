// ============================================================
// Smart Feature Repository (SFR) — Feature Intelligence Platform.
// Captures every client-specific enhancement, measures business value,
// and promotes reusable innovations across all 1100+ HIMS clients.
// Data model covers the 14 modules from the SFR spec.
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

// ── Module 1 · Feature Registration (master list) ───────────────────────────
export const FEATURES = [
  { id: 'FEA-1001', name: 'Insurance Card Integration', module: 'Insurance / TPA', category: 'Revenue', client: 'ABC Hospital', requestDate: '2026-05-20', priority: 'High', estDevTime: '18 days', status: 'In Development', impactScore: 9.4, reusable: true, applicableTo: ['All Hospitals', 'Insurance Clients'], revenueGenerated: 5200000, devCost: 850000, clientsUsing: 34, totalImpl: 41, supportTickets: 12, satisfaction: 4.6, roiScore: 88, adoptionRate: 62, functionalConsultant: 'Anita Rao', projectManager: 'Devendra Singh', developer: 'Utkarsh', requestedBy: 'Dr. Mehta (ABC)', businessProblem: 'Manual insurance card entry causes errors and slows OPD billing.', proposedSolution: 'Scan/parse insurance card, auto-fill member & scheme, verify eligibility in real time.' },
  { id: 'FEA-1002', name: 'AI-Based OPD Queue Prediction', module: 'AI / Automation', category: 'Efficiency', client: 'City Hospital', requestDate: '2026-05-18', priority: 'High', estDevTime: '30 days', status: 'Under Review', impactScore: 8.8, reusable: true, applicableTo: ['All Hospitals'], revenueGenerated: 0, devCost: 1200000, clientsUsing: 0, totalImpl: 0, supportTickets: 0, satisfaction: 0, roiScore: 0, adoptionRate: 0, functionalConsultant: 'Sneha Rao', projectManager: 'Devendra Singh', developer: 'TBD', requestedBy: 'Admin (City)', businessProblem: 'Unpredictable OPD wait times hurt patient satisfaction.', proposedSolution: 'ML model predicts queue length & wait time; display on token screens.' },
  { id: 'FEA-1003', name: 'WhatsApp Appointment Reminder', module: 'Patient Engagement', category: 'Patient Experience', client: 'XYZ Hospital', requestDate: '2026-05-19', priority: 'Medium', estDevTime: '8 days', status: 'Testing', impactScore: 8.2, reusable: true, applicableTo: ['All Hospitals', 'Diagnostic Centers'], revenueGenerated: 2100000, devCost: 260000, clientsUsing: 58, totalImpl: 64, supportTickets: 6, satisfaction: 4.8, roiScore: 92, adoptionRate: 78, functionalConsultant: 'Neha Patel', projectManager: 'Devendra Singh', developer: 'Shubham', requestedBy: 'Front Office (XYZ)', businessProblem: 'High no-show rate for booked appointments.', proposedSolution: 'Send WhatsApp reminders 24h & 2h before appointment with confirm/reschedule.' },
  { id: 'FEA-1004', name: 'Auto Split Billing', module: 'Billing', category: 'Revenue', client: 'Life Care Hospital', requestDate: '2026-05-17', priority: 'Medium', estDevTime: '12 days', status: 'Deployed', impactScore: 7.6, reusable: true, applicableTo: ['All Hospitals', 'Insurance Clients'], revenueGenerated: 3800000, devCost: 420000, clientsUsing: 21, totalImpl: 27, supportTickets: 9, satisfaction: 4.4, roiScore: 81, adoptionRate: 55, functionalConsultant: 'Anita Rao', projectManager: 'Devendra Singh', developer: 'Utkarsh', requestedBy: 'Billing Head (Life Care)', businessProblem: 'Splitting a bill between insurance & patient is manual and error-prone.', proposedSolution: 'Rule-based auto split of charges across payer + patient with configurable ratios.' },
  { id: 'FEA-1005', name: 'Dynamic Consent Form', module: 'Clinical / EMR', category: 'Compliance', client: 'Sunrise Hospital', requestDate: '2026-05-16', priority: 'Low', estDevTime: '10 days', status: 'Approved', impactScore: 6.9, reusable: true, applicableTo: ['All Hospitals', 'Government Hospitals'], revenueGenerated: 900000, devCost: 300000, clientsUsing: 8, totalImpl: 11, supportTickets: 2, satisfaction: 4.3, roiScore: 70, adoptionRate: 33, functionalConsultant: 'Sneha Rao', projectManager: 'Devendra Singh', developer: 'Priya', requestedBy: 'Compliance (Sunrise)', businessProblem: 'Paper consent forms are hard to audit and localise.', proposedSolution: 'Configurable digital consent templates with e-signature & audit trail.' },
  { id: 'FEA-1006', name: 'Patient Self Check-in Kiosk', module: 'Patient Engagement', category: 'Patient Experience', client: 'Prime Hospital', requestDate: '2026-05-12', priority: 'High', estDevTime: '22 days', status: 'Deployed', impactScore: 7.2, reusable: true, applicableTo: ['All Hospitals'], revenueGenerated: 2600000, devCost: 560000, clientsUsing: 17, totalImpl: 20, supportTickets: 7, satisfaction: 4.5, roiScore: 76, adoptionRate: 48, functionalConsultant: 'Neha Patel', projectManager: 'Devendra Singh', developer: 'Shubham', requestedBy: 'Ops (Prime)', businessProblem: 'Front-desk congestion at peak OPD hours.', proposedSolution: 'Kiosk self check-in with token print & payment.' },
  { id: 'FEA-1007', name: 'Lab Result Auto SMS', module: 'Laboratory', category: 'Automation', client: 'City Hospital', requestDate: '2026-04-28', priority: 'Medium', estDevTime: '5 days', status: 'Available for All', impactScore: 7.0, reusable: true, applicableTo: ['All Hospitals', 'Diagnostic Centers'], revenueGenerated: 1400000, devCost: 180000, clientsUsing: 72, totalImpl: 80, supportTickets: 4, satisfaction: 4.7, roiScore: 90, adoptionRate: 82, functionalConsultant: 'Neha Patel', projectManager: 'Devendra Singh', developer: 'Shubham', requestedBy: 'Lab (City)', businessProblem: 'Patients call repeatedly asking if reports are ready.', proposedSolution: 'Auto SMS/WhatsApp with secure report link when lab result is verified.' },
  { id: 'FEA-1008', name: 'ePrescription Module', module: 'Clinical / EMR', category: 'Efficiency', client: 'Medicare Hospital', requestDate: '2026-04-20', priority: 'High', estDevTime: '25 days', status: 'Available for All', impactScore: 8.1, reusable: true, applicableTo: ['All Hospitals'], revenueGenerated: 4100000, devCost: 720000, clientsUsing: 61, totalImpl: 70, supportTickets: 15, satisfaction: 4.5, roiScore: 85, adoptionRate: 74, functionalConsultant: 'Sneha Rao', projectManager: 'Devendra Singh', developer: 'Utkarsh', requestedBy: 'Dr. Rao (Medicare)', businessProblem: 'Handwritten prescriptions cause dispensing errors.', proposedSolution: 'Structured ePrescription with drug interaction check & pharmacy hand-off.' },
  { id: 'FEA-1009', name: 'Telemedicine Module', module: 'Clinical / EMR', category: 'Revenue', client: 'Health Plus', requestDate: '2026-04-15', priority: 'High', estDevTime: '35 days', status: 'In Development', impactScore: 8.5, reusable: true, applicableTo: ['All Hospitals'], revenueGenerated: 3300000, devCost: 1400000, clientsUsing: 9, totalImpl: 12, supportTickets: 8, satisfaction: 4.2, roiScore: 72, adoptionRate: 28, functionalConsultant: 'Sneha Rao', projectManager: 'Devendra Singh', developer: 'Utkarsh', requestedBy: 'CEO (Health Plus)', businessProblem: 'No remote consultation channel post-pandemic demand.', proposedSolution: 'Video consult with scheduling, e-prescription and online payment.' },
  { id: 'FEA-1010', name: 'Payroll Integration', module: 'Administration', category: 'Integration', client: 'Prime Hospital', requestDate: '2026-04-10', priority: 'Low', estDevTime: '15 days', status: 'Deployed', impactScore: 6.4, reusable: false, applicableTo: ['All Hospitals'], revenueGenerated: 700000, devCost: 380000, clientsUsing: 3, totalImpl: 3, supportTickets: 3, satisfaction: 4.0, roiScore: 58, adoptionRate: 12, functionalConsultant: 'Priya Menon', projectManager: 'Devendra Singh', developer: 'Priya', requestedBy: 'HR (Prime)', businessProblem: 'Manual payroll export to accounting.', proposedSolution: 'Sync attendance & payroll to finance ledger.' },
  { id: 'FEA-1011', name: 'Multi-Language Support', module: 'Mobile / Portal', category: 'Patient Experience', client: 'Global Hospital', requestDate: '2026-04-02', priority: 'Medium', estDevTime: '20 days', status: 'Available for All', impactScore: 7.3, reusable: true, applicableTo: ['All Hospitals', 'Government Hospitals'], revenueGenerated: 1900000, devCost: 480000, clientsUsing: 44, totalImpl: 50, supportTickets: 5, satisfaction: 4.6, roiScore: 83, adoptionRate: 66, functionalConsultant: 'Neha Patel', projectManager: 'Devendra Singh', developer: 'Shubham', requestedBy: 'Ops (Global)', businessProblem: 'Patients need local-language portal & receipts.', proposedSolution: 'i18n framework with runtime language switch across portal & app.' },
  { id: 'FEA-1012', name: 'Online Payment Refund', module: 'Billing', category: 'Revenue', client: 'Care Hospital', requestDate: '2026-03-28', priority: 'Medium', estDevTime: '9 days', status: 'Approved', impactScore: 6.8, reusable: true, applicableTo: ['All Hospitals'], revenueGenerated: 1100000, devCost: 240000, clientsUsing: 12, totalImpl: 14, supportTickets: 6, satisfaction: 4.1, roiScore: 68, adoptionRate: 24, functionalConsultant: 'Anita Rao', projectManager: 'Devendra Singh', developer: 'Utkarsh', requestedBy: 'Billing (Care)', businessProblem: 'Refunds against online payments are manual & slow.', proposedSolution: 'One-click gateway refund with reconciliation & audit.' },
  { id: 'FEA-1013', name: 'OPD Token System', module: 'OPD', category: 'Efficiency', client: 'City Hospital', requestDate: '2026-03-20', priority: 'Medium', estDevTime: '11 days', status: 'Deployed', impactScore: 7.1, reusable: true, applicableTo: ['All Hospitals'], revenueGenerated: 1600000, devCost: 300000, clientsUsing: 38, totalImpl: 44, supportTickets: 5, satisfaction: 4.4, roiScore: 79, adoptionRate: 58, functionalConsultant: 'Neha Patel', projectManager: 'Devendra Singh', developer: 'Shubham', requestedBy: 'OPD (City)', businessProblem: 'Disorganised OPD queues.', proposedSolution: 'Digital token with TV display & counter routing.' },
  { id: 'FEA-1014', name: 'Bed Management Live Board', module: 'IPD', category: 'Efficiency', client: 'Apollo Hospital', requestDate: '2026-03-12', priority: 'Medium', estDevTime: '14 days', status: 'Available for All', impactScore: 7.4, reusable: true, applicableTo: ['All Hospitals'], revenueGenerated: 2000000, devCost: 400000, clientsUsing: 33, totalImpl: 40, supportTickets: 6, satisfaction: 4.5, roiScore: 82, adoptionRate: 60, functionalConsultant: 'Sneha Rao', projectManager: 'Devendra Singh', developer: 'Utkarsh', requestedBy: 'Nursing (Apollo)', businessProblem: 'No real-time visibility of bed occupancy.', proposedSolution: 'Live ward board with bed status, cleaning & transfers.' },
  { id: 'FEA-1015', name: 'Barcode Printing', module: 'Laboratory', category: 'Automation', client: 'Diagno Labs', requestDate: '2026-03-05', priority: 'Low', estDevTime: '6 days', status: 'Available for All', impactScore: 6.2, reusable: true, applicableTo: ['All Hospitals', 'Diagnostic Centers'], revenueGenerated: 800000, devCost: 150000, clientsUsing: 49, totalImpl: 55, supportTickets: 3, satisfaction: 4.6, roiScore: 88, adoptionRate: 70, functionalConsultant: 'Neha Patel', projectManager: 'Devendra Singh', developer: 'Shubham', requestedBy: 'Lab (Diagno)', businessProblem: 'Sample mislabelling.', proposedSolution: 'Auto barcode print & scan for sample tracking.' },
  { id: 'FEA-1016', name: 'Patient Dashboard', module: 'Mobile / Portal', category: 'Patient Experience', client: 'All Clients', requestDate: '2026-02-25', priority: 'Medium', estDevTime: '18 days', status: 'Available for All', impactScore: 7.5, reusable: true, applicableTo: ['All Hospitals'], revenueGenerated: 2400000, devCost: 520000, clientsUsing: 52, totalImpl: 60, supportTickets: 7, satisfaction: 4.6, roiScore: 84, adoptionRate: 68, functionalConsultant: 'Neha Patel', projectManager: 'Devendra Singh', developer: 'Shubham', requestedBy: 'Product', businessProblem: 'Patients lack a single view of visits, reports & bills.', proposedSolution: 'Unified patient portal dashboard with reports, prescriptions & payments.' },
  { id: 'FEA-1017', name: 'Dynamic Package Billing', module: 'Billing', category: 'Revenue', client: 'Max Healthcare', requestDate: '2026-02-18', priority: 'High', estDevTime: '20 days', status: 'Testing', impactScore: 8.0, reusable: true, applicableTo: ['All Hospitals', 'Insurance Clients'], revenueGenerated: 3600000, devCost: 640000, clientsUsing: 14, totalImpl: 18, supportTickets: 8, satisfaction: 4.3, roiScore: 80, adoptionRate: 40, functionalConsultant: 'Anita Rao', projectManager: 'Devendra Singh', developer: 'Utkarsh', requestedBy: 'Billing (Max)', businessProblem: 'Package pricing changes are hard to configure.', proposedSolution: 'Configurable package engine with inclusions & auto-billing.' },
  { id: 'FEA-1018', name: 'Radiology AI Triage', module: 'Radiology', category: 'Automation', client: 'GE Partner', requestDate: '2026-02-10', priority: 'High', estDevTime: '40 days', status: 'New Request', impactScore: 8.6, reusable: false, applicableTo: ['All Hospitals'], revenueGenerated: 0, devCost: 1600000, clientsUsing: 0, totalImpl: 0, supportTickets: 0, satisfaction: 0, roiScore: 0, adoptionRate: 0, functionalConsultant: 'Sneha Rao', projectManager: 'Devendra Singh', developer: 'TBD', requestedBy: 'GE Partner', businessProblem: 'Radiologists overloaded; urgent studies delayed.', proposedSolution: 'AI triage flags critical studies for priority reads.' },
  { id: 'FEA-1019', name: 'NABH Compliance Dashboard', module: 'Administration', category: 'Compliance', client: 'Manipal Hospital', requestDate: '2026-02-01', priority: 'High', estDevTime: '16 days', status: 'New Request', impactScore: 7.8, reusable: true, applicableTo: ['All Hospitals', 'Government Hospitals'], revenueGenerated: 0, devCost: 500000, clientsUsing: 0, totalImpl: 0, supportTickets: 0, satisfaction: 0, roiScore: 0, adoptionRate: 0, functionalConsultant: 'Sneha Rao', projectManager: 'Devendra Singh', developer: 'TBD', requestedBy: 'Quality (Manipal)', businessProblem: 'NABH audit prep is manual.', proposedSolution: 'Live compliance dashboard tracking NABH indicators.' },
  { id: 'FEA-1020', name: 'Voice-to-Text OPD Notes', module: 'AI / Automation', category: 'Efficiency', client: 'Beta Wishlist', requestDate: '2026-01-22', priority: 'Low', estDevTime: '28 days', status: 'Under Review', impactScore: 6.6, reusable: true, applicableTo: ['All Hospitals'], revenueGenerated: 0, devCost: 900000, clientsUsing: 0, totalImpl: 0, supportTickets: 0, satisfaction: 0, roiScore: 0, adoptionRate: 0, functionalConsultant: 'Sneha Rao', projectManager: 'Devendra Singh', developer: 'TBD', requestedBy: 'Beta wishlist', businessProblem: 'Doctors spend too long typing notes.', proposedSolution: 'Speech-to-text dictation into structured OPD notes.' },
];

export const findFeature = (id) => FEATURES.find((f) => f.id === id);

// ── Module 2 · Business Analysis (keyed by feature) ─────────────────────────
export const BUSINESS_ANALYSIS = {
  'FEA-1001': { existingWorkflow: 'Front desk types insurance details manually → error-prone eligibility check by phone.', newWorkflow: 'Scan card → auto-fill → real-time eligibility → proceed to cashless billing.', objective: 'Cut OPD registration time and insurance rejections.', benefits: 'Faster registration, fewer claim rejections, better cashless experience.', functionalReq: 'Card OCR, eligibility API, scheme auto-map, exception queue.', nonFunctionalReq: 'Eligibility response < 3s, PII encrypted at rest.', dependencies: 'Insurance/TPA API (SIR), OCR service.', assumptions: 'Insurer exposes eligibility API; card format standardised.' },
  'FEA-1003': { existingWorkflow: 'Manual reminder calls by front office.', newWorkflow: 'System auto-sends WhatsApp reminders with confirm/reschedule buttons.', objective: 'Reduce appointment no-shows.', benefits: 'Higher show-up rate, lower staff effort, better patient experience.', functionalReq: 'Template management, opt-in, delivery tracking, reschedule link.', nonFunctionalReq: 'Message delivery within 30s; GDPR/consent compliant.', dependencies: 'WhatsApp Business API (SIR).', assumptions: 'Patient mobile numbers valid & opted-in.' },
  'FEA-1004': { existingWorkflow: 'Cashier manually splits charges between payer and patient.', newWorkflow: 'Rule engine auto-splits charges by configured payer ratios.', objective: 'Eliminate manual split errors and speed up billing.', benefits: 'Accurate splits, faster billing, cleaner claims.', functionalReq: 'Split rules per scheme, override with reason, audit trail.', nonFunctionalReq: 'Deterministic rounding; fully auditable.', dependencies: 'Insurance scheme master.', assumptions: 'Payer ratios known per scheme.' },
};

// ── Module 3 · Technical Analysis (keyed by feature) ────────────────────────
export const TECHNICAL_ANALYSIS = {
  'FEA-1001': { dbChanges: 'Add InsuranceCardScan table; extend PatientInsurance.', tables: 'InsuranceCardScan, PatientInsurance', storedProcs: 'usp_SaveCardScan, usp_VerifyEligibility', apis: 'POST /insurance/eligibility, POST /ocr/card', backgroundJobs: 'job_RetryEligibility (5 min)', reports: 'Insurance Rejection Report', mobileChanges: 'Card scan in patient app', portalChanges: 'Insurance panel on registration' },
  'FEA-1003': { dbChanges: 'Add AppointmentReminder table.', tables: 'AppointmentReminder', storedProcs: 'usp_QueueReminder', apis: 'POST /wa/send', backgroundJobs: 'job_SendReminders (hourly)', reports: 'No-show Trend Report', mobileChanges: '—', portalChanges: 'Reminder settings' },
  'FEA-1004': { dbChanges: 'Add BillSplitRule table; extend Invoice.', tables: 'BillSplitRule, Invoice', storedProcs: 'usp_ApplySplitRule', apis: 'POST /billing/split', backgroundJobs: '—', reports: 'Payer Split Report', mobileChanges: '—', portalChanges: 'Split preview on invoice' },
};

// ── Module 5 · Workflow Documentation (keyed by feature) ────────────────────
export const FEATURE_WORKFLOWS = {
  'FEA-1001': { steps: ['Patient Registration', 'Scan Insurance Card', 'Auto-fill Member & Scheme', 'Verify Eligibility', 'Cashless Billing', 'Generate Approval'], decisionPoints: 'Eligible? → cashless. Not eligible → cash / exception queue.', alternateFlows: 'Manual entry if scan fails.', exceptionHandling: 'Eligibility timeout → retry job; card OCR low-confidence → manual review.' },
  'FEA-1004': { steps: ['Generate Invoice', 'Load Split Rule', 'Compute Payer & Patient Share', 'Post Payer Claim', 'Collect Patient Share', 'Reconcile'], decisionPoints: 'Scheme configured? → auto-split. Else → manual.', alternateFlows: 'Manual override with reason.', exceptionHandling: 'Rounding mismatch → adjust to patient share; missing rule → block with alert.' },
};

// ── Module 6 · Development Details (keyed by feature) ───────────────────────
export const DEV_DETAILS = {
  'FEA-1001': { project: 'HIMS.API', branch: 'feature/insurance-card', developer: 'Utkarsh', startDate: '2026-05-22', completionDate: '—', codeLocation: 'HIMS.API > Insurance/Card', filesModified: 'CardService.cs, EligibilityClient.cs, RegistrationController.cs', classesModified: 'CardService, EligibilityClient', apisCreated: 'CardController.Scan(), EligibilityController.Verify()', sqlScripts: 'V101_InsuranceCardScan.sql' },
  'FEA-1004': { project: 'HIMS.API', branch: 'feature/auto-split', developer: 'Utkarsh', startDate: '2026-04-01', completionDate: '2026-04-16', codeLocation: 'HIMS.API > Billing/Split', filesModified: 'SplitEngine.cs, InvoiceService.cs', classesModified: 'SplitEngine', apisCreated: 'BillingController.Split()', sqlScripts: 'V88_BillSplitRule.sql' },
};

// ── Module 9 · Impact Analysis (keyed by feature) ───────────────────────────
export const IMPACT = {
  'FEA-1001': { revenueGenerated: 5200000, timeSaved: '4 min / registration', manualWorkReduced: '70% fewer manual entries', compliance: 'Cleaner audit trail for cashless', patientExperience: 'Faster OPD, fewer disputes', modulesAffected: 'Registration, Billing, Insurance', apisChanged: 'Eligibility, OCR', reportsChanged: 'Insurance Rejection Report', dbChanges: '2 tables, 2 SPs' },
  'FEA-1003': { revenueGenerated: 2100000, timeSaved: '1.5 hr / day front office', manualWorkReduced: 'No manual reminder calls', compliance: 'Consent captured', patientExperience: '32% fewer no-shows', modulesAffected: 'Appointments', apisChanged: 'WhatsApp send', reportsChanged: 'No-show Trend', dbChanges: '1 table' },
  'FEA-1004': { revenueGenerated: 3800000, timeSaved: '2 min / bill', manualWorkReduced: 'Zero manual splits', compliance: 'Auditable splits', patientExperience: 'Fewer billing disputes', modulesAffected: 'Billing', apisChanged: 'Split API', reportsChanged: 'Payer Split Report', dbChanges: '1 table, 1 SP' },
};

// ── Module 4 · UI / Screen Changes ──────────────────────────────────────────
export const SCREEN_CHANGES = [
  { id: 'SCR-01', featureId: 'FEA-1001', featureName: 'Insurance Card Integration', module: 'Registration', screen: 'Patient Registration', menuPath: 'Front Office > Registration', buttonAdded: 'Scan Card', control: 'Insurance Panel', validation: 'Card no. required; scheme must resolve', userRights: 'Front Office, Billing' },
  { id: 'SCR-02', featureId: 'FEA-1003', featureName: 'WhatsApp Appointment Reminder', module: 'Appointments', screen: 'Appointment Settings', menuPath: 'Settings > Appointments', buttonAdded: 'Enable Reminders', control: 'Reminder toggle', validation: 'Template required', userRights: 'Admin' },
  { id: 'SCR-03', featureId: 'FEA-1004', featureName: 'Auto Split Billing', module: 'Billing', screen: 'Invoice Screen', menuPath: 'Billing > Invoice', buttonAdded: 'Auto Split', control: 'Split preview grid', validation: 'Split rule must exist', userRights: 'Billing' },
  { id: 'SCR-04', featureId: 'FEA-1006', featureName: 'Patient Self Check-in Kiosk', module: 'OPD', screen: 'Kiosk Check-in', menuPath: 'Kiosk', buttonAdded: 'Check In', control: 'Token panel', validation: 'Appointment/UHID required', userRights: 'Kiosk' },
  { id: 'SCR-05', featureId: 'FEA-1008', featureName: 'ePrescription Module', module: 'Clinical / EMR', screen: 'Consultation', menuPath: 'EMR > Consultation', buttonAdded: 'ePrescribe', control: 'Drug grid', validation: 'Interaction check pass', userRights: 'Doctor' },
  { id: 'SCR-06', featureId: 'FEA-1013', featureName: 'OPD Token System', module: 'OPD', screen: 'Token Counter', menuPath: 'OPD > Token', buttonAdded: 'Call Next', control: 'Counter routing', validation: '—', userRights: 'OPD Staff' },
];

// ── Module 7 · Testing ──────────────────────────────────────────────────────
export const FEATURE_TESTS = [
  { id: 'FT-01', featureId: 'FEA-1001', featureName: 'Insurance Card Integration', testCase: 'Scan valid card & verify eligibility', tester: 'Anand', uatStatus: 'In Progress', bugs: 3, bugFixes: 2, qaApproval: 'Pending', clientUat: 'Pending' },
  { id: 'FT-02', featureId: 'FEA-1003', featureName: 'WhatsApp Appointment Reminder', testCase: 'Reminder sent 24h before', tester: 'Anand', uatStatus: 'Passed', bugs: 1, bugFixes: 1, qaApproval: 'Approved', clientUat: 'Approved' },
  { id: 'FT-03', featureId: 'FEA-1004', featureName: 'Auto Split Billing', testCase: 'Split 60/40 payer/patient', tester: 'Neha', uatStatus: 'Passed', bugs: 2, bugFixes: 2, qaApproval: 'Approved', clientUat: 'Approved' },
  { id: 'FT-04', featureId: 'FEA-1017', featureName: 'Dynamic Package Billing', testCase: 'Package inclusions auto-billed', tester: 'Anand', uatStatus: 'In Progress', bugs: 4, bugFixes: 2, qaApproval: 'Pending', clientUat: 'Pending' },
  { id: 'FT-05', featureId: 'FEA-1008', featureName: 'ePrescription Module', testCase: 'Drug interaction warning', tester: 'Neha', uatStatus: 'Passed', bugs: 5, bugFixes: 5, qaApproval: 'Approved', clientUat: 'Approved' },
  { id: 'FT-06', featureId: 'FEA-1009', featureName: 'Telemedicine Module', testCase: 'Video consult + e-prescription', tester: 'Anand', uatStatus: 'In Progress', bugs: 6, bugFixes: 3, qaApproval: 'Pending', clientUat: 'Pending' },
];

// ── Module 12 · Client Adoption Tracker (also Module 8 Deployment) ──────────
export const CLIENT_ADOPTION = [
  { id: 'AD-01', featureId: 'FEA-1004', featureName: 'Auto Split Billing', client: 'Lumumba Hospital', status: 'Live', goLive: '2026-01-10', version: 'V1', environment: 'Live', deployedBy: 'Utkarsh' },
  { id: 'AD-02', featureId: 'FEA-1004', featureName: 'Auto Split Billing', client: 'NSK Hospital', status: 'Live', goLive: '2026-02-20', version: 'V1', environment: 'Live', deployedBy: 'Utkarsh' },
  { id: 'AD-03', featureId: 'FEA-1004', featureName: 'Auto Split Billing', client: 'Mengo Hospital', status: 'UAT', goLive: null, version: 'V2', environment: 'UAT', deployedBy: 'Shubham' },
  { id: 'AD-04', featureId: 'FEA-1004', featureName: 'Auto Split Billing', client: 'AMH Hospital', status: 'Planned', goLive: null, version: 'V2', environment: '—', deployedBy: '—' },
  { id: 'AD-05', featureId: 'FEA-1003', featureName: 'WhatsApp Appointment Reminder', client: 'Lumumba Hospital', status: 'Live', goLive: '2026-02-01', version: 'V1', environment: 'Live', deployedBy: 'Shubham' },
  { id: 'AD-06', featureId: 'FEA-1003', featureName: 'WhatsApp Appointment Reminder', client: 'City Hospital', status: 'Live', goLive: '2026-02-15', version: 'V1', environment: 'Live', deployedBy: 'Shubham' },
  { id: 'AD-07', featureId: 'FEA-1007', featureName: 'Lab Result Auto SMS', client: 'City Hospital', status: 'Live', goLive: '2026-01-18', version: 'V1', environment: 'Live', deployedBy: 'Shubham' },
  { id: 'AD-08', featureId: 'FEA-1007', featureName: 'Lab Result Auto SMS', client: 'Diagno Labs', status: 'Live', goLive: '2026-02-12', version: 'V1', environment: 'Live', deployedBy: 'Shubham' },
  { id: 'AD-09', featureId: 'FEA-1008', featureName: 'ePrescription Module', client: 'Medicare Hospital', status: 'Live', goLive: '2026-03-05', version: 'V1', environment: 'Live', deployedBy: 'Utkarsh' },
  { id: 'AD-10', featureId: 'FEA-1001', featureName: 'Insurance Card Integration', client: 'ABC Hospital', status: 'UAT', goLive: null, version: 'V1', environment: 'UAT', deployedBy: 'Utkarsh' },
  { id: 'AD-11', featureId: 'FEA-1006', featureName: 'Patient Self Check-in Kiosk', client: 'Prime Hospital', status: 'Live', goLive: '2026-02-28', version: 'V1', environment: 'Live', deployedBy: 'Shubham' },
  { id: 'AD-12', featureId: 'FEA-1014', featureName: 'Bed Management Live Board', client: 'Apollo Hospital', status: 'Live', goLive: '2026-03-12', version: 'V1', environment: 'Live', deployedBy: 'Utkarsh' },
];

// ── Module 14 · Knowledge Base ──────────────────────────────────────────────
export const KB_DOCS = [
  { id: 'KB-01', featureId: 'FEA-1001', featureName: 'Insurance Card Integration', name: 'Insurance Card SRS.pdf', type: 'SRS', size: '1.9 MB', uploadedBy: 'Anita Rao', uploadedOn: '2026-05-21' },
  { id: 'KB-02', featureId: 'FEA-1001', featureName: 'Insurance Card Integration', name: 'Eligibility API BRD.docx', type: 'BRD', size: '820 KB', uploadedBy: 'Anita Rao', uploadedOn: '2026-05-21' },
  { id: 'KB-03', featureId: 'FEA-1003', featureName: 'WhatsApp Appointment Reminder', name: 'Reminder Config Guide.pdf', type: 'User Manual', size: '640 KB', uploadedBy: 'Neha Patel', uploadedOn: '2026-04-30' },
  { id: 'KB-04', featureId: 'FEA-1004', featureName: 'Auto Split Billing', name: 'Split Rule SQL.sql', type: 'SQL Script', size: '12 KB', uploadedBy: 'Utkarsh', uploadedOn: '2026-04-16' },
  { id: 'KB-05', featureId: 'FEA-1004', featureName: 'Auto Split Billing', name: 'Auto Split Release Notes.md', type: 'Release Notes', size: '30 KB', uploadedBy: 'Utkarsh', uploadedOn: '2026-04-17' },
  { id: 'KB-06', featureId: 'FEA-1008', featureName: 'ePrescription Module', name: 'ePrescription Training.mp4', type: 'Training Video', size: '84 MB', uploadedBy: 'Neha Patel', uploadedOn: '2026-04-25' },
  { id: 'KB-07', featureId: 'FEA-1008', featureName: 'ePrescription Module', name: 'ePrescription FAQs.pdf', type: 'FAQ', size: '210 KB', uploadedBy: 'Neha Patel', uploadedOn: '2026-04-26' },
  { id: 'KB-08', featureId: 'FEA-1007', featureName: 'Lab Result Auto SMS', name: 'Lab SMS Screenshots.zip', type: 'Screenshot', size: '3.4 MB', uploadedBy: 'Shubham', uploadedOn: '2026-04-29' },
];

// ── Approvals queue (Module 3 review / approval gate) ───────────────────────
export const APPROVALS = FEATURES
  .filter((f) => ['Under Review', 'Approved', 'New Request'].includes(f.status))
  .map((f, i) => ({
    id: `APR-${String(i + 1).padStart(2, '0')}`,
    featureId: f.id, featureName: f.name, module: f.module, priority: f.priority,
    requestedBy: f.requestedBy, requestDate: f.requestDate, impactScore: f.impactScore,
    stage: f.status === 'New Request' ? 'Business Review' : f.status === 'Under Review' ? 'Technical Review' : 'Head Approval',
    decision: f.status === 'Approved' ? 'Approved' : 'Pending',
    approver: f.status === 'Approved' ? 'Product Manager' : '—',
  }));

// ── Derived helpers ─────────────────────────────────────────────────────────
export const featureAdoption = (id) => CLIENT_ADOPTION.filter((a) => a.featureId === id);
export const featureTests = (id) => FEATURE_TESTS.filter((t) => t.featureId === id);
export const featureScreens = (id) => SCREEN_CHANGES.filter((s) => s.featureId === id);
export const featureDocs = (id) => KB_DOCS.filter((d) => d.featureId === id);

// Reusable / published feature library (Module 11)
export const FEATURE_LIBRARY = FEATURES.filter((f) => f.reusable && ['Deployed', 'Available for All'].includes(f.status));

// Top features by impact score (dashboard widget)
export const TOP_BY_IMPACT = [...FEATURES].sort((a, b) => b.impactScore - a.impactScore).slice(0, 5);

// Status distribution for the dashboard donut (illustrative all-time counts)
export const STATUS_MIX = [
  { label: 'New Request', value: 28 },
  { label: 'Under Review', value: 36 },
  { label: 'Approved', value: 58 },
  { label: 'In Development', value: 42 },
  { label: 'Testing', value: 30 },
  { label: 'Deployed', value: 88 },
  { label: 'Available for All', value: 74 },
];

// Category distribution
export const CATEGORY_MIX = FEATURE_CATEGORIES.map((c) => ({ label: c, value: FEATURES.filter((f) => f.category === c).length })).filter((x) => x.value > 0);

// Monthly feature throughput (requests vs deployed)
export const FEATURE_TREND = [
  { label: 'Jan', requested: 22, deployed: 14 },
  { label: 'Feb', requested: 26, deployed: 18 },
  { label: 'Mar', requested: 31, deployed: 21 },
  { label: 'Apr', requested: 28, deployed: 24 },
  { label: 'May', requested: 34, deployed: 26 },
  { label: 'Jun', requested: 30, deployed: 27 },
  { label: 'Jul', requested: 28, deployed: 25 },
];

// ── Dashboard Summary KPIs ──────────────────────────────────────────────────
export const SFR_KPIS = {
  totalFeatures: 356,
  newRequests: 28,
  inDevelopment: 42,
  completed: 186,
  availableForAll: 74,
  totalClients: 1102,
  revenueGenerated: 48000000,
  reusableFeatures: FEATURES.filter((f) => f.reusable).length,
  adoptionRate: 68,
  avgDevTime: 16,
  topReusable: FEATURE_LIBRARY.length,
};
