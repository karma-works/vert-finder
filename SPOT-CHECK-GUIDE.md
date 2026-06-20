# Spot-Check Guide: Comparing App Elevation Gain to Ground Truth

**Purpose:** Validate that the Copernicus GLO-30 elevation processor is accurate enough for MVP

**Method:** Compare calculated elevation gain to known values from 10 well-known routes

---

## Where to Find Ground Truth Data

### 1. **Gaia GPS** (https://www.gaiagps.com/)
- Free app, web version available
- Huge library of public running routes
- **How to use:**
  - Search for region (e.g., "Chamonix ultra routes")
  - Open a route
  - Scroll to find "Elevation Gain" field
  - Note the value (in meters or feet)

### 2. **Komoot** (https://www.komoot.com/)
- Focus on running routes and cycling
- Detailed elevation profiles
- **How to use:**
  - Search region + "ultra running" or "trail running"
  - Open a route
  - Look for "Cumulative Ascent" in the stats panel
  - Note the value

### 3. **AllTrails** (https://www.alltrails.com/)
- Mostly hiking but has some running routes
- User ratings and reviews
- **How to use:**
  - Search region + "trail"
  - Open a trail
  - Check sidebar for "Elevation Gain"
  - Note the value

### 4. **Strava** (https://www.strava.com/)
- Activity sharing app
- Public segments with elevation data
- **How to use:**
  - Search segment or route
  - Check "Elevation Gain" stat
  - Note the value

### 5. **Race Reports & Running Websites**
- Ultra race websites often publish course profiles
- Running blogs document training routes
- **Examples:**
  - UTMB (Ultra Trail Mont-Blanc): official course data
  - Moab trails: local running clubs
  - Boulder running: local guides

---

## Routes to Spot-Check (Suggestions)

### Chamonix (2 routes)
1. **Planpraz Vertical / Tour du Mont-Blanc segment**
   - Known gain: 1,400–1,500m
   - Find on: Gaia GPS, Komoot

2. **Mont-Blanc approach**
   - Known gain: 1,200–1,400m
   - Find on: Gaia GPS, UTMB race data

### Boulder (2 routes)
1. **Green Mountain (from Baseline Road)**
   - Known gain: 1,100–1,200m
   - Very common training route
   - Find on: Strava, local guides

2. **Flatirons Loop (Baseline to Flatirons Vista)**
   - Known gain: 800–900m
   - Find on: Gaia GPS, AllTrails

### Moab (2 routes)
1. **Porcupine Rim (full route)**
   - Known gain: 1,200–1,300m
   - Find on: Komoot, Gaia GPS

2. **Amasa Back**
   - Known gain: 800–900m
   - Find on: Gaia GPS, AllTrails

### Sedona (2 routes)
1. **Cathedral Rock / Bell Rock climb**
   - Known gain: 600–800m
   - Find on: AllTrails, Komoot

2. **Devil's Bridge ascent**
   - Known gain: 1,000–1,100m
   - Find on: Gaia GPS

### Limone Piemonte (1 route, hard to find)
1. **Colle di Tenda traditional**
   - Known gain: 1,200–1,400m
   - Find on: Alpine running forums, Komoot
   - May need to ask local ultra running community

---

## How to Compare

### Step 1: Find Route in App

```bash
# Check the generated GeoJSON
cat public/data/routes.geojson | jq '.features[] | {name: .properties.name, region: .properties.region, gain: .properties.elevation_gain}' | head -50
```

Or open the app in browser and search visually for the route.

### Step 2: Record Values

| Route Name | Region | App Gain (m) | Ground Truth (m) | Error % | Source | ✓/✗ |
|---|---|---|---|---|---|---|
| Planpraz Vertical | Chamonix | 1,450 | 1,450 | 0% | Gaia GPS | ✓ |
| Green Mountain | Boulder | 1,180 | 1,200 | -1.7% | Strava | ✓ |
| Porcupine Rim | Moab | 1,100 | 1,250 | -12% | Komoot | ✗ |
| ... | ... | ... | ... | ... | ... | ... |

### Step 3: Calculate Error

```
Error % = (App Gain - Ground Truth) / Ground Truth × 100
```

- **±5% error:** Excellent ✓✓
- **±10% error:** Good ✓
- **±15% error:** Acceptable ⚠️
- **>±15% error:** Poor ✗

### Step 4: Summary Statistics

Once you've checked all 10:

```
Routes within ±5%:  X/10
Routes within ±10%: Y/10
Routes within ±15%: Z/10
Mean error: A%
Median error: B%
```

### Success Threshold

✅ **PASS (Proceed Phase 0):** ≥85% of routes within ±10%
⚠️ **CAUTION:** 70–85% within ±10%
❌ **FAIL (Halt for improvements):** <70% within ±10%

---

## Troubleshooting

### "I can't find this route in the app GeoJSON"

This means:
1. The route isn't in OSM (data gap)
2. The route is there but with a different name
3. The route is outside the 30 km search radius

→ Try a different route, or note it as a "coverage gap" in your report.

### "The app's gain is way off (>20% error)"

Possible causes:
1. **Sparse trail:** If the OSM route only has 2–3 nodes, elevation gain will be inaccurate. Note this.
2. **DEM noise:** Copernicus GLO-30 has ±10m noise. On steep slopes, this accumulates.
3. **Route mismatch:** You're checking a different route than what's in the app.

→ Note the discrepancy and suggest improvements (Phase 0.5b).

### "Most routes are within ±10%, a few are way off"

This suggests:
- Current pipeline is mostly good
- Poor performance on sparse/short trails
- Recommendation: Proceed Phase 0, flag limitation, improve in Phase 1

---

## Once You Have Results

Fill in `ELEVATION-VALIDATION-RESULTS.md` with:

1. **Route-by-route comparison** (10 routes, all fields)
2. **Accuracy summary** (min, max, mean, median error; % within thresholds)
3. **Pattern analysis** (by region, by terrain type, systematic bias)
4. **Decision** (PASS / CAUTION / FAIL)
5. **Notes** (unexpected findings, coverage gaps, suggestions)

---

## Example: Well-Documented Result

```markdown
## Route-by-Route Comparison

### Chamonix

**Route 1: Planpraz Vertical**
- Ground truth: 1,450m (Gaia GPS route "Planpraz Vertical Training Loop")
- App calculation: 1,420m
- Error: -2.1% (PASS ✓)
- Source: https://www.gaiagps.com/trips/12345
- Notes: High alpine, well-mapped in OSM, close agreement

**Route 2: Mont-Blanc Approach**
- Ground truth: 1,350m (UTMB race course, official data)
- App calculation: 1,210m
- Error: -10.4% (PASS ✓)
- Source: https://www.utmb.com/
- Notes: Sparse OSM nodes on upper section, likely undercount
```

This level of detail helps you spot patterns and make confident decisions.

---

**Questions?** Check:
- `specs/ELEVATION-VALIDATION-TEMPLATE.md` for the full template
- `RECOMMENDED-APPROACH.md` for decision logic
