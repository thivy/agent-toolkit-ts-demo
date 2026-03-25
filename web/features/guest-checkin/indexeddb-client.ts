import type { GuestCheckinInput, GuestRecord } from "./types";

const DB_NAME = "guest-checkin-db";
const DB_VERSION = 1;
const STORE_NAME = "guests";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("dayKey", "dayKey", { unique: false });
      }
    };

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
  });
}

// Returns "YYYY-MM-DD" in the browser's *local* timezone so the day boundary
// matches what the operator sees on screen. We intentionally avoid
// `toISOString()` here because that returns the UTC date, which can differ
// from the local date near midnight.
export function getTodayDayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function loadGuestsByDay(dayKey: string): Promise<GuestRecord[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("dayKey");
    const request = index.getAll(dayKey);
    request.onsuccess = (event) => resolve((event.target as IDBRequest<GuestRecord[]>).result);
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
}

export async function createGuestRecord(input: GuestCheckinInput): Promise<GuestRecord> {
  const db = await openDb();
  const record: GuestRecord = {
    id: crypto.randomUUID(),
    firstName: input.firstName,
    lastName: input.lastName,
    photo: input.photo,
    checkedInAt: Date.now(),
    dayKey: getTodayDayKey(),
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(record);
    request.onsuccess = () => resolve(record);
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
}

export async function deleteGuestRecord(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
}
