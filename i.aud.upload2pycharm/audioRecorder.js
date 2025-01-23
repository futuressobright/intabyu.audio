// Core audio recording functionality
export class AudioRecorderService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async initialize() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      return true;
    } catch (error) {
      console.error('Error initializing audio recorder:', error);
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
        this.audioChunks.push(event.data);
        if (onDataAvailable) {
          onDataAvailable(event.data);
        }
      }
    };

    this.mediaRecorder.start();
  }

  stop() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        resolve(audioUrl);
      };

      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }
}
