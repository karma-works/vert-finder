# Implementation Plan: Vert Finder

> **Historical plan.** The project has moved past the initial scaffold and adopted the worldwide live-data architecture in [ADR-006](ADR-006-worldwide-live-data.md). Use the repository README and ADR-006 for current implementation guidance.

## Estimated Timeline

- **Phase 0 (MVP): 10–12 weeks** (solo developer) or **6–8 weeks** (2-person team)
- **Phase 1: 8–12 weeks** (post-launch iteration)
- **Phase 2: Open-ended** (new features, scaling)

---

## Phase 0: MVP (Detailed Week-by-Week)

### Week 1: Project Setup + Infrastructure

**Goals:** Get the developer environment and CI/CD pipeline working. First deploy to GitHub Pages.

**Tasks:**
- [ ] Initialize Vite project (`npm create vite@latest utm-height -- --template react`)
- [ ] Configure TypeScript: `tsconfig.json`, set `strict: true`
- [ ] Install dependencies:
  - `react-leaflet`, `leaflet`
  - `recharts` (elevation profile chart)
  - `tailwindcss` + PostCSS
  - `typescript` types
- [ ] Set up Git repository and GitHub Pages
  - Create `gh-pages` branch
  - Configure GitHub repo settings for Pages (publish from `gh-pages` branch)
- [ ] Create GitHub Actions workflow `.github/workflows/deploy.yml`
  - Runs on push to main
  - Installs deps, builds (`npm run build`), deploys to GitHub Pages
- [ ] Set up basic Tailwind CSS styling in `index.css`
- [ ] Deploy a "Hello World" page to GitHub Pages
- [ ] Verify site is live at `https://username.github.io/utm-height/`

**Deliverables:**
- [ ] Working Vite + React dev environment
- [ ] GitHub Pages deployment pipeline (proven with test deploy)
- [ ] Tailwind CSS configured

**Success criteria:** You can `npm run dev`, see a live development server, and push to GitHub to see the site update within 1 minute.

---

### Week 2: Map UI + Location Search

**Goals:** Build the core map interface and location search.

**Tasks:**
- [ ] Create `src/components/Map.tsx`: Leaflet map centered on Boulder, CO (default)
  - Pan and zoom controls
  - OSM tiles as base layer
  - Map container styled with Tailwind (full height)
- [ ] Create `src/components/LocationSearch.tsx`:
  - Text input field for city name or coordinates
  - Debounced search handler
  - Display search results (dropdown of cities)
- [ ] Integrate reverse geocoding (use free API like Nominatim):
  - "Chamonix" → {lat, lng}
  - Store in React state
  - Map centers on selected location
- [ ] Create `src/App.tsx`: Top-level layout
  - Location search bar at top
  - Map below
  - Responsive grid layout

**Deliverables:**
- [ ] Interactive map with pan/zoom
- [ ] Location search (city name → coordinates)
- [ ] Map re-centers on location change

**Success criteria:** User can type "Chamonix," map centers on Chamonix, all interactions are smooth.

---

### Week 3: Elevation Gain Filter + Basic Data Loading

**Goals:** Build the elevation gain filter UI and load sample trail data.

**Tasks:**
- [ ] Create sample GeoJSON file `public/data/sample.geojson` with 10–20 mock trails (for testing)
  - Each feature: `{geometry: LineString, properties: {name, elevation_gain, distance}}`
- [ ] Create `src/components/ElevationFilter.tsx`:
  - Two sliders: min elevation gain, max elevation gain
  - Display selected range
  - State management (React hooks)
- [ ] Create `src/hooks/useTrails.ts`: Data loading
  - Fetch GeoJSON from `public/data/{region}.geojson`
  - Filter routes by elevation gain range
  - Store in React state
- [ ] Integrate filters into `App.tsx`
  - When elevation gain range changes, re-filter trails
- [ ] Add basic error handling (network errors, no results)

