# Vert Finder: Specification Index

**Project:** Route discovery tool for ultra marathon runners seeking training routes by elevation gain

**Status:** MVP implementation active. Worldwide live-data architecture accepted in ADR-006.

---

## Specification Documents

| Document | Purpose | Key Takeaway |
|----------|---------|--------------|
| [thesis.md](thesis.md) | Why this product needs to exist | Existing tools (Google Maps, Strava, AllTrails) don't sort trails by elevation gain. Ultra runners planning training waste 20–45 minutes per route manually calculating gain. |
| [vision.md](vision.md) | What the product is and how to measure success | Simple web map: enter location, set elevation gain goal, see runnable routes sorted by gain. No accounts, no social features, no route planning. MVP success = user finds a route in <2 minutes. |
| [product.md](product.md) | Features and user flows | Two core flows: (1) Find route by elevation gain, (2) Explore routes visually. MVP features: location search, elevation gain filter, map display, route details + elevation profile. No favorites, no exports, no accounts. |
| [tech-stack.md](tech-stack.md) | Technology choices and rationale | React 18 + TypeScript + Vite (frontend), Leaflet.js (maps), OSM + Overpass API (trails), Copernicus GLO-30 DEM (elevation), GitHub Pages (hosting), GitHub Actions (CI/CD). Zero cost to run. |
| [challenges.md](challenges.md) | Assumptions that could fail | **12 major risks identified.** Biggest: OSM data is too sparse, MVP scope is too minimal, sustainability model is unclear. Mitigations provided for each. |
| [ADR-001-frontend-framework.md](ADR-001-frontend-framework.md) | React vs vanilla JS vs Vue vs Svelte | **Decision: React 18 + TypeScript.** Ecosystem maturity (react-leaflet, Recharts) and type safety outweigh bundle size cost. |
| [ADR-002-map-library.md](ADR-002-map-library.md) | Leaflet vs Mapbox vs Google Maps | **Decision: Leaflet.js + react-leaflet.** Free, OSM-native, lightweight (~40 KB). Mapbox and Google Maps cost $100–500/month; not viable for a free tool. |
| [ADR-003-hosting-and-deployment.md](ADR-003-hosting-and-deployment.md) | GitHub Pages vs Cloudflare Pages vs AWS | **Decision: GitHub Pages for MVP, migrate to Cloudflare Pages in Phase 1.** Zero cost, auto-deploy from Git, no configuration. |
| [ADR-004-elevation-processing.md](ADR-004-elevation-processing.md) | Original elevation-processing decision | **Superseded for production.** Retained for offline validation. |
| [ADR-005-trail-data-source.md](ADR-005-trail-data-source.md) | OSM vs Strava vs AllTrails vs proprietary | **Decision: OpenStreetMap + Overpass API.** Free, queryable, comprehensive in ultra regions, community-maintained. Data quality varies by region (acceptable for MVP). |
| [ADR-006-worldwide-live-data.md](ADR-006-worldwide-live-data.md) | Worldwide live trail and elevation architecture | **Decision: On-demand Overpass segments + browser-side Terrarium elevation + IndexedDB cache.** Zurich and Bülach validate the worldwide path. |
| [implementation-plan.md](implementation-plan.md) | Week-by-week execution plan for MVP | **12 weeks (solo), 8 weeks (2-person team).** Detailed tasks for each week, launch criteria, risk mitigation. Phase 1 and Phase 2 themes outlined. |

---

## Critical Decisions Summary

### Scope (MVP)

> Current implementation note: “routes” below means selectable trail-network segments. Data is loaded worldwide on demand rather than limited to five bundled regions.

✅ **In scope:**
- Location search (city or coordinates)
- Elevation gain filter (min/max slider)
- Map display with OSM tiles
- Trail routes as colored line segments
- Route detail view with elevation profile chart
- Configurable search radius (30 km default, hidden in settings)
- Static site, no login, no accounts, no tracking

❌ **Out of scope (Phase 1+):**
- Route favoriting / saved routes
- GPX export (can open in external app instead)
- Route difficulty rating
- Terrain type filtering
- Weather integration
- User accounts
- Mobile apps
- Analytics / user tracking

### Tech Stack Highlights

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + TypeScript + Vite | Ecosystem maturity, type safety, fast development |
| Maps | Leaflet.js + react-leaflet | Free, OSM-native, lightweight |
| Styling | Tailwind CSS | Rapid UI dev, small bundle |
| Elevation | Mapzen/AWS Terrarium tiles | Free global tiled terrain sampled in the browser |
| Trails | OSM + Overpass API | Free, queryable, community-maintained |
| Processing | TypeScript + Canvas | Client-side segment graph and terrain decoding; GDAL/Python retained for validation |
| Hosting | GitHub Pages | Free, auto-deploy, zero operational overhead |
| CI/CD | GitHub Actions | Free, integrated, runs nightly elevation pipeline |

### Cost Model (MVP)

- **Hosting:** $0 (GitHub Pages)
- **Map tiles:** $0 (OSM community tiles, fair-use)
- **APIs:** $0 (Overpass API, Nominatim, Copernicus DEM)
- **Domain:** $0 (github.io subdomain) or $10–15/year (custom domain)
- **Total:** $0–200/year (custom domain optional)

This remains free as long as:
- You host on GitHub Pages or Cloudflare Pages (no backend)
- You use only open/free APIs (no Mapbox, Google, Strava paid access)
- You pre-compute elevation data nightly (GitHub Actions free tier: 1000 min/month)

### Biggest Risks

