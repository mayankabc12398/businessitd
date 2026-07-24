// Shared formatting helpers

export const fmtINR = (n, compact = false) => {
  if (n == null || isNaN(n)) return '—';
  if (compact) {
    if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(1)} Cr`;
    if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
    if (Math.abs(n) >= 1e3) return `₹${(n / 1e3).toFixed(0)}k`;
  }
  return `₹${Number(n).toLocaleString('en-IN')}`;
};

export const fmtNum = (n) => (n == null ? '—' : Number(n).toLocaleString('en-IN'));

export const fmtDate = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return iso;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(d).padStart(2, '0')} ${months[m - 1]} ${y}`;
};

export const fmtDateShort = (iso) => {
  if (!iso) return '—';
  const [, m, d] = String(iso).split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return m && d ? `${String(d).padStart(2, '0')} ${months[m - 1]}` : iso;
};

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

// Map arbitrary status strings to badge tones
export const statusTone = (status = '') => {
  const s = String(status).toLowerCase();
  if (/(approved|active|present|paid|cleared|verified|issued|disbursed|filed|completed|confirmed|published|relieved|clear$|accepted|joined|engaged|processed|ready)/.test(s)) return 'success';
  if (/(pending|awaiting|waiting|in progress|review|scheduled|initiated|upcoming|draft|screening|applied|not started|running|attendance lock|shortlisted|on hold)/.test(s)) return 'pending';
  if (/(rejected|absent|failed|expired|escalated|discrepancy|breach|critical|final warning|overdue|withdrawn|cancelled|inactive)/.test(s)) return 'danger';
  if (/(late|hold|warning|extend|query|probation|notice|fitness|advisory|awaited)/.test(s)) return 'warning';
  if (/(on leave|interview|offer|responded|acknowledged|info|mid-review)/.test(s)) return 'info';
  return 'neutral';
};

export const priorityTone = (p = '') => ({ critical: 'danger', high: 'warning', medium: 'info', low: 'neutral' }[String(p).toLowerCase()] || 'neutral');

// CSV export
export const exportCSV = (rows, columns, filename = 'export.csv') => {
  const header = columns.map((c) => `"${c.header}"`).join(',');
  const lines = rows.map((r) =>
    columns.map((c) => {
      const raw = typeof c.accessor === 'function' ? c.accessor(r) : r[c.accessor ?? c.key];
      const v = raw == null ? '' : String(raw).replace(/"/g, '""');
      return `"${v}"`;
    }).join(',')
  );
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};
