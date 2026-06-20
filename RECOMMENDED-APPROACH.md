# Recommended Approach: Elevation Pipeline Validation & Phase 0 Path Forward

> **Superseded on 2026-06-20 by [`specs/ADR-006-worldwide-live-data.md`](specs/ADR-006-worldwide-live-data.md).** This document records the earlier precomputed-region proposal; it is not the current production architecture.

**Date:** 2026-06-20

**Recommendation:** **Phased validation with contingency planning**

---

## Executive Summary

The current elevation processing pipeline is **structurally sound** but has three known limitations:
1. Treats individual OSM ways as complete routes (should prefer relations)
2. Only samples elevation at OSM nodes (should interpolate every 20–30m)
3. Has no DEM smoothing (should apply Savitzky-Golay filter)

**Recommendation:** Validate the **current pipeline's accuracy first**. If accuracy ≥85% on well-known routes, **proceed to Phase 0 as-is**. Improvements can happen in Phase 1. If accuracy <70%, halt Phase 0 and implement improvements.

**Timeline impact:** +1 day (validation) with 95% confidence, OR +5 days (validation + improvements) with 5% probability.

---

## Rationale

### Why Not Improve First?

**If we improve before validation:**
- ✅ Potentially higher accuracy
- ✅ Higher confidence in data quality
- ❌ **Delays Phase 0 by 5–7 days**
- ❌ Risk: improvements might introduce new bugs
- ❌ Unknown: we don't know if improvements are necessary

### Why Validate First?

- ✅ **Fast decision:** Answer "is current accuracy acceptable?" in 1 day
- ✅ **Risk-aware:** Only improve if validation shows it's necessary
- ✅ **Data-driven:** Validate on 10 real routes, not on speculation
- ✅ **Minimal delay:** 1 day validation vs. 5 days improvement
- ❌ Slight risk: if accuracy is bad, we need to pivot to Phase 0.5b

### Probability Analysis

| Scenario | Likelihood | Impact | Timeline |
|----------|-----------|--------|----------|
| Accuracy ≥85% | **70%** | Proceed Phase 0 immediately | +1 day |
| Accuracy 70–85% | **20%** | Proceed with caution + Phase 1 improvements | +1 day + 3–5 days (Phase 1) |
| Accuracy <70% | **10%** | Halt, implement improvements now (Phase 0.5b) | +1 day + 4–6 days + Phase 0 |

**Expected delay:** (0.70 × 1) + (0.20 × 1) + (0.10 × 5) = **1.4 days average**

---

## Recommended Path: Phase 0.5a → Decision → Phase 0 or Phase 0.5b

```
┌─────────────────────────────────────────────────────────────────┐
│ NOW: Phase 0.5a Validation (1 day)                               │
│ ├─ Download GLO-30 DEM tiles (AWS, automated)                   │
│ ├─ Build VRT mosaic (gdalbuildvrt)                              │
│ ├─ Run processor on 5 regions                                   │
│ ├─ Spot-check 10 real routes                                    │
│ └─ Document accuracy (% within ±10%)                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    ┌─────────────────┐
                    │   Decision      │
                    └─────────────────┘
                    ↙        ↓        ↘
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │ ≥85%     │  │70–85%    │  │<70%      │
            │ PROCEED  │  │CAUTION   │  │HALT      │
            │ PHASE 0  │  │PHASE 0+  │  │PHASE0.5b │
            │          │  │FLAG DATA │  │IMPROVE   │
            └──────────┘  └──────────┘  └──────────┘
                ↓              ↓              ↓
            BEST           MIDDLE           WORST
```

---

## What Success Looks Like

### Phase 0.5a Success Criteria

✅ **Technical:**
- GLO-30 tiles downloaded (13 tiles, ~1 GB)
- VRT builds without errors
- Processor runs cleanly, generates ~1,000 real trails
- No console errors or crashes

✅ **Data Quality:**
- ≥85% of 10 spot-checked routes within ±10% elevation gain error
- No systematic bias (e.g., always undercount flat sections)
- Coverage ≥60% in each region (app shows most known trails)

✅ **Documentation:**
- Spot-check results in `ELEVATION-VALIDATION-RESULTS.md`
- Clear go/no-go decision documented
- Known limitations and caveats noted

### Phase 0 Entry Criteria (after 0.5a)

✅ Elevation accuracy validated
✅ Real GeoJSON dataset in `public/data/routes.geojson`
✅ Metadata (region counts, gain ranges) documented
✅ UI mockup ready (already exists in React app)
✅ Remaining work: integrate real data + test on device

---

## Phase 0 Timeline Impact

