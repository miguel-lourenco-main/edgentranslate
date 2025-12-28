/**
 * Minimal IndexedDB key/value helpers (no external deps).
 * Only usable in the browser.
 */

const DB_NAME = 'edgentranslate';
const DB_VERSION = 1;
const STORE_NAME = 'kv';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDb();
      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);

      const request = fn(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);

      // Close the DB when the transaction completes to avoid leaking connections.
      tx.oncomplete = () => db.close();
      tx.onerror = () => {
        db.close();
      };
      tx.onabort = () => {
        db.close();
      };
    } catch (e) {
      reject(e);
    }
  });
}

export async function idbGet<T>(key: string): Promise<T | undefined> {
  return await withStore<T | undefined>('readonly', (store) => store.get(key));
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  await withStore('readwrite', (store) => store.put(value as never, key));
}

export async function idbDel(key: string): Promise<void> {
  await withStore('readwrite', (store) => store.delete(key));
}


