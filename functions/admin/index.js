const PAGE_SIZE = 500;

function requireAuth(request, env) {
  if (!env.ADMIN_PASSWORD) return new Response('Admin not configured.', { status: 503 });
  const authHeader = request.headers.get('Authorization') || '';
  const expected = 'Basic ' + btoa(`admin:${env.ADMIN_PASSWORD}`);
  if (!timingSafeEqual(authHeader, expected)) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="of1 Admin"' },
    });
  }
  return null;
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const authError = requireAuth(request, env);
  if (authError) return authError;

  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'), 10);
  if (!id || id < 1) return new Response('Invalid id.', { status: 400 });

  await env.LEADS_DB.prepare('DELETE FROM leads WHERE id = ?').bind(id).run();
  return new Response(null, { status: 204 });
}

export async function onRequest(context) {
  const { request, env } = context;
  const authError = requireAuth(request, env);
  if (authError) return authError;

  const url = new URL(request.url);

  // CSV download
  if (url.searchParams.get('format') === 'csv') {
    const { results } = await env.LEADS_DB.prepare(
      'SELECT id, name, email, message, ip, created_at FROM leads ORDER BY created_at DESC LIMIT ?'
    ).bind(PAGE_SIZE).all();

    const rows = [
      ['ID', 'Name', 'Email', 'Message', 'IP', 'Submitted At'],
      ...results.map(r => [r.id, r.name, r.email, r.message || '', r.ip || '', r.created_at]),
    ];

    const csv = rows.map(row =>
      row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="of1-leads.csv"',
      },
    });
  }

  // HTML admin page
  const { results } = await env.LEADS_DB.prepare(
    'SELECT id, name, email, message, ip, created_at FROM leads ORDER BY created_at DESC LIMIT ?'
  ).bind(PAGE_SIZE).all();

  const rows = results.map(r => `
    <tr id="row-${r.id}">
      <td class="meta">${esc(r.id)}</td>
      <td>${esc(r.name)}</td>
      <td>${esc(r.email)}</td>
      <td class="msg">${esc(r.message || '—')}</td>
      <td class="meta">${esc(r.ip || '—')}</td>
      <td class="meta">${esc(r.created_at)}</td>
      <td class="actions"><button class="del-btn" onclick="deleteLead(${r.id}, this)" title="Delete">&#x2715;</button></td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>of1 — Interest Leads</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #1C1917;
    --fg: #F5F0E8;
    --accent: #FF3D00;
    --tertiary: #00E5A0;
    --dim: rgba(245,240,232,0.55);
    --faint: rgba(245,240,232,0.07);
    --border: rgba(245,240,232,0.12);
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--bg); color:var(--fg); font-family:'JetBrains Mono',monospace; font-size:13px; line-height:1.6; padding:2rem; }
  header { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:2.5rem; flex-wrap:wrap; gap:1rem; }
  h1 { font-family:'Cormorant Garamond',serif; font-size:2.5rem; font-weight:400; }
  h1 em { color:var(--accent); font-style:italic; }
  .meta-row { display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap; }
  .count { color:var(--dim); font-size:0.85rem; }
  .count strong { color:var(--tertiary); }
  .csv-link { color:var(--accent); text-decoration:none; font-size:0.8rem; letter-spacing:0.1em; text-transform:uppercase; border:1px solid var(--accent); padding:0.4rem 0.9rem; border-radius:100px; transition:background 0.2s, color 0.2s; }
  .csv-link:hover { background:var(--accent); color:var(--bg); }
  .table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; }
  thead tr { border-bottom:1px solid var(--border); }
  th { text-align:left; padding:0.6rem 1rem; font-size:0.7rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--dim); font-weight:500; white-space:nowrap; }
  td { padding:0.75rem 1rem; border-bottom:1px solid var(--faint); vertical-align:top; }
  .msg { max-width:360px; color:var(--dim); }
  .meta { color:var(--dim); font-size:0.8rem; white-space:nowrap; }
  .actions { width:1px; white-space:nowrap; }
  tbody tr:hover td { background:var(--faint); }
  tbody tr.deleting td { opacity:0.4; transition:opacity 0.2s; }
  .del-btn {
    background: none;
    border: 1px solid rgba(255,61,0,0.25);
    color: var(--accent);
    border-radius: 4px;
    padding: 0.2rem 0.5rem;
    cursor: pointer;
    font-size: 0.75rem;
    opacity: 0.5;
    transition: opacity 0.15s, background 0.15s;
  }
  .del-btn:hover { opacity:1; background: rgba(255,61,0,0.1); }
  .empty { text-align:center; padding:4rem; color:var(--dim); }
  .empty em { font-family:'Cormorant Garamond',serif; font-size:1.5rem; display:block; margin-bottom:0.5rem; color:var(--fg); }
  .limit-note { color:var(--dim); font-size:0.75rem; margin-top:1rem; }
</style>
</head>
<body>
<header>
  <h1>of1 <em>leads</em></h1>
  <div class="meta-row">
    <span class="count">Showing <strong id="entryCount">${results.length}</strong> most recent ${results.length === 1 ? 'entry' : 'entries'}</span>
    <a href="?format=csv" class="csv-link">Download CSV</a>
  </div>
</header>
<div class="table-wrap">
${results.length === 0 ? '<div class="empty"><em>No leads yet.</em>Check back after the conference.</div>' : `
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Name</th>
      <th>Email</th>
      <th>Message</th>
      <th>IP</th>
      <th>Submitted</th>
      <th></th>
    </tr>
  </thead>
  <tbody id="leadsBody">${rows}</tbody>
</table>
<p class="limit-note">Showing up to ${PAGE_SIZE} most recent entries. Use CSV download for the full dataset.</p>`}
</div>
<script>
async function deleteLead(id, btn) {
  if (!confirm('Delete this lead? This cannot be undone.')) return;
  const row = document.getElementById('row-' + id);
  row.classList.add('deleting');
  btn.disabled = true;
  try {
    const res = await fetch('/admin?id=' + id, { method: 'DELETE' });
    if (res.ok) {
      row.remove();
      const counter = document.getElementById('entryCount');
      if (counter) counter.textContent = parseInt(counter.textContent, 10) - 1;
    } else {
      alert('Delete failed. Please try again.');
      row.classList.remove('deleting');
      btn.disabled = false;
    }
  } catch {
    alert('Network error. Please try again.');
    row.classList.remove('deleting');
    btn.disabled = false;
  }
}
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}

function timingSafeEqual(a, b) {
  const te = new TextEncoder();
  const ba = te.encode(a);
  const bb = te.encode(b);
  if (ba.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ bb[i];
  return diff === 0;
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
