const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Categories
app.get('/api/categories', async (req, res) => {
  const { userId } = req.query;
  const result = await db.query('SELECT * FROM categories WHERE user_id = $1', [userId]);
  res.json(result.rows);
});

app.post('/api/categories', async (req, res) => {
  const { name, userId } = req.body;
  const result = await db.query(
    'INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING *',
    [name, userId]
  );
  res.json(result.rows[0]);
});

// Questions
app.post('/api/questions', async (req, res) => {
  const { categoryId, text } = req.body;
  const result = await db.query(
    'INSERT INTO questions (category_id, text) VALUES ($1, $2) RETURNING *',
    [categoryId, text]
  );
  res.json(result.rows[0]);
});

app.get('/api/questions', async (req, res) => {
  const { categoryId } = req.query;
  const result = await db.query('SELECT * FROM questions WHERE category_id = $1', [categoryId]);
  res.json(result.rows);
});

// Recordings
app.post('/api/recordings', async (req, res) => {
  const { questionId, audioUrl } = req.body;
  const result = await db.query(
    'INSERT INTO recordings (question_id, audio_url) VALUES ($1, $2) RETURNING *',
    [questionId, audioUrl]
  );
  res.json(result.rows[0]);
});

app.get('/api/recordings', async (req, res) => {
  const { questionId } = req.query;
  const result = await db.query('SELECT * FROM recordings WHERE question_id = $1', [questionId]);
  res.json(result.rows);
});

// server/server.js (add to existing code)
const audioStorageService = require('./services/audioStorageService');

// Serve audio files statically
app.use('/audio-uploads', express.static('audio-uploads'));

// Update recordings endpoint to handle audio upload
app.post('/api/recordings', async (req, res) => {
  try {
    const { questionId, audioData } = req.body;
    const audioBuffer = Buffer.from(audioData.split(',')[1], 'base64');

    const { url } = await audioStorageService.saveAudio(audioBuffer);

    const result = await db.query(
      'INSERT INTO recordings (question_id, audio_url) VALUES ($1, $2) RETURNING *',
      [questionId, url]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving audio recording:', error);
    res.status(500).json({ error: error.message });
  }
});


const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
