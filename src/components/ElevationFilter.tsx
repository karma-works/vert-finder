interface Props { value: [number, number]; max: number; onChange: (value: [number, number]) => void }

export function ElevationFilter({ value, max, onChange }: Props) {
  const minPct = value[0] / max * 100
  const maxPct = value[1] / max * 100
  return <section className="filter" aria-labelledby="gain-heading">
    <div className="section-heading"><div><span className="eyebrow">TRAINING TARGET</span><h2 id="gain-heading">Elevation gain</h2></div><strong>{value[0].toLocaleString()}–{value[1].toLocaleString()} m</strong></div>
    <div className="range" style={{ '--min': `${minPct}%`, '--max': `${maxPct}%` } as React.CSSProperties}>
      <div className="range__track" />
      <input aria-label="Minimum elevation gain" type="range" min="0" max={max} step="100" value={value[0]} onChange={(e) => onChange([Math.min(Number(e.target.value), value[1] - 100), value[1]])} />
      <input aria-label="Maximum elevation gain" type="range" min="0" max={max} step="100" value={value[1]} onChange={(e) => onChange([value[0], Math.max(Number(e.target.value), value[0] + 100)])} />
    </div>
    <div className="range__labels"><span>0 m</span><span>{max.toLocaleString()} m+</span></div>
  </section>
}
