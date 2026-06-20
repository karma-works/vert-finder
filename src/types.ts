export type Coordinate = [number, number]

export interface ElevationPoint {
  distance: number
  elevation: number
}

export interface TrailProperties {
  id: string
  name: string
  region: string
  elevation_gain: number
  elevation_loss: number
  distance: number
  surface: string
  profile: ElevationPoint[]
  source_ids?: number[]
}

export interface TrailFeature {
  type: 'Feature'
  geometry: { type: 'LineString'; coordinates: Coordinate[] }
  properties: TrailProperties
}

export interface TrailCollection {
  type: 'FeatureCollection'
  features: TrailFeature[]
}

export interface TestRegion {
  id: string
  name: string
  country: string
  center: Coordinate
  radiusKm: number
}
