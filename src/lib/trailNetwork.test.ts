import { describe, expect, it } from 'vitest'
import { buildSegments, densifyLine, elevationMetrics, type OsmWay } from './trailNetwork'

const way = (id: number, nodes: number[], coordinates: Array<[number, number]>, tags: Record<string, string> = {}): OsmWay => ({
  type: 'way', id, nodes, tags, geometry: coordinates.map(([lon, lat]) => ({ lon, lat })),
})

describe('trail network processing', () => {
  it('merges uninterrupted compatible ways', () => {
    const segments = buildSegments([
      way(1, [1, 2], [[8.5, 47.5], [8.501, 47.5]], { highway: 'path', surface: 'gravel' }),
      way(2, [2, 3], [[8.501, 47.5], [8.502, 47.5]], { highway: 'path', surface: 'gravel' }),
    ])
    expect(segments).toHaveLength(1)
    expect(segments[0].coordinates).toHaveLength(3)
    expect(segments[0].sourceIds).toEqual([1, 2])
  })

  it('keeps an intersection as a segment boundary', () => {
    const segments = buildSegments([
      way(1, [1, 2, 3], [[8.5, 47.5], [8.501, 47.5], [8.502, 47.5]], { highway: 'path' }),
      way(2, [4, 2, 5], [[8.501, 47.499], [8.501, 47.5], [8.501, 47.501]], { highway: 'path' }),
    ])
    expect(segments).toHaveLength(4)
    expect(segments.every((segment) => segment.coordinates.length === 2)).toBe(true)
  })

  it('densifies and calculates smoothed elevation metrics', () => {
    const coordinates = densifyLine([[8.5, 47.5], [8.502, 47.5]], 50)
    expect(coordinates.length).toBeGreaterThan(3)
    const metrics = elevationMetrics(coordinates, coordinates.map((_, index) => 400 + index * 3))
    expect(metrics.gain).toBeGreaterThan(0)
    expect(metrics.loss).toBe(0)
  })

  it('ignores an Overpass way with a missing geometry point', () => {
    const malformed = {
      type: 'way',
      id: 99,
      nodes: [1, 2, 3],
      geometry: [{ lon: 8.5, lat: 47.5 }, null, { lon: 8.502, lat: 47.5 }],
      tags: { highway: 'path' },
    } as unknown as OsmWay
    expect(buildSegments([malformed])).toEqual([])
  })
})
