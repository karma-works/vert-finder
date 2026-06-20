import type { TrailFeature } from '../types'

export function SelectionDetail({ trails, onRemove, onClear }: { trails: TrailFeature[]; onRemove: (id: string) => void; onClear: () => void }) {
  const gain = trails.reduce((sum, trail) => sum + trail.properties.elevation_gain, 0)
  const distance = trails.reduce((sum, trail) => sum + trail.properties.distance, 0)
  return <aside className="detail" aria-label="Selected trail segments">
    <button className="detail__close" onClick={onClear} aria-label="Clear selected segments">×</button>
    <span className="eyebrow">COMBINED SELECTION</span>
    <h2>{trails.length} trail segments</h2>
    <p className="detail__region">Totals follow the selected segments; they do not imply a connected route.</p>
    <div className="metrics metrics--combined">
      <div><strong>{gain.toLocaleString()}</strong><span>gain / m</span></div>
      <div><strong>{distance.toFixed(1)}</strong><span>distance / km</span></div>
      <div><strong>{distance ? Math.round(gain / (distance * 10)) : 0}</strong><span>avg grade / %</span></div>
    </div>
    <div className="selection-list">
      {trails.map((trail) => <button key={trail.properties.id} onClick={() => onRemove(trail.properties.id)}>
        <span><strong>{trail.properties.name}</strong><small>{trail.properties.surface}</small></span>
        <span><strong>{trail.properties.elevation_gain} m</strong><small>{trail.properties.distance.toFixed(1)} km · remove</small></span>
      </button>)}
    </div>
    <p className="safety">Verify that selected segments connect before using them as a route. Trail access and conditions can change.</p>
  </aside>
}
