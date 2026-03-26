export interface GuestRecord {
  id: string;
  firstName: string;
  lastName: string;
  photoDataUrl: string | null;
  checkedInAt: number;
  dayKey: string; // YYYY-MM-DD in local timezone
}

const DB_NAME = "guest-checkin-db";
const DB_VERSION = 1;
const STORE_NAME = "guests";

function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("dayKey", "dayKey", { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export async function addGuest(guest: Omit<GuestRecord, "dayKey">): Promise<GuestRecord> {
  const db = await openDB();
  const record: GuestRecord = { ...guest, dayKey: getTodayKey() };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(record);

    request.onsuccess = () => resolve(record);
    request.onerror = (event) => reject((event.target as IDBRequest).error);

    tx.oncomplete = () => db.close();
  });
}

export async function listTodayGuests(): Promise<GuestRecord[]> {
  const db = await openDB();
  const dayKey = getTodayKey();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("dayKey");
    const request = index.getAll(IDBKeyRange.only(dayKey));

    request.onsuccess = (event) => resolve((event.target as IDBRequest<GuestRecord[]>).result);
    request.onerror = (event) => reject((event.target as IDBRequest).error);

    tx.oncomplete = () => db.close();
  });
}

export async function removeGuest(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject((event.target as IDBRequest).error);

    tx.oncomplete = () => db.close();
  });
}
