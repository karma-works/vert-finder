# ADR-004: Elevation Gain Computation (Pre-computed vs Client-side vs API)

**Status:** Superseded for production by [ADR-006](ADR-006-worldwide-live-data.md). Retained as the offline validation approach.

**Date:** 2026-06-20

## Context

For each trail route, you need to calculate total elevation gain (vertical climbing). This is computationally expensive: for a 1,000-point trail, you need to:
1. Sample elevation from a DEM at each point (10m–30m resolution)
2. Calculate vertical differences between consecutive points
3. Sum positive differences (downhill climbing doesn't count)

Requirements:
- Accurate elevation gain (±5–10% acceptable for training)
- Fast query performance (user enters location → routes appear in <1 second)
- No per-request costs (free tool)
- Scalable to thousands of routes

### Alternatives considered:

**A) Pre-computed elevation (chosen)**
- Pros: Fast queries, zero per-request cost, entire route history available for analysis
- Cons: Data staleness (daily or weekly updates), requires batch processing, storage for many routes

**B) Client-side elevation computation**
- Pros: Real-time, no server needed, works with any route
- Cons: Extremely slow (downloading full DEM ~500 MB per region into browser), battery-intensive, impractical

**C) External API (Mapbox Elevation, Google Elevation)**
- Pros: Accurate, real-time, no infrastructure needed
- Cons: Cost scales with usage ($100–500/month), rate limits, vendor lock-in, not viable for free tool

## Decision

**Pre-compute elevation gain offline (CI/CD) and serve as static JSON.**

- Elevation gain computed nightly via GitHub Actions
- Data stored as GeoJSON features with elevation gain in properties
- Client queries pre-computed data; no computation happens at runtime

## Rationale

1. **Zero per-request cost:** Elevation gain is computed once per route, not per query. Running a batch job nightly costs nothing (GitHub Actions is free).

2. **Fast query performance:** User enters location → client loads pre-computed GeoJSON → displays routes instantly. No waiting for API calls.

3. **No external API dependency:** Mapbox Elevation, Google Elevation cost money and have rate limits. Pre-computing avoids these constraints.

4. **Data freshness trade-off is acceptable:** Routes don't change hourly. Updating nightly (or weekly) is sufficient for MVP.

5. **Scalable:** Pre-computing 10,000 routes takes 30–60 minutes. Fits in GitHub Actions' free tier.

6. **Easy to validate:** You can spot-check elevation gain calculations against manual calculations before deploying.

## What This Option Does NOT Do Well

- **New trails:** If a new trail is added to OSM, it won't appear until the next batch run (next day or week).
  - **Mitigation:** Acceptable for MVP. Real ultra runners navigate to established routes; bootleg trails are rare. Schedule nightly updates.

- **Trail closure updates:** If a trail is closed, the pre-computed data doesn't reflect this until the next batch run.
  - **Mitigation:** Add a "report this trail is closed" button. Flag the route in your JSON and hide it from results.

- **Seasonal variations:** Elevation gain is the same whether it's summer or winter, but runability varies (snow, ice, flood).
  - **Mitigation:** Not addressable with elevation data alone. Phase 2 feature: add seasonal data.

- **Custom routes:** Users can't create custom routes and get instant elevation gain calculation.
  - **Mitigation:** Not a Phase 1 feature. Defer to Phase 2.

## Consequences

1. **Data pipeline:** You'll need a Python + GDAL script to:
   - Query Overpass API for trails in each region
   - Download DEM tiles from Copernicus GLO-30
   - Sample elevation along each trail
   - Calculate total gain/loss
   - Output as GeoJSON

2. **Storage:** Each region's GeoJSON is 5–50 MB (gzipped to 1–10 MB). Store in Git LFS or upload to S3 if Git becomes unwieldy.

3. **Processing time:** Computing elevation for 1,000 trails takes 5–30 minutes (depends on trail length and DEM resolution). Schedule nightly.

4. **Data validation:** Before deploying, spot-check 10–20 elevation gain calculations against manual GPX-based calculations. Aim for <10% error.

5. **Version control:** Keep `public/data/*.geojson` in Git (or Git LFS). Each commit is a versioned snapshot of the elevation data. Easy to rollback if a batch run produces bad data.

6. **Metadata file:** Generate a `metadata.json` with:
   - Last update timestamp
   - Number of routes per region
   - Elevation gain range per region
   - Data quality metrics (if any)

   This helps the UI inform users ("Last updated 2 hours ago").

## Example Workflow

```
GitHub Actions (daily at 2am UTC):
1. Checkout code and data
2. Install GDAL, Python dependencies
3. Run `python scripts/process_elevation.py`:
   - For each region (chamonix, moab, sedona, ...):
     a. Query Overpass API for all trails
     b. Download DEM tiles if not cached
     c. For each trail: sample elevation, calculate gain
     d. Output GeoJSON to public/data/{region}.geojson
4. Generate public/data/metadata.json
5. Commit and push: "Update elevation data"
6. GitHub Pages automatically deploys
```

## Related Decisions

- **ADR-002:** Leaflet expects GeoJSON data (this decision produces GeoJSON)
- **ADR-005:** OSM + Overpass API (data source for trails)
- **ADR-007:** Copernicus GLO-30 DEM (elevation source)