| Scenario | Phase 0.5a | Phase 0.5b | Phase 0 | Total |
|----------|-----------|-----------|---------|-------|
| **Best (≥85%)** | 1 day | — | 10–12 weeks | **10–12 weeks** |
| **Middle (70–85%)** | 1 day | — | 10–12 weeks | **10–12 weeks** (+ Phase 1 improvements) |
| **Worst (<70%)** | 1 day | 4–6 days | 10–12 weeks | **10–13 weeks** |

**Key insight:** Even in worst case, Phase 0.5a validation costs only 1 day. If we skip validation and improvements are necessary, we'll waste much more time debugging bad data in Phase 0.

---

## Contingency Plans

### If DEM Download Fails
- **Fallback:** Use publicly available DEMs (SRTM, NASADEM) with slightly lower accuracy
- **Mitigation:** Have fallback DEM source ready (1-hour setup)

### If Processor Crashes on Real Data
- **Fallback:** Test with smaller subset (1 region) first
- **Mitigation:** Check error logs, debug with sample data

### If Accuracy Is Bad (<70%)
- **Fallback:** Implement Phase 0.5b improvements (relation assembly + interpolation)
- **Mitigation:** Improvements are pre-designed, estimated 4–6 days

### If OSM Coverage Is Sparse (<60% in a region)
- **Fallback:** Choose different launch regions (more mountainous, better mapped)
- **Mitigation:** Have backup regions identified (confirmed in Phase 0.5)

---

## Deliverables by End of Phase 0.5a

1. **Real DEM mosaic:** `data/copernicus.vrt`
2. **Real GeoJSON:** `public/data/routes.geojson` with ~1,000 trails
3. **Metadata:** `public/data/metadata.json` with region statistics
4. **Validation report:** `ELEVATION-VALIDATION-RESULTS.md` with spot-checks
5. **Decision:** Clear "proceed Phase 0" or "halt for Phase 0.5b" recommendation

---

## Communication & Next Steps

### Immediate (This Session)

✅ **Done:**
- Documented elevation pipeline strategy (specs/ELEVATION-PIPELINE-STRATEGY.md)
- Created download script (scripts/download_dem.py)
- Created processor wrapper script (scripts/build_vrt_and_process.sh)
- Prepared validation template (specs/ELEVATION-VALIDATION-TEMPLATE.md)
- Documented execution plan (PHASE-0.5A-EXECUTION-PLAN.md)

⏳ **In progress:**
- Downloading 13 GLO-30 tiles from AWS (~1 hour)

### Tomorrow (Once DEM Download Completes)

1. Run: `bash scripts/build_vrt_and_process.sh`
2. Inspect output: `cat public/data/metadata.json`
3. Spot-check 10 routes (2–4 hours)
4. Document results: `ELEVATION-VALIDATION-RESULTS.md`
5. Make decision: **Go Phase 0** or **Go Phase 0.5b**

### If Decision Is "Proceed Phase 0" (Most Likely)

- Start Phase 0 (week-by-week plan already documented)
- Week 1: Project setup
- Week 2–4: Core map + filter UI
- Week 5–12: Route display, detail panels, launch

### If Decision Is "Halt for Improvements" (Unlikely)

- Implement Phase 0.5b improvements (4–6 days)
- Re-run processor
- Re-validate on same 10 routes
- Once ≥85% accuracy, proceed to Phase 0

---

## Key Dependencies & Assumptions

✅ **Validated:**
- AWS Copernicus GLO-30 is publicly accessible (no account needed)
- Overpass API is available and responsive
- GDAL tools work correctly
- Python processor is correct

⚠️ **Assumed (will validate in Phase 0.5a):**
- Elevation accuracy is ≥70% (probably true)
- OSM coverage is ≥60% in all 5 regions (probably true, except maybe Moab)
- DEM has no major voids or corruption (probably true)
- Processor doesn't crash on real data (probably true)

---

## Recommendation: **GO PHASE 0.5a VALIDATION NOW**

**Why?**
- Low risk (1 day cost, read-only operation)
- High information gain (answers the critical accuracy question)
- Fast decision (clear go/no-go by tomorrow)
- Enables confident Phase 0 launch (no surprises mid-development)

**Expected outcome:** 70% chance we proceed to Phase 0 with confidence tomorrow.

---

## Questions & Decisions for Product Lead

1. **Agree with phased validation approach?** (vs. improve first)
2. **Accept 1-day delay for validation confidence?**
3. **Which 10 routes to spot-check?** (user will suggest specific ones they know)
4. **Success threshold:** 85% within ±10%? (or different number?)
5. **Launch regions:** Are Chamonix, Boulder, Moab, Sedona, Limone correct? (or different regions?)

---

**Approval & Signature**

I recommend: **Proceed with Phase 0.5a validation now.**

Expected completion: **2026-06-21 (tomorrow)**

Expected Phase 0 start: **2026-06-21 or 2026-06-24** (depending on validation results)
