import { parseRun, type LabRun } from './model';

let connection: Promise<IDBDatabase> | null = null;
function database(): Promise<IDBDatabase> {
  if (!connection) {
    connection = new Promise((resolve, reject) => {
      const request = indexedDB.open('gaesup-performance-runs', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('runs', { keyPath: 'runId' });
      request.onerror = () => { connection = null; reject(request.error); };
      request.onblocked = () => { connection = null; reject(new Error('계측 DB를 사용하는 다른 탭을 닫아 주세요.')); };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => { db.close(); connection = null; };
        resolve(db);
      };
    });
  }
  return connection;
}

export async function saveRun(run: LabRun): Promise<void> {
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('runs', 'readwrite');
    tx.objectStore('runs').put(parseRun(run));
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error ?? new Error('결과 저장 중단'));
  });
}

export async function loadRuns(): Promise<LabRun[]> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('runs', 'readonly');
    const request = tx.objectStore('runs').getAll();
    tx.oncomplete = () => {
      try { resolve((request.result as unknown[]).map(parseRun).sort((a, b) => b.startedAt.localeCompare(a.startedAt))); }
      catch (error) { reject(error); }
    };
    tx.onabort = () => reject(tx.error ?? new Error('결과 불러오기 중단'));
  });
}
