import { Router } from 'express';
import { query } from '../db.js';

const r = Router();

// Create a kid
r.post('/', async (req, res) => {
  const { userId, name, age, grade, theme } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    const { rows } = await query(
      `INSERT INTO kids (user_id, name, age, grade, theme)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId || null, name, age || 7, grade || 2, theme || 'magic']
    );
    res.json({ kid: rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get kids for a user
r.get('/:userId', async (req, res) => {
  const { rows } = await query(
    'SELECT * FROM kids WHERE user_id=$1 ORDER BY created_at',
    [req.params.userId]
  );
  res.json({ kids: rows });
});

export default r;
