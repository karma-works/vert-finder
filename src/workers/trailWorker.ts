/// <reference lib="webworker" />
import type { Coordinate } from '../types'
import { buildSegments, densifyLine, isUsableOsmWay, toTrailFeature, type OsmWay, type SegmentGeometry } from '../lib/trailNetwork'

type Request =
  | { type: 'prepare'; center: Coordinate; radius: number; endpoints: string[] }
  | { type: 'finalize'; elevations: number[]; label: string }

let prepared: { segments: SegmentGeometry[]; sampled: Coordinate[][] } | null = null

async function fetchWays(center: Coordinate, radius: number, endpoints: string[]): Promise<OsmWay[]> {
  const query = `[out:json][timeout:120];way(around:${radius * 1000},${center[1]},${center[0]})["highway"~"^(path|bridleway)$"]["access"!="private"];out body geom;`
  let lastError: unknown
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error(`Trail service returned ${response.status}`)
      const payload = await response.json() as { elements?: unknown[] }
      return (payload.elements ?? []).filter(isUsableOsmWay)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError ?? new Error('No trail service was available')
}

self.onmessage = async (event: MessageEvent<Request>) => {
  try {
    if (event.data.type === 'prepare') {
      const segments = buildSegments(await fetchWays(event.data.center, event.data.radius, event.data.endpoints))
      const sampled = segments.map((segment) => densifyLine(segment.coordinates))
      prepared = { segments, sampled }
      self.postMessage({ type: 'prepared', coordinates: sampled.flat() })
      return
    }
    if (!prepared) throw new Error('Trail worker was not prepared')
    const { elevations, label } = event.data
    let offset = 0
    const features = prepared.segments.map((segment, index) => {
      const values = elevations.slice(offset, offset + prepared!.sampled[index].length)
      offset += prepared!.sampled[index].length
      return toTrailFeature(segment, label, values, prepared!.sampled[index])
    })
    self.postMessage({ type: 'finalized', features })
    prepared = null
  } catch (error) {
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : 'Trail processing failed' })
  }
}
