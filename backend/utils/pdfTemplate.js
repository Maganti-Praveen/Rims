const generateProfileHTML = (user, data, yearFilter) => {
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const yearLabel  = yearFilter ? ` — ${yearFilter}` : ' — All Years';

    /* Reusable table builder */
    const table = (headers, rows) => `
    <table>
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.length > 0 ? rows.join('') : `<tr><td colspan="${headers.length}" class="no-data">No records found</td></tr>`}</tbody>
    </table>`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>RCEE RIMS – ${user.name}</title>
  <style>
    /* ── Reset ── */
    * { margin:0; padding:0; box-sizing:border-box; }

    /* ── Base ── */
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 12px;
      color: #292524;
      background: #fff;
      padding: 0;
    }

    /* ── Page header ── */
    .page-header {
      background: linear-gradient(135deg, #9a3412 0%, #c2410c 45%, #ea580c 80%, #fb923c 100%);
      color: white;
      padding: 28px 36px 22px;
    }
    .page-header .org {
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #fed7aa;
      margin-bottom: 4px;
    }
    .page-header h1 {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.3px;
      margin-bottom: 2px;
    }
    .page-header .meta {
      font-size: 11px;
      color: #fed7aa;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-top: 6px;
    }
    .page-header .meta span { display: flex; align-items: center; gap: 4px; }
    .year-badge {
      display: inline-block;
      margin-top: 10px;
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 12px;
      border-radius: 20px;
    }

    /* ── Content wrapper ── */
    .content { padding: 24px 36px; }

    /* ── Info grid ── */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 24px;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 22px;
    }
    .info-item { font-size: 12px; color: #44403c; }
    .info-item b { color: #9a3412; margin-right: 4px; }

    /* ── Section heading ── */
    h2 {
      font-size: 13px;
      font-weight: 700;
      color: #9a3412;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      border-left: 3px solid #ea580c;
      padding-left: 10px;
      margin: 20px 0 10px;
    }

    /* ── Table ── */
    table { width: 100%; border-collapse: collapse; font-size: 11.5px; margin-bottom: 6px; }
    thead tr { background: linear-gradient(135deg,#c2410c,#ea580c); }
    th {
      color: white;
      font-weight: 600;
      padding: 7px 10px;
      text-align: left;
      font-size: 11px;
      letter-spacing: 0.03em;
    }
    td { padding: 6px 10px; border-bottom: 1px solid #f5f5f4; color: #44403c; }
    tbody tr:nth-child(even) td { background: #fff7ed; }
    tbody tr:last-child td { border-bottom: none; }
    .no-data { color: #a8a29e; font-style: italic; text-align: center; padding: 10px; }

    /* ── Footer ── */
    .page-footer {
      margin-top: 32px;
      padding: 12px 36px;
      background: #fff7ed;
      border-top: 2px solid #fed7aa;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #a8a29e;
    }
    .page-footer strong { color: #ea580c; }
  </style>
</head>
<body>

  <!-- ── Header ── -->
  <div class="page-header">
    <p class="org">Ramachandra College of Engineering &amp; Technology — RIMS</p>
    <h1>${user.name}</h1>
    <div class="meta">
      <span>🏢 ${user.department}</span>
      ${user.designation ? `<span>🎓 ${user.designation}</span>` : ''}
      <span>🪪 ${user.employeeId}</span>
    </div>
    <div><span class="year-badge">📅 ${yearLabel.trim()}</span></div>
  </div>

  <div class="content">

    <!-- ── Basic Info ── -->
    <h2>Basic Information</h2>
    <div class="info-grid">
      <div class="info-item"><b>Email:</b> ${user.email}</div>
      <div class="info-item"><b>Mobile:</b> ${user.mobileNumber || '—'}</div>
      <div class="info-item"><b>Official Email:</b> ${user.officialEmail || '—'}</div>
      <div class="info-item"><b>Domain:</b> ${user.domain || '—'}</div>
      <div class="info-item"><b>Joining Date:</b> ${formatDate(user.joiningDate)}</div>
      <div class="info-item"><b>Address:</b> ${user.address || '—'}</div>
    </div>

    <!-- ── Education ── -->
    <h2>Education</h2>
    ${table(
        ['Degree', 'University', 'Specialization', 'Year'],
        data.education.map(e => `<tr>
            <td>${e.degree}</td>
            <td>${e.university}</td>
            <td>${e.specialization || '—'}</td>
            <td>${e.year || '—'}</td>
        </tr>`)
    )}

    <!-- ── Publications ── -->
    <h2>Publications</h2>
    ${table(
        ['Title', 'Journal', 'Type', 'Indexed', 'Year'],
        data.publications.map(p => `<tr>
            <td>${p.title}</td>
            <td>${p.journalName || '—'}</td>
            <td>${p.publicationType || '—'}</td>
            <td>${p.indexedType || '—'}</td>
            <td>${p.academicYear || '—'}</td>
        </tr>`)
    )}

    <!-- ── Patents ── -->
    <h2>Patents</h2>
    ${table(
        ['Title', 'Patent No.', 'Status', 'Filing Date', 'Year'],
        data.patents.map(p => `<tr>
            <td>${p.title}</td>
            <td>${p.patentNumber || '—'}</td>
            <td>${p.status || '—'}</td>
            <td>${formatDate(p.filingDate)}</td>
            <td>${p.academicYear || '—'}</td>
        </tr>`)
    )}

    <!-- ── Workshops ── -->
    <h2>Workshops</h2>
    ${table(
        ['Title', 'Institution', 'Role', 'Date', 'Year'],
        data.workshops.map(w => `<tr>
            <td>${w.title}</td>
            <td>${w.institution || '—'}</td>
            <td>${w.role || '—'}</td>
            <td>${formatDate(w.date)}</td>
            <td>${w.academicYear || '—'}</td>
        </tr>`)
    )}

    <!-- ── Seminars ── -->
    <h2>Seminars</h2>
    ${table(
        ['Topic', 'Institution', 'Role', 'Date', 'Year'],
        data.seminars.map(s => `<tr>
            <td>${s.topic}</td>
            <td>${s.institution || '—'}</td>
            <td>${s.role || '—'}</td>
            <td>${formatDate(s.date)}</td>
            <td>${s.academicYear || '—'}</td>
        </tr>`)
    )}

    <!-- ── Certifications ── -->
    <h2>Certifications</h2>
    ${table(
        ['Title', 'Issued By', 'Date', 'Credential ID'],
        data.certifications.map(c => `<tr>
            <td>${c.title}</td>
            <td>${c.issuedBy}</td>
            <td>${formatDate(c.date)}</td>
            <td>${c.credentialId || '—'}</td>
        </tr>`)
    )}

  </div>

  <!-- ── Footer ── -->
  <div class="page-footer">
    <span>Generated by <strong>RCEE RIMS</strong> · Ramachandra College of Engineering &amp; Technology</span>
    <span>📅 ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
  </div>

</body>
</html>`;
};

module.exports = generateProfileHTML;
