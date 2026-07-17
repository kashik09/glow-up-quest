"use client";

const DB_NAME = "glowUpPhotosDB";
const DB_VERSION = 1;
const STORE_NAME = "photos";

export type PhotoEntry = {
  id: string;
  dataUrl: string;
  date: string;
  label: string;
  cycleDay?: number;
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

export async function savePhoto(photo: PhotoEntry): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(photo);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getAllPhotos(): Promise<PhotoEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function exportPhotos(): Promise<string> {
  const photos = await getAllPhotos();
  return JSON.stringify(photos, null, 2);
}

export async function importPhotos(jsonData: string): Promise<number> {
  const photos = JSON.parse(jsonData) as PhotoEntry[];
  for (const photo of photos) {
    await savePhoto(photo);
  }
  return photos.length;
}

// Migrate from localStorage to IndexedDB (one-time)
export async function migrateFromLocalStorage(): Promise<number> {
  const LEGACY_KEY = "glowUpPhotos";
  const stored = localStorage.getItem(LEGACY_KEY);

  if (!stored) return 0;

  try {
    const photos = JSON.parse(stored) as Array<{
      dataUrl: string;
      date: string;
      label: string;
      cycleDay?: number;
    }>;

    let migrated = 0;
    for (const photo of photos) {
      const entry: PhotoEntry = {
        id: `photo-${photo.date}-${Math.random().toString(36).slice(2, 8)}`,
        ...photo,
      };
      await savePhoto(entry);
      migrated++;
    }

    // Clear old localStorage after successful migration
    localStorage.removeItem(LEGACY_KEY);

    return migrated;
  } catch {
    return 0;
  }
}
