import type { Coordinate, TrailFeature } from '../types'

const earthRadiusKm = 6371

export function haversineKm(a: Coordinate, b: Coordinate): number {
  const toRad = (n: number) => n * Math.PI / 180
  const dLat = toRad(b[1] - a[1])
  const dLng = toRad(b[0] - a[0])
  const lat1 = toRad(a[1])
  const lat2 = toRad(b[1])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function trailDistanceFrom(trail: TrailFeature, center: Coordinate): number {
  return Math.min(...trail.geometry.coordinates.map((point) => haversineKm(center, point)))
}

export function gainColor(gain: number): string {
  if (gain < 50) return '#4f8c69'
  if (gain < 150) return '#d4a72c'
  if (gain < 300) return '#e8743b'
  return '#c64635'
}

export function parseCoordinates(value: string): Coordinate | null {
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)$/)
  if (!match) return null
  const lat = Number(match[1])
  const lng = Number(match[2])
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  return [lng, lat]
}