**1. OSM coverage is insufficient** (Challenge #1)
- *Mitigation:* Validate coverage in 5 target regions before building. Count known trails, compare to OSM count. If <60% match, choose different regions.

**2. MVP scope is too minimal** (Challenge #12)
- *Mitigation:* Prototype with target users before coding. Ask: "Would you use this to find a route?" If >50% say no, add missing features to MVP.

**3. Elevation gain calculation is inaccurate** (Challenge #2)
- *Mitigation:* Spot-check against ground truth (GPS recordings, other apps). Accept ±10% error. If error is >20%, use higher-resolution DEM or accept lower accuracy.

**4. Competitive threat** (Challenge #10)
- *Mitigation:* Launch quickly (8–12 weeks). Get early adopters before Strava/Komoot solve this. Focus on simplicity + speed.

---

## Next Steps (Before Building)

### Phase 0.5: Validation (1–2 weeks)

Before writing code, validate the core assumptions:

1. **Interview 5–10 target ultra runners**
   - Problem validation: "Do you manually calculate elevation gain when finding routes? How long does it take?"
   - MVP validation: "Would you use a tool that shows all routes by elevation gain in your region?"
   - Data validation: "Which region would you test this in? Is elevation gain the primary sorting metric for you?"

2. **Validate OSM coverage in 5 target regions**
   - Manually list 20+ known running trails in each region
   - Query Overpass API in that region
   - Compare results: is OSM coverage >60% for known trails?
   - If <60%, choose different target regions (more mountainous, more developed)

3. **Prototype elevation gain calculation**
   - Pick one well-known trail (e.g., "Chamonix Valley circuit")
   - Get its GPS route from Gaia GPS or Komoot
   - Use GDAL to calculate elevation gain from Copernicus DEM
   - Compare to actual elevation gain (from GPS or trail guides)
   - Is error <10%? If not, investigate better DEM or calculation approach

4. **Validate with a clickable prototype**
   - Create a Figma mockup or HTML prototype of the MVP
   - Show it to 5 runners: "Here's the UI. Would you use this?"
   - Iterate based on feedback

**Estimated effort:** 40–60 hours (1.5–2 weeks part-time)

**Decision gates:**
- OSM coverage >60% in ≥5 regions? → Proceed to Phase 0.
- Elevation accuracy within ±10%? → Proceed to Phase 0.
- >3 of 5 runners say they'd use it? → Proceed to Phase 0.

If any gate fails, revisit product assumptions or pivot to a different problem.

---

## Getting Started with Development

### Prerequisites

- Node.js 18+
- Python 3.9+ (for elevation processing)
- GDAL (system library)
- Git + GitHub account

### Development Quick Start

```bash
# Clone repo
git clone https://github.com/karma-works/vert-finder.git
cd vert-finder

# Install frontend deps
npm install

# Start dev server
npm run dev
# Open http://localhost:5173

# Build for production
npm run build

# Run elevation processing locally (optional)
pip install gdal fiona shapely requests
python scripts/process_elevation.py
```

### File Structure (Post-MVP)

```
vert-finder/
├── src/
│   ├── components/
│   │   ├── Map.tsx
│   │   ├── LocationSearch.tsx
│   │   ├── ElevationFilter.tsx
│   │   ├── TrailLayer.tsx
│   │   ├── RouteDetail.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useTrails.ts
│   │   └── useGeocoding.ts
│   ├── types/
│   │   └── index.ts (GeoJSON types, route types, etc.)
│   ├── App.tsx
│   └── index.css
├── public/
│   ├── data/
│   │   ├── chamonix.geojson
│   │   ├── moab.geojson
│   │   ├── metadata.json
│   │   └── ...
│   ├── logo.svg
│   └── favicon.svg
├── scripts/
│   ├── process_elevation.py
│   └── requirements.txt
├── .github/workflows/
│   ├── deploy.yml (build + deploy to GitHub Pages)
│   └── process-elevation.yml (nightly elevation update)
├── specs/
│   ├── thesis.md
│   ├── vision.md
│   ├── product.md
│   ├── tech-stack.md
│   ├── challenges.md
│   ├── ADR-*.md
│   ├── implementation-plan.md
│   └── README.md (this file)
├── README.md (user-facing project README)
├── LICENSE (MIT)
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

---

## Success Metrics (MVP)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Discoverability** | User finds a route matching their elevation goal in <90 seconds | Time yourself: open app, search location, set elevation, select a route |
| **Accuracy** | Elevation gain within ±10% of GPS ground truth | Spot-check 20 routes against Gaia GPS, Komoot, AllTrails |
| **Coverage** | ≥5 major ultra regions with >60% trail completeness | Manually count known trails vs. app trails per region |
| **Performance** | Page loads in <3 seconds, map interaction <200ms lag | Chrome DevTools Lighthouse, timeline profiler |
| **Usability** | 4/5 early testers say "yes, I'd use this again" | Feedback form: "Would you use this again?" |

---

## References

- **OSM/Overpass:** https://wiki.openstreetmap.org/wiki/Overpass_API
- **Copernicus DEM:** https://www.tessella.com/en/technology-blog/copernicus-dem-30m-raster-now-available
- **GDAL/Rasterio:** https://rasterio.readthedocs.io/
- **Leaflet.js:** https://leafletjs.com/
- **React Leaflet:** https://react-leaflet.js.org/
- **Tailwind CSS:** https://tailwindcss.com/
- **Recharts:** https://recharts.org/

---

## Questions & Next Steps

**For the team:**
1. Do all assumptions in [challenges.md](challenges.md) align with your understanding?
2. Are the target launch regions (Chamonix, Moab, Sedona, Boulder, others) correct?
3. Should we add any Phase 1 features to MVP scope?
4. Who's leading development? Solo or team?

**Next meeting:** Decide on Phase 0.5 validation timeline and assign responsibilities.
