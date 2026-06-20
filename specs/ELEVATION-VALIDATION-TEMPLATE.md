# Elevation Gain Validation Results

**Validation Date:** 2026-06-20

**Pipeline Version:** Current (pre-improvement)

**DEM Source:** Copernicus GLO-30

**Validation Dataset:** 10 well-known ultra running routes across all 5 regions

---

## Route-by-Route Comparison

### Chamonix Region

**Route 1: Chamonix Valley Ascent (Planpraz)**
- **Ground truth:** ~1,400–1,500m (from Gaia GPS public route)
- **App calculation:** (pending)
- **Error:** (pending)
- **Source:** [Gaia GPS route or race report]
- **Notes:**

**Route 2: Mont-Blanc approach loop**
- **Ground truth:** (pending)
- **App calculation:** (pending)
- **Error:** (pending)
- **Source:**
- **Notes:**

### Boulder Region

**Route 3: Green Mountain (from Baseline)**
- **Ground truth:** ~1,100–1,200m (common training route)
- **App calculation:** (pending)
- **Error:** (pending)
- **Source:**
- **Notes:**

**Route 4: South Boulder Peak loop**
- **Ground truth:** (pending)
- **App calculation:** (pending)
- **Error:** (pending)
- **Source:**
- **Notes:**

### Moab Region

**Route 5: Porcupine Rim (full route)**
- **Ground truth:** ~1,200–1,300m
- **App calculation:** (pending)
- **Error:** (pending)
- **Source:**
- **Notes:**

**Route 6: Amasa Back (Red Rock Loop)**
- **Ground truth:** (pending)
- **App calculation:** (pending)
- **Error:** (pending)
- **Source:**
- **Notes:**

### Sedona Region

**Route 7: Camelhead Mountain**
- **Ground truth:** ~1,000–1,100m
- **App calculation:** (pending)
- **Error:** (pending)
- **Source:**
- **Notes:**

**Route 8: Devil's Bridge circuit**
- **Ground truth:** (pending)
- **App calculation:** (pending)
- **Error:** (pending)
- **Source:**
- **Notes:**

### Limone Piemonte Region

**Route 9: Colle di Tenda traditional route**
- **Ground truth:** ~1,300–1,400m
- **App calculation:** (pending)
- **Error:** (pending)
- **Source:**
- **Notes:**

**Route 10: Marguareis approach (high altitude)**
- **Ground truth:** (pending)
- **App calculation:** (pending)
- **Error:** (pending)
- **Source:**
- **Notes:**

---

## Accuracy Summary

| Statistic | Value |
|-----------|-------|
| **Routes tested** | 10 |
| **Routes within ±5%** | — |
| **Routes within ±10%** | — |
| **Routes within ±15%** | — |
| **Routes outside ±15%** | — |
| **Mean absolute error** | — |
| **Median error** | — |
| **Min error** | — |
| **Max error** | — |

---

## Pattern Analysis

**By region:**
- Chamonix (alpine): (pending)
- Boulder (foothills): (pending)
- Moab (desert): (pending)
- Sedona (canyons): (pending)
- Limone (maritime alps): (pending)

**By terrain type:**
- High alpine (>2000m): (pending)
- Forested: (pending)
- Rocky/exposed: (pending)
- Sparse trails: (pending)

**Systematic bias (if any):**
- (pending)

---

## Decision

**Accuracy target:** ≥85% of routes within ±10% error

**Result:** (pending)

**Action:**
- [ ] **PASS — Proceed to Phase 0** with current pipeline
- [ ] **CAUTION — Proceed with flag** (60–85% accuracy)
- [ ] **FAIL — Halt and improve** (<60% accuracy)

---

## Next Steps (if improving)

If accuracy is insufficient, implement:
1. [ ] OSM relation assembly (prefer `route=hiking`)
2. [ ] Point interpolation every 20–30m
3. [ ] Savitzky-Golay elevation smoothing
4. [ ] Re-test all 10 routes

Estimated time to improvement: 3–5 days

---

## Notes & Caveats

- **Copernicus GLO-30 is a surface model,** not bare-earth. Vegetation and structures add ~1–5m to elevation readings.
- **DEM resolution is 30m.** Trails smaller than 30m cannot be accurately represented.
- **Sparse trails** with few nodes along their path may have significantly different calculated gain.
- **Noisy elevation profiles** can inflate or deflate gain. Smoothing is recommended.

---

## Raw Data (for reference)

**Command used:**
```bash
python scripts/process_elevation.py --dem data/copernicus.vrt
```

**Output file:** `public/data/routes.geojson`

**Generated routes:** (pending) total across 5 regions

**Samples per profile:** (pending, depends on trail length)

**Processing time:** (pending)
