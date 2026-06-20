# ADR-002: Map Library (Leaflet.js + react-leaflet)

**Status:** Decided

**Date:** 2026-06-20

## Context

The app's core feature is displaying routes on a map. Requirements:
- Show OSM-based maps (trails, terrain)
- Render trail routes as colored line segments or markers
- Handle pan, zoom, and layer toggling
- Display multiple routes without performance degradation (up to 1,000 routes in a view)
- No cost to the application (free hosting = free map tiles)

### Alternatives considered:

**A) Leaflet.js + react-leaflet** (chosen)
- Pros: Open-source, lightweight (~40 KB), native OSM support, excellent React bindings, zero cost
- Cons: Less polished visuals than commercial options, limited 3D/advanced features

**B) Mapbox GL JS + react-map-gl**
- Pros: Beautiful, performant vector rendering, excellent mobile experience, 3D terrain, real-time traffic
- Cons: Requires API key, pay-per-request pricing ($100–500/month at scale), vendor lock-in

**C) Google Maps + @react-google-maps/api**
- Pros: Ubiquitous, excellent API, good documentation
- Cons: Requires API key and billing; not suitable for a free tool; less focused on OSM trails

**D) ESRI ArcGIS Maps SDK**
- Pros: Enterprise-grade, powerful spatial queries
- Cons: Complex, overkill for this use case, paid licensing, steep learning curve

## Decision

Use **Leaflet.js + react-leaflet**.

- Leaflet.js for the mapping engine
- react-leaflet for React integration (hooks-based, not class components)
- OpenStreetMap tiles for the base layer (free, fair-use policy)

## Rationale

1. **Cost:** Zero per-request cost. Leaflet + OSM is fully open-source and free. Mapbox and Google Maps would cost $100–500/month at scale, making the free product unsustainable.

2. **OSM native support:** Leaflet was designed for OSM. GeoJSON layers, marker clusters, and pop-ups all work seamlessly. You're not fighting the framework.

3. **Bundle size:** Leaflet is ~40 KB gzipped. Mapbox GL is ~200+ KB. For a tool that should load in <2 seconds, Leaflet wins.

4. **React integration:** react-leaflet is mature and well-maintained. It exposes Leaflet as React components, making state management intuitive (e.g., `<Popup position={coord}>{content}</Popup>`).

5. **Customization:** Leaflet's plugin ecosystem is large. If you need to add heatmaps, cluster markers, or custom controls, plugins exist.

6. **Performance for this use case:** Rendering 1,000 GeoJSON features as SVG is acceptable (Leaflet's approach). Mapbox vector tiles are faster for 10,000+ features, but that's beyond MVP scope.

## What This Option Does NOT Do Well

- **Large datasets (10,000+ routes):** Leaflet renders GeoJSON as SVG, which is slow at scale. Above 10,000 features, the browser can lag.
  - **Mitigation:** For MVP, you'll query only routes in the search radius + elevation gain range. This should stay <1,000 features per view. If you outgrow this, migrate to Mapbox (painful) or implement vector tiles (complex).

- **3D terrain visualization:** Leaflet doesn't do 3D. If you want to show topographic relief as a 3D model, you need Cesium.js or Mapbox 3D (both expensive and complex).
  - **Mitigation:** Not required for MVP. A 2D map + elevation profile chart is sufficient.

- **Real-time updates:** Leaflet doesn't efficiently update large datasets. If routes change every second (they don't), Mapbox's incremental updates would be better.
  - **Mitigation:** Your data updates nightly via CI/CD. Real-time is not needed.

- **Mobile-first design:** Leaflet works on mobile, but Mapbox GL's touch controls and rendering are superior.
  - **Mitigation:** You can improve mobile UX with custom CSS and gesture handlers. Not perfect, but acceptable.

## Consequences

1. **Data format:** You'll serve GeoJSON files. Each route is a Feature with geometry (LineString) and properties (name, elevation gain, distance).

2. **Performance budget:** Keep GeoJSON file size <20 MB per region. At scale, you'll need to split by region and load dynamically.

3. **Styling:** Routes are styled with Leaflet's pathOptions (color, weight, opacity). Mapbox's style spec is more flexible, but Leaflet is sufficient for MVP.

4. **Cluster markers:** For dense regions (Chamonix has 100 routes within 5 km), clustering routes by default (zoom to see individual routes) improves UX. Use Leaflet.markercluster plugin.

5. **Testing:** Testing map interactions (click route, pan map) requires jsdom or a browser (Cypress/Playwright). React Testing Library alone is insufficient.

## Related Decisions

- **ADR-005:** Choice of OSM + Overpass API (depends on Leaflet's GeoJSON support)
- **ADR-004:** Choice of pre-computed elevation gain in GeoJSON (depends on Leaflet rendering GeoJSON)
