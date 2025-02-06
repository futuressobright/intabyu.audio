export class AudioRecorderService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async initialize() {
    try {
      console.log('Initializing audio recorder...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Got audio stream');

      // Check for MP4 with AAC support
      const options = {
        mimeType: 'audio/mp4; codecs=mp4a.40.2',
        audioBitsPerSecond: 128000
      };

      console.log('Checking codec support:', options.mimeType);
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error('MP4/AAC not supported, supported types:', MediaRecorder.isTypeSupported('audio/webm'));
        throw new Error('MP4/AAC recording not supported');
      }

      this.mediaRecorder = new MediaRecorder(stream, options);
      console.log('MediaRecorder initialized with options:', options);
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
    console.log('Starting recording...');

    this.mediaRecorder.ondataavailable = (event) => {
      console.log('Data available:', event.data.size, 'bytes');
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

      console.log('Stopping recording...');
      this.mediaRecorder.onstop = () => {
        console.log('Chunks collected:', this.audioChunks.length);
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp4' });
        console.log('Final blob size:', audioBlob.size, 'bytes');
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }
}