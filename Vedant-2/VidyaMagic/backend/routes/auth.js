import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const r = Router();
const SECRET = process.env.JWT_SECRET || 'dev-secret';

r.post('/signup', async (req, res) => {
  const { email, password, phone } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email + password required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      'INSERT INTO users (email, password, phone) VALUES ($1, $2, $3) RETURNING id, email',
      [email, hash, phone || null]
    );
    const token = jwt.sign({ uid: rows[0].id }, SECRET, { expiresIn: '30d' });
    res.json({ token, user: rows[0] });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'email exists' });
    res.status(500).json({ error: e.message });
  }
});

r.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await query('SELECT id, password FROM users WHERE email=$1', [email]);
  if (!rows.length) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, rows[0].password);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = jwt.sign({ uid: rows[0].id }, SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: rows[0].id, email } });
});

export default r;
