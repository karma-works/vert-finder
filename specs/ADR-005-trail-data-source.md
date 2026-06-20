# ADR-005: Trail Data Source (OSM + Overpass API vs Alternatives)

**Status:** Amended by [ADR-006](ADR-006-worldwide-live-data.md). OSM remains the source; processing now occurs on demand in the browser.

**Date:** 2026-06-20

## Context

You need a dataset of runnable trails in ultra running destinations. Requirements:
- Comprehensive coverage of hiking/running trails in target regions
- Queryable by region (e.g., "all trails within 30 km of Chamonix")
- Free or cheap (can't afford $100+/month for API access)
- Real trails only (no hypothetical routes)
- Updatable (ideally via community contributions)

### Alternatives considered:

**A) OpenStreetMap + Overpass API** (chosen)
- Pros: Free, open-source, crowd-sourced, queryable via Overpass API, comprehensive in developed regions
- Cons: Data quality varies by region, updates depend on mapper activity, no real-time freshness

**B) Strava Metro (heatmap) + API**
- Pros: Real activity data from millions of runners, shows actual usage
- Cons: Requires paid API access ($500–5000/month), doesn't provide trail geometry (just heatmap), unclear accuracy
- Strava activity routes instead: Users can export GPX, but requires scraping or partnerships

**C) AllTrails API / Data**
- Pros: Curated trails, user ratings, reviews
- Cons: No public API, proprietary data, would require commercial partnership

**D) Google Maps / Mapbox Map Data**
- Pros: Comprehensive, well-maintained
- Cons: Requires API access and billing, proprietary data, tied to map service

**E) Proprietary trail database (build your own)**
- Pros: Full control, can curate quality
- Cons: Labor-intensive, requires partnerships with local communities, no scalability

## Decision

Use **OpenStreetMap (OSM) + Overpass API** as the primary trail data source.

- Query trails via Overpass API (no auth required, fair-use friendly)
- Filter for hiking/running routes (way tags: `route=hiking`, `highway=footway|path|trail`, `access!=private`)
- Query on demand after a user searches; cache processed areas in IndexedDB

## Rationale

1. **Free and open-source:** No API costs. Overpass API is community-operated; fair-use policy allows 10k+ requests/day (sufficient for MVP).

2. **Coverage in target regions:** OSM has excellent coverage in ultra running destinations (Chamonix, Moab, Colorado, Alps). Less coverage in remote/developing regions, but acceptable for Phase 1.

3. **Queryable:** Overpass API provides a DSL to query specific trail types, regions, and attributes. You can ask "give me all hiking trails within a 30 km radius of this point" and get precise results.

4. **Community maintained:** Unlike a proprietary database, OSM is maintained by volunteers. New trails appear as mappers explore. This is both a pro (free updates) and a con (variable quality).

5. **Real trails only:** OSM classifies trails by type (`highway=path`, `route=hiking`). You can filter out theoretical paths or private access.

6. **Integrates well with Leaflet:** Leaflet renders OSM-style GeoJSON natively. No transformation needed.

## What This Option Does NOT Do Well

- **Comprehensive real-time data:** OSM updates are crowd-sourced and delayed. A brand-new trail may not appear for weeks.
  - **Mitigation:** For MVP, accept 1–2 week lag. Phase 2: Add a "report new trail" feature where users can suggest new routes.

- **Trail conditions:** OSM doesn't distinguish between "passable in summer" and "snow-covered in winter" or "closed for maintenance."
  - **Mitigation:** Phase 2 feature. For MVP, assume all trails are runnable (may frustrate users in off-season, but acceptable).

- **User ratings or difficulty:** Unlike AllTrails, OSM has no built-in review system.
  - **Mitigation:** Phase 2 feature. Add user feedback ("Is this route runnable? Rate it.") on route detail pages.

- **Accuracy in sparse regions:** In rural or developing areas, OSM coverage is incomplete.
  - **Mitigation:** Launch in well-mapped regions first (Alps, US mountain West, etc.). Expand to other regions after validating the model works.

- **Private trail detection:** OSM can have `access=private` tags, but not all private trails are tagged. You might show a route that requires permission to run.
  - **Mitigation:** Filter by `access=private` and remove known private routes. For MVP, accept a small false-positive rate (runners will learn which routes are closed).

## Consequences

1. **Query approach:** Use Overpass API query like:
   ```
   [bbox:south,west,north,east];
   (
     way[highway~"footway|path|trail|bridleway"][access!="private"];
     way[route="hiking"];
   );
   out geom;
   ```
   This returns all hiking paths within a bounding box.

2. **Data freshness:** Batch job runs nightly. If a new trail is added to OSM at 3pm, it appears in your app at 2am+1 day.

3. **Data licensing:** OSM data is CC-BY-SA (Creative Commons). You must attribute: "© OpenStreetMap contributors" on the site.

4. **Quality variability:** Some regions have 100% trail coverage; others have 50%. You'll discover this during Phase 0 validation.

5. **Caching:** Store downloaded Overpass results to avoid redundant queries. Use `If-Modified-Since` headers to check for updates.

6. **Coverage map:** Generate a `coverage.json` showing which regions have good coverage vs. sparse coverage. Use in UI to inform users ("This region has limited trail data").

## Complementary Data Sources (Phase 2+)

If OSM coverage proves insufficient in specific regions:
- **Strava Metro:** Integrate heatmap data to identify popular routes not in OSM
- **Community contributions:** Allow users to submit new trails / verify existing ones
- **Local trail organizations:** Partner with ultramarathon clubs to contribute verified trail data
- **Hiking guidebooks:** Digitize data from trail guides in regions with poor OSM coverage

## Related Decisions

- **ADR-004:** Elevation processing depends on trail data from OSM
- **ADR-002:** Leaflet renders GeoJSON from OSM queries
