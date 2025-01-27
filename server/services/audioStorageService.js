// src/services/audioRecorder.js
import { AUDIO_CONFIG, DEV_CONFIG } from '../config';

const { log } = console;

export class AudioRecorderService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async initialize() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: AUDIO_CONFIG.MIME_TYPE
      });

      if (DEV_CONFIG.ENABLE_LOGGING) {
        log(`${DEV_CONFIG.LOG_PREFIX.AUDIO} Initialized recorder with mime type:`, AUDIO_CONFIG.MIME_TYPE);
      }

      return true;
    } catch (error) {
      console.error(`${DEV_CONFIG.LOG_PREFIX.AUDIO} Error initializing recorder:`, error);
      throw error;
    }
  }

  start(onDataAvailable) {
    if (!this.mediaRecorder) {
      throw new Error('AudioRecorder not initialized');
    }

    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        if (event.data.size > AUDIO_CONFIG.MAX_FILE_SIZE) {
          console.error(`${DEV_CONFIG.LOG_PREFIX.AUDIO} Recording exceeds size limit`);
          this.stop();
          return;
        }

        this.audioChunks.push(event.data);
        if (onDataAvailable) {
          onDataAvailable(event.data);
        }
      }
    };

    this.mediaRecorder.start();

    if (DEV_CONFIG.ENABLE_LOGGING) {
      log(`${DEV_CONFIG.LOG_PREFIX.AUDIO} Recording started`);
    }
  }

  stop() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
        resolve({ url: null, blob: null });
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: AUDIO_CONFIG.MIME_TYPE });
        const audioUrl = URL.createObjectURL(audioBlob);

        if (DEV_CONFIG.ENABLE_LOGGING) {
          log(`${DEV_CONFIG.LOG_PREFIX.AUDIO} Recording stopped:`, {
            size: audioBlob.size,
            type: audioBlob.type,
            url: audioUrl
          });
        }

        resolve({
          url: audioUrl,
          blob: audioBlob
        });
      };

      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }

  static async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}