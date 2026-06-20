import type { Coordinate, ElevationPoint, TrailFeature } from '../types'
import { haversineKm } from './geo'

export interface OsmWay {
  type: 'way'
  id: number
  nodes?: number[]
  geometry?: Array<{ lon: number; lat: number } | null>
  tags?: Record<string, string>
}

type CompleteOsmWay = Omit<OsmWay, 'nodes' | 'geometry'> & {
  nodes: number[]
  geometry: Array<{ lon: number; lat: number }>
}

interface Edge {
  id: number
  start: number
  end: number
  coordinates: Coordinate[]
  tags: Record<string, string>
  sourceIds: number[]
}

export interface SegmentGeometry {
  id: string
  coordinates: Coordinate[]
  name: string
  surface: string
  sourceIds: number[]
}

const usefulLengthKm = 0.05

export function lineDistanceKm(coordinates: Coordinate[]): number {
  return coordinates.slice(1).reduce((sum, point, index) => sum + haversineKm(coordinates[index], point), 0)
}

function splitWays(ways: OsmWay[]): Edge[] {
  const completeWays = ways.filter(isUsableOsmWay)
  const occurrences = new Map<number, number>()
  completeWays.forEach((way) => new Set(way.nodes).forEach((node) => occurrences.set(node, (occurrences.get(node) ?? 0) + 1)))
  const edges: Edge[] = []
  let edgeId = 0

  completeWays.forEach((way) => {
    let start = 0
    for (let index = 1; index < way.nodes.length; index += 1) {
      const boundary = index === way.nodes.length - 1 || (occurrences.get(way.nodes[index]) ?? 0) > 1
      if (!boundary) continue
      const coordinates = way.geometry.slice(start, index + 1).map(({ lon, lat }) => [lon, lat] as Coordinate)
      if (coordinates.length > 1) {
        edges.push({ id: edgeId++, start: way.nodes[start], end: way.nodes[index], coordinates, tags: way.tags ?? {}, sourceIds: [way.id] })
      }
      start = index
    }
  })
  return edges
}

export function isUsableOsmWay(value: unknown): value is CompleteOsmWay {
  if (!value || typeof value !== 'object') return false
  const way = value as OsmWay
  return way.type === 'way'
    && typeof way.id === 'number'
    && Array.isArray(way.nodes)
    && Array.isArray(way.geometry)
    && way.nodes.length > 1
    && way.nodes.length === way.geometry.length
    && way.geometry.every((point) => point !== null
      && Number.isFinite(point.lon)
      && Number.isFinite(point.lat))
}

function compatible(a: Edge, b: Edge): boolean {
  const aName = a.tags.name ?? a.tags.ref
  const bName = b.tags.name ?? b.tags.ref
  if (aName && bName && aName !== bName) return false
  const aSurface = a.tags.surface
  const bSurface = b.tags.surface
  return !aSurface || !bSurface || aSurface === bSurface
}

function mergeAtEnd(chain: Edge, candidate: Edge, node: number): Edge {
  const forward = candidate.start === node
  const coordinates = forward ? candidate.coordinates : [...candidate.coordinates].reverse()
  return {
    ...chain,
    end: forward ? candidate.end : candidate.start,
    coordinates: [...chain.coordinates, ...coordinates.slice(1)],
    tags: { ...candidate.tags, ...chain.tags },
    sourceIds: [...chain.sourceIds, ...candidate.sourceIds],
  }
}

function mergeAtStart(chain: Edge, candidate: Edge, node: number): Edge {
  const forward = candidate.end === node
  const coordinates = forward ? candidate.coordinates : [...candidate.coordinates].reverse()
  return {
    ...chain,
    start: forward ? candidate.start : candidate.end,
    coordinates: [...coordinates.slice(0, -1), ...chain.coordinates],
    tags: { ...candidate.tags, ...chain.tags },
    sourceIds: [...candidate.sourceIds, ...chain.sourceIds],
  }
}

function stableId(ids: number[], start: number, end: number): string {
  let hash = 2166136261
  for (const char of `${[...ids].sort((a, b) => a - b).join(',')}:${start}:${end}`) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return `osm-segment-${(hash >>> 0).toString(36)}`
}

