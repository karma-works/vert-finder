import { FormEvent, useEffect, useRef, useState } from 'react'
import type { Coordinate, TestRegion } from '../types'
import { parseCoordinates } from '../lib/geo'

interface SearchResult { display_name: string; lat: string; lon: string }
const geocodingEndpoint = import.meta.env.VITE_GEOCODING_URL ?? 'https://nominatim.openstreetmap.org/search'

interface Props {
  regions: TestRegion[]
  onSelect: (coordinate: Coordinate, label: string) => void
}

export function LocationSearch({ regions, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const timeout = useRef<number>()

  useEffect(() => () => window.clearTimeout(timeout.current), [])

  const search = (value: string) => {
    setQuery(value)
    setOpen(Boolean(value))
    window.clearTimeout(timeout.current)
    if (value.trim().length < 3 || parseCoordinates(value)) return setResults([])
    const local = regions.filter((region) => `${region.name} ${region.country}`.toLowerCase().includes(value.toLowerCase()))
    if (local.length) {
      setResults(local.map((region) => ({ display_name: `${region.name}, ${region.country}`, lat: String(region.center[1]), lon: String(region.center[0]) })))
      return
    }
    timeout.current = window.setTimeout(async () => {
      setSearching(true)
      try {
      const response = await fetch(`${geocodingEndpoint}?format=jsonv2&limit=5&q=${encodeURIComponent(value)}`, { headers: { 'Accept-Language': 'en' } })
        setResults(response.ok ? await response.json() as SearchResult[] : [])
      } finally { setSearching(false) }
    }, 1000)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const coordinates = parseCoordinates(query)
    if (coordinates) {
      onSelect(coordinates, `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`)
      setOpen(false)
    } else if (results[0]) select(results[0])
  }

  const select = (result: SearchResult) => {
    const coordinate: Coordinate = [Number(result.lon), Number(result.lat)]
    setQuery(result.display_name)
    setOpen(false)
    onSelect(coordinate, result.display_name.split(',').slice(0, 2).join(','))
  }

  return <form className="search" onSubmit={submit} role="search">
    <span className="search__icon" aria-hidden="true">⌕</span>
    <label className="sr-only" htmlFor="location">Search city or coordinates</label>
    <input id="location" value={query} onChange={(event) => search(event.target.value)} onFocus={() => setOpen(Boolean(query))} placeholder="City or coordinates" autoComplete="off" />
    {searching && <span className="spinner" aria-label="Searching" />}
    {open && results.length > 0 && <ul className="search__results">
      {results.map((result) => <li key={`${result.lat}-${result.lon}`}><button type="button" onClick={() => select(result)}>{result.display_name}</button></li>)}
    </ul>}
  </form>
}
