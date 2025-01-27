// cleanup.js
const db = require('./db');
const fs = require('fs').promises;
const path = require('path');

async function cleanup() {
    console.log('[Cleanup] Starting cleanup process...');

    try {
        // 1. Clear database tables
        console.log('[Cleanup] Clearing database tables...');
        await db.query('TRUNCATE recordings CASCADE');
        await db.query('TRUNCATE questions CASCADE');
        await db.query('TRUNCATE categories CASCADE');
        console.log('[Cleanup] Database tables cleared successfully');

        // 2. Clean up audio files
        const uploadsDir = path.join(__dirname, 'audio-uploads');
        console.log('[Cleanup] Cleaning audio files directory:', uploadsDir);
        
        try {
            await fs.rm(uploadsDir, { recursive: true, force: true });
            console.log('[Cleanup] Removed existing audio-uploads directory');
        } catch (err) {
            console.log('[Cleanup] No existing audio-uploads directory to remove');
        }

        // Create fresh directory
        await fs.mkdir(uploadsDir, { recursive: true });
        console.log('[Cleanup] Created fresh audio-uploads directory');

        console.log('[Cleanup] Cleanup completed successfully!');
        
        // Close database connection
        await db.end();
        
    } catch (error) {
        console.error('[Cleanup] Error during cleanup:', error);
        process.exit(1);
    }
}

cleanup();
