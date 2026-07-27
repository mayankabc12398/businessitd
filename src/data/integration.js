// ============================================================
// Smart Integration Records (SIR) — Central Integration Repository.
// Knowledge Base + API Repository + Implementation Tracker + Code Reuse.
// Data model covers the 14 modules from the SIR spec.
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

// ── Module 1 · Integration Master ───────────────────────────────────────────
export const INTEGRATIONS = [
  { id: 'INT-01', name: 'M-Pesa Payment Gateway', type: 'Payment Gateway', vendor: 'Safaricom', company: 'Safaricom PLC', contact: 'Peter Kimani', email: 'api@safaricom.co.ke', phone: '+254 722 000 000', website: 'https://developer.safaricom.co.ke', docLink: 'https://developer.safaricom.co.ke/docs', status: 'Active', stage: 6, reusable: true, totalApis: 12, createdOn: '2025-11-04', lastUpdated: '2026-05-20', description: 'Process patient and other payments through M-Pesa Daraja platform (STK Push, C2B, B2C).' },
  { id: 'INT-02', name: 'Airtel Money Integration', type: 'Payment Gateway', vendor: 'Airtel', company: 'Airtel Africa', contact: 'Grace Mwangi', email: 'developers@airtel.africa', phone: '+254 733 100 100', website: 'https://developers.airtel.africa', docLink: 'https://developers.airtel.africa/documentation', status: 'Active', stage: 6, reusable: true, totalApis: 10, createdOn: '2025-12-10', lastUpdated: '2026-05-19', description: 'Collections & disbursements via Airtel Money for OPD/IPD billing.' },
  { id: 'INT-03', name: 'NHIF Insurance Integration', type: 'Insurance', vendor: 'NHIF', company: 'National Hospital Insurance Fund', contact: 'Samuel Otieno', email: 'edi@nhif.or.ke', phone: '+254 20 272 3000', website: 'https://www.nhif.or.ke', docLink: 'https://portal.nhif.or.ke/api', status: 'Active', stage: 5, reusable: true, totalApis: 18, createdOn: '2025-09-15', lastUpdated: '2026-05-18', description: 'Member eligibility, pre-authorisation and e-claim submission to NHIF.' },
  { id: 'INT-04', name: 'Jubilee Insurance', type: 'Insurance', vendor: 'Jubilee', company: 'Jubilee Health Insurance', contact: 'Anita Rao', email: 'techsupport@jubilee.co.ke', phone: '+254 20 328 1000', website: 'https://jubileeinsurance.com', docLink: 'https://api.jubilee.co.ke/docs', status: 'Under Testing', stage: 4, reusable: false, totalApis: 14, createdOn: '2026-02-01', lastUpdated: '2026-05-17', description: 'Real-time cashless authorisation and claim status for Jubilee members.' },
  { id: 'INT-05', name: 'NBC Bank Integration', type: 'Bank', vendor: 'NBC Bank', company: 'National Bank of Commerce', contact: 'Joseph Mushi', email: 'apisupport@nbc.co.tz', phone: '+255 22 219 7700', website: 'https://www.nbc.co.tz', docLink: 'https://developer.nbc.co.tz', status: 'Active', stage: 6, reusable: true, totalApis: 16, createdOn: '2025-10-22', lastUpdated: '2026-05-15', description: 'Bank payment collection, statement pull and settlement reconciliation.' },
  { id: 'INT-06', name: 'ZHSF Government Scheme', type: 'Government', vendor: 'ZHSF', company: 'Zanzibar Health Services Fund', contact: 'Fatma Ali', email: 'ict@zhsf.go.tz', phone: '+255 24 223 0000', website: 'https://zhsf.go.tz', docLink: 'https://zhsf.go.tz/edi', status: 'Under Testing', stage: 4, reusable: false, totalApis: 9, createdOn: '2026-01-18', lastUpdated: '2026-05-12', description: 'Government-scheme member verification and claim EDI for Zanzibar facilities.' },
  { id: 'INT-07', name: 'PACS Radiology Integration', type: 'PACS', vendor: 'GE Healthcare', company: 'GE Centricity', contact: 'Rahul Nair', email: 'support@gehealthcare.com', phone: '+1 262 544 3011', website: 'https://gehealthcare.com', docLink: 'https://gehealthcare.com/dicom', status: 'Active', stage: 6, reusable: true, totalApis: 6, createdOn: '2025-08-30', lastUpdated: '2026-05-10', description: 'DICOM modality worklist push and radiology study/report retrieval.' },
  { id: 'INT-08', name: 'LIS Lab Analyzer', type: 'LIS', vendor: 'Roche', company: 'Roche Diagnostics', contact: 'Neha Patel', email: 'lis@roche.com', phone: '+41 61 688 1111', website: 'https://roche.com', docLink: 'https://roche.com/hl7', status: 'Active', stage: 6, reusable: true, totalApis: 8, createdOn: '2025-07-12', lastUpdated: '2026-05-08', description: 'HL7 ORU result capture from Cobas analyzers into HIMS lab module.' },
  { id: 'INT-09', name: "Africa's Talking SMS", type: 'SMS Gateway', vendor: "Africa's Talking", company: "Africa's Talking Ltd", contact: 'Brian Koech', email: 'support@africastalking.com', phone: '+254 711 082 000', website: 'https://africastalking.com', docLink: 'https://developers.africastalking.com', status: 'Active', stage: 6, reusable: true, totalApis: 4, createdOn: '2025-06-01', lastUpdated: '2026-05-05', description: 'Appointment reminders, OTP and lab-report SMS notifications.' },
  { id: 'INT-10', name: 'SendGrid Email', type: 'Email Gateway', vendor: 'Twilio SendGrid', company: 'Twilio Inc.', contact: 'Amit Verma', email: 'support@sendgrid.com', phone: '+1 720 588 4000', website: 'https://sendgrid.com', docLink: 'https://docs.sendgrid.com', status: 'Active', stage: 5, reusable: true, totalApis: 3, createdOn: '2025-06-20', lastUpdated: '2026-04-28', description: 'Transactional email — invoices, discharge summaries and statements.' },
  { id: 'INT-11', name: 'Tally ERP Sync', type: 'ERP', vendor: 'Tally', company: 'Tally Solutions', contact: 'Priya Menon', email: 'support@tallysolutions.com', phone: '+91 80 2530 9770', website: 'https://tallysolutions.com', docLink: 'https://tallysolutions.com/integration', status: 'In Development', stage: 3, reusable: false, totalApis: 5, createdOn: '2026-03-05', lastUpdated: '2026-04-20', description: 'Day-book, ledger and voucher export from HIMS billing to Tally Prime.' },
  { id: 'INT-12', name: 'CRDB Bank', type: 'Bank', vendor: 'CRDB', company: 'CRDB Bank PLC', contact: 'Halima Juma', email: 'api@crdbbank.co.tz', phone: '+255 22 211 7442', website: 'https://crdbbank.co.tz', docLink: 'https://developer.crdbbank.co.tz', status: 'In Development', stage: 2, reusable: false, totalApis: 7, createdOn: '2026-04-01', lastUpdated: '2026-04-15', description: 'SimBanking collection and settlement integration for Tanzanian facilities.' },
];

