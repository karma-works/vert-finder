# 🗺️ UTM Height Training: Next Steps Summary

> **Archived.** These next steps describe the superseded precomputed-region pipeline. See [`README.md`](README.md) and [`specs/ADR-006-worldwide-live-data.md`](specs/ADR-006-worldwide-live-data.md) for the implemented worldwide architecture.

**Date:** 2026-06-20

**Status:** Phase 0.5a Validation In Progress

---

## What Just Happened

You now have:

✅ **Complete specification** (`/specs/`)
- Thesis, vision, product spec, challenges
- Tech stack recommendations
- 5 ADRs with detailed trade-offs
- 12-week implementation plan
- Validation strategy

✅ **Real elevation data pipeline** (in progress)
- Download script for Copernicus GLO-30 DEM (13 tiles from AWS)
- VRT builder and processor wrapper
- Validation template

✅ **Strategic documentation**
- `RECOMMENDED-APPROACH.md` — Why phased validation is smart
- `PHASE-0.5A-EXECUTION-PLAN.md` — Detailed execution checklist
- `ELEVATION-PIPELINE-STRATEGY.md` — Full rationale for the approach

---

## What's Happening Right Now

🔄 **DEM Download:** 5 of 13 tiles completed (~38%)

Estimated remaining time: 1–2 hours (tiles are ~35–40 MB each)

**Tiles downloaded so far:**
- ✅ Sedona (all 4 tiles)
- ✅ Moab (1 of 1 tile)
- ⏳ Boulder (0 of 2 tiles)
- ⏳ Chamonix (0 of 4 tiles)
- ⏳ Limone (0 of 2 tiles)

---

## What Happens Next (Once Download Completes)

### Phase 0.5a: Elevation Validation (~2–4 hours)

**Step 1: Build VRT Mosaic** (5 min)
```bash
bash scripts/build_vrt_and_process.sh
```
This runs:
1. `gdalbuildvrt data/copernicus.vrt data/copernicus/*.tif`
2. `python3 scripts/process_elevation.py --dem data/copernicus.vrt`

**Output:** `public/data/routes.geojson` with ~1,000 real trails

**Step 2: Spot-Check Elevation Accuracy** (2–4 hours)
- Pick 10 well-known ultra running routes
- Compare app's elevation gain to ground truth (Gaia GPS, Komoot, AllTrails)
- Calculate error for each route
- Document in `ELEVATION-VALIDATION-RESULTS.md`

**Step 3: Make Decision** (30 min)
- **If ≥85% of routes within ±10% error:** ✅ **Proceed to Phase 0**
- **If 70–85% within ±10%:** ⚠️ **Proceed to Phase 0** but flag data as "beta accuracy"
- **If <70% within ±10%:** ❌ **Halt and improve** (Phase 0.5b: 4–6 days)

### Expected Timeline

| Task | Duration | When |
|------|----------|------|
| DEM download | 1–2 hours | Today |
| VRT + processing | 20 min | Today |
| Spot-checking | 2–4 hours | Today or tomorrow |
| Decision | 30 min | Tomorrow |
| **Total Phase 0.5a** | **4–6 hours actual work** | **Tomorrow (2026-06-21)** |

---

## Decision Tree

```
┌─────────────────────────┐
│ DEM download completes  │
└───────────┬─────────────┘
            │
            ↓
    ┌──────────────────┐
    │ Run processor    │
    │ Get 1,000 trails │
    └────────┬─────────┘
             │
             ↓
    ┌──────────────────────────────┐
    │ Spot-check 10 routes         │
    │ Calculate accuracy % within ±10% │
    └────────┬─────────────────────┘
             │
        ┌────┴────────────────────┐
        │                         │
    ┌───▼────┐          ┌────────▼──┐
    │ ≥85%?  │          │ <70%?      │
    │   YES  │          │   YES      │
    └───┬────┘          └─────┬──────┘
        │                     │
        ↓                     ↓
    ✅ PHASE 0      ❌ PHASE 0.5b
    START WEEK 1    IMPROVE FIRST
    (10–12 weeks)   (4–6 days)
                         │
                         ↓
                    Improve processor:
                    • OSM relations
                    • Interpolation
                    • Smoothing
                         │
                         ↓
                    Re-test on 10 routes
                         │
                         ↓
                    ✅ PHASE 0
                    (if ≥85%)
```

---

## Files to Know About

### Critical Decisions
- **`specs/ELEVATION-PIPELINE-STRATEGY.md`** — Why this approach
- **`RECOMMENDED-APPROACH.md`** — Strategic rationale
- **`PHASE-0.5A-EXECUTION-PLAN.md`** — Detailed checklist

### Scripts
- **`scripts/download_dem.py`** — Download GLO-30 tiles (RUNNING NOW)
- **`scripts/build_vrt_and_process.sh`** — Build mosaic + run processor
- **`scripts/process_elevation.py`** — Core elevation processor (already existed)

### Templates
- **`specs/ELEVATION-VALIDATION-TEMPLATE.md`** — Spot-check template
- Will create: **`ELEVATION-VALIDATION-RESULTS.md`** — Your spot-check results

### Implementation Plans
- **`specs/implementation-plan.md`** — Week-by-week Phase 0 breakdown
- **`specs/README.md`** — Specs folder index
- **`README.md`** — Project README (already exists)

