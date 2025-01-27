const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const audioStorageService = require('./services/audioStorageService');

const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use('/audio-uploads', express.static(path.join(__dirname, 'audio-uploads')));

// Categories
app.get('/api/categories', async (req, res) => {
  const { userId } = req.query;
  const result = await db.query('SELECT * FROM categories WHERE user_id = $1', [userId]);
  const questionResult = await db.query('SELECT * FROM questions WHERE category_id = ANY(SELECT id FROM categories WHERE user_id = $1)', [userId]);
  const categoriesWithQuestions = result.rows.map(category => ({
    ...category,
    questions: questionResult.rows.filter(q => q.category_id === category.id)
  }));
  res.json(categoriesWithQuestions);
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
app.get('/api/recordings', async (req, res) => {
  try {
    const { questionId } = req.query;
    const result = await db.query(
      'SELECT * FROM recordings WHERE question_id = $1 ORDER BY created_at DESC',
      [questionId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recordings:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/recordings', async (req, res) => {
  try {
    const { questionId, audioData } = req.body;
    if (!questionId || !audioData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const audioBuffer = Buffer.from(audioData.split(',')[1], 'base64');
    const { url } = await audioStorageService.saveAudio(audioBuffer);

    const result = await db.query(
      'INSERT INTO recordings (question_id, audio_url, created_at, last_modified) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
      [questionId, url]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving recording:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));