const request = require('supertest');
const app = require('./test-server');
const db = require('../db');

let testUser;

beforeAll(async () => {
  const result = await db.query(
    'INSERT INTO users (email) VALUES ($1) RETURNING *',
    ['test@example.com']
  );
  testUser = result.rows[0];
});

afterAll(async () => {
  await db.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
  await db.end();
});

describe('Categories API', () => {
  let category;

  test('POST /api/categories', async () => {
    const response = await request(app)
      .post('/api/categories')
      .send({ name: 'Test Category', userId: testUser.id });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Test Category');
    category = response.body;
  });

  test('GET /api/categories', async () => {
    const response = await request(app)
      .get('/api/categories')
      .query({ userId: testUser.id });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('PUT /api/categories/:id', async () => {
    const response = await request(app)
      .put(`/api/categories/${category.id}`)
      .send({ name: 'Updated Category' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Category');
  });

  test('DELETE /api/categories/:id', async () => {
    const response = await request(app)
      .delete(`/api/categories/${category.id}`);

    expect(response.status).toBe(200);
  });
});

describe('Questions API', () => {
  let category;
  let question;

  beforeAll(async () => {
    const result = await db.query(
      'INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING *',
      ['Test Category', testUser.id]
    );
    category = result.rows[0];
  });

  test('POST /api/questions', async () => {
    const response = await request(app)
      .post('/api/questions')
      .send({
        categoryId: category.id,
        text: 'Test Question'
      });

    expect(response.status).toBe(200);
    expect(response.body.text).toBe('Test Question');
    question = response.body;
  });

  test('GET /api/questions', async () => {
    const response = await request(app)
      .get('/api/questions')
      .query({ categoryId: category.id });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('PUT /api/questions/:id', async () => {
    const response = await request(app)
      .put(`/api/questions/${question.id}`)
      .send({ text: 'Updated Question' });

    expect(response.status).toBe(200);
    expect(response.body.text).toBe('Updated Question');
  });

  test('DELETE /api/questions/:id', async () => {
    const response = await request(app)
      .delete(`/api/questions/${question.id}`);

    expect(response.status).toBe(200);
  });
});

describe('Recordings API', () => {
  let question;
  let recording;

  beforeAll(async () => {
    const catResult = await db.query(
      'INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING *',
      ['Test Category', testUser.id]
    );
    const qResult = await db.query(
      'INSERT INTO questions (category_id, text) VALUES ($1, $2) RETURNING *',
      [catResult.rows[0].id, 'Test Question']
    );
    question = qResult.rows[0];
  });

  test('POST /api/recordings', async () => {
    const response = await request(app)
      .post('/api/recordings')
      .send({
        questionId: question.id,
        audioUrl: 'test-recording.mp3'
      });

    expect(response.status).toBe(200);
    expect(response.body.audio_url).toBe('test-recording.mp3');
    recording = response.body;
  });

  test('GET /api/recordings', async () => {
    const response = await request(app)
      .get('/api/recordings')
      .query({ questionId: question.id });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('DELETE /api/recordings/:id', async () => {
    const response = await request(app)
      .delete(`/api/recordings/${recording.id}`);

    expect(response.status).toBe(200);
  });
});
