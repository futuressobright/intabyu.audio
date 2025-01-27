// src/config.js

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3002',
  ENDPOINTS: {
    CATEGORIES: '/api/categories',
    QUESTIONS: '/api/questions',
    RECORDINGS: '/api/recordings'
  }
};

// Audio Configuration
export const AUDIO_CONFIG = {
  MIME_TYPE: 'audio/webm',
  STORAGE_PATH: '/audio-uploads',
  MAX_FILE_SIZE: 50 * 1024 * 1024,  // 50MB max file size

  // URL handling functions
  getAudioUrl: (filename) => {
    if (!filename) return null;
    if (DEV_CONFIG.ENABLE_LOGGING) {
      console.log(`${DEV_CONFIG.LOG_PREFIX.AUDIO} Processing audio URL:`, filename);
    }
    // If it's already a full URL, return as is
    if (filename.startsWith('http')) return filename;
    // If it's a path starting with /audio-uploads, add base URL
    if (filename.startsWith('/audio-uploads')) {
      return `${API_CONFIG.BASE_URL}${filename}`;
    }
    // If it's just a filename, construct full path
    return `${API_CONFIG.BASE_URL}/audio-uploads/${filename}`;
  },

  // Extract filename from URL for storage
  getFilenameFromUrl: (url) => {
    if (!url) return null;
    const parts = url.split('/');
    return parts[parts.length - 1];
  }
};

// User Configuration
export const USER_CONFIG = {
  DEFAULT_USER_ID: '6'  // TODO: Replace with actual auth
};

// Development and Logging Configuration
export const DEV_CONFIG = {
  ENABLE_LOGGING: true,
  LOG_PREFIX: {
    SERVER: '[Server]',
    AUDIO: '[AudioRecorder]',
    DB: '[Database]',
    API: '[API]',
    URL: '[URL]'
  },
  LOG_LEVELS: {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
  },
  // Helper function for consistent logging
  log: (prefix, message, level = 'INFO', data = null) => {
    if (!DEV_CONFIG.ENABLE_LOGGING) return;

    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} ${prefix} ${level}: ${message}`;

    switch (level) {
      case 'ERROR':
        console.error(logMessage, data);
        break;
      case 'WARN':
        console.warn(logMessage, data);
        break;
      case 'DEBUG':
        console.debug(logMessage, data);
        break;
      default:
        console.log(logMessage, data);
    }
  }
};

// Storage Configuration
export const STORAGE_CONFIG = {
  LOCAL_STORAGE_KEYS: {
    ACTIVE_CATEGORY: 'activeCategory',
    ACTIVE_QUESTION: 'activeQuestionId'
  }
};