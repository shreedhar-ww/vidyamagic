import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import kidsRoutes from './routes/kids.js';
import progressRoutes from './routes/progress.js';
import attemptsRoutes from './routes/attempts.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'vidyamagic-api', ts: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/kids', kidsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/attempts', attemptsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ VidyaMagic API listening on http://localhost:${PORT}`);
});
