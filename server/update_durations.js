// update-durations.js
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

require('dotenv').config();

const AUDIO_UPLOADS_DIR = '/Users/ashish/Dropbox/programming/intabyu.audio/server/audio-uploads';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

async function getAudioDuration(filepath) {
  try {
    console.log(`Running ffprobe on: ${filepath}`);
    const { stdout, stderr } = await execAsync(
      `ffprobe -i "${filepath}" -show_entries format=duration -v quiet -of csv="p=0"`
    );
    if (stderr) {
      console.error('ffprobe stderr:', stderr);
    }
    const duration = parseFloat(stdout.trim());
    console.log(`Duration for ${path.basename(filepath)}: ${duration}s`);
    return duration;
  } catch (error) {
    console.error(`Error getting duration for ${filepath}:`, error.message);
    return null;
  }
}

async function updateRecordingDurations() {
  try {
    const { rows } = await pool.query('SELECT id, audio_url FROM recordings WHERE duration IS NULL');
    console.log(`Found ${rows.length} recordings to update`);

    for (const row of rows) {
      try {
        const filename = path.basename(row.audio_url);
        const filepath = path.join(AUDIO_UPLOADS_DIR, filename);
        
        console.log(`\nProcessing recording ${row.id}:`);
        console.log(`- File: ${filename}`);
        console.log(`- Full path: ${filepath}`);

        // Check if file exists
        try {
          await fs.access(filepath);
          console.log('- File exists');
        } catch (error) {
          console.error(`- File not found: ${filepath}`);
          continue;
        }

        // Get duration
        const duration = await getAudioDuration(filepath);
        if (duration) {
          // Update database
          const updateResult = await pool.query(
            'UPDATE recordings SET duration = $1 WHERE id = $2 RETURNING *',
            [duration, row.id]
          );
          console.log(`- Updated recording ${row.id} with duration ${duration}s`);
        }
      } catch (error) {
        console.error(`Error processing recording ${row.id}:`, error);
      }
    }

    console.log('\nFinished updating recording durations');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

updateRecordingDurations();
