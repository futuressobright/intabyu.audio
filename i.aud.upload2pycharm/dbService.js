// src/services/dbService.js
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
      
      request.onerror = () => {
        console.error('DB init error:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('DB initialized successfully');
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create categories store if it doesn't exist
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        
        // Create recordings store if it doesn't exist
        if (!db.objectStoreNames.contains('recordings')) {
          const recordingsStore = db.createObjectStore('recordings', { keyPath: 'id' });
          recordingsStore.createIndex('questionId', 'questionId', { unique: false });
        }
      };
    });
  }

  async closeConnection() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async saveCategories(categories) {
    try {
      const db = await this.init();
      const tx = db.transaction('categories', 'readwrite');
      const store = tx.objectStore('categories');

      // Clear existing data
      await store.clear();

      // Save new categories
      for (const category of categories) {
        await store.put(category);
      }

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => {
          this.closeConnection();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.error('Save categories error:', error);
      throw error;
    }
  }

  async getCategories() {
    try {
      const db = await this.init();
      const tx = db.transaction('categories', 'readonly');
      const store = tx.objectStore('categories');
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const data = request.result;
          this.closeConnection();
          resolve(data || []);
        };
        request.onerror = () => {
          console.error('Get categories error:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('GetCategories error:', error);
      return [];
    }
  }

  async saveRecording(recording) {
    try {
      const db = await this.init();
      const tx = db.transaction('recordings', 'readwrite');
      const store = tx.objectStore('recordings');

      return new Promise((resolve, reject) => {
        const request = store.put(recording);
        
        request.onsuccess = () => {
          tx.oncomplete = () => {
            this.closeConnection();
            resolve(request.result);
          };
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Save recording error:', error);
      throw error;
    }
  }

  async getRecordingsByQuestionId(questionId) {
    try {
      const db = await this.init();
      const tx = db.transaction('recordings', 'readonly');
      const store = tx.objectStore('recordings');
      const index = store.index('questionId');
      const request = index.getAll(questionId);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const recordings = request.result;
          this.closeConnection();
          resolve(recordings || []);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Get recordings error:', error);
      return [];
    }
  }
}

export default new DBService();
