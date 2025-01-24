class DBService {
  constructor() {
    this.dbName = 'intabyuDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('recordings')) {
          const recordingsStore = db.createObjectStore('recordings', {
            keyPath: 'id',
            autoIncrement: true
          });
          recordingsStore.createIndex('questionId', 'questionId', { unique: false });
        }
      };
    });
  }

  async saveRecording(recording) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('recordings', 'readwrite');
      const store = tx.objectStore('recordings');
      const request = store.add(recording);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getRecordingsByQuestionId(questionId) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('recordings', 'readonly');
      const store = tx.objectStore('recordings');
      const index = store.index('questionId');
      const request = index.getAll(questionId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }
}

export default new DBService();