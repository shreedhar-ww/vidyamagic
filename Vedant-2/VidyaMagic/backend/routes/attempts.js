import { Router } from 'express';
import { query } from '../db.js';

const r = Router();

// Log a single attempt (or batch)
r.post('/', async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : [req.body];
  try {
    for (const a of items) {
      await query(
        `INSERT INTO attempts
           (kid_id, subject, topic, skill, difficulty, question,
            answer_given, is_correct, time_taken)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [a.kidId, a.subject, a.topic, a.skill, a.difficulty,
         a.question, String(a.answerGiven), a.isCorrect, a.timeTaken]
      );
    }
    res.json({ ok: true, count: items.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get recent attempts for a kid (for dashboard)
r.get('/detail/:kidId', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT question, answer_given, is_correct, time_taken, skill, difficulty, created_at
       FROM attempts WHERE kid_id=$1
       ORDER BY created_at DESC LIMIT 50`,
      [req.params.kidId]
    );
    res.json({ attempts: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default r;
