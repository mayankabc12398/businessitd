// ============================================================
// Client / Hospital master — groups, branches, contacts, escalation.
// ============================================================

export const CLIENTS = [
  {
    id: 'CL-001', name: 'City Care Hospital', group: 'City Care Group', type: 'Multi-Specialty',
    country: 'India', state: 'Maharashtra', city: 'Mumbai', beds: 420, branches: 3,
    gst: '27AACCC1234C1Z5', timezone: 'IST (GMT+5:30)', currency: 'INR',
    since: '2025-11-02', activeProjects: 1, health: 'On Track',
    contacts: [
      { name: 'Dr. Amit Verma', title: 'Medical Director (Client SPOC)', phone: '+91 98104 21210', email: 'amit.verma@citycare.in', primary: true },
      { name: 'Nisha Rao', title: 'IT Head', phone: '+91 99887 12345', email: 'nisha.rao@citycare.in' },
      { name: 'Sunil Kamat', title: 'Finance Controller', phone: '+91 98220 55221', email: 'sunil.kamat@citycare.in' },
    ],
    escalation: [
      { level: 'L1', role: 'Project Manager', name: 'Rahul Sharma', sla: '4 hrs' },
      { level: 'L2', role: 'Implementation Manager', name: 'Priya Nair', sla: '8 hrs' },
      { level: 'L3', role: 'PMO Head', name: 'Devendra Singh', sla: '24 hrs' },
    ],
  },
  { id: 'CL-002', name: 'Sunrise Medicity', group: 'Sunrise Health', type: 'Super-Specialty', country: 'India', state: 'Karnataka', city: 'Bengaluru', beds: 650, branches: 2, gst: '29AABCS7788K1Z2', timezone: 'IST (GMT+5:30)', currency: 'INR', since: '2025-09-14', activeProjects: 1, health: 'At Risk',
    contacts: [{ name: 'Dr. Meera Krishnan', title: 'COO (Client SPOC)', phone: '+91 98450 66112', email: 'meera@sunrisemedicity.in', primary: true }, { name: 'Arjun Pillai', title: 'CIO', phone: '+91 90035 77441', email: 'arjun@sunrisemedicity.in' }],
    escalation: [{ level: 'L1', role: 'Project Manager', name: 'Priya Nair', sla: '4 hrs' }, { level: 'L2', role: 'PMO Head', name: 'Devendra Singh', sla: '12 hrs' }],
  },
  { id: 'CL-003', name: 'Gulf Medical Center', group: 'Gulf Health Holdings', type: 'Multi-Specialty', country: 'United Arab Emirates', state: 'Dubai', city: 'Dubai', beds: 300, branches: 1, gst: 'TRN 100234556700003', timezone: 'GST (GMT+4)', currency: 'AED', since: '2026-01-20', activeProjects: 1, health: 'On Track',
    contacts: [{ name: 'Ahmed Al Farsi', title: 'Group CEO (Client SPOC)', phone: '+971 50 234 6677', email: 'ahmed@gulfmedical.ae', primary: true }, { name: 'Fatima Noor', title: 'Quality Head', phone: '+971 55 889 1122', email: 'fatima@gulfmedical.ae' }],
    escalation: [{ level: 'L1', role: 'Project Manager', name: 'Rahul Sharma', sla: '6 hrs' }, { level: 'L2', role: 'PMO Head', name: 'Devendra Singh', sla: '24 hrs' }],
  },
  { id: 'CL-004', name: 'Lifeline Multispeciality', group: 'Lifeline Group', type: 'Multi-Specialty', country: 'India', state: 'Delhi', city: 'New Delhi', beds: 280, branches: 4, gst: '07AAACL9911M1Z8', timezone: 'IST (GMT+5:30)', currency: 'INR', since: '2025-07-08', activeProjects: 1, health: 'Delayed',
    contacts: [{ name: 'Dr. Rachel George', title: 'Director (Client SPOC)', phone: '+91 98111 44556', email: 'rachel@lifeline.in', primary: true }],
    escalation: [{ level: 'L1', role: 'Project Manager', name: 'Priya Nair', sla: '4 hrs' }, { level: 'L2', role: 'PMO Head', name: 'Devendra Singh', sla: '12 hrs' }],
  },
  { id: 'CL-005', name: 'Nairobi County Hospital', group: 'East Africa Health', type: 'Government', country: 'Kenya', state: 'Nairobi', city: 'Nairobi', beds: 500, branches: 1, gst: 'PIN P051234567X', timezone: 'EAT (GMT+3)', currency: 'KES', since: '2026-02-11', activeProjects: 1, health: 'On Track',
    contacts: [{ name: 'Joseph Mwangi', title: 'Hospital Superintendent', phone: '+254 722 334 556', email: 'joseph@nairobicounty.go.ke', primary: true }],
    escalation: [{ level: 'L1', role: 'Project Manager', name: 'Rahul Sharma', sla: '8 hrs' }],
  },
  { id: 'CL-006', name: 'Apollo Care Clinics', group: 'Apollo Care', type: 'Clinic Chain', country: 'India', state: 'Telangana', city: 'Hyderabad', beds: 60, branches: 8, gst: '36AAACA1122P1Z1', timezone: 'IST (GMT+5:30)', currency: 'INR', since: '2026-03-30', activeProjects: 1, health: 'On Track',
    contacts: [{ name: 'Deepa Reddy', title: 'Operations Head', phone: '+91 90008 22110', email: 'deepa@apollocare.in', primary: true }],
    escalation: [{ level: 'L1', role: 'Project Manager', name: 'Priya Nair', sla: '4 hrs' }],
  },
  { id: 'CL-007', name: 'Al Noor Specialist Hospital', group: 'Al Noor Health', type: 'Super-Specialty', country: 'Saudi Arabia', state: 'Riyadh', city: 'Riyadh', beds: 380, branches: 2, gst: 'VAT 310234556700003', timezone: 'AST (GMT+3)', currency: 'SAR', since: '2025-12-05', activeProjects: 1, health: 'At Risk',
    contacts: [{ name: 'Khalid Al Otaibi', title: 'CIO (Client SPOC)', phone: '+966 55 234 7788', email: 'khalid@alnoor.sa', primary: true }],
    escalation: [{ level: 'L1', role: 'Project Manager', name: 'Rahul Sharma', sla: '6 hrs' }, { level: 'L2', role: 'PMO Head', name: 'Devendra Singh', sla: '24 hrs' }],
  },
  { id: 'CL-008', name: 'Grace Mission Hospital', group: 'Grace Trust', type: 'Trust / NGO', country: 'India', state: 'Tamil Nadu', city: 'Chennai', beds: 180, branches: 1, gst: '33AAATG5566R1Z9', timezone: 'IST (GMT+5:30)', currency: 'INR', since: '2026-04-18', activeProjects: 1, health: 'On Track',
    contacts: [{ name: 'Sister Angela Thomas', title: 'Administrator', phone: '+91 98847 33221', email: 'angela@gracemission.in', primary: true }],
    escalation: [{ level: 'L1', role: 'Project Manager', name: 'Priya Nair', sla: '8 hrs' }],
  },
  { id: 'CL-009', name: 'MetroDiagnostics Labs', group: 'Metro Group', type: 'Diagnostic Center', country: 'India', state: 'Maharashtra', city: 'Pune', beds: 0, branches: 12, gst: '27AAACM2244Q1Z4', timezone: 'IST (GMT+5:30)', currency: 'INR', since: '2026-05-22', activeProjects: 1, health: 'On Track',
    contacts: [{ name: 'Sameer Joshi', title: 'CEO', phone: '+91 99220 11223', email: 'sameer@metrodiag.in', primary: true }],
    escalation: [{ level: 'L1', role: 'Project Manager', name: 'Rahul Sharma', sla: '6 hrs' }],
  },
  { id: 'CL-010', name: 'Dhaka General Hospital', group: 'Bengal Health', type: 'Multi-Specialty', country: 'Bangladesh', state: 'Dhaka', city: 'Dhaka', beds: 340, branches: 1, gst: 'BIN 004455667788', timezone: 'BST (GMT+6)', currency: 'BDT', since: '2026-06-09', activeProjects: 1, health: 'Planning',
    contacts: [{ name: 'Dr. Zaid Rahman', title: 'Director', phone: '+880 1711 223344', email: 'zaid@dhakageneral.bd', primary: true }],
    escalation: [{ level: 'L1', role: 'Project Manager', name: 'Priya Nair', sla: '8 hrs' }],
  },
];

export const findClient = (id) => CLIENTS.find((c) => c.id === id);
export const clientName = (id) => findClient(id)?.name ?? '—';
