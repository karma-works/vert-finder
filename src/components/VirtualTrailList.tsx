import { useEffect, useRef, useState } from 'react'
import type { TrailFeature } from '../types'

const rowHeight = 68
const overscan = 6

interface Props {
  trails: TrailFeature[]
  selectedIds: Set<string>
  onToggle: (trail: TrailFeature) => void
}

export function VirtualTrailList({ trails, selectedIds, onToggle }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [height, setHeight] = useState(500)

  useEffect(() => {
    const element = container.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (container.current) container.current.scrollTop = 0
    setScrollTop(0)
  }, [trails])

  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const end = Math.min(trails.length, Math.ceil((scrollTop + height) / rowHeight) + overscan)

  return <div className="route-list" ref={container} onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}>
    <div className="route-list__spacer" style={{ height: trails.length * rowHeight }}>
      {trails.slice(start, end).map((trail, offset) => <button
        className={`route-row ${selectedIds.has(trail.properties.id) ? 'is-active' : ''}`}
        style={{ transform: `translateY(${(start + offset) * rowHeight}px)` }}
        key={trail.properties.id}
        onClick={() => onToggle(trail)}
      >
        <span className="route-row__line" />
        <span className="route-row__main"><strong>{trail.properties.name}</strong><small>{trail.properties.surface}</small></span>
        <span className="route-row__metric"><strong>{trail.properties.elevation_gain.toLocaleString()} m</strong><small>{trail.properties.distance.toFixed(1)} km</small></span>
      </button>)}
    </div>
  </div>
}
