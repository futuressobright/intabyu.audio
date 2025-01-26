// server/services/audioStorageService.js
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class AudioStorageService {
  constructor() {
    this.audioDir = path.join(__dirname, '../audio-uploads');
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.audioDir, { recursive: true });
    } catch (error) {
      console.error('Error creating audio directory:', error);
    }
  }

  async saveAudio(audioData) {
    const fileName = crypto.randomUUID() + '.webm';
    const filePath = path.join(this.audioDir, fileName);
    
    await fs.writeFile(filePath, audioData);
    
    return {
      url: `/audio-uploads/${fileName}`,
      fileName
    };
  }

  async getAudio(fileName) {
    const filePath = path.join(this.audioDir, fileName);
    return fs.readFile(filePath);
  }

  // Future cloud storage methods would be added here
  // async uploadToCloud(file) { ... }
  // async getFromCloud(key) { ... }
}

module.exports = new AudioStorageService();
