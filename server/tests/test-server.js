const express = require('express');
const cors = require('cors');
const db = require('../db');

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

app.put('/api/categories/:id', async (req, res) => {
  const result = await db.query(
    'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
    [req.body.name, req.params.id]
  );
  res.json(result.rows[0]);
});

app.delete('/api/categories/:id', async (req, res) => {
  await db.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
  res.json({ success: true });
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

app.put('/api/questions/:id', async (req, res) => {
  const result = await db.query(
    'UPDATE questions SET text = $1 WHERE id = $2 RETURNING *',
    [req.body.text, req.params.id]
  );
  res.json(result.rows[0]);
});

app.delete('/api/questions/:id', async (req, res) => {
  await db.query('DELETE FROM questions WHERE id = $1', [req.params.id]);
  res.json({ success: true });
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

app.delete('/api/recordings/:id', async (req, res) => {
  await db.query('DELETE FROM recordings WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(3002, () => console.log('Server running on port 3002'));
}

module.exports = app;
