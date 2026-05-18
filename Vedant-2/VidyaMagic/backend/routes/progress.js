import { Router } from 'express';
import { query } from '../db.js';

const r = Router();

// Get all progress for a kid
r.get('/:kidId', async (req, res) => {
  const { kidId } = req.params;
  const progress = await query('SELECT * FROM progress WHERE kid_id=$1', [kidId]);
  const skills = await query('SELECT * FROM skill_state WHERE kid_id=$1', [kidId]);
  res.json({ progress: progress.rows, skills: skills.rows });
});

// Sync localStorage progress → DB (upsert)
r.post('/sync', async (req, res) => {
  const { kidId, topics, skills } = req.body;
  if (!kidId) return res.status(400).json({ error: 'kidId required' });

  try {
    // Upsert topics
    for (const t of topics || []) {
      await query(
        `INSERT INTO progress (kid_id, subject, topic, current_level, sections, stars, last_played)
         VALUES ($1,$2,$3,$4,$5,$6,NOW())
         ON CONFLICT (kid_id, subject, topic)
         DO UPDATE SET current_level=$4, sections=$5, stars=$6, last_played=NOW()`,
        [kidId, t.subject, t.topic, t.currentLevel, JSON.stringify(t.sections), t.stars]
      );
    }
    // Upsert skills
    for (const s of skills || []) {
      await query(
        `INSERT INTO skill_state
           (kid_id, skill, difficulty, mastery, streak, last_results,
            total_attempts, total_correct, weak_spots, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
         ON CONFLICT (kid_id, skill)
         DO UPDATE SET difficulty=$3, mastery=$4, streak=$5, last_results=$6,
           total_attempts=$7, total_correct=$8, weak_spots=$9, updated_at=NOW()`,
        [kidId, s.skill, s.difficulty, s.mastery, s.streak,
         JSON.stringify(s.lastResults), s.totalAttempts, s.totalCorrect,
         JSON.stringify(s.weakSpots || [])]
      );
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default r;