export const findIntegration = (id) => INTEGRATIONS.find((i) => i.id === id);

// ── Module 2 · Business Process Flow ────────────────────────────────────────
export const PROCESS_FLOWS = {
  'INT-01': { processName: 'M-Pesa Payment Collection', steps: ['Payment Initiated (from HIMS)', 'Request to M-Pesa API', 'Validate & Process by M-Pesa', 'Response to HIMS', 'Update Payment Status in HIMS', 'Generate Receipt & Send SMS'], businessRules: 'Amount must match invoice balance. Duplicate CheckoutRequestID rejected. Timeout after 120s triggers reconciliation query.', exceptionCases: 'User cancels STK prompt · insufficient funds · callback not received (poll STK status) · duplicate transaction.' },
  'INT-03': { processName: 'NHIF Claim Submission', steps: ['Verify Member Eligibility', 'Capture Diagnosis & Services', 'Request Pre-Authorisation', 'Submit e-Claim', 'Receive Claim Reference', 'Track Claim Status'], businessRules: 'Member must be active. ICD-10 diagnosis mandatory. Pre-auth required above KES 50,000.', exceptionCases: 'Member inactive · policy expired · duplicate claim · service not covered.' },
  'INT-05': { processName: 'NBC Bank Collection', steps: ['Generate Payment Reference', 'Push Bill to Bank', 'Customer Pays at Bank/App', 'Bank Sends Callback', 'Reconcile & Update HIMS', 'Post to Ledger'], businessRules: 'Reference expires in 72h. Partial payments allowed. Settlement file pulled daily 06:00.', exceptionCases: 'Reference expired · under/over payment · callback mismatch · settlement gap.' },
  'INT-07': { processName: 'PACS Study Exchange', steps: ['Order Raised in HIMS', 'Modality Worklist Push (DICOM MWL)', 'Study Performed', 'Images Stored to PACS', 'Report Retrieved', 'Attach to Patient EMR'], businessRules: 'Accession number unique per order. Study auto-linked by MRN + accession.', exceptionCases: 'Worklist not received · orphan study · report delayed.' },
};