export function buildSegments(ways: OsmWay[]): SegmentGeometry[] {
  const edges = splitWays(ways)
  const adjacency = new Map<number, number[]>()
  edges.forEach((edge) => {
    adjacency.set(edge.start, [...(adjacency.get(edge.start) ?? []), edge.id])
    adjacency.set(edge.end, [...(adjacency.get(edge.end) ?? []), edge.id])
  })
  const byId = new Map(edges.map((edge) => [edge.id, edge]))
  const used = new Set<number>()
  const chains: Edge[] = []

  for (const edge of edges) {
    if (used.has(edge.id)) continue
    used.add(edge.id)
    let chain = edge
    let changed = true
    while (changed) {
      changed = false
      const atEnd = adjacency.get(chain.end) ?? []
      if (atEnd.length === 2) {
        const next = atEnd.map((id) => byId.get(id)!).find((item) => !used.has(item.id))
        if (next && compatible(chain, next)) {
          used.add(next.id)
          chain = mergeAtEnd(chain, next, chain.end)
          changed = true
        }
      }
      const atStart = adjacency.get(chain.start) ?? []
      if (atStart.length === 2) {
        const next = atStart.map((id) => byId.get(id)!).find((item) => !used.has(item.id))
        if (next && compatible(chain, next)) {
          used.add(next.id)
          chain = mergeAtStart(chain, next, chain.start)
          changed = true
        }
      }
    }
    chains.push(chain)
  }

  return chains
    .filter((edge) => lineDistanceKm(edge.coordinates) >= usefulLengthKm)
    .map((edge) => ({
      id: stableId(edge.sourceIds, edge.start, edge.end),
      coordinates: edge.coordinates,
      name: edge.tags.name ?? edge.tags.ref ?? 'Trail segment',
      surface: (edge.tags.surface ?? edge.tags.tracktype ?? edge.tags.highway ?? 'path').replace(/_/g, ' '),
      sourceIds: [...new Set(edge.sourceIds)],
    }))
}

export function densifyLine(coordinates: Coordinate[], spacingMetres = 50): Coordinate[] {
  if (coordinates.length < 2) return coordinates
  const result: Coordinate[] = [coordinates[0]]
  for (let index = 1; index < coordinates.length; index += 1) {
    const from = coordinates[index - 1]
    const to = coordinates[index]
    const distanceMetres = haversineKm(from, to) * 1000
    const steps = Math.max(1, Math.ceil(distanceMetres / spacingMetres))
    for (let step = 1; step <= steps; step += 1) {
      const ratio = step / steps
      result.push([from[0] + (to[0] - from[0]) * ratio, from[1] + (to[1] - from[1]) * ratio])
    }
  }
  return result
}

export function elevationMetrics(coordinates: Coordinate[], elevations: number[]): { gain: number; loss: number; profile: ElevationPoint[] } {
  const smoothed = elevations.map((_, index) => {
    const values = elevations.slice(Math.max(0, index - 1), Math.min(elevations.length, index + 2))
    return values.reduce((sum, value) => sum + value, 0) / values.length
  })
  let distance = 0
  let gain = 0
  let loss = 0
  const profile = smoothed.map((elevation, index) => {
    if (index) distance += haversineKm(coordinates[index - 1], coordinates[index])
    const change = index ? elevation - smoothed[index - 1] : 0
    if (change >= 1) gain += change
    if (change <= -1) loss -= change
    return { distance: Math.round(distance * 100) / 100, elevation: Math.round(elevation) }
  })
  const stride = Math.max(1, Math.ceil(profile.length / 100))
  return { gain: Math.round(gain), loss: Math.round(loss), profile: profile.filter((_, index) => index % stride === 0 || index === profile.length - 1) }
}

export function toTrailFeature(segment: SegmentGeometry, region: string, elevations: number[], sampled: Coordinate[]): TrailFeature {
  const metrics = elevationMetrics(sampled, elevations)
  return {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: segment.coordinates },
    properties: {
      id: segment.id,
      name: segment.name,
      region,
      surface: segment.surface,
      distance: Math.round(lineDistanceKm(segment.coordinates) * 100) / 100,
      elevation_gain: metrics.gain,
      elevation_loss: metrics.loss,
      profile: metrics.profile,
      source_ids: segment.sourceIds,
    },
  }
}
