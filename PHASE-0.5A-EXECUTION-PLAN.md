# Phase 0.5a Execution Plan: DEM Validation

> **Historical/offline validation plan.** Production now uses the browser-side worldwide pipeline in [`specs/ADR-006-worldwide-live-data.md`](specs/ADR-006-worldwide-live-data.md).

**Status:** In Progress

**Started:** 2026-06-20

**Objective:** Download real Copernicus GLO-30 elevation data, process real OSM trails, and validate elevation gain accuracy before Phase 0 MVP development.

---

## Current Status: DEM Download

**Action:** Downloading 13 Copernicus GLO-30 DEM tiles from AWS (estimated 0.7–1.9 GB)

**Tiles being downloaded:**
- Chamonix (France): 4 tiles (N44-45, E6-7)
- Boulder (USA): 2 tiles (N40, W105-106)
- Moab (USA): 1 tile (N38, W109)
- Sedona (USA): 4 tiles (N34-35, W111-112)
- Limone Piemonte (Italy): 2 tiles (N44, E7-8)

**Progress:** Running in background (ID: `bjo8nskar`)

**Next step:** Once download completes → Build VRT → Run processor

---

## Remaining Steps (After DEM Download)

### Step 1: Build VRT Mosaic (5 min)

```bash
gdalbuildvrt data/copernicus.vrt data/copernicus/*.tif
```

This creates a virtual raster that stitches all tiles together without duplicating data.

**Output:** `data/copernicus.vrt` (~5 KB virtual index)

### Step 2: Run Elevation Processor (10-20 min)

```bash
python3 scripts/process_elevation.py --dem data/copernicus.vrt
```

This:
1. Queries Overpass API for all trails within 30 km of each region center
2. Samples elevation from the DEM at each OSM node
3. Calculates total elevation gain and loss
4. Outputs GeoJSON with full trail data

**Output:**
- `public/data/routes.geojson` (~5–20 MB, real trail network)
- `public/data/metadata.json` (statistics per region)

**Expected trails per region:**
- Chamonix: 150–300 trails
- Boulder: 200–400 trails
- Moab: 100–200 trails
- Sedona: 150–300 trails
- Limone: 80–150 trails

**Total:** ~700–1,400 real trails (vs. 20 demo trails currently)

### Step 3: Spot-Check Elevation Accuracy (2-4 hours)

Compare calculated elevation gain to ground truth for 10 well-known routes:

1. Find 10 well-known ultra running routes across the 5 regions
2. Get their elevation gain from:
   - Gaia GPS (public shared routes)
   - Komoot (detailed routes)
   - AllTrails (user-curated, reviews)
   - Race reports (official race websites)
   - Strava (public routes with ≥100 activities)
3. Calculate error: `(app_gain - true_gain) / true_gain`
4. Document results in `ELEVATION-VALIDATION-RESULTS.md`

**Success criteria:**
- ≥85% of routes within ±10% error → **Proceed to Phase 0**
- 70–85% within ±10% → **Proceed with caution** (flag data as beta)
- <70% within ±10% → **Halt and improve** (implement interpolation + smoothing in Phase 0.5b)

---

## Commands to Execute (After Download)

**All-in-one script:**
```bash
bash scripts/build_vrt_and_process.sh
```

**Or step-by-step:**
```bash
# Build mosaic
gdalbuildvrt data/copernicus.vrt data/copernicus/*.tif

# Run processor
python3 scripts/process_elevation.py --dem data/copernicus.vrt

# Inspect output
cat public/data/metadata.json | jq '.'
wc -l public/data/routes.geojson
```

---

## Spot-Check Template

For each of 10 routes, fill in:

| # | Route Name | Region | Ground Truth (m) | App Calc (m) | Error (%) | Source | Notes |
|---|---|---|---|---|---|---|---|
| 1 | Planpraz Vertical | Chamonix | 1,450 | TBD | TBD | Gaia GPS | |
| 2 | Mont-Blanc approach | Chamonix | TBD | TBD | TBD | | |
| 3 | Green Mountain | Boulder | 1,150 | TBD | TBD | Komoot | |
| ... | ... | ... | ... | ... | ... | ... | |

**Sources to check:**
- **Gaia GPS:** Search region → sort by elevation gain → note the value
- **Komoot:** Open route → scroll to "Cumulative Ascent" in details
- **AllTrails:** Open trail → "Elevation Gain" in sidebar
- **Strava:** Segment → "Elevation Gain" at top
- **Race sites:** Official 100-miler results often list course elevation

---

## Expected Outcomes