---

## Key Insights from Spec Work

### The Problem Is Real
Ultra runners spend 20–45 minutes manually finding routes by elevation gain. Existing tools (Google Maps, Strava, AllTrails) don't sort by elevation gain. **This is a real, painful problem.**

### Tech Stack Is Smart
- React + Leaflet + OSM = zero hosting costs, fast iteration
- GitHub Pages + GitHub Actions = no servers, no databases
- Pre-computed elevation data = instant queries, no backend needed
- **Total cost: $0–200/year** (domain optional)

### MVP Scope Is Tight
Just: location search → elevation filter → map → route detail
No accounts, no social features, no route planning
**Ruthlessly focused on the core problem.**

### Biggest Risks (Already Identified)
1. **OSM coverage is sparse** in some regions
2. **Elevation accuracy is bad** with current method
3. **MVP scope is still too minimal** (missing terrain type, etc.)
4. **Competitive window is narrow** (Strava could add this feature anytime)

→ **Phase 0.5a validation directly addresses risks #1 and #2.**

---

## What to Do If You Get Stuck

### Download Stalls or Fails
- Check: `tail -30 /tmp/claude-1000/-home-ubuntu-Projects-utm-height-training/*/tasks/bjo8nskar.output`
- If AWS S3 is down: fallback to SRTM or NASADEM
- If AWS CLI broken: reinstall with `sudo apt-get install awscli`

### Processor Crashes
- Check error message in terminal
- Test with one region only: `python3 scripts/process_elevation.py --dem data/copernicus.vrt --regions scripts/regions-one.json`
- Common issues: missing DEM tiles, corrupt GeoJSON

### Spot-Check Resources
- **Gaia GPS:** https://www.gaiagps.com/ (search routes, note elevation gain)
- **Komoot:** https://www.komoot.com/ (open route, check "Cumulative Ascent")
- **AllTrails:** https://www.alltrails.com/ (sidebar shows elevation gain)
- **Strava:** https://www.strava.com/ (segment details)

---

## Success Criteria Checklist

By end of tomorrow (2026-06-21):

- [ ] DEM download complete (13 tiles)
- [ ] VRT builds without errors
- [ ] Processor runs cleanly, generates real GeoJSON
- [ ] Spot-checked 10 routes
- [ ] Documented accuracy (% within ±10%)
- [ ] Created `ELEVATION-VALIDATION-RESULTS.md`
- [ ] Decision made: **Proceed Phase 0** or **Halt for Phase 0.5b**

**If all checked:** You're ready to start Phase 0 (Week 1: Project Setup)

---

## Timeline to Launch

| Phase | Duration | Status |
|-------|----------|--------|
| **0.5a** (validation) | **1 day** | ⏳ **In progress** |
| **0.5b** (improvements, if needed) | 4–6 days | Conditional |
| **Phase 0** (MVP) | 10–12 weeks | Pending 0.5a |
| **Phase 1** (iteration) | 8–12 weeks | After launch |
| **Phase 2** (growth) | Open-ended | Later |

**Best case:** Live public app by mid-September 2026 (3 months)
**Realistic case:** Live public app by late September 2026 (3.5 months)
**If improvements needed:** Live public app by early October 2026 (4 months)

---

## Open Questions for You

Before starting Phase 0, clarify:

1. **Launch regions:** Chamonix, Boulder, Moab, Sedona, Limone — correct? (Or different?)
2. **Success threshold:** 85% within ±10% error? (Or different number?)
3. **Timeline:** Can we commit 12–15 weeks to Phase 0 development?
4. **Team:** Solo or with a collaborator? (Affects velocity)
5. **After launch:** Who maintains elevation data (nightly updates, bug fixes)?

---

## One Thing

**The single most important thing to validate right now:**

✅ **Does the current elevation processor produce accurate-enough data?**

If yes → Fast path to Phase 0 (1 day + 10 weeks = 11 weeks total)
If no → Slightly slower path (1 day + 5 days + 10 weeks = 16 weeks total)

Either way, we'll know tomorrow. That's why Phase 0.5a is valuable: **high certainty for minimal cost.**

---

## Next Action

⏳ **Let the DEM download finish** (1–2 hours)

Then:

```bash
# Run the processor
bash scripts/build_vrt_and_process.sh

# Check the output
cat public/data/metadata.json | jq '.'

# Start spot-checking
# (Open Gaia GPS, Komoot, etc. in browser, fill in validation template)
```

---

## Ready to Launch Phase 0?

Once Phase 0.5a validation is complete and decision is "go," you have everything needed:

✅ Complete specification
✅ Real elevation data (GeoJSON in `public/data/`)
✅ React app structure (already exists)
✅ Detailed week-by-week plan
✅ Tech stack documented
✅ Risks identified and mitigated

Week 1: Project setup + basic map UI
Week 2–4: Core features
Week 5–12: Integration + polish + launch

**You're ready to ship. Just waiting on tomorrow's validation decision.**

---

**Questions?** Check the docs listed above, or ask about specific implementation steps.

**Ready to proceed?** Once DEM download completes, run `bash scripts/build_vrt_and_process.sh` and report back with the metadata.

🚀
