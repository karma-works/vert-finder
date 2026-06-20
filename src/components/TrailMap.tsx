import { GeoJSON, MapContainer, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Feature, GeoJsonObject, LineString } from 'geojson'
import type { Layer } from 'leaflet'
import type { Coordinate, TrailFeature, TrailProperties } from '../types'
import { gainColor, haversineKm } from '../lib/geo'

const mapFeatureLimit = 1200

function Recenter({ center }: { center: Coordinate }) {
  const map = useMap()
  useEffect(() => { map.flyTo([center[1], center[0]], 12, { duration: 0.8 }) }, [center, map])
  return null
}

interface IndexedTrail { trail: TrailFeature; west: number; south: number; east: number; north: number }

function indexTrail(trail: TrailFeature): IndexedTrail {
  let west = Infinity; let south = Infinity; let east = -Infinity; let north = -Infinity
  trail.geometry.coordinates.forEach(([lon, lat]) => {
    west = Math.min(west, lon); east = Math.max(east, lon); south = Math.min(south, lat); north = Math.max(north, lat)
  })
  return { trail, west, south, east, north }
}

function TrailLayer({ trails, selectedIds, onSelect, onViewportChange }: Omit<Props, 'center'>) {
  const indexed = useMemo(() => trails.map(indexTrail), [trails])
  const [view, setView] = useState<{ features: TrailFeature[]; key: number }>({ features: [], key: 0 })

  const update = useCallback((map: ReturnType<typeof useMap>) => {
    const bounds = map.getBounds().pad(0.12)
    const inBounds = indexed
      .filter(({ west, south, east, north }) => east >= bounds.getWest() && west <= bounds.getEast() && north >= bounds.getSouth() && south <= bounds.getNorth())
      .map(({ trail }) => trail)
    const center = map.getCenter()
    const features = inBounds.length <= mapFeatureLimit ? inBounds : [...inBounds]
      .sort((a, b) => haversineKm([center.lng, center.lat], a.geometry.coordinates[0]) - haversineKm([center.lng, center.lat], b.geometry.coordinates[0]))
      .slice(0, mapFeatureLimit)
    setView((current) => ({ features, key: current.key + 1 }))
    onViewportChange({ rendered: features.length, inBounds: inBounds.length })
  }, [indexed, onViewportChange])

  const map = useMapEvents({ moveend: () => update(map), zoomend: () => update(map), resize: () => update(map) })
  useEffect(() => update(map), [map, update])

  const collection = useMemo(() => ({ type: 'FeatureCollection' as const, features: view.features }), [view.features])
  const selected = useMemo(() => trails.filter((trail) => selectedIds.has(trail.properties.id)), [trails, selectedIds])

  const bindFeature = useCallback((feature: Feature<LineString, TrailProperties>, layer: Layer) => {
    const trail = feature as unknown as TrailFeature
    layer.on('click', () => onSelect(trail))
    const tooltip = document.createElement('div')
    const title = document.createElement('strong')
    title.textContent = trail.properties.name
    tooltip.append(title, document.createElement('br'), `${trail.properties.elevation_gain.toLocaleString()} m · ${trail.properties.distance.toFixed(1)} km`)
    layer.bindTooltip(tooltip, { sticky: true })
  }, [onSelect])

  return <>
    <GeoJSON
      key={view.key}
      data={collection as GeoJsonObject}
      style={(feature) => ({ color: gainColor((feature?.properties as TrailProperties).elevation_gain), weight: 4, opacity: .88 })}
      onEachFeature={bindFeature}
    />
    {selected.map((trail) => <Polyline
      key={`selected-${trail.properties.id}`}
      positions={trail.geometry.coordinates.map(([lon, lat]) => [lat, lon])}
      pathOptions={{ color: '#fff6e7', weight: 7, opacity: 1 }}
      eventHandlers={{ click: () => onSelect(trail) }}
    />)}
  </>
}

interface Props {
  center: Coordinate
  trails: TrailFeature[]
  selectedIds: Set<string>
  onSelect: (trail: TrailFeature) => void
  onViewportChange: (counts: { rendered: number; inBounds: number }) => void
}

export function TrailMap({ center, trails, selectedIds, onSelect, onViewportChange }: Props) {
  return <MapContainer center={[center[1], center[0]]} zoom={12} zoomControl={false} className="map" preferCanvas>
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Recenter center={center} />
    <TrailLayer trails={trails} selectedIds={selectedIds} onSelect={onSelect} onViewportChange={onViewportChange} />
  </MapContainer>
}