### Best Case (≥85% accuracy)
✅ Download complete
✅ VRT builds successfully
✅ Processor runs, generates ~1,000 real trails
✅ Spot-checks show ≥85% within ±10% error
✅ **Decision:** Proceed to Phase 0 with current pipeline
✅ Timeline impact: +1 day

### Middle Ground (70–85% accuracy)
⚠️ Download complete
⚠️ Processor works
⚠️ Spot-checks show 70–85% accuracy
⚠️ **Decision:** Proceed to Phase 0 but flag elevation data as "beta accuracy"
⚠️ Queue improvements (interpolation + smoothing) for Phase 1
⚠️ Timeline impact: +1 day (validation) + 3–5 days (Phase 1 improvements)

### Worst Case (<70% accuracy)
❌ Processor works but accuracy is poor
❌ Spot-checks show <70% accuracy
❌ **Decision:** Halt Phase 0, implement improvements in Phase 0.5b
❌ Timeline impact: +1 day (validation) + 4–6 days (improvements) + 10–12 weeks (Phase 0) = 4–6 weeks delay

---

## Decision Criteria

| Accuracy | Coverage | Processor Status | Decision |
|----------|----------|------------------|----------|
| ≥85% ±10% | ≥60% of known routes | Works cleanly | ✅ **PROCEED PHASE 0** |
| 70–85% ±10% | ≥50% of known routes | Works, minor issues | ⚠️ **PROCEED WITH FLAG** |
| <70% ±10% | <50% of known routes | Works but bad output | ❌ **HALT, IMPROVE PHASE 0.5B** |

---

## Phase 0.5b Improvements (If Needed)

If accuracy is <70%, implement these before Phase 0:

### 1. OSM Relation Assembly (3 days)
- Prefer `relation[route=hiking]` over individual ways
- Assemble connected ways into complete routes
- Expected gain: +5–10% accuracy

### 2. Interpolation & Smoothing (3 days)
- Interpolate points every 20–30m
- Apply Savitzky-Golay filter (smooth DEM noise)
- Expected gain: +10–15% accuracy

### 3. Re-test (1 day)
- Regenerate GeoJSON with improvements
- Re-run spot-checks on same 10 routes
- Verify accuracy ≥85%

**Total Phase 0.5b:** 4–6 days

---

## Success Criteria Summary

| Deliverable | Target | Status |
|---|---|---|
| DEM tiles downloaded | 13 tiles, ≥700 MB | In progress |
| VRT built | 1 file, valid spatial index | Not started |
| Routes processed | 700–1,400 trails in 5 regions | Not started |
| Accuracy spot-checked | 10 routes, documented | Not started |
| Decision documented | Clear go/no-go for Phase 0 | Not started |

---

## Files Created for This Phase

**Scripts:**
- `scripts/download_dem.py` — Download GLO-30 tiles from AWS
- `scripts/build_vrt_and_process.sh` — Build VRT and run processor

**Documentation:**
- `specs/ELEVATION-PIPELINE-STRATEGY.md` — Overall strategy and rationale
- `specs/ELEVATION-VALIDATION-TEMPLATE.md` — Template for spot-check results
- `PHASE-0.5A-EXECUTION-PLAN.md` — This file

**To be created:**
- `ELEVATION-VALIDATION-RESULTS.md` — Actual spot-check results and decision

---

## Timeline

| Task | Est. Duration | Status |
|---|---|---|
| DEM download | 30 min – 2 hours | ⏳ In progress |
| VRT build | 5 min | Pending |
| Processor run | 10–20 min | Pending |
| Spot-check (10 routes) | 2–4 hours | Pending |
| Document results | 30 min | Pending |
| **Total Phase 0.5a** | **3–7 hours** | **In progress** |

**Expected completion:** Today or tomorrow (2026-06-20 or 2026-06-21)

---

## Next Instructions

**When DEM download completes:**

1. Run: `bash scripts/build_vrt_and_process.sh`
2. Wait for processor to finish (~10–20 min)
3. Review output: `cat public/data/metadata.json`
4. Pick 10 well-known routes and spot-check elevation gain
5. Fill in `ELEVATION-VALIDATION-RESULTS.md`
6. Make go/no-go decision for Phase 0

**Questions to ask during spot-checking:**
- Are the routes correctly identified in OSM?
- Is the elevation gain within ±10% of known values?
- Are there systematic errors (e.g., always undercount flat sections)?
- Which regions have the best vs. worst accuracy?

---

## Contacts / Resources

- **Copernicus Data:** https://dataspace.copernicus.eu/
- **AWS Dataset:** https://registry.opendata.aws/copernicus-dem/
- **Gaia GPS:** https://www.gaiagps.com/ (free routes for sport)
- **Komoot:** https://www.komoot.com/
- **GDAL Docs:** https://gdal.org/
