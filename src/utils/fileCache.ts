/**
 * Client-Side Persistent File Storage using IndexedDB
 * Allows storing large uploaded curriculum files (PDFs, Images, DOCX, XLSX)
 * without hitting localStorage (5MB) or Firestore document (1MB) limits.
 */

const DB_NAME = 'SIARKUR_FILE_STORAGE';
const DB_VERSION = 1;
const STORE_NAME = 'uploaded_files';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'docId' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveFileToCache(
  docId: string,
  dataUrl: string,
  fileName?: string,
  fileType?: string
): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        docId,
        dataUrl,
        fileName: fileName || '',
        fileType: fileType || '',
        updatedAt: Date.now(),
      };
      const req = store.put(record);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('File cache save error:', err);
    return false;
  }
}

export async function getFileFromCache(docId: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(docId);

      req.onsuccess = () => {
        if (req.result && req.result.dataUrl) {
          resolve(req.result.dataUrl);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('File cache get error:', err);
    return null;
  }
}

export async function removeFileFromCache(docId: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(docId);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('File cache remove error:', err);
    return false;
  }
}
