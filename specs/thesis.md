# Thesis: Route Finder for Ultra Runners by Elevation Gain

## The Broken Status Quo

Ultra marathoners are a specific breed: they train for 100+ km events, often involving 5,000–10,000m of elevation gain. When training, elevation gain is the limiting factor — not distance. A runner who needs 1,200m of elevation gain today will run 8 km or 25 km, depending on what the terrain offers. The region they're in determines their training possibilities.

When an experienced ultra runner relocates (for a job, a season, a sabbatical), they lose their known routes. They arrive in a new city, often with only days to begin training, and face a critical problem: **they cannot efficiently find routes by elevation gain in their new region.**

### Why Existing Tools Fail

**Google Maps / standard hiking apps**: Show elevation profiles and "elevation gain" summaries, but require the runner to:
- Know which trails exist in the region (hard if you just arrived)
- Click through dozens of route profiles manually
- Calculate total gain from a visual profile (error-prone, time-consuming)
- Guess which routes are runnable at speed (vs. technical scrambles or hiking-only trails)

**Strava**: Dominated by local communities. Routes are sorted by popularity (local runners, not training data). The search is geographic, not elevation-based. A runner new to the region sees routes biased toward social volume, not training utility. Strava's data is also noisy — walking routes, bike rides, and actual trail runs are mixed.

**AllTrails / hiking apps**: Designed for scenic day hikes, not ultra training. They do not sort by elevation gain, and they classify routes by difficulty (which is subjective and not training-specific).

**Manual route planning**: The current workaround. The runner:
- Opens a DEM (digital elevation model) tool or topographic map
- Traces a plausible path
- Calculates gain manually using elevation data
- Verifies the path is real and runnable
- **This takes 20–45 minutes per route. For a runner new to a region, it's a major friction point.**

### The Signal

Ultra running has grown 15–20% annually in the US and Europe over the past decade. The community is now large enough to support relocation (sabbaticals, training camps, job moves). Meanwhile, trail running apps treat elevation gain as secondary metadata, not a primary training variable. The gap between ultra runner needs and app design is widening.

### The Claim

**A map-based tool that shows all runnable routes within a given radius, sorted and filterable by elevation gain, eliminates the manual planning friction.**

It does this by:
1. Indexing real, walkable paths (from OSM) with computed elevation gain (from DEMs)
2. Surfacing routes by training metric, not by social signal or scenery rating
3. Making it possible for a transient ultra runner to find a 1,200m-gain route in 90 seconds, not 30 minutes

This is not a social app, not a logging app, not a training plan app. **It is a route discovery tool, optimized for one specific variable: elevation gain.**
