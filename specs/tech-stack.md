# Tech Stack: UTM Height Training

## Summary

| Layer | Technology | Status | ADR | Notes |
|-------|-----------|--------|-----|-------|
| Frontend framework | React 18 + TypeScript | Decided | ADR-001 | Map UI, filters, interactivity |
| Bundler | Vite | Decided | ADR-001 | Fast dev, fast builds |
| Map library | Leaflet.js | Decided | ADR-002 | OSM-native, lightweight, open-source |
| Styling | Tailwind CSS | Decided | ADR-003 | Rapid UI dev, small bundle |
| Elevation chart | Recharts | Decided | ADR-004 | React-native charting library |
| Hosting | GitHub Pages / Cloudflare Pages | Decided | ADR-005 | Free static hosting, auto-deploy |
| Trail data source | OpenStreetMap + Overpass API | Decided | ADR-006 | Free, open-source, community-maintained |
| DEM (elevation data) | Mapzen/AWS Terrarium tiles | Decided | ADR-006 | Global raster tiles decoded in the browser |
| Elevation processing | TypeScript + Canvas | Decided | ADR-006 | Sample at ~50m, smooth, compute gain on demand |
| Client cache | IndexedDB | Decided | ADR-006 | Avoid repeated Overpass and terrain requests |
| CI/CD | GitHub Actions | Decided | ADR-003 | Test, build, and deploy the static application |
| Data format | OSM JSON → in-memory GeoJSON | Decided | ADR-006 | No bundled production-region dataset |
| Map tiles | OpenStreetMap community tiles | Decided | ADR-005 | Free, no rate limit (fair-use), open-source |

---

## Layer-by-Layer Decisions

### Frontend Framework: React 18 + TypeScript

**Rationale:**
- React is the standard for interactive web UIs. The map interaction, filter controls, and route detail panels need responsive state management.
- TypeScript prevents runtime errors in a data-heavy app (coordinates, elevation arrays, route objects). This is important for correctness.
- React 18 includes automatic batching and concurrent features, though we won't need them immediately.

**Trade-offs accepted:**
- Bundle size: React adds ~35 KB (gzipped). Acceptable for a web app; large for a minimal tool, but worth the DX.
- Learning curve: Requires React knowledge. This is not a problem if you or your team has it; it is if you're a solo developer with only vanilla JS experience.

