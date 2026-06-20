import type { TrailCollection } from '../types'

const databaseName = 'vert-finder'
const storeName = 'areas'
const maxAgeMs = 7 * 24 * 60 * 60 * 1000

interface CacheEntry { savedAt: number; collection: TrailCollection }

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(storeName)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function readArea(key: string): Promise<TrailCollection | null> {
  const db = await database()
  const result = await new Promise<CacheEntry | null>((resolve, reject) => {
    const request = db.transaction(storeName).objectStore(storeName).get(key)
    request.onsuccess = () => resolve(request.result as CacheEntry | null)
    request.onerror = () => reject(request.error)
  })
  db.close()
  if (!result || typeof result.savedAt !== 'number' || Date.now() - result.savedAt > maxAgeMs) return null
  return result.collection
}

export async function writeArea(key: string, value: TrailCollection): Promise<void> {
  const db = await database()
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    transaction.objectStore(storeName).put({ savedAt: Date.now(), collection: value } satisfies CacheEntry, key)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
  db.close()
}
