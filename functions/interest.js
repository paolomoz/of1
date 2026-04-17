const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 3600 * 1000;

export async function onRequestPost(context) {
  const { request, env } = context;

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  // IP-based rate limit (30/hour) — conference-safe, fixed window
  const rlKey = `rl:${ip}`;
  const stored = await env.RATE_LIMIT_KV.get(rlKey);
  const now = Date.now();
  let window = stored ? JSON.parse(stored) : null;

  if (window && window.expiresAt <= now) window = null;

  if (window && window.count >= RATE_LIMIT) {
    return json({ error: 'Too many submissions. Please try again later.' }, 429);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  const name = (body.name || '').trim().slice(0, 200);
  const email = (body.email || '').trim().slice(0, 200).toLowerCase();
  const message = (body.message || '').trim().slice(0, 2000);
  const userAgent = (request.headers.get('User-Agent') || '').slice(0, 512);

  if (!name || !email || !isValidEmail(email)) {
    return json({ error: 'Name and a valid email are required.' }, 400);
  }

  // Email deduplication — one submission per email
  const existing = await env.LEADS_DB.prepare(
    'SELECT id FROM leads WHERE email = ? LIMIT 1'
  ).bind(email).first();

  if (existing) {
    return json({ error: "You're already on the list — we'll be in touch." }, 409);
  }

  await env.LEADS_DB.prepare(
    'INSERT INTO leads (name, email, message, ip, user_agent) VALUES (?, ?, ?, ?, ?)'
  ).bind(name, email, message, ip, userAgent).run();

  // Increment rate limit counter with fixed window
  const newCount = window ? window.count + 1 : 1;
  const expiresAt = window ? window.expiresAt : now + RATE_WINDOW_MS;
  await env.RATE_LIMIT_KV.put(rlKey, JSON.stringify({ count: newCount, expiresAt }), {
    expirationTtl: Math.ceil((expiresAt - now) / 1000),
  });

  return json({ success: true });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
