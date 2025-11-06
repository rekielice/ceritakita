import { openDB } from 'idb';
import CONFIG from '../config.js'; 

const DB_NAME = 'ceritakita-database';
const STORE_NAME = 'favorite-stories';
const DB_VERSION = 1;

// Buka (atau buat) database
const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // Buat 'object store' (seperti tabel) jika belum ada
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      // Kita gunakan 'id' cerita sebagai 'keyPath' (primary key)
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  },
});

const FavoriteStoryDB = {
  async getStory(id) {
    if (!id) return;
    return (await dbPromise).get(STORE_NAME, id);
  },

  async getAllStories() {
    return (await dbPromise).getAll(STORE_NAME);
  },

  async putStory(story) {
    if (!story || !story.id) {
       console.error('Gagal menyimpan cerita: Data cerita atau ID tidak valid.', story);
       return;
    }
    return (await dbPromise).put(STORE_NAME, story);
  },

  async deleteStory(id) {
    if (!id) return;
    return (await dbPromise).delete(STORE_NAME, id);
  },
};

export default FavoriteStoryDB;