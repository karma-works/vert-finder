import { lazy, Suspense } from 'react'
import type { TrailFeature } from '../types'
import { useTextLayout } from '../hooks/useTextLayout'

const ElevationChart = lazy(() => import('./ElevationChart'))

export function RouteDetail({ trail, onClose }: { trail: TrailFeature; onClose: () => void }) {
  const p = trail.properties
  const heading = useTextLayout<HTMLHeadingElement>()
  const [lng, lat] = trail.geometry.coordinates[0]
  return <aside className="detail" aria-label="Trail segment details">
    <button className="detail__close" onClick={onClose} aria-label="Close segment details">×</button>
    <span className="eyebrow">SELECTED SEGMENT</span>
    <h2 ref={heading}>{p.name}</h2>
    <p className="detail__region">{p.region} · {p.surface}</p>
    <div className="metrics">
      <div><strong>{p.elevation_gain.toLocaleString()}</strong><span>gain / m</span></div>
      <div><strong>{p.distance.toFixed(1)}</strong><span>distance / km</span></div>
      <div><strong>{Math.round(p.elevation_gain / (p.distance * 10))}</strong><span>avg grade / %</span></div>
    </div>
    <div className="chart-heading"><span>Elevation profile</span><span>{Math.min(...p.profile.map((x) => x.elevation))}–{Math.max(...p.profile.map((x) => x.elevation))} m</span></div>
    <Suspense fallback={<div className="chart-loading">Loading profile…</div>}><ElevationChart data={p.profile} /></Suspense>
    <a className="maps-link" href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`} target="_blank" rel="noreferrer">Open trailhead in maps <span aria-hidden="true">↗</span></a>
    <p className="safety">Trail data can be incomplete. Check access, weather, and local conditions before setting out.</p>
  </aside>
}
