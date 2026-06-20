import { useEffect, useMemo, useState } from 'react'
import type { Coordinate, TrailCollection } from '../types'
import { trailDistanceFrom } from '../lib/geo'
import { readArea, writeArea } from '../lib/trailCache'
import { processTrailArea } from '../lib/trailWorkerClient'

function cacheKey(center: Coordinate, radius: number): string {
  return `v3:${center[0].toFixed(3)}:${center[1].toFixed(3)}:${radius}`
}

async function loadArea(center: Coordinate, radius: number, label: string, signal: AbortSignal): Promise<{ collection: TrailCollection; cached: boolean }> {
  const key = cacheKey(center, radius)
  const cached = await readArea(key).catch(() => null)
  if (cached) return { collection: cached, cached: true }
  const features = await processTrailArea(center, radius, label, signal)
  const collection: TrailCollection = { type: 'FeatureCollection', features }
  await writeArea(key, collection).catch(() => undefined)
  return { collection, cached: false }
}

export function useTrailNetwork(center: Coordinate, label: string, gain: [number, number], radius: number) {
  const [data, setData] = useState<TrailCollection | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [cached, setCached] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    loadArea(center, radius, label, controller.signal)
      .then((result) => { setData(result.collection); setCached(result.cached) })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return
        console.error(reason)
        setError('Live trail data could not be loaded. Try again or reduce the search radius.')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [center, label, radius])

  const trails = useMemo(() => data?.features
    .filter((trail) => trail.properties.elevation_gain >= gain[0] && trail.properties.elevation_gain <= gain[1])
    .filter((trail) => trailDistanceFrom(trail, center) <= radius)
    .sort((a, b) => b.properties.elevation_gain - a.properties.elevation_gain) ?? [], [data, center, gain, radius])

  return { trails, loading, error, cached }
}
