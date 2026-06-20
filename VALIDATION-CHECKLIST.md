# Phase 0.5a Validation Checklist

**Status:** Elevation processor in progress

**Objective:** Validate real elevation data accuracy before Phase 0 launch

---

## ✅ Completed

- [x] Downloaded 13 Copernicus GLO-30 DEM tiles (~1 GB)
- [x] Built VRT mosaic from tiles
- [x] Fixed User-Agent header for Overpass API
- [x] Started elevation processor
- [x] Created spot-check guide
- [x] Prepared validation templates

## 🔄 In Progress

- [ ] Elevation processor querying OSM (5 regions)
- [ ] Sampling elevation from DEM
- [ ] Calculating elevation gains
- [ ] Generating real GeoJSON

## ⏳ Next Steps (When Processor Completes)

### Step 1: Inspect Output (5 min)

```bash
# Show metadata
cat public/data/metadata.json | jq '.'

# Count total routes
cat public/data/routes.geojson | jq '.features | length'

# Show sample routes
cat public/data/routes.geojson | jq '.features[0:3]'
```

**Expected output:**
- ~1,000 total routes across 5 regions
- 150–400 routes per region depending on density
- Elevation gain ranges from ~50m to ~2,500m

### Step 2: Validate Elevation Accuracy (2–4 hours)

**Pick 10 well-known routes** — 2 per region:

| Region | Route 1 | Route 2 |
|--------|---------|---------|
| Chamonix | Planpraz Vertical | Mont-Blanc approach |
| Boulder | Green Mountain | Flatirons |
| Moab | Porcupine Rim | Amasa Back |
| Sedona | Cathedral Rock | Devil's Bridge |
| Limone | Colle di Tenda | (find a second) |

**For each route:**
1. Find ground truth elevation gain from Gaia GPS, Komoot, AllTrails, or Strava
2. Find the route in `public/data/routes.geojson` (search by name, region)
3. Compare app's `elevation_gain` to ground truth
4. Calculate error: `(app - truth) / truth × 100`
5. Record in table

**Resources:**
- See `SPOT-CHECK-GUIDE.md` for detailed instructions
- Use `specs/ELEVATION-VALIDATION-TEMPLATE.md` for the form

### Step 3: Analyze Results (30 min)

Fill in the template:

```markdown
# Elevation Gain Validation Results

**Validation Date:** [today]
**Processor Version:** Current
**DEM:** Copernicus GLO-30
**Routes Tested:** 10

## Summary Statistics

| Metric | Value |
|--------|-------|
| Routes within ±5% | X/10 |
| Routes within ±10% | Y/10 |
| Routes within ±15% | Z/10 |
| Mean absolute error | A% |
| Median error | B% |
| Min/Max error | C% / D% |

## Decision

- [ ] ✅ **PASS** (≥85% within ±10%) → Proceed Phase 0
- [ ] ⚠️ **CAUTION** (70–85% within ±10%) → Proceed with flag
- [ ] ❌ **FAIL** (<70% within ±10%) → Halt for improvements
```

### Step 4: Make Go/No-Go Decision (30 min)

**Decision Criteria:**

✅ **PROCEED PHASE 0** if:
- ≥85% of routes within ±10% error
- No systematic bias (e.g., not always undercount)
- Coverage ≥60% of known trails per region

⚠️ **PROCEED WITH CAUTION** if:
- 70–85% within ±10%
- Minor systematic bias
- Plan Phase 1 improvements

❌ **HALT FOR IMPROVEMENTS** if:
- <70% within ±10%
- Major systematic bias
- Must implement Phase 0.5b before Phase 0

---

## What Success Looks Like

### Best Case ✅
```
Chamonix: 300 trails, accuracy 92%
Boulder: 350 trails, accuracy 89%
Moab: 150 trails, accuracy 87%
Sedona: 280 trails, accuracy 88%
Limone: 120 trails, accuracy 85%
---
TOTAL: 1,200 trails, 88% within ±10%
DECISION: PROCEED PHASE 0 ✅
```

### Realistic Case ⚠️
```
Chamonix: 280 trails, accuracy 82%
Boulder: 320 trails, accuracy 80%
Moab: 140 trails, accuracy 79%
Sedona: 250 trails, accuracy 81%
Limone: 100 trails, accuracy 77%
---
TOTAL: 1,090 trails, 80% within ±10%
DECISION: PROCEED WITH FLAG ⚠️
(Queue Phase 1 improvements: interpolation + smoothing)
```

### Worst Case ❌
```
Chamonix: 200 trails, accuracy 65%
Boulder: 240 trails, accuracy 62%
Moab: 100 trails, accuracy 58%
Sedona: 180 trails, accuracy 61%
Limone: 80 trails, accuracy 55%
---
TOTAL: 800 trails, 60% within ±10%
DECISION: HALT FOR IMPROVEMENTS ❌
(Implement Phase 0.5b: relations + interpolation + smoothing)
```

---

## Timeline

| Task | Est. Time | Elapsed |
|------|-----------|---------|
| Processor running | 10–20 min | (in progress) |
| Inspect output | 5 min | (pending) |
| Spot-check 10 routes | 2–4 hours | (pending) |
| Analyze results | 30 min | (pending) |
| Make decision | 30 min | (pending) |
| **Total Phase 0.5a** | **4–6 hours** | **In progress** |

---

## Documentation Files

| File | Purpose | Status |
|------|---------|--------|
| `SPOT-CHECK-GUIDE.md` | How to find/compare routes | Ready |
| `specs/ELEVATION-VALIDATION-TEMPLATE.md` | Spot-check form | Ready |
| `ELEVATION-VALIDATION-RESULTS.md` | Your results (to fill in) | To create |
| `RECOMMENDED-APPROACH.md` | Strategic rationale | Complete |
| `PHASE-0.5A-EXECUTION-PLAN.md` | Detailed plan | Complete |

---

## FAQ

**Q: "The processor is taking a long time. Is it stuck?"**
A: Overpass API queries can be slow (30–60 seconds per region). Normal. Check `ps aux | grep process_elevation` to verify it's still running.

**Q: "I can't find a route in the GeoJSON. What do I do?"**
A: It might be:
1. Not in OSM (data gap)
2. Outside the 30 km radius
3. Named differently in OSM
Try a different route, or note as "coverage gap" in report.

**Q: "Should I validate all 10 routes or can I stop after 5?"**
A: Validate all 10 for statistical confidence. Takes 2–4 hours total.

**Q: "What if only 3 of 5 regions have good coverage?"**
A: Still proceed. Note which regions are weak, plan Phase 1 improvements.

---

## Once You Have Results

1. Fill in `ELEVATION-VALIDATION-RESULTS.md` with all data
2. Share decision (PASS / CAUTION / FAIL) with team
3. If **PASS** or **CAUTION:** Start Phase 0 Week 1
4. If **FAIL:** Implement Phase 0.5b improvements, re-test, then Phase 0

**Expected outcome:** Clear go/no-go by end of today (2026-06-20) or tomorrow (2026-06-21)

---

**Next:** Check back when processor completes. You'll see the real trail counts and elevation data.
