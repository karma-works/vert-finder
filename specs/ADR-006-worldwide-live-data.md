# ADR-006: Worldwide Live Trail and Elevation Data

**Status:** Accepted

**Date:** 2026-06-20

**Supersedes:** The production-path decisions in ADR-004 and the nightly batch portion of ADR-005

## Context

The original architecture precomputed a GeoJSON file for a small list of regions. The first generated five-region file reached 93 MB and contained 85,813 raw OSM ways. A search elsewhere in the world silently selected the nearest bundled region. This could not meet the requirement that location search work worldwide.

The product now presents useful trail-network segments, not complete curated routes. This makes on-demand processing practical because the client does not need to infer arbitrary loops or named itineraries.

## Decision

Use a static, browser-only, on-demand pipeline:

1. Resolve places with Nominatim.
2. Fetch `highway=path|bridleway`, excluding `access=private`, from a public Overpass instance.
3. Split OSM ways at shared nodes, then merge compatible chains through degree-two nodes.
4. Drop fragments shorter than 50 metres.
5. Densify geometry to approximately 50-metre spacing.
6. Sample Mapzen/AWS Terrarium tiles at zoom 12 and decode elevation in the browser.
7. Smooth samples with a three-point moving average and calculate cumulative gain/loss.
8. Store processed search areas in IndexedDB with a seven-day expiry.

## Performance constraints

- Fetching, JSON parsing, graph construction, densification, and gain/loss calculation run in a Web Worker.
- The result list is virtualized; only visible rows plus a small overscan window enter the DOM.
- The map uses one GeoJSON layer containing segments that intersect the padded viewport.
- A maximum of 1,200 nearest segments is drawn at once; panning or zooming selects the next viewport set.
- Cached-load budget: fewer than 500 DOM nodes and no main-thread task longer than 100 ms in the Zurich 10 km fixture.

Zurich and Bülach, each with a 10 km radius, are the primary validation areas. They do not receive special production data. A non-Swiss location must remain part of runtime verification.

## Consequences

- The site remains deployable to GitHub Pages with no backend or API keys.
- A first search can take several seconds; cached searches are substantially faster.
- Availability depends on community-operated Overpass and Nominatim services and AWS terrain-tile hosting.
- Elevation resolution is approximately 20–40 metres at zoom 12, depending on latitude.
- Segment totals do not prove that selected geometry forms a connected route.
- Public-service endpoints must remain configurable if usage grows or an operator requests migration.
- The offline Copernicus/GDAL pipeline remains useful for independent elevation validation, but is no longer shipped as the application dataset.

## Rejected alternatives

- **Global precomputed GeoJSON:** too large and expensive to refresh for a personal static project.
- **Per-coordinate elevation API:** Open-Meteo accepts at most 100 coordinates per request, creating excessive calls for dense trail networks.
- **Application backend:** provides stronger caching and service control, but adds operations and deployment cost not justified for the personal/open-source use case.
