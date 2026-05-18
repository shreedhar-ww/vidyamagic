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

export default r;
