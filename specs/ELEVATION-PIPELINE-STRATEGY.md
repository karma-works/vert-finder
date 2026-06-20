# Elevation Pipeline Strategy & Validation Plan

**Status:** Approved for Phase 0.5a validation

**Decision Date:** 2026-06-20

---

## Context

The current elevation processing pipeline (`scripts/process_elevation.py`) has solid structure but three known limitations:

1. **Route assembly:** Treats individual OSM way segments as complete routes. Should prefer OSM hiking route relations or assemble connected ways.
2. **Sparse sampling:** Only samples elevation at existing OSM nodes. Sparse trails undercount/overcount gain.
3. **DEM noise:** No smoothing. Copernicus GLO-30 surface model has noise that affects gain calculations.

**Question:** Is the current pipeline accurate enough for MVP, or must we improve it before Phase 0?

---

## Recommended Approach: Phased Validation + Improvement

### Phase 0.5a: Rapid Validation (This Week)

**Goal:** Answer "Is current pipeline accurate enough (±10% or better)?"

**Timeline:** 8–12 hours

**Steps:**

1. **Download Copernicus GLO-30 tiles** for 5 target regions
   - Use AWS public dataset (no account required)
   - ~16 tiles total, ~0.5–1 GB
   - Cached locally in `data/copernicus/` (excluded from Git)

2. **Build DEM mosaic** using `gdalbuildvrt`
   - Creates virtual raster `data/copernicus.vrt`
   - Stitches tiles without copying data

3. **Run elevation processor**
   - `python scripts/process_elevation.py --dem data/copernicus.vrt`
   - Outputs real GeoJSON to `public/data/routes.geojson`

4. **Spot-check elevation accuracy**
   - Pick 10 well-known ultra running routes
   - For each: compare app's elevation gain to ground truth (Gaia GPS, Komoot, AllTrails, race reports)
   - Calculate error rate: `(app_gain - true_gain) / true_gain`
   - Target: ≥85% of routes within ±10% error

5. **Document findings**
   - Route-by-route comparison table
   - Error statistics (min, max, median)
   - Any pattern failures (e.g., flat routes undercount gain)

**Decision Gate:**

| Accuracy | Action |
|----------|--------|
| ≥85% within ±10% | **Proceed to Phase 0** with current script. Queue improvements for Phase 1. |
| 70–85% within ±10% | **Proceed with caution.** Flag elevation data as "beta accuracy" in UI. Improve script in parallel during Phase 0. |
| <70% within ±10% | **Halt Phase 0.** Implement improvements (relations + interpolation + smoothing) before proceeding. |

---

### Phase 0.5b: Pipeline Improvements (Phase 1, if needed)

If Phase 0.5a validation reveals accuracy <70%, implement these improvements before Phase 0:

**1. OSM Relation Assembly** (Priority: High)
- Prefer `relation[route=hiking]` over individual ways
- Fall back to ways if no relation exists
- Assemble connected ways into complete routes
- **Effort:** 2–3 days
- **Expected gain:** +5–10% accuracy in mountain regions with proper route tags

**2. Interpolation & Smoothing** (Priority: High)
- Interpolate points every 20–30m along each route (not just at OSM nodes)
- Apply Savitzky-Golay filter (window: 5–7 points, degree 2) to smooth DEM noise
- Recalculate elevation gain from smoothed profile
- **Effort:** 2–3 days
- **Expected gain:** +5–15% accuracy, especially on sparse trails

**3. Automatic Tile Download** (Priority: Medium)
- Script to automatically download GLO-30 tiles for new regions
- Detect missing tiles, fetch from AWS, cache locally
- **Effort:** 1 day
- **Expected benefit:** Easier onboarding for new regions in Phase 1

**4. Seasonal/Metadata Flagging** (Priority: Low, Phase 2)
- Flag routes as "winter closure" if they're in alpine zones above treeline
- Add surface type from OSM (`surface=gravel`, `surface=rock`, etc.)
- **Effort:** 1 day
- **Expected benefit:** Better user guidance

---

## Rationale

**Why phased validation?**
- If current accuracy is acceptable (≥85%), we save 1–2 weeks and ship MVP faster
- If accuracy is bad (<70%), we fix the pipeline before generating misleading data
- Risk: Minimal. Validation doesn't commit changes; it's read-only testing.

**Why not improve now?**
- Improvements are complex and may introduce bugs
- Validation will tell us if they're necessary
- MVP can launch with "good enough" data and iterate

**Why keep improvements for Phase 1?**
- Reduces time-to-MVP
- Allows us to gather user feedback first ("which routes are wrong?")
- Gives us concrete data to test improvements against

---

## Expected Outcomes

### Phase 0.5a Validation

**Output:** `ELEVATION-VALIDATION-RESULTS.md` with:
- 10 tested routes with side-by-side comparison
- Accuracy metrics (mean error, % within ±10%)
- Regional patterns (e.g., "alpine routes more accurate than forest")
- Decision: proceed vs. halt vs. improve

**Deliverable:** Real GeoJSON dataset in `public/data/routes.geojson` ready for MVP or improvements.

### Success Criteria

- [ ] GLO-30 tiles downloaded and VRT built
- [ ] Processor runs without errors
- [ ] 10 routes spot-checked
- [ ] Error rate documented
- [ ] Decision made: Phase 0 or Phase 0.5b

---

## Data Management

**DEM tiles:**
- Downloaded to `data/copernicus/` (excluded from Git)
- VRT reference: `data/copernicus.vrt` (excluded from Git)
- Reusable across multiple runs (don't re-download)

**Processed output:**
- GeoJSON: `public/data/routes.geojson` (committed to Git)
- Metadata: `public/data/metadata.json` (committed to Git)
- These are the only files needed for deployment

**CI/CD (Phase 1):**
- GitHub Actions workflow: download tiles (if not cached) → run processor → commit GeoJSON
- Runs nightly
- No tile data committed; only GeoJSON

---

## Timeline Impact

| Phase | Duration | Status |
|-------|----------|--------|
| 0.5a (validation) | 1 day | **This week** |
| Decision | — | Determines path forward |
| 0.5b (improvements, if needed) | 4–6 days | **If accuracy <70%** |
| Phase 0 (MVP) | 10–12 weeks | **Proceeds after 0.5a or 0.5b** |

**Best case:** +1 day (validation passes, proceed)
**Worst case:** +5 days (validation fails, improve, then proceed)

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| DEM has bad tiles (corruption, voids) | Low | Test with one region first. Inspect tiles with `gdalinfo`. |
| Processor crashes on real data | Low | Test with small subset (1 region) before all 5. |
| Validation finds unacceptable accuracy | Medium | Pre-planned improvements (Phase 0.5b) ready to implement. |
| Real OSM data is too sparse | Medium | Switch launch regions if coverage <60%. Already identified in Phase 0.5. |
| Elevation gain formula is wrong | Low | Spot-check math by hand on one route. Compare to public GPS traces. |

---

## Next Steps

1. **This session:** Download GLO-30, build VRT, run processor
2. **Tomorrow:** Spot-check 10 routes, document accuracy
3. **End of week:** Decision meeting (proceed vs. improve)
4. **Following week:** Phase 0 kickoff (or Phase 0.5b if needed)
