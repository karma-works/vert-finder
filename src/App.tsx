import { useMemo, useState } from 'react'
import { ElevationFilter } from './components/ElevationFilter'
import { LocationSearch } from './components/LocationSearch'
import { RouteDetail } from './components/RouteDetail'
import { SelectionDetail } from './components/SelectionDetail'
import { TrailMap } from './components/TrailMap'
import { VirtualTrailList } from './components/VirtualTrailList'
import { useTrailNetwork } from './hooks/useTrailNetwork'
import type { Coordinate, TestRegion, TrailFeature } from './types'

const regions: TestRegion[] = [
  { id: 'zurich', name: 'Zurich', country: 'Switzerland', center: [8.5417, 47.3769], radiusKm: 10 },
  { id: 'buelach', name: 'Bülach', country: 'Switzerland', center: [8.5400, 47.5189], radiusKm: 10 },
]

export default function App() {
  const zurichCoord: Coordinate = [8.5417, 47.3769]
  const [center, setCenter] = useState<Coordinate>(zurichCoord)
  const [locationLabel, setLocationLabel] = useState('Zurich, Switzerland')
  const [gain, setGain] = useState<[number, number]>([0, 600])
  const [radius, setRadius] = useState(() => Number(localStorage.getItem('search-radius')) || 10)
  const [selected, setSelected] = useState<TrailFeature[]>([])
  const [settings, setSettings] = useState(false)
  const [mapCount, setMapCount] = useState({ rendered: 0, inBounds: 0 })
  const { trails, loading, error, cached } = useTrailNetwork(center, locationLabel, gain, radius)
  const totalDistance = useMemo(() => trails.reduce((sum, trail) => sum + trail.properties.distance, 0), [trails])
  const selectedIds = useMemo(() => new Set(selected.map((trail) => trail.properties.id)), [selected])

  const selectLocation = (coordinate: Coordinate, label: string) => {
    setCenter(coordinate)
    setLocationLabel(label)
    setSelected([])
  }

  const updateRadius = (value: number) => {
    setRadius(value)
    localStorage.setItem('search-radius', String(value))
  }

  const toggleTrail = (trail: TrailFeature) => setSelected((current) => current.some((item) => item.properties.id === trail.properties.id)
    ? current.filter((item) => item.properties.id !== trail.properties.id)
    : [...current, trail])

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href={import.meta.env.BASE_URL} aria-label="Vert Finder home"><span className="brand__mark"><i /><i /><i /></span><span>VERT<br />FINDER</span></a>
      <LocationSearch regions={regions} onSelect={selectLocation} />
      <button className="settings-button" onClick={() => setSettings(!settings)} aria-expanded={settings} aria-controls="settings-panel"><span>Radius</span> {radius} km <i aria-hidden="true">⌄</i></button>
      {settings && <div className="settings" id="settings-panel"><label htmlFor="radius">Search radius <strong>{radius} km</strong></label><input id="radius" type="range" min="5" max="30" step="5" value={radius} onChange={(event) => updateRadius(Number(event.target.value))} /></div>}
    </header>
    <main className="workspace">
      <aside className="sidebar">
        <div className="location"><span className="eyebrow">SEARCH AREA</span><h1>{locationLabel}</h1><p>{radius} km · live OpenStreetMap paths</p></div>
        <ElevationFilter value={gain} max={1000} onChange={(value) => { setGain(value); setSelected([]) }} />
        <section className="results" aria-live="polite">
          <div className="results__heading"><div><span className="eyebrow">MATCHES</span><h2>{loading ? 'Finding segments…' : `${trails.length} segments`}</h2></div><span>{totalDistance.toFixed(0)} km total</span></div>
          {error && <p className="notice notice--error">{error}</p>}
          {loading && <p className="notice">Fetching paths and calculating terrain elevation. A new area can take several seconds.</p>}
          {!loading && !error && trails.length === 0 && <p className="notice">No trail segments match. Widen the gain range or radius.</p>}
          <VirtualTrailList trails={trails} selectedIds={selectedIds} onToggle={toggleTrail} />
        </section>
        <footer><span>{cached ? 'Loaded from local cache' : 'Live data for this area'}</span><span><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a> · <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank" rel="noreferrer">Elevation © Mapzen</a></span></footer>
      </aside>
      <section className="map-stage" aria-label="Trail map">
        <TrailMap center={center} trails={trails} selectedIds={selectedIds} onSelect={toggleTrail} onViewportChange={setMapCount} />
        <div className="legend"><span><i className="gain-low" />&lt;50</span><span><i className="gain-mid" />50–150</span><span><i className="gain-high" />150–300</span><span><i className="gain-max" />300+ m</span></div>
        <div className="map-label"><span>{mapCount.rendered} of {mapCount.inBounds} segments in view</span><strong>{locationLabel}</strong></div>
      </section>
      {selected.length === 1 && <RouteDetail trail={selected[0]} onClose={() => setSelected([])} />}
      {selected.length > 1 && <SelectionDetail trails={selected} onRemove={(id) => setSelected((current) => current.filter((trail) => trail.properties.id !== id))} onClear={() => setSelected([])} />}
    </main>
  </div>
}