**What this does NOT do well:**
- Server-side rendering or static generation. React is client-side only. Pages are blank until JS loads. Not ideal for SEO, but acceptable for a utility tool (people don't search for "elevation gain route finder" the way they search for blog posts).

**Alternative considered:**
- **Vanilla JS + htmx:** Simpler, smaller bundle, faster load. Would work fine for this project. Decision: React is overkill, but it enables faster feature iteration later (modal dialogs, saved routes, etc.). Use it.

---

### Bundler: Vite

**Rationale:**
- Vite is 10–100x faster than Webpack for dev loops. For a map-based app with frequent re-renders, fast HMR (hot module reload) is critical.
- Native ES module support means you don't have to configure loaders for TypeScript, JSX, or CSS.
- Production builds are optimized with Rollup under the hood.

**Trade-offs accepted:**
- Browser support: Vite assumes evergreen browsers (ES2020+). IE 11 is not supported. Acceptable for a 2025 web app.
- Node.js version: Requires Node 18+. Not a blocker for most developers.

**What this does NOT do well:**
- Legacy projects or IE support. If you need to support IE, Webpack or Parcel is required.

**Alternative considered:**
- **Create React App (CRA):** Slower dev loop, more black-box build config. Vite is objectively better for new projects in 2025.

---

### Map Library: Leaflet.js

**Rationale:**
- Leaflet is the de facto standard for lightweight, open-source web mapping.
- Native OSM support. OSM tiles, GeoJSON layers, and interactive elements work out of the box.
- Small bundle (~40 KB gzipped). Mapbox and Google Maps are heavier and/or paid.
- React integdings available (react-leaflet) for seamless state management.

**Trade-offs accepted:**
- Less polished than Mapbox or Google Maps. You won't get fancy 3D terrain or real-time traffic. Acceptable for this use case.
- Limited built-in search. You'll need to add reverse geocoding separately (see geocoding library below).

**What this does NOT do well:**
- Vector tile performance at global scale. Leaflet renders GeoJSON as SVG, which is slow for 10,000+ features. For MVP, we'll pre-filter data to show only routes in the search radius, so this is not a blocker.

**Alternative considered:**
- **Mapbox GL JS:** Beautiful, performant, but $100+/month for high-volume tile serving. For a free product, this is unsustainable unless you host your own vector tiles.
- **Google Maps:** Good, but requires API key and per-request billing. Not suitable for a free tool.
- **OpenLayers:** Heavier than Leaflet, more powerful, overkill for this project.

---

### Styling: Tailwind CSS

**Rationale:**
- Tailwind is the fastest way to build a UI without custom CSS files. Utility-first approach means you style in JSX without switching contexts.
- Works well with React and Vite. No build configuration needed beyond adding the Tailwind plugin.
- Produces a small CSS bundle (only includes classes you use).

**Trade-offs accepted:**
- HTML is verbose with class names (`<div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4">`). Readable once you know Tailwind, but looks messy initially.
- No design system. You're building from utilities, not components. For a simple tool, this is fine.

**What this does NOT do well:**
- Complex animations or advanced CSS. Tailwind is for layout and simple styling. Complex animations belong in CSS-in-JS (like Framer Motion) or vanilla CSS.

**Alternative considered:**
- **styled-components or emotion:** Would require more JavaScript bundle and more boilerplate. Tailwind is faster to iterate with.
- **Plain CSS + CSS modules:** Fine, but slower to develop. Tailwind is the right choice for rapid iteration.

---

### Elevation Chart: Recharts

**Rationale:**
- Recharts is a React wrapper around D3. You get composable chart components that are easy to customize.
- Lightweight (~60 KB), performs well even with 1,000+ data points (elevation samples along a route).
- Works seamlessly with Tailwind CSS and React state.

**Trade-offs accepted:**
- Heavy bundle if you use many chart types. For this project, you only need LineChart, so it's fine.
- Rendering performance: At 1,000+ elevation samples, Recharts can be slow. Mitigation: Simplify elevation profiles to 100–200 samples before rendering.

**What this does NOT do well:**
- Real-time updating. If you need a live dashboard that refreshes every second, Recharts can lag. Not needed for this project.

**Alternative considered:**
- **Chart.js:** Lighter, simpler API, but less composable. Would work fine; Recharts is better if you need interactivity.
- **D3 directly:** Too low-level, requires expertise. Not worth it for one chart type.

---

### Hosting: GitHub Pages / Cloudflare Pages

**Rationale:**
- Both are free static hosting with auto-deploy from Git. Push to main → site updates in 1 minute.
- GitHub Pages: Integrated with GitHub, no extra setup. Drawback: only supports GitHub repos, no serverless functions.
- Cloudflare Pages: Faster global CDN, supports serverless functions (for future use), more flexible. Drawback: requires Cloudflare account.
- **Recommendation for MVP:** Start with GitHub Pages. If you need Cloudflare features later, migrate.

**Trade-offs accepted:**
- No backend. All computation must be done offline (in CI/CD) or client-side. This is intentional and keeps costs zero.
- No dynamic content. The site is static. For future features (user preferences, saved routes), you'd need a thin backend.

**What this does NOT do well:**
- Dynamic content generation. If you need to compute routes on-the-fly, a serverless function (Cloudflare Workers, AWS Lambda) is required.

**Alternative considered:**
- **Vercel:** Similar to Cloudflare Pages, slightly easier DX, but requires more complex setup for dynamic computation.
- **Self-hosted:** More control, but requires DevOps and cost. Not suitable for a free tool.

---

### Trail Data: OpenStreetMap + Overpass API

> Updated by ADR-006: queries run after user searches and results are processed and cached in the browser. They are not precomputed daily.

**Rationale:**
- OSM is the most complete, open-source map database. It's crowd-sourced but has good coverage in ultra running regions (Alps, US mountains).
- Overpass API allows you to query specific trail types (hiking routes, running paths) within a bounding box. This is the perfect data source for discovering trails.
- No rate limits (fair-use, ~10k requests/day is fine for MVP). No API key required.

**Trade-offs accepted:**
- Data quality varies by region. Popular regions (Chamonix, Moab) have excellent coverage. Remote regions are sparse.
- Updates are slow. OSM is crowd-sourced, so new trails take weeks to appear.
- No real-time freshness. You'll pre-compute routes daily or weekly, not hourly.

**What this does NOT do well:**
- Real-time trail conditions (closures, maintenance). You'd need a separate data source (park websites, community reports).

**Alternative considered:**
- **Strava Metro:** Gives you heatmaps of actual runs, but requires paid API access and doesn't give you the actual trail network.
- **Google Maps API:** Requires billing and has usage quotas. More expensive than OSM.
- **AllTrails API:** Not publicly available at scale.

---

### DEM (Elevation Data): Mapzen/AWS Terrarium

> Updated by ADR-006: production elevation comes from global Terrarium PNG tiles at zoom 12. Copernicus GLO-30 and GDAL remain an offline validation path.

**Rationale:**
- Copernicus GLO-30 is a free, global digital elevation model with 30m resolution.
- Publicly available and open-licensed (CC BY 4.0). No API key required.
- 30m resolution is sufficient for elevation gain calculations (±50–150m accuracy, which is acceptable for training).
- Complete global coverage, including remote regions.

**Trade-offs accepted:**
- 30m resolution misses fine details (gullies, switchbacks <30m). Elevation gain can be ±50–150m off, not pixel-perfect.
- Large file size: Global GLO-30 is ~6 GB. For MVP, you'll only download tiles for your target regions (~500 MB total for 5 regions).

**What this does NOT do well:**
- Sub-meter accuracy for technical terrain. If you need to distinguish between a 2m scramble and a 5m cliff, GLO-30 is too coarse.

**Alternative considered:**
- **SRTM (Shuttle Radar Topography Mission):** Similar 30m resolution, also free. Copernicus GLO-30 is newer and better validated.
- **Lidar (IFSAR):** Higher resolution (~3m), but expensive or restricted. Not viable for free global coverage.

---

### Elevation Processing: GDAL (CLI) + Python

**Rationale:**
- GDAL (Geospatial Data Abstraction Library) is the industry standard for raster processing. It can read DEMs, sample elevation along paths, and compute derivatives.
- Python + GDAL + Fiona (for GeoJSON) gives you a complete geospatial toolkit.
- Process elevation gain offline (in CI/CD) and serve pre-computed results as static JSON. This keeps the client-side code simple and performant.

**Trade-offs accepted:**
- GDAL is not the easiest library (steep learning curve). Mitigation: Hire or learn for a week.
- Processing time: Computing elevation gain for 1,000 trails might take 5–10 minutes. Acceptable if done overnight in CI/CD.

**What this does NOT do well:**
- Real-time elevation processing. If you need to compute gain on-demand, client-side GDAL (via WebAssembly) is extremely slow.

**Alternative considered:**
- **Mapbox Elevation API:** Pay-per-request, not suitable for a free tool with thousands of routes.
- **Google Elevation API:** Same issue.
- **Client-side elevation processing:** Possible with JavaScript libraries (turf.js, etc.), but requires downloading the entire DEM into the browser (~500 MB for one region). Not practical.

**Workflow:**
1. CI/CD (GitHub Actions) runs daily:
   - Query Overpass API for all trails in target regions
   - For each trail: sample elevation at 10m intervals using GDAL
   - Compute total gain and loss
   - Store results as GeoJSON + JSON
2. Frontend loads pre-computed data, renders on map, displays gain/loss metrics
3. No elevation processing happens in the browser

---

### CI/CD: GitHub Actions

**Rationale:**
- GitHub Actions is free for public repos. Your data pipeline (query OSM, process elevation, generate JSON) runs nightly.
- Integrated with GitHub. Workflows are defined in `.github/workflows/` YAML files, committed to the repo.
- Outcomes (generated JSON files) can be committed back to the repo or pushed to a storage service (AWS S3, etc.).

**Trade-offs accepted:**
- GitHub Actions has a fair-use policy. 1,000 free minutes/month is plenty for your use case (daily 10-minute pipeline = 300 minutes/month).
- Workflow debugging can be slow. Logs are helpful, but running locally is easier.

**What this does NOT do well:**
- Long-running jobs (>60 min). If your elevation processing takes hours, you'll need a dedicated server or scheduled Lambda.

**Workflow example:**
```yaml
name: Refresh elevation data
on:
  schedule:
    - cron: '0 2 * * *'  # 2am UTC daily
jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install GDAL and dependencies
        run: sudo apt-get install gdal-bin
      - name: Process elevation
        run: python scripts/process_elevation.py
      - name: Commit and push
        run: |
          git config user.name "Data bot"
          git config user.email "bot@utm-height.dev"
          git add public/data/*.json
          git commit -m "Update elevation data"
          git push
```

---

### Data Format: GeoJSON + JSON

**Rationale:**
- GeoJSON is the standard for geographic data interchange. Web mapping tools (Leaflet, Mapbox) natively parse GeoJSON.
- Compact when gzipped. A GeoJSON file with 1,000 trails (~50 MB raw) compresses to ~5 MB gzipped.
- Easy to parse in JavaScript. No special libraries needed; JSON.parse() works.

**Trade-offs accepted:**
- Large file size for global coverage. For MVP (5 regions), you'll serve ~25 MB gzipped. Acceptable.
- No spatial indexing. Filtering by bounding box happens client-side (O(n) scan). For <10,000 features, this is fine.

**What this does NOT do well:**
- Real-time updates. If you need to add new routes hourly, GeoJSON files become stale quickly. Solution: Use a lightweight API instead.

**File structure example:**
```
public/data/
├── chamonix.geojson       # All trails near Chamonix
├── moab.geojson           # All trails near Moab
├── metadata.json          # {chamonix: {count: 200, gain_range: [50, 2400]}, ...}
└── index.json             # List of regions, last updated timestamps
```

---

### Map Tiles: OpenStreetMap Community Tiles

**Rationale:**
- OSM community tiles are free and require no authentication.
- "Fair use" policy: 10k requests/day is acceptable for MVP. Above that, host your own tiles (tedious but free).
- Fully open-source and non-commercial. No vendor lock-in.

**Trade-offs accepted:**
- Lower visual quality than Mapbox or Google Maps. OSM tiles are functional but less polished.
- No 3D terrain, satellite imagery, or real-time traffic. Acceptable for a tool focused on route discovery.

**Attribution requirement:**
- OSM requires attribution: "© OpenStreetMap contributors." Easy to add as a line of text in the footer.

**What this does NOT do well:**
- Customize styling. OSM tiles are fixed. If you want custom colors/labels, host your own vector tiles (advanced, out of MVP scope).

**Alternative considered:**
- **Mapbox Raster Tiles:** Beautiful, but $100+/month for high usage.
- **Stamen Terrain:** Free but possibly shutting down. Not recommended long-term.

---

## Stack Summary Table: What We're NOT Using

| Technology | Why Not | Alternative Cost |
|-----------|---------|------------------|
| Backend API (Node.js, Python) | Unnecessary for a data-driven static site. Pre-compute and serve static JSON. | Would add hosting cost, DevOps burden, and complexity. |
| Database (PostgreSQL, MongoDB) | No persistent user data. Routes are computed once daily and served as static files. | Same as above. |
| Authentication / User accounts | Not needed for MVP. All data is public. | Adds security, DevOps, and privacy obligations. |
| Mapbox or Google Maps | Expensive ($100s/month) and overkill for route discovery. Leaflet + OSM is sufficient. | Cost: $1,200–5,000/year. |
| D3.js for custom charts | Overkill. Recharts is more than enough. | Adds learning curve and bundle size. |
| TypeScript + frontend state management (Redux, Zustand) | TypeScript yes, Redux no. Redux is overkill for a simple filter + map view. Use React Context or props. | Redux adds boilerplate; not needed. |
| Server-side rendering (Next.js) | Not needed for a static site. Vite handles everything. | Next.js adds complexity; not justified here. |
| Testing framework (Jest, Vitest) | MVP first, tests later. If time permits, add Vitest for unit tests. | Delayed, not deleted. |
| Analytics (Google Analytics, Posthog) | Not in MVP scope. Add later if retention tracking matters. | Delayed, not deleted. |

---

## Conclusion

This stack is **minimal, free, and fast to develop:**
- **Zero hosting costs:** GitHub Pages + free APIs + pre-computed data.
- **Fast iteration:** Vite + React for responsive UI development.
- **Low operational overhead:** No servers, no databases, no CI/CD complexity beyond one daily Python script.
- **Open-source throughout:** No vendor lock-in.

**The biggest risk:** If elevation gain processing takes longer than expected, or if OSM coverage is sparse, you'll hit bottlenecks. **Mitigate by validating data coverage in Phase 0 (before coding).**
