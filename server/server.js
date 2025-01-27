const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { v7: uuidv7 } = require('uuid');
const db = require('./db');
const AUDIO_UPLOADS_DIR = '/Users/ashish/Dropbox/programming/intabyu.audio/server/audio-uploads';

console.log('[Server] Using audio uploads directory:', AUDIO_UPLOADS_DIR);

// Create Express app instance
const app = express();

// Apply middleware
app.use(cors());
app.use(express.json({limit: '50mb'}));

// Ensure audio uploads directory exists
(async () => {
  try {
    await fs.access(AUDIO_UPLOADS_DIR);
    console.log('[Server] Audio uploads directory exists:', AUDIO_UPLOADS_DIR);
  } catch {
    console.log('[Server] Creating audio uploads directory:', AUDIO_UPLOADS_DIR);
    await fs.mkdir(AUDIO_UPLOADS_DIR, { recursive: true });
  }
})();

// Configure static file serving
app.use('/audio-uploads', express.static(AUDIO_UPLOADS_DIR, {
  setHeaders: (res, filepath) => {
    console.log('[Server] Serving audio file:', filepath);
    res.set('Content-Type', 'audio/webm');
    res.set('Cache-Control', 'public, max-age=31536000');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Categories endpoints
app.get('/api/categories', async (req, res) => {
  const { userId } = req.query;
  console.log(`[Server] Fetching categories for user ${userId}`);

  try {
    // First get all categories for the user
    const categoriesResult = await db.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    // Then get all questions for these categories
    const questionsResult = await db.query(
      'SELECT * FROM questions WHERE category_id = ANY($1) ORDER BY created_at',
      [categoriesResult.rows.map(c => c.id)]
    );

    // Combine categories with their questions
    const categoriesWithQuestions = categoriesResult.rows.map(category => ({
      ...category,
      questions: questionsResult.rows.filter(q => q.category_id === category.id)
    }));

    console.log(`[Server] Found ${categoriesWithQuestions.length} categories`);
    res.json(categoriesWithQuestions);
  } catch (error) {
    console.error('[Server] Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', async (req, res) => {
  const { name, userId } = req.body;
  console.log(`[Server] Creating new category "${name}" for user ${userId}`);

  try {
    const result = await db.query(
      'INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING *',
      [name, userId]
    );

    // Return the new category with an empty questions array
    const newCategory = {
      ...result.rows[0],
      questions: []
    };

    console.log('[Server] Created category:', newCategory);
    res.json(newCategory);
  } catch (error) {
    console.error('[Server] Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Questions endpoints
app.post('/api/questions', async (req, res) => {
  const { categoryId, text } = req.body;
  console.log(`[Server] Adding question to category ${categoryId}:`, text);

  try {
    const result = await db.query(
      'INSERT INTO questions (category_id, text) VALUES ($1, $2) RETURNING *',
      [categoryId, text]
    );
    console.log('[Server] Created question:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[Server] Error creating question:', error);
    res.status(500).json({ error: error.message });
  }
});

// Recordings endpoints with enhanced logging
app.get('/api/recordings', async (req, res) => {
  const { questionId } = req.query;
  console.log(`[Server] Fetching recordings for question ${questionId}`);

  try {
    const result = await db.query(
      'SELECT * FROM recordings WHERE question_id = $1 ORDER BY created_at DESC',
      [questionId]
    );
    console.log(`[Server] Found ${result.rows.length} recordings in database`);

    // Verify each recording file exists
    const recordings = await Promise.all(result.rows.map(async (recording) => {
      try {
        const filepath = path.resolve(AUDIO_UPLOADS_DIR, path.basename(recording.audio_url));
        console.log('[Server] Checking audio file exists:', filepath);
        await fs.access(filepath);

        // Get file stats for verification
        const stats = await fs.stat(filepath);
        console.log('[Server] Audio file verified:', {
          path: filepath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        });

        return recording;
      } catch (error) {
        console.error(`[Server] Audio file not found for recording ${recording.id}:`, {
          error: error.message,
          path: recording.audio_url
        });
        return {
          ...recording,
          audio_url: null
        };
      }
    }));

    const validRecordings = recordings.filter(r => r.audio_url !== null);
    console.log(`[Server] Returning ${validRecordings.length} valid recordings`);
    res.json(validRecordings);

  } catch (error) {
    console.error('[Server] Error fetching recordings:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/recordings', async (req, res) => {
  try {
    const { questionId, audioData } = req.body;
    console.log(`[Server] Received new recording for question ${questionId}`);
    console.log('[Server] Audio data prefix:', audioData.substring(0, 50));

    if (!questionId || !audioData) {
      console.error('[Server] Missing required fields in recording upload');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate UUID v7-based filename
    const uuid = uuidv7();
    const filename = `recording-${uuid}.webm`;
    const filepath = path.join(AUDIO_UPLOADS_DIR, filename);
    const audioUrl = `/audio-uploads/${filename}`;

    console.log('[Server] Generated unique filename:', {
      uuid,
      filename,
      filepath,
      timestamp: new Date(parseInt(uuid.substring(0, 8), 16)).toISOString()
    });

    // Save audio file
    const audioBuffer = Buffer.from(audioData.split(',')[1], 'base64');
    console.log('[Server] Processing audio data:', {
      originalLength: audioData.length,
      bufferSize: audioBuffer.length,
      filename
    });

    await fs.writeFile(filepath, audioBuffer);

    // Verify file was written correctly
    const stats = await fs.stat(filepath);
    console.log('[Server] Audio file saved successfully:', {
      path: filepath,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    });

    // Save to database
    const result = await db.query(
      'INSERT INTO recordings (question_id, audio_url, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *',
      [questionId, audioUrl]
    );
    console.log('[Server] Recording saved to database:', {
      id: result.rows[0].id,
      questionId,
      audioUrl,
      timestamp: result.rows[0].created_at
    });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[Server] Error saving recording:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] Audio files will be saved to: ${AUDIO_UPLOADS_DIR}`);
});