// ── Module 3 · API Repository ───────────────────────────────────────────────
export const APIS = [
  { id: 'API-1001', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', name: 'STK Push (Lipa Na M-Pesa)', purpose: 'Initiate customer payment prompt', method: 'POST', url: '/mpesa/stkpush/v1/processrequest', sandboxUrl: 'https://sandbox.safaricom.co.ke', liveUrl: 'https://api.safaricom.co.ke', authType: 'Bearer Token', headers: 'Authorization, Content-Type, Host', status: 'Active' },
  { id: 'API-1002', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', name: 'STK Query', purpose: 'Query status of an STK push', method: 'POST', url: '/mpesa/stkpushquery/v1/query', sandboxUrl: 'https://sandbox.safaricom.co.ke', liveUrl: 'https://api.safaricom.co.ke', authType: 'Bearer Token', headers: 'Authorization, Content-Type', status: 'Active' },
  { id: 'API-1003', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', name: 'OAuth Token', purpose: 'Generate access token', method: 'GET', url: '/oauth/v1/generate?grant_type=client_credentials', sandboxUrl: 'https://sandbox.safaricom.co.ke', liveUrl: 'https://api.safaricom.co.ke', authType: 'Basic', headers: 'Authorization (Basic)', status: 'Active' },
  { id: 'API-1004', integrationId: 'INT-02', integrationName: 'Airtel Money Integration', name: 'Collection Request', purpose: 'Request payment from subscriber', method: 'POST', url: '/merchant/v1/payments/', sandboxUrl: 'https://openapiuat.airtel.africa', liveUrl: 'https://openapi.airtel.africa', authType: 'Bearer Token', headers: 'Authorization, X-Country, X-Currency', status: 'Active' },
  { id: 'API-1005', integrationId: 'INT-03', integrationName: 'NHIF Insurance Integration', name: 'Member Eligibility', purpose: 'Check member active status & benefits', method: 'GET', url: '/api/v2/Member/{cardNo}', sandboxUrl: 'https://uat.nhif.or.ke', liveUrl: 'https://portal.nhif.or.ke', authType: 'API Key', headers: 'Authorization, HospitalCode, FacilityCode', status: 'Active' },
  { id: 'API-1006', integrationId: 'INT-03', integrationName: 'NHIF Insurance Integration', name: 'Claim Submission', purpose: 'Submit e-claim with diagnosis & services', method: 'POST', url: '/api/v2/Claim/Submit', sandboxUrl: 'https://uat.nhif.or.ke', liveUrl: 'https://portal.nhif.or.ke', authType: 'API Key', headers: 'Authorization, HospitalCode, Content-Type', status: 'Active' },
  { id: 'API-1007', integrationId: 'INT-05', integrationName: 'NBC Bank Integration', name: 'Push Bill', purpose: 'Register a payable bill reference', method: 'POST', url: '/api/collections/bills', sandboxUrl: 'https://uat.nbc.co.tz', liveUrl: 'https://api.nbc.co.tz', authType: 'OAuth 2.0', headers: 'Authorization, Client-ID, Secret-Key', status: 'Active' },
  { id: 'API-1008', integrationId: 'INT-05', integrationName: 'NBC Bank Integration', name: 'Statement Pull', purpose: 'Fetch daily settlement statement', method: 'GET', url: '/api/accounts/{acc}/statement', sandboxUrl: 'https://uat.nbc.co.tz', liveUrl: 'https://api.nbc.co.tz', authType: 'OAuth 2.0', headers: 'Authorization, Client-ID', status: 'Active' },
  { id: 'API-1009', integrationId: 'INT-07', integrationName: 'PACS Radiology Integration', name: 'Modality Worklist', purpose: 'Push order to modality worklist', method: 'POST', url: '/dicom/mwl', sandboxUrl: 'dicom://uat-pacs:104', liveUrl: 'dicom://pacs:104', authType: 'Basic', headers: 'AE-Title', status: 'Active' },
  { id: 'API-1010', integrationId: 'INT-08', integrationName: 'LIS Lab Analyzer', name: 'Result Inbound (ORU)', purpose: 'Receive HL7 ORU lab results', method: 'POST', url: '/hl7/oru', sandboxUrl: 'mllp://uat-lis:6661', liveUrl: 'mllp://lis:6661', authType: 'API Key', headers: 'MSH auth segment', status: 'Active' },
  { id: 'API-1011', integrationId: 'INT-09', integrationName: "Africa's Talking SMS", name: 'Send SMS', purpose: 'Send transactional SMS', method: 'POST', url: '/version1/messaging', sandboxUrl: 'https://api.sandbox.africastalking.com', liveUrl: 'https://api.africastalking.com', authType: 'API Key', headers: 'apiKey, Content-Type, Accept', status: 'Active' },
  { id: 'API-1012', integrationId: 'INT-10', integrationName: 'SendGrid Email', name: 'Send Mail', purpose: 'Send transactional email', method: 'POST', url: '/v3/mail/send', sandboxUrl: 'https://api.sendgrid.com', liveUrl: 'https://api.sendgrid.com', authType: 'Bearer Token', headers: 'Authorization, Content-Type', status: 'Active' },
  { id: 'API-1013', integrationId: 'INT-11', integrationName: 'Tally ERP Sync', name: 'Post Voucher', purpose: 'Export sales voucher to Tally', method: 'POST', url: '/tally/import', sandboxUrl: 'http://localhost:9000', liveUrl: 'http://tally-server:9000', authType: 'Basic', headers: 'Content-Type (XML)', status: 'In Development' },
  { id: 'API-1014', integrationId: 'INT-04', integrationName: 'Jubilee Insurance', name: 'Cashless Authorisation', purpose: 'Request cashless treatment approval', method: 'POST', url: '/api/auth/request', sandboxUrl: 'https://uat.jubilee.co.ke', liveUrl: 'https://api.jubilee.co.ke', authType: 'JWT', headers: 'Authorization, ProviderCode', status: 'Under Testing' },
];

// ── Module 4 · Payload Repository ───────────────────────────────────────────
export const PAYLOADS = [
  {
    id: 'PAY-01', apiId: 'API-1001', integrationName: 'M-Pesa Payment Gateway', apiName: 'STK Push',
    request: `{\n  "BusinessShortCode": "174379",\n  "Password": "<base64>",\n  "Timestamp": "20260520093012",\n  "TransactionType": "CustomerPayBillOnline",\n  "Amount": "1500",\n  "PartyA": "254722000000",\n  "PartyB": "174379",\n  "PhoneNumber": "254722000000",\n  "CallBackURL": "https://hims/api/mpesa/callback",\n  "AccountReference": "INV-55021",\n  "TransactionDesc": "OPD Payment"\n}`,
    response: `{\n  "MerchantRequestID": "29115-34620561-1",\n  "CheckoutRequestID": "ws_CO_20260520093012",\n  "ResponseCode": "0",\n  "ResponseDescription": "Success. Request accepted",\n  "CustomerMessage": "Success. Request accepted"\n}`,
    errors: '400 Bad Request · 401 Unauthorized · 500 Server Error · Timeout · Duplicate Transaction',
  },
  {
    id: 'PAY-02', apiId: 'API-1005', integrationName: 'NHIF Insurance Integration', apiName: 'Member Eligibility',
    request: `GET /api/v2/Member/CARD123456\nHeaders:\n  Authorization: Bearer <token>\n  HospitalCode: 01234\n  FacilityCode: FAC-001`,
    response: `{\n  "MemberNo": "CARD123456",\n  "FullName": "Jane Wanjiku",\n  "Status": "Active",\n  "Scheme": "NHIF SupaCover",\n  "Beneficiaries": 4,\n  "OutpatientBalance": 30000\n}`,
    errors: '401 Unauthorized · 404 Member Not Found · 409 Policy Expired · 500 Server Error',
  },
  {
    id: 'PAY-03', apiId: 'API-1007', integrationName: 'NBC Bank Integration', apiName: 'Push Bill',
    request: `{\n  "billReference": "INV-70233",\n  "amount": 25000,\n  "currency": "TZS",\n  "payerName": "John Mushi",\n  "expiry": "2026-05-23T23:59:59",\n  "callbackUrl": "https://hims/api/nbc/callback"\n}`,
    response: `{\n  "status": "SUCCESS",\n  "controlNumber": "991234567890",\n  "referenceNo": "NBC-70233",\n  "message": "Bill registered"\n}`,
    errors: '400 Validation Error · 401 Unauthorized · 409 Duplicate Reference · 503 Service Unavailable',
  },
];

// ── Module 5 · HIMS Changes ─────────────────────────────────────────────────
export const HIMS_CHANGES = [
  { id: 'HC-01', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', module: 'Billing', screen: 'Payment Screen', screenPath: 'Billing > Payments > Collect', control: 'Payment Mode Dropdown', button: 'Pay with M-Pesa', storedProc: 'usp_CreateMpesaPayment', apiCalled: 'STK Push', tableChanged: 'PaymentTransaction, MpesaLog', logic: 'On click, validate invoice balance, call STK Push, poll status, mark paid on callback.' },
  { id: 'HC-02', integrationId: 'INT-03', integrationName: 'NHIF Insurance Integration', module: 'Registration', screen: 'Patient Registration', screenPath: 'Front Office > Registration', control: 'Insurance Panel', button: 'Verify NHIF', storedProc: 'usp_VerifyNhifMember', apiCalled: 'Member Eligibility', tableChanged: 'PatientInsurance', logic: 'Fetch member status & benefits, auto-fill scheme, block if inactive.' },
  { id: 'HC-03', integrationId: 'INT-03', integrationName: 'NHIF Insurance Integration', module: 'Billing', screen: 'Claim Screen', screenPath: 'Insurance > Claims', control: 'Claim Grid', button: 'Submit Claim', storedProc: 'usp_SubmitNhifClaim', apiCalled: 'Claim Submission', tableChanged: 'InsuranceClaim, ClaimItem', logic: 'Compile diagnosis + services, submit e-claim, store claim reference.' },
  { id: 'HC-04', integrationId: 'INT-05', integrationName: 'NBC Bank Integration', module: 'Billing', screen: 'Invoice Screen', screenPath: 'Billing > Invoice', control: 'Control Number Label', button: 'Generate Bank Bill', storedProc: 'usp_PushNbcBill', apiCalled: 'Push Bill', tableChanged: 'BankBill', logic: 'Generate control number via bank, display to patient, reconcile on callback.' },
  { id: 'HC-05', integrationId: 'INT-07', integrationName: 'PACS Radiology Integration', module: 'Radiology', screen: 'Radiology Order', screenPath: 'Radiology > Orders', control: 'Order Grid', button: 'Send to Modality', storedProc: 'usp_PushWorklist', apiCalled: 'Modality Worklist', tableChanged: 'RadOrder', logic: 'Push accession + patient demographics to modality worklist.' },
  { id: 'HC-06', integrationId: 'INT-08', integrationName: 'LIS Lab Analyzer', module: 'Laboratory', screen: 'Result Entry', screenPath: 'Lab > Results', control: 'Result Grid', button: '(auto)', storedProc: 'usp_ReceiveLabResult', apiCalled: 'Result Inbound (ORU)', tableChanged: 'LabResult', logic: 'Parse HL7 ORU, map LOINC codes, auto-post analyzer results.' },
];

// ── Module 6 · Database Changes ─────────────────────────────────────────────
export const DB_CHANGES = [
  { id: 'DB-01', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', tableName: 'MpesaLog', newColumns: 'CheckoutRequestID, MpesaReceipt, ResultCode', alterScript: 'ALTER TABLE PaymentTransaction ADD MpesaReceipt VARCHAR(20) NULL;', newSP: 'usp_CreateMpesaPayment, usp_HandleMpesaCallback', modifiedSP: 'usp_GetInvoiceBalance', trigger: 'trg_MpesaLog_Audit', scheduler: 'job_MpesaReconcile (every 15 min)' },
  { id: 'DB-02', integrationId: 'INT-03', integrationName: 'NHIF Insurance Integration', tableName: 'InsuranceClaim', newColumns: 'ClaimReference, PreAuthCode, ClaimStatus', alterScript: 'ALTER TABLE PatientInsurance ADD NhifStatus VARCHAR(15) NULL;', newSP: 'usp_VerifyNhifMember, usp_SubmitNhifClaim', modifiedSP: 'usp_GetPatientInsurance', trigger: '—', scheduler: 'job_NhifClaimStatus (hourly)' },
  { id: 'DB-03', integrationId: 'INT-05', integrationName: 'NBC Bank Integration', tableName: 'BankBill', newColumns: 'ControlNumber, ReferenceNo, SettledOn', alterScript: 'CREATE TABLE BankBill (Id INT IDENTITY, ControlNumber VARCHAR(20), Amount DECIMAL(18,2), Status VARCHAR(15));', newSP: 'usp_PushNbcBill, usp_ReconcileNbc', modifiedSP: 'usp_PostToLedger', trigger: 'trg_BankBill_Status', scheduler: 'job_NbcSettlement (daily 06:00)' },
  { id: 'DB-04', integrationId: 'INT-08', integrationName: 'LIS Lab Analyzer', tableName: 'LabResult', newColumns: 'LoincCode, AnalyzerId, RawHl7', alterScript: 'ALTER TABLE LabResult ADD LoincCode VARCHAR(15) NULL;', newSP: 'usp_ReceiveLabResult', modifiedSP: 'usp_GetLabOrder', trigger: 'trg_LabResult_Notify', scheduler: '—' },
];

// ── Module 7 · Source Code Repository ───────────────────────────────────────
export const SOURCE_CODE = [
  { id: 'SC-01', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', project: 'HIMS.API', layer: 'Service', folder: 'Payment/Mpesa', className: 'MpesaGateway.cs', methodName: 'CreatePayment()', functionName: 'InitiateStkPush', apiServiceFile: 'MpesaService.cs' },
  { id: 'SC-02', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', project: 'HIMS.API', layer: 'Controller', folder: 'Controllers', className: 'MpesaController.cs', methodName: 'Callback()', functionName: 'HandleCallback', apiServiceFile: 'MpesaService.cs' },
  { id: 'SC-03', integrationId: 'INT-03', integrationName: 'NHIF Insurance Integration', project: 'HIMS.API', layer: 'Service', folder: 'Insurance/Nhif', className: 'NhifService.cs', methodName: 'VerifyMember()', functionName: 'GetEligibility', apiServiceFile: 'NhifClient.cs' },
  { id: 'SC-04', integrationId: 'INT-05', integrationName: 'NBC Bank Integration', project: 'HIMS.API', layer: 'Service', folder: 'Banking/Nbc', className: 'NbcGateway.cs', methodName: 'PushBill()', functionName: 'RegisterBill', apiServiceFile: 'NbcClient.cs' },
  { id: 'SC-05', integrationId: 'INT-08', integrationName: 'LIS Lab Analyzer', project: 'HIMS.Interface', layer: 'Worker', folder: 'Hl7/Lis', className: 'Hl7Listener.cs', methodName: 'OnMessage()', functionName: 'ParseOru', apiServiceFile: 'LisParser.cs' },
];

// ── Module 8 · Screen Repository ────────────────────────────────────────────
export const SCREENS = [
  { id: 'SR-01', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', screenName: 'Payment Screen', changedControls: 'Payment Mode dropdown, Phone input', validation: 'Phone 12 digits, amount ≤ balance', buttons: 'Pay with M-Pesa, Check Status', dropdowns: 'Payment Mode', newFields: 'M-Pesa Receipt No.' },
  { id: 'SR-02', integrationId: 'INT-03', integrationName: 'NHIF Insurance Integration', screenName: 'Patient Registration', changedControls: 'Insurance panel, Verify button', validation: 'Card no. required, member active', buttons: 'Verify NHIF', dropdowns: 'Scheme', newFields: 'Member No., Benefits balance' },
  { id: 'SR-03', integrationId: 'INT-05', integrationName: 'NBC Bank Integration', screenName: 'Invoice Screen', changedControls: 'Control number label', validation: 'Reference not expired', buttons: 'Generate Bank Bill', dropdowns: '—', newFields: 'Control Number' },
  { id: 'SR-04', integrationId: 'INT-07', integrationName: 'PACS Radiology Integration', screenName: 'Radiology Order', changedControls: 'Order grid, Send button', validation: 'Accession unique', buttons: 'Send to Modality', dropdowns: 'Modality', newFields: 'Accession No.' },
];

// ── Module 9 · Client Implementation ────────────────────────────────────────
export const CLIENT_IMPLEMENTATIONS = [
  { id: 'CI-01', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', client: 'Lumumba Hospital', status: 'Live', liveDate: '2026-01-20', version: 'V1.1' },
  { id: 'CI-02', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', client: 'NSK Hospital', status: 'Live', liveDate: '2026-02-25', version: 'V1.0' },
  { id: 'CI-03', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', client: 'Mengo Hospital', status: 'UAT', liveDate: null, version: 'V2.0' },
  { id: 'CI-04', integrationId: 'INT-03', integrationName: 'NHIF Insurance Integration', client: 'Lumumba Hospital', status: 'Live', liveDate: '2025-12-10', version: 'V1.2' },
  { id: 'CI-05', integrationId: 'INT-03', integrationName: 'NHIF Insurance Integration', client: 'Abdulla Mzee Hospital', status: 'Live', liveDate: '2026-01-15', version: 'V1.1' },
  { id: 'CI-06', integrationId: 'INT-03', integrationName: 'NHIF Insurance Integration', client: 'Arusha Hospital', status: 'UAT', liveDate: null, version: 'V1.2' },
  { id: 'CI-07', integrationId: 'INT-05', integrationName: 'NBC Bank Integration', client: 'Mengo Hospital', status: 'Live', liveDate: '2026-02-01', version: 'V1.0' },
  { id: 'CI-08', integrationId: 'INT-05', integrationName: 'NBC Bank Integration', client: 'Abdulla Mzee Hospital', status: 'Live', liveDate: '2026-03-05', version: 'V1.0' },
  { id: 'CI-09', integrationId: 'INT-07', integrationName: 'PACS Radiology Integration', client: 'Lumumba Hospital', status: 'Live', liveDate: '2025-11-18', version: 'V1.0' },
  { id: 'CI-10', integrationId: 'INT-07', integrationName: 'PACS Radiology Integration', client: 'Arusha Hospital', status: 'Live', liveDate: '2026-02-12', version: 'V1.0' },
  { id: 'CI-11', integrationId: 'INT-08', integrationName: 'LIS Lab Analyzer', client: 'Lumumba Hospital', status: 'Live', liveDate: '2025-10-30', version: 'V1.1' },
  { id: 'CI-12', integrationId: 'INT-09', integrationName: "Africa's Talking SMS", client: 'NSK Hospital', status: 'Live', liveDate: '2025-09-01', version: 'V1.0' },
  { id: 'CI-13', integrationId: 'INT-06', integrationName: 'ZHSF Government Scheme', client: 'Abdulla Mzee Hospital', status: 'UAT', liveDate: null, version: 'V1.0' },
  { id: 'CI-14', integrationId: 'INT-04', integrationName: 'Jubilee Insurance', client: 'Arusha Hospital', status: 'UAT', liveDate: null, version: 'V1.0' },
];

// ── Module 10 · Testing ─────────────────────────────────────────────────────
export const TEST_CASES = [
  { id: 'TC-01', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', testCase: 'Successful STK push & callback', apiTested: 'STK Push', tester: 'Shubham', testDate: '2026-01-10', result: 'Pass', bugFound: 0, bugFixed: 0 },
  { id: 'TC-02', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', testCase: 'User cancels prompt', apiTested: 'STK Query', tester: 'Shubham', testDate: '2026-01-10', result: 'Pass', bugFound: 1, bugFixed: 1 },
  { id: 'TC-03', integrationId: 'INT-03', integrationName: 'NHIF Insurance Integration', testCase: 'Inactive member blocked', apiTested: 'Member Eligibility', tester: 'Anand', testDate: '2026-01-22', result: 'Pass', bugFound: 0, bugFixed: 0 },
  { id: 'TC-04', integrationId: 'INT-03', integrationName: 'NHIF Insurance Integration', testCase: 'Claim above 50k needs pre-auth', apiTested: 'Claim Submission', tester: 'Anand', testDate: '2026-01-23', result: 'Fail', bugFound: 2, bugFixed: 1 },
  { id: 'TC-05', integrationId: 'INT-05', integrationName: 'NBC Bank Integration', testCase: 'Control number generation', apiTested: 'Push Bill', tester: 'Utkarsh', testDate: '2026-02-15', result: 'Pass', bugFound: 0, bugFixed: 0 },
  { id: 'TC-06', integrationId: 'INT-04', integrationName: 'Jubilee Insurance', testCase: 'Cashless auth approval flow', apiTested: 'Cashless Authorisation', tester: 'Anand', testDate: '2026-05-02', result: 'In Progress', bugFound: 1, bugFixed: 0 },
  { id: 'TC-07', integrationId: 'INT-08', integrationName: 'LIS Lab Analyzer', testCase: 'ORU parse & LOINC mapping', apiTested: 'Result Inbound (ORU)', tester: 'Neha', testDate: '2026-03-11', result: 'Pass', bugFound: 3, bugFixed: 3 },
  { id: 'TC-08', integrationId: 'INT-11', integrationName: 'Tally ERP Sync', testCase: 'Voucher XML export', apiTested: 'Post Voucher', tester: 'Priya', testDate: '2026-04-18', result: 'In Progress', bugFound: 2, bugFixed: 1 },
];

// ── Module 11 · Documents ───────────────────────────────────────────────────
export const INT_DOCUMENTS = [
  { id: 'DOC-01', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', name: 'Daraja API Reference.pdf', type: 'API PDF', size: '2.4 MB', uploadedBy: 'Shubham', uploadedOn: '2025-11-05' },
  { id: 'DOC-02', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', name: 'M-Pesa.postman_collection.json', type: 'Postman Collection', size: '84 KB', uploadedBy: 'Shubham', uploadedOn: '2025-11-06' },
  { id: 'DOC-03', integrationId: 'INT-03', integrationName: 'NHIF Insurance Integration', name: 'NHIF EDI Spec v2.pdf', type: 'API PDF', size: '3.1 MB', uploadedBy: 'Anand', uploadedOn: '2025-09-16' },
  { id: 'DOC-04', integrationId: 'INT-03', integrationName: 'NHIF Insurance Integration', name: 'NHIF Field Mapping.xlsx', type: 'Excel Mapping', size: '210 KB', uploadedBy: 'Anand', uploadedOn: '2025-09-20' },
  { id: 'DOC-05', integrationId: 'INT-05', integrationName: 'NBC Bank Integration', name: 'NBC Collections Swagger.yaml', type: 'Swagger', size: '46 KB', uploadedBy: 'Utkarsh', uploadedOn: '2025-10-25' },
  { id: 'DOC-06', integrationId: 'INT-05', integrationName: 'NBC Bank Integration', name: 'NBC BRD.docx', type: 'BRD', size: '1.2 MB', uploadedBy: 'Utkarsh', uploadedOn: '2025-10-23' },
  { id: 'DOC-07', integrationId: 'INT-07', integrationName: 'PACS Radiology Integration', name: 'DICOM Conformance.pdf', type: 'API PDF', size: '1.8 MB', uploadedBy: 'Rahul', uploadedOn: '2025-08-31' },
  { id: 'DOC-08', integrationId: 'INT-08', integrationName: 'LIS Lab Analyzer', name: 'HL7 ORU Sample.txt', type: 'Image', size: '12 KB', uploadedBy: 'Neha', uploadedOn: '2025-07-13' },
  { id: 'DOC-09', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', name: 'DB Change Script.sql', type: 'SQL Script', size: '8 KB', uploadedBy: 'Shubham', uploadedOn: '2025-11-08' },
];

// ── Module 12 · Version History ─────────────────────────────────────────────
export const VERSION_HISTORY = [
  { id: 'VH-01', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', version: 'V1.0', date: '2026-01-10', modifiedBy: 'Shubham', changes: 'Initial integration — STK Push + callback' },
  { id: 'VH-02', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', version: 'V1.1', date: '2026-01-15', modifiedBy: 'Anand', changes: 'OAuth token caching, timeout handling' },
  { id: 'VH-03', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', version: 'V2.0', date: '2026-03-20', modifiedBy: 'Utkarsh', changes: 'Added B2C refund API + reconciliation job' },
  { id: 'VH-04', integrationId: 'INT-03', integrationName: 'NHIF Insurance Integration', version: 'V1.0', date: '2025-09-15', modifiedBy: 'Anand', changes: 'Member eligibility + claim submission' },
  { id: 'VH-05', integrationId: 'INT-03', integrationName: 'NHIF Insurance Integration', version: 'V1.2', date: '2026-02-10', modifiedBy: 'Anand', changes: 'Pre-authorisation flow, claim status polling' },
  { id: 'VH-06', integrationId: 'INT-05', integrationName: 'NBC Bank Integration', version: 'V1.0', date: '2026-02-01', modifiedBy: 'Utkarsh', changes: 'Push bill + settlement reconciliation' },
  { id: 'VH-07', integrationId: 'INT-08', integrationName: 'LIS Lab Analyzer', version: 'V1.1', date: '2026-03-11', modifiedBy: 'Neha', changes: 'LOINC mapping, auto-post results' },
];

// ── Module 13 · Developer Notes ─────────────────────────────────────────────
export const DEVELOPER_NOTES = [
  { id: 'DN-01', integrationId: 'INT-01', integrationName: 'M-Pesa Payment Gateway', codeLocation: 'HIMS.API > Payment/Mpesa > MpesaGateway.cs', importantNotes: 'Token valid 3599s — cache it. Password = Base64(Shortcode+Passkey+Timestamp).', commonErrors: '404.001 invalid token · 500.001.1001 duplicate · callback not hitting (check public URL).', debuggingSteps: 'Log MerchantRequestID. Use STK Query when callback missing. Verify CallBackURL is HTTPS & reachable.', deploymentSteps: 'Set Shortcode/Passkey/ConsumerKey/Secret in appsettings. Whitelist callback IP. Run DB script.' },
  { id: 'DN-02', integrationId: 'INT-03', integrationName: 'NHIF Insurance Integration', codeLocation: 'HIMS.API > Insurance/Nhif > NhifService.cs', importantNotes: 'HospitalCode + FacilityCode mandatory in every header. ICD-10 required for claims.', commonErrors: '401 expired key · 404 member not found · 409 policy expired.', debuggingSteps: 'Check member status first. Validate ICD-10 before submit. Inspect ClaimReference in response.', deploymentSteps: 'Configure API key + hospital/facility codes per client. Whitelist facility with NHIF.' },
  { id: 'DN-03', integrationId: 'INT-05', integrationName: 'NBC Bank Integration', codeLocation: 'HIMS.API > Banking/Nbc > NbcGateway.cs', importantNotes: 'Control number expires in 72h. Settlement file pulled daily 06:00 by scheduler.', commonErrors: '409 duplicate reference · settlement mismatch · callback signature invalid.', debuggingSteps: 'Verify HMAC signature on callback. Reconcile against settlement statement.', deploymentSteps: 'Set Client-ID/Secret. Configure settlement account. Enable job_NbcSettlement.' },
];

// ── Vendors / Partners ──────────────────────────────────────────────────────
export const VENDORS = [
  { id: 'VN-01', name: 'Safaricom', company: 'Safaricom PLC', contact: 'Peter Kimani', email: 'api@safaricom.co.ke', phone: '+254 722 000 000', website: 'developer.safaricom.co.ke', type: 'Payment Gateway', integrations: 1 },
  { id: 'VN-02', name: 'Airtel', company: 'Airtel Africa', contact: 'Grace Mwangi', email: 'developers@airtel.africa', phone: '+254 733 100 100', website: 'developers.airtel.africa', type: 'Payment Gateway', integrations: 1 },
  { id: 'VN-03', name: 'NHIF', company: 'National Hospital Insurance Fund', contact: 'Samuel Otieno', email: 'edi@nhif.or.ke', phone: '+254 20 272 3000', website: 'nhif.or.ke', type: 'Insurance', integrations: 1 },
  { id: 'VN-04', name: 'Jubilee', company: 'Jubilee Health Insurance', contact: 'Anita Rao', email: 'techsupport@jubilee.co.ke', phone: '+254 20 328 1000', website: 'jubileeinsurance.com', type: 'Insurance', integrations: 1 },
  { id: 'VN-05', name: 'NBC Bank', company: 'National Bank of Commerce', contact: 'Joseph Mushi', email: 'apisupport@nbc.co.tz', phone: '+255 22 219 7700', website: 'nbc.co.tz', type: 'Bank', integrations: 1 },
  { id: 'VN-06', name: 'CRDB', company: 'CRDB Bank PLC', contact: 'Halima Juma', email: 'api@crdbbank.co.tz', phone: '+255 22 211 7442', website: 'crdbbank.co.tz', type: 'Bank', integrations: 1 },
  { id: 'VN-07', name: 'GE Healthcare', company: 'GE Centricity', contact: 'Rahul Nair', email: 'support@gehealthcare.com', phone: '+1 262 544 3011', website: 'gehealthcare.com', type: 'PACS', integrations: 1 },
  { id: 'VN-08', name: 'Roche', company: 'Roche Diagnostics', contact: 'Neha Patel', email: 'lis@roche.com', phone: '+41 61 688 1111', website: 'roche.com', type: 'LIS', integrations: 1 },
  { id: 'VN-09', name: "Africa's Talking", company: "Africa's Talking Ltd", contact: 'Brian Koech', email: 'support@africastalking.com', phone: '+254 711 082 000', website: 'africastalking.com', type: 'SMS Gateway', integrations: 1 },
  { id: 'VN-10', name: 'Twilio SendGrid', company: 'Twilio Inc.', contact: 'Amit Verma', email: 'support@sendgrid.com', phone: '+1 720 588 4000', website: 'sendgrid.com', type: 'Email Gateway', integrations: 1 },
];

// ── Derived helpers ─────────────────────────────────────────────────────────
export const integrationApis = (id) => APIS.filter((a) => a.integrationId === id);
export const integrationClients = (id) => CLIENT_IMPLEMENTATIONS.filter((c) => c.integrationId === id);
export const integrationVersions = (id) => VERSION_HISTORY.filter((v) => v.integrationId === id);
export const integrationDocs = (id) => INT_DOCUMENTS.filter((d) => d.integrationId === id);
export const integrationHimsChanges = (id) => HIMS_CHANGES.filter((h) => h.integrationId === id);

// Type distribution for the dashboard donut (grouped)
export const TYPE_MIX = [
  { label: 'Payment Gateways', value: INTEGRATIONS.filter((i) => i.type === 'Payment Gateway').length },
  { label: 'Insurance Companies', value: INTEGRATIONS.filter((i) => i.type === 'Insurance').length },
  { label: 'Banks', value: INTEGRATIONS.filter((i) => i.type === 'Bank').length },
  { label: 'Government / Others', value: INTEGRATIONS.filter((i) => !['Payment Gateway', 'Insurance', 'Bank'].includes(i.type)).length },
];

// ── Dashboard Summary KPIs (Module: Dashboard Summary) ──────────────────────
export const SIR_KPIS = {
  totalIntegrations: INTEGRATIONS.length,
  activeIntegrations: INTEGRATIONS.filter((i) => i.status === 'Active').length,
  totalClients: new Set(CLIENT_IMPLEMENTATIONS.map((c) => c.client)).size,
  totalApis: APIS.length,
  screensModified: HIMS_CHANGES.length,
  dbChanges: DB_CHANGES.length,
  documents: INT_DOCUMENTS.length,
  liveIntegrations: new Set(CLIENT_IMPLEMENTATIONS.filter((c) => c.status === 'Live').map((c) => c.integrationId)).size,
  underTesting: INTEGRATIONS.filter((i) => i.status === 'Under Testing').length,
  inDevelopment: INTEGRATIONS.filter((i) => i.status === 'In Development').length,
  reusable: INTEGRATIONS.filter((i) => i.reusable).length,
  completedImplementations: CLIENT_IMPLEMENTATIONS.filter((c) => c.status === 'Live').length,
};
