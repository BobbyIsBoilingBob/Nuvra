import { useCallback, useEffect, useRef, useState } from 'react'

interface CacheEntry<T> { data: T; timestamp: number; promise?: Promise<T> }

const cache = new Map<string, CacheEntry<any>>()
const DEFAULT_TTL = 60_000

export function useCachedData<T>(key: string, fetcher: () => Promise<T>, ttl = DEFAULT_TTL): { data: T | null; loading: boolean; error: string | null; refresh: () => Promise<void> } {
  const [data, setData] = useState<T | null>(() => {
    const entry = cache.get(key)
    return entry ? entry.data : null
  })
  const [loading, setLoading] = useState(() => !cache.has(key))
  const [error, setError] = useState<string | null>(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const load = useCallback(async () => {
    const entry = cache.get(key)
    if (entry && Date.now() - entry.timestamp < ttl) {
      setData(entry.data); setLoading(false); return
    }
    if (entry?.promise) {
      setLoading(!entry.data); setData(entry.data)
      try { const d = await entry.promise; setData(d); cache.set(key, { data: d, timestamp: Date.now() }) } catch (e: any) { setError(e.message) }
      setLoading(false); return
    }
    setLoading(!entry?.data)
    const promise = fetcherRef.current()
    cache.set(key, { data: entry?.data, timestamp: Date.now(), promise })
    try {
      const d = await promise
      setData(d); cache.set(key, { data: d, timestamp: Date.now() })
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }, [key, ttl])

  useEffect(() => { load() }, [load])

  const refresh = useCallback(async () => {
    cache.delete(key)
    await load()
  }, [key, load])

  return { data, loading, error, refresh }
}

export function invalidateCache(key?: string) {
  if (key) cache.delete(key)
  else cache.clear()
}

export function prefetchData<T>(key: string, fetcher: () => Promise<T>, ttl = DEFAULT_TTL) {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.timestamp < ttl) return
  if (entry?.promise) return
  const promise = fetcher()
  cache.set(key, { data: entry?.data, timestamp: Date.now(), promise })
  promise.then(d => cache.set(key, { data: d, timestamp: Date.now() })).catch(() => {})
}