**Deliverables:**
- [ ] Working elevation gain filter (min/max sliders)
- [ ] Load and filter sample GeoJSON data
- [ ] Display filter results count ("Found 5 routes")

**Success criteria:** User can adjust elevation gain sliders; map updates to show matching routes (currently as invisible features).

---

### Week 4: Render Trails on Map

**Goals:** Display trail routes on the map as interactive line segments.

**Tasks:**
- [ ] Create `src/components/TrailLayer.tsx`: Render GeoJSON features as polylines
  - Each route is a colored line (color by elevation gain bracket: green/yellow/red)
  - Thin lines (weight: 2–3) to avoid clutter
  - Tooltip on hover (route name, elevation gain, distance)
  - Click handler to open route detail
- [ ] Implement color scale: elevation gain → color
  - <500m: green
  - 500–1000m: yellow
  - 1000–1500m: orange
  - 1500m+: red
- [ ] Add map control to toggle trails on/off
- [ ] Optimize rendering: Leaflet GeoJSON layer vs. many individual polylines
  - For <1,000 features, Leaflet GeoJSON layer is fine
  - For >1,000 features, implement clustering or simplification
- [ ] Test with 100+ mock trails in sample GeoJSON

**Deliverables:**
- [ ] Trails rendered on map as colored lines
- [ ] Hover tooltip shows route info
- [ ] Click handler (not yet functional, but fires)
- [ ] Map is interactive (routes don't block pan/zoom)

**Success criteria:** User can see trails on the map, visually distinguished by elevation gain color.

---

### Week 5: Route Detail Panel

**Goals:** Show route information when user clicks a trail.

**Tasks:**
- [ ] Create `src/components/RouteDetail.tsx`: Side panel (right side of screen)
  - Shows when user clicks a route
  - Displays: route name, elevation gain, distance, gradient (gain/distance)
  - Elevation profile chart (using Recharts)
  - "Open in maps" button (link to Google Maps / Apple Maps with coordinates)
  - Close button (X)
- [ ] Create elevation profile chart:
  - X-axis: distance along trail
  - Y-axis: elevation
  - Show area under curve (colored by grade: <5% green, 5–10% yellow, 10%+ red)
  - Tooltip on hover (distance, elevation, grade at that point)
- [ ] State management: `selectedRoute` in React Context or props
  - Click trail → set selectedRoute → panel appears
  - Close panel → clear selectedRoute
- [ ] Responsive layout:
  - Desktop: side panel on right (width: 300px)
  - Mobile: modal overlay (full width)

**Deliverables:**
- [ ] Route detail panel opens on click
- [ ] Elevation profile chart displays correctly
- [ ] "Open in maps" button works

**Success criteria:** User clicks a trail, sees its full details including elevation profile, can open it in external map app.

---

### Week 6: Radius Configuration

**Goals:** Add configurable search radius.

**Tasks:**
- [ ] Add "Options" or "Settings" button to top bar
  - Modal with: radius slider (5–100 km, default 30 km)
  - Other settings (e.g., units: meters vs feet)
- [ ] Store radius in React state and localStorage (persist across sessions)
- [ ] Update trail filtering logic:
  - Calculate distance from search location to each trail's start point
  - Filter: `distance <= radius`
- [ ] Update UI to show "Found X routes within Y km"
- [ ] Test with various radius values

**Deliverables:**
- [ ] Settings modal with radius configuration
- [ ] Trails filtered by radius
- [ ] Settings persisted in localStorage

**Success criteria:** User can adjust radius (not prominent, as requested), see filtered results.

---

### Week 7: Elevation Processing Pipeline (Phase 0)

**Goals:** Build the CI/CD pipeline that computes elevation gain from OSM data and DEMs.

**Tasks:**
- [ ] Set up Python environment for batch processing
  - Install GDAL, fiona, shapely, requests
  - Create `scripts/process_elevation.py`
- [ ] Implement Overpass API querying:
  - Define bounding boxes for 5 target regions (Chamonix, Moab, Sedona, Boulder, Chamonix Valley)
  - Query Overpass API for hiking trails
  - Parse results into GeoJSON
  - Handle timeouts and retries
- [ ] Implement elevation processing:
  - Download Copernicus GLO-30 DEM tiles for each region (cached)
  - For each trail: sample elevation at 10–20m intervals
  - Calculate elevation gain (sum of positive elevation changes)
  - Store gain in GeoJSON properties
- [ ] Generate metadata:
  - `public/data/metadata.json`: regions, counts, gain ranges, last update timestamp
- [ ] Create GitHub Actions workflow `.github/workflows/process-elevation.yml`
  - Runs daily at 2am UTC
  - Runs Python script to process trails
  - Commits updated GeoJSON files to Git
  - Deploys to GitHub Pages
- [ ] Test the pipeline locally with one region
  - Verify elevation gain calculations against manual spot-checks (Gaia GPS, etc.)
  - Aim for ±100m accuracy (±5–10%)

**Deliverables:**
- [ ] `scripts/process_elevation.py` implemented
- [ ] GitHub Actions workflow for daily updates
- [ ] 5 regions of trail data pre-computed and committed to repo
- [ ] Metadata file with region info

**Success criteria:** You can run the script locally, it produces valid GeoJSON, and the GitHub Actions workflow runs successfully and deploys updated data.

---

### Week 8: Validation + Data QA

**Goals:** Ensure elevation data is accurate before launch.

**Tasks:**
- [ ] Spot-check elevation gain calculations:
  - Pick 10 well-known trails (e.g., Chamonix trail: "Montagne à l'Index")
  - Compare app elevation gain to manual calculation (Gaia GPS, Komoot, AllTrails)
  - Aim for <10% error
  - Document results in `DATA_VALIDATION.md`
- [ ] Validate OSM coverage:
  - In each target region, manually count known running trails
  - Compare to trails in app
  - If <60% coverage in a region, note as "limited coverage" in UI
- [ ] Test edge cases:
  - Routes with no elevation data (flat terrain)
  - Very long routes (>50 km)
  - Very short routes (<1 km)
- [ ] Check trail descriptions (missing names, weird characters, etc.)
- [ ] Generate coverage report:
  - Chamonix: 150 routes, gain range 100–2800m ✓
  - Moab: 80 routes, gain range 50–1600m ✓
  - Sedona: 120 routes, gain range 100–1500m ✓
  - Boulder: 200 routes, gain range 50–2000m ✓
  - Etc.

**Deliverables:**
- [ ] Data validation report
- [ ] Coverage per region documented
- [ ] Any bad data flagged and removed

**Success criteria:** You're confident that elevation gain is within ±10% of ground truth for at least 80% of routes.

---

### Week 9: UI Polish + Mobile Responsiveness

**Goals:** Make the UI polished and mobile-friendly.

**Tasks:**
- [ ] Test on mobile browsers (iOS Safari, Chrome Android)
  - Map interactions work (single-finger pan, pinch zoom)
  - Location search is accessible (no tiny text)
  - Route detail panel is modal (fullscreen on mobile)
  - Filter sliders are easy to use with touch
- [ ] Optimize performance:
  - Profile app with Chrome DevTools Lighthouse
  - Aim for >80 Performance score
  - Lazy-load Recharts chart library
  - Simplify GeoJSON if >5000 features per region
- [ ] Improve UX:
  - Add loading spinner while fetching data
  - Improve error messages ("No results" vs. "Server error")
  - Add "found X routes" summary
  - Smooth transitions (panel slide in/out)
- [ ] Styling:
  - Dark mode support (optional, not required for MVP)
  - Consistent spacing, typography
  - Accessible colors (color-blind friendly gain scale)
- [ ] Browser compatibility:
  - Test on Chrome, Firefox, Safari (last 2 versions)
  - Verify Leaflet works on older browsers (if needed)

**Deliverables:**
- [ ] Mobile-responsive UI
- [ ] No visual bugs or layout breaks
- [ ] Lighthouse Performance >80

**Success criteria:** App works smoothly on both desktop and mobile browsers.

---

### Week 10: Documentation + README

**Goals:** Document the project for GitHub and users.

**Tasks:**
- [ ] Write `README.md`:
  - What the app does (1-2 paragraphs)
  - Features (bullet list)
  - How to use (walkthrough with screenshot)
  - Limitations ("MVP features, future plans")
  - Development setup (for contributors)
  - License (MIT)
- [ ] Add SVG logo:
  - Simple design: map icon + elevation gain symbol (triangle/wave)
  - 256x256px and 64x64px versions
  - Use in README and browser tab (favicon)
- [ ] Write contribution guidelines (optional for MVP, but nice to have)
- [ ] Add MIT license file (`LICENSE`)
- [ ] Document the elevation processing pipeline:
  - How to run locally
  - How the GitHub Actions workflow works
  - How to add new regions
- [ ] Update `package.json`:
  - Add description, keywords, homepage, repository, license

**Deliverables:**
- [ ] Comprehensive README
- [ ] SVG logo
- [ ] MIT license
- [ ] Development documentation

**Success criteria:** Someone finds the GitHub repo, reads the README, understands what it does, can use it immediately.

---

### Week 11: Testing + Final QA

**Goals:** Test the app thoroughly before launch.

**Tasks:**
- [ ] Functional testing:
  - [ ] Location search: try 10 different cities, verify map centers correctly
  - [ ] Elevation filter: try edge cases (min=0, max=10000, etc.)
  - [ ] Route detail: click various routes, verify chart renders
  - [ ] Settings: change radius, verify trails update
  - [ ] Responsiveness: test on 3+ devices/screen sizes
- [ ] Performance testing:
  - [ ] Load time: measure time from page load to "map is interactive"
  - [ ] Interaction: measure pan/zoom latency (should be <200ms)
  - [ ] Chart rendering: measure chart load time for complex profiles
- [ ] Data integrity:
  - [ ] Verify all 5 regions have data
  - [ ] Verify gain calculations are consistent (run twice, same results)
  - [ ] Check for missing routes or corrupted GeoJSON
- [ ] Browser testing:
  - [ ] Chrome (desktop + mobile)
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge (if possible)
- [ ] Write up any bugs found
- [ ] Fix critical bugs; defer minor UX tweaks to Phase 1

**Deliverables:**
- [ ] QA report (checklist of tested features)
- [ ] Bug tracker (any remaining issues logged)

**Success criteria:** App is stable, performs well, no critical bugs. You're ready to launch.

---

### Week 12: Launch + Early User Feedback

**Goals:** Launch the app and gather initial feedback from ultra runners.

**Tasks:**
- [ ] Final deployment check:
  - [ ] GitHub Pages site is live and fast
  - [ ] All data is deployed (5 regions, metadata)
  - [ ] GitHub Actions is running nightly (or scheduled) elevation updates
- [ ] Announce the app:
  - [ ] Post on Reddit (r/ultrarunning, r/trailrunning)
  - [ ] Post in Facebook ultra running groups
  - [ ] Email to ultra running contacts (if you have a list)
  - [ ] Tweet / social media (if applicable)
- [ ] Set up feedback collection:
  - [ ] Simple Google Form (optional: "Did this route work for you?")
  - [ ] GitHub Issues open for bug reports
  - [ ] Email address or Slack for feedback (if you want direct contact)
- [ ] Monitor early usage:
  - [ ] Check GitHub Actions logs (is the elevation pipeline running?)
  - [ ] Monitor feedback (are people finding it useful? Any complaints?)
  - [ ] Fix any critical bugs immediately
- [ ] Document early feedback:
  - [ ] What's working well?
  - [ ] What's broken?
  - [ ] What's the most-requested feature?

**Deliverables:**
- [ ] Live, public app with users
- [ ] Feedback collection mechanism in place
- [ ] Early feedback documented

**Success criteria:** App is live, users can find it, you're collecting feedback for Phase 1.

---

## Phase 1: Post-Launch Iteration (8–12 weeks)

### Major themes (not detailed week-by-week yet):

- **Data quality improvements:**
  - User-reported route issues (closed trails, inaccurate gain)
  - Better OSM coverage (manually add missing trails, verify existing ones)
  - Terrain type filtering (road vs. trail vs. single-track)

- **Feature expansion (based on user feedback):**
  - Route favoriting (localStorage or simple API)
  - Route sharing (generate shareable link)
  - Difficulty rating (combine gain + distance → perceived difficulty)
  - Weather integration (forecast for search location)

- **Scaling & performance:**
  - Migrate to Cloudflare Pages (faster CDN)
  - Optimize GeoJSON for large regions (if needed)
  - Add serverless functions (Cloudflare Workers) if any compute is needed

- **User experience:**
  - Mobile app (React Native or native iOS/Android)
  - Export route as GPX (for GPS watches)
  - Integration with fitness apps (Strava, TrainingPeaks)

---

## Phase 2: Long-term Vision (Open-ended)

### Major themes:

- **Community features:**
  - User accounts (optional login for saved routes)
  - Route reviews and difficulty ratings
  - Seasonal trail conditions (snow, water crossings)

- **Advanced analytics:**
  - Dashboard: "Top 10 hardest routes in your region"
  - Training load calculator (based on gain and distance)
  - Route similarity (find routes like the one you just ran)

- **Competitive integration:**
  - Partnerships with race organizers (embed route finder in race websites)
  - Integration with ultra race apps (show training routes near race location)

- **Global expansion:**
  - Improve OSM coverage in under-mapped regions
  - Regional trail databases (hire local contributors)
  - Multi-language support

---

## Phase 0 Launch Criteria

The MVP is ready to launch when:

- [ ] App loads in <3 seconds on 4G mobile
- [ ] All 5 target regions have elevation data (validated to ±10% accuracy)
- [ ] Map is interactive and responsive (<200ms lag)
- [ ] Route detail panel displays correctly on desktop and mobile
- [ ] Location search works for at least 50 major cities
- [ ] Elevation filter works (slider, no lag)
- [ ] No console errors in browser
- [ ] README is comprehensive and welcoming
- [ ] MIT license is in place
- [ ] GitHub Actions elevation pipeline runs nightly without errors
- [ ] At least one ultra runner outside the immediate team has tested it and given feedback

---

## Risk Factors & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| OSM data is too sparse in target regions | Medium | Validate coverage in Week 0.5 before building UI; choose well-mapped regions for launch |
| Elevation gain calculation is inaccurate | Medium | Spot-check manually in Week 8; accept ±10% error |
| Leaflet performance lags with 1000+ routes | Medium | Implement clustering / simplification in Week 4; test with sample data early |
| GitHub Actions elevation processing takes >1 hour | Low | Profile script in Week 7; optimize GDALqueries; run on faster runner if needed |
| No users adopt the app | Medium | Validate problem with target ultra runners before MVP launch (Week 0); gather feedback in Week 12 |
| Hosting costs spike | Low | GitHub Pages + static files = zero cost; only risk is if you add a backend |

---

## Effort Estimate

**Solo developer:**
- Week 1–12: 40–50 hours/week (part-time) or 20–25 hours/week (hobby)
- Total: 480–600 hours (12–15 weeks part-time, or 24–30 weeks hobby)

**Two-person team (frontend + backend/data):**
- Week 1–8: 40 hours/week per person
- Total: 320 hours (8 weeks)

**Recommended:** Start solo if you have 15–20 hours/week available; consider bringing a collaborator for Week 7+ (elevation processing) if that's unfamiliar territory.
