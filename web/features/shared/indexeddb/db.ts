import type { GuestRecord } from "@/features/guest-checkin/types";

const DB_NAME = "guest-checkin";
const DB_VERSION = 1;
const STORE_NAME = "guests";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function insertGuest(guest: GuestRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(guest);
    req.onsuccess = () => resolve();
    req.onerror = () =>
      reject(new Error(`Failed to save guest record: ${req.error?.message ?? "unknown error"}`));
  });
}

export async function fetchAllGuests(): Promise<GuestRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as GuestRecord[]);
    req.onerror = () => reject(req.error);
  });
}
