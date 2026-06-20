import { describe, expect, it } from 'vitest'
import { gainColor, haversineKm, parseCoordinates } from './geo'

describe('geo helpers', () => {
  it('measures distance in kilometres', () => {
    expect(haversineKm([6.8694, 45.9237], [6.6323, 46.5197])).toBeCloseTo(68.8, 0)
  })
  it('parses latitude-first coordinates', () => {
    expect(parseCoordinates('45.9237, 6.8694')).toEqual([6.8694, 45.9237])
    expect(parseCoordinates('120, 6')).toBeNull()
  })
  it('uses stable gain brackets', () => {
    expect(gainColor(49)).toBe('#4f8c69')
    expect(gainColor(300)).toBe('#c64635')
  })
})
