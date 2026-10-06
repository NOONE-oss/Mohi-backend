import { Router } from 'express';
import crypto from 'crypto';
import { query } from '../lib/db.js';
import { hashPassword } from '../lib/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';

export const passwordRequestsRouter = Router();

// Creates the table the first time it is needed (no manual migration).
let ready = null;
function ensureTable() {
  if (!ready) {
    ready = query(`CREATE TABLE IF NOT EXISTS pw_requests (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      center_id uuid,
      kind text NOT NULL,
      person_id uuid NOT NULL,
      identifier text NOT NULL,
      full_name text NOT NULL,
      status text NOT NULL DEFAULT 'PENDING',
      requested_at timestamptz NOT NULL DEFAULT now(),
      resolved_at timestamptz
    )`).catch((e) => { ready = null; throw e; });
  }
  return ready;
}

// Sends an email through Resend (https://resend.com) when RESEND_API_KEY and MAIL_FROM are set.
// Returns true if sent, false if email is not set up or failed. Never throws.
async function sendEmail(to, subject, text) {
  const key = process.env.RESEND_API_KEY, from = process.env.MAIL_FROM;
  if (!key || !from || !to) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, text }),
    });
    return r.ok;
  } catch { return false; }
}

function tempPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += chars[crypto.randomInt(chars.length)];
  return s;
}

// PUBLIC: anyone who forgot their password (teacher, student or admin) asks for help.
// Teachers and students go to their school admin. Admins go to IT support.
// The reply is always the same, so nobody can use this to find out which accounts exist.
passwordRequestsRouter.post('/forgot', asyncHandler(async (req, res) => {
  await ensureTable();
  const idf = String(req.body.identifier || req.body.email || '').trim();
  if (!idf) return res.status(400).json({ error: 'Enter your email or CIN number.' });

  let who = null;
  if (idf.includes('@')) {
    const email = idf.toLowerCase();
    const a = await query(`SELECT id, center_id, full_name FROM admins WHERE lower(email) = $1`, [email]);
    if (a.rows[0]) who = { kind: 'admin', id: a.rows[0].id, center: a.rows[0].center_id, name: a.rows[0].full_name, ident: email };
    else {
      const t = await query(`SELECT id, center_id, full_name FROM teachers WHERE lower(email) = $1`, [email]);
      if (t.rows[0]) who = { kind: 'teacher', id: t.rows[0].id, center: t.rows[0].center_id, name: t.rows[0].full_name, ident: email };
    }
  } else {
    const v = idf.toUpperCase(), cand = [v];
    if (/^\d+$/.test(v)) cand.push('MOHI-' + v, 'MOHI-' + v.padStart(4, '0'));
    const s = await query(`SELECT id, center_id, full_name, school_id_number FROM students WHERE upper(school_id_number) = ANY($1)`, [cand]);
    if (s.rows.length === 1) who = { kind: 'student', id: s.rows[0].id, center: s.rows[0].center_id, name: s.rows[0].full_name, ident: s.rows[0].school_id_number };
  }
  if (who) {
    const dupe = await query(`SELECT 1 FROM pw_requests WHERE person_id = $1 AND kind = $2 AND status = 'PENDING'`, [who.id, who.kind]);
    if (!dupe.rows[0]) {
      await query(`INSERT INTO pw_requests (center_id, kind, person_id, identifier, full_name) VALUES ($1, $2, $3, $4, $5)`,
        [who.center, who.kind, who.id, who.ident, who.name]);
    }
  }
  res.json({ ok: true, message: 'If that account exists, it has been reported. Your school admin (or IT support, for admin accounts) will give you a temporary password.' });
}));

// Pending requests. IT support sees all of them, across every center.
// A school admin sees only the teacher and student requests of their own center.
passwordRequestsRouter.get('/', requireAuth, asyncHandler(async (req, res) => {
  await ensureTable();
  const role = req.auth.role;
  const cols = `r.id, r.kind, r.identifier, r.full_name, r.requested_at, c.name AS center_name`;
  if (role === 'it_support') {
    const { rows } = await query(`SELECT ${cols} FROM pw_requests r LEFT JOIN centers c ON c.id = r.center_id
      WHERE r.status = 'PENDING' ORDER BY r.requested_at DESC`);
    return res.json(rows);
  }
  if (role === 'admin') {
    const { rows } = await query(`SELECT ${cols} FROM pw_requests r LEFT JOIN centers c ON c.id = r.center_id
      WHERE r.status = 'PENDING' AND r.center_id = $1 AND r.kind IN ('teacher', 'student') ORDER BY r.requested_at DESC`, [req.auth.centerId]);
    return res.json(rows);
  }
  res.status(403).json({ error: 'Not allowed' });
}));

// Set a temporary password (typed, or generated if left empty) and email it when possible.
// Teachers and students must choose a new one at next sign-in. Admins change theirs from the profile menu.
passwordRequestsRouter.post('/:id/resolve', requireAuth, asyncHandler(async (req, res) => {
  await ensureTable();
  const role = req.auth.role;
  if (role !== 'admin' && role !== 'it_support') return res.status(403).json({ error: 'Not allowed' });
  const r = await query(`SELECT * FROM pw_requests WHERE id = $1 AND status = 'PENDING'`, [req.params.id]);
  const q = r.rows[0];
  if (!q) return res.status(404).json({ error: 'Request not found or already handled' });
  if (role === 'admin' && (q.kind === 'admin' || String(q.center_id) !== String(req.auth.centerId))) {
    return res.status(403).json({ error: 'Only IT support can reset this account.' });
  }

  let pw = String(req.body.password || '').trim();
  if (pw && pw.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  if (!pw) pw = tempPassword();
  const hash = await hashPassword(pw);

  let sendTo = null, intro = '', outro = 'You will be asked to choose a new password the first time you sign in.';
  if (q.kind === 'teacher') {
    await query(`UPDATE teachers SET password_hash = $1, must_change_password = true WHERE id = $2`, [hash, q.person_id]);
    sendTo = q.identifier;
  } else if (q.kind === 'student') {
    await query(`UPDATE students SET password_hash = $1, password_changed = false WHERE id = $2`, [hash, q.person_id]);
    const s = await query(`SELECT parent_email FROM students WHERE id = $1`, [q.person_id]);
    sendTo = (s.rows[0] && s.rows[0].parent_email) || null;
    intro = `This is for ${q.full_name} (School ID ${q.identifier}). `;
  } else {
    await query(`UPDATE admins SET password_hash = $1 WHERE id = $2`, [hash, q.person_id]);
    sendTo = q.identifier;
    outro = 'After signing in, open the profile menu and choose Password to set your own.';
  }
  await query(`UPDATE pw_requests SET status = 'DONE', resolved_at = now() WHERE id = $1`, [q.id]);

  const site = process.env.APP_URL ? `\nSign in here: ${process.env.APP_URL}\n` : '\n';
  const emailed = await sendEmail(sendTo, 'Your MOHI Results temporary password',
    `Hello,\n\n${intro}A temporary password has been set for the MOHI Results system.\n\nSign in with: ${q.identifier}\nTemporary password: ${pw}\n${site}\n${outro}`);

  res.json({ ok: true, emailed, emailedTo: emailed ? sendTo : null, tempPassword: pw, kind: q.kind, identifier: q.identifier });
}));